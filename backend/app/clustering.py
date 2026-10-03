"""
Clustering algorithm for finding root-cause groups among complaints.

Pipeline:
    1. Text Normalization & Title Boosting — preprocess text, normalize common
       domain variations (e.g. wi-fi -> wifi, a/c -> air conditioning), and give
       title 2x weight because user titles are high-density summaries.
    2. Sublinear TF-IDF — convert text to weighted vectors with sublinear scaling
       1 + log(tf) to prevent long descriptions from overpowering concise complaints.
    3. Cosine Similarity & Domain Consistency — compute pairwise cosine similarity
       between all vectors with an auxiliary domain category consistency reinforcement.
    4. Threshold Filter — keep only pairs whose similarity >= calibrated threshold.
    5. Union-Find — group transitively similar complaints into connected components.
    6. Cluster Explainability:
       - Extract top distinctive TF-IDF keywords per cluster from centroid vectors.
       - Select the most representative complaint (closest to cluster centroid).
       - Identify shared entities/locations (e.g. 'Block A', 'Room 204').
    7. Confidence Score — calculate average pairwise similarity within each cluster.

This module is intentionally self-contained so it can be tested independently
of the web framework or database.
"""

import re
from typing import List, Dict, Any
from itertools import combinations

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ===========================================================================
# Union-Find / Disjoint Set Union (DSU)
# ===========================================================================

class UnionFind:
    """
    Disjoint Set Union data structure with path compression and union by rank.

    Why Union-Find?
    ---------------
    If complaint A is similar to B, and B is similar to C, then A, B, and C
    likely share the same root cause — even if A and C aren't directly similar.
    Union-Find captures this *transitive* relationship efficiently in O(α(N)).

    Operations:
        find(x)    — return the root/representative of x's group
        union(x,y) — merge the groups containing x and y
    """

    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x: int) -> int:
        """Find the root representative of x's group with path compression."""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> None:
        """Merge the groups containing x and y using union by rank."""
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return

        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1


# ===========================================================================
# Text Preprocessing & Entity Extraction Helpers
# ===========================================================================

def normalize_complaint_text(title: str, description: str) -> str:
    """
    Preprocess and normalize text for vectorization.
    - Title is repeated twice (2x weighting) because user titles are concise summaries.
    - Acronyms and common synonyms are normalized (e.g., wi-fi, a/c, cafeteria).
    """
    t = (title or "").strip()
    d = (description or "").strip()
    raw = f"{t} {t} {d}".lower()

    # Domain synonym / acronym normalization
    raw = re.sub(r"\bwi[- ]?fi\b", "wifi", raw)
    raw = re.sub(r"\ba/?c\b", "air conditioning", raw)
    raw = re.sub(r"\bhvac\b", "air conditioning", raw)
    raw = re.sub(r"\bcafeteria\b", "canteen", raw)
    raw = re.sub(r"\bdining hall\b", "canteen", raw)
    raw = re.sub(r"\bwashroom\b", "bathroom", raw)
    raw = re.sub(r"\brestroom\b", "bathroom", raw)

    return raw if raw.strip() else "empty"


def extract_location_entities(complaints: List[Dict[str, Any]]) -> List[str]:
    """
    Extract common campus locations or room identifiers present in the cluster.
    Matches patterns like 'Block A', 'Room 204', 'Lab 3', 'Science Block', 'Hostel', 'Library'.
    """
    patterns = [
        r"\b(?:block|room|lab|hall|building|floor)\s+[0-9a-zA-Z]+\b",
        r"\b(?:science|engineering|admin|main)\s+(?:block|building|hall|canteen)\b",
        r"\b(?:canteen|cafeteria|hostel|library|gym|auditorium)\b",
    ]
    found = set()
    for c in complaints:
        text = f"{c.get('title') or ''} {c.get('description') or ''}"
        for pat in patterns:
            matches = re.findall(pat, text, flags=re.IGNORECASE)
            for m in matches:
                # Title case for presentation
                clean = " ".join(word.capitalize() for word in m.split())
                found.add(clean)

    return sorted(found)


# ===========================================================================
# Main Clustering Function
# ===========================================================================

def cluster_complaints(
    complaints: List[Dict[str, Any]],
    threshold: float = 0.12,
    category_boost: float = 0.03,
) -> Dict[str, Any]:
    """
    Cluster complaints by textual similarity and domain context.

    Parameters
    ----------
    complaints : list of dict
        Each dict must have at least 'id', 'title', 'description'.
        May also include 'category', 'submitter', 'status', 'created_at'.
    threshold : float, default 0.12
        Minimum cosine similarity for two complaints to be considered related.
        Calibrated against evaluation benchmarks:
          - WiFi / IT: ~0.26 similarity
          - Canteen: ~0.35 similarity
          - Projectors: ~0.14 similarity
          - Unrelated pairs: <= 0.06 similarity
    category_boost : float, default 0.03
        Modest bonus added when complaints share the exact same category,
        applied ONLY if textual similarity is already positive (> 0.05).

    Returns
    -------
    dict with keys:
        clusters           — list of cluster dicts (size >= 2) with explainability metadata
        individual_reports — list of complaint dicts that didn't match anyone
        threshold          — the threshold used for this computation
        total_open         — number of complaints analyzed
    """

    if not complaints:
        return {
            "clusters": [],
            "individual_reports": [],
            "threshold": threshold,
            "total_open": 0,
        }

    n = len(complaints)

    if n == 1:
        return {
            "clusters": [],
            "individual_reports": [complaints[0]],
            "threshold": threshold,
            "total_open": 1,
        }

    # =====================================================================
    # STEP 1 — Text Normalization & Title Boosting
    # =====================================================================
    texts = [
        normalize_complaint_text(c.get("title") or "", c.get("description") or "")
        for c in complaints
    ]

    # =====================================================================
    # STEP 2 — Sublinear TF-IDF Vectorization
    # =====================================================================
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(texts)
    feature_names = np.array(vectorizer.get_feature_names_out())

    # =====================================================================
    # STEP 3 — Cosine Similarity Matrix & Safe Category Reinforcement
    # =====================================================================
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Apply category boost only if complaints share the same category AND have text overlap
    for i in range(n):
        for j in range(i + 1, n):
            c1 = complaints[i].get("category")
            c2 = complaints[j].get("category")
            if c1 and c2 and c1.strip().lower() == c2.strip().lower():
                if similarity_matrix[i][j] > 0.05:
                    boosted = similarity_matrix[i][j] + category_boost
                    similarity_matrix[i][j] = boosted
                    similarity_matrix[j][i] = boosted

    # =====================================================================
    # STEP 4 + 5 — Threshold Filtering & Union-Find Graph Merge
    # =====================================================================
    uf = UnionFind(n)
    for i in range(n):
        for j in range(i + 1, n):
            if similarity_matrix[i][j] >= threshold:
                uf.union(i, j)

    # =====================================================================
    # STEP 6 — Partition Clusters and Individual Reports
    # =====================================================================
    groups: Dict[int, List[int]] = {}
    for idx in range(n):
        root = uf.find(idx)
        groups.setdefault(root, []).append(idx)

    clusters = []
    individual_reports = []
    cluster_id_counter = 0

    dense_tfidf = tfidf_matrix.toarray()

    for root, member_indices in groups.items():
        if len(member_indices) == 1:
            individual_reports.append(complaints[member_indices[0]])
        else:
            # ============================================================
            # STEP 7 — Cluster Explainability & Representative Complaint
            # ============================================================
            cluster_docs = [complaints[i] for i in member_indices]

            # 7a. Average Pairwise Similarity (Confidence Score)
            pair_sims = []
            for a, b in combinations(member_indices, 2):
                pair_sims.append(float(similarity_matrix[a][b]))
            avg_sim = sum(pair_sims) / len(pair_sims) if pair_sims else 0.0

            # 7b. Cluster Centroid & Representative Complaint
            sub_vectors = dense_tfidf[member_indices]
            centroid = sub_vectors.mean(axis=0, keepdims=True)
            doc_similarities_to_centroid = cosine_similarity(sub_vectors, centroid).flatten()
            best_doc_idx = member_indices[int(np.argmax(doc_similarities_to_centroid))]
            representative_title = complaints[best_doc_idx].get("title") or "Related incident"

            # 7c. Top Keywords from Centroid Vector
            mean_weights = centroid.flatten()
            top_kw_indices = mean_weights.argsort()[::-1][:5]
            top_keywords = [
                feature_names[idx]
                for idx in top_kw_indices
                if mean_weights[idx] > 0
            ]

            # 7d. Locations & Categories
            locations = extract_location_entities(cluster_docs)
            categories = sorted(set(
                c.get("category") or "Uncategorized"
                for c in cluster_docs
            ))

            clusters.append({
                "cluster_id": cluster_id_counter,
                "size": len(member_indices),
                "avg_similarity": round(avg_sim, 4),
                "representative_title": representative_title,
                "top_keywords": top_keywords,
                "locations": locations,
                "categories": categories,
                "complaints": cluster_docs,
            })
            cluster_id_counter += 1

    # Sort clusters by size (largest first) for dashboard display
    clusters.sort(key=lambda c: c["size"], reverse=True)

    return {
        "clusters": clusters,
        "individual_reports": individual_reports,
        "threshold": threshold,
        "total_open": n,
    }
