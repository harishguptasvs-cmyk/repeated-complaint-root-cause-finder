"""
Benchmark script for evaluating clustering algorithm performance against ground truth.
Computes Pairwise Precision, Recall, and F1 Score across different configurations.
"""

from itertools import combinations
from evaluation_dataset import EVALUATION_COMPLAINTS
from app.clustering import cluster_complaints


def evaluate_clustering(result, dataset):
    id_to_comp = {c["id"]: c for c in dataset}
    clusters = result["clusters"]

    # Build ground truth pairs
    ground_truth_pairs = set()
    all_grouped_ids = [c["id"] for c in dataset if c["expected_group"] is not None]
    for id1, id2 in combinations(all_grouped_ids, 2):
        if id_to_comp[id1]["expected_group"] == id_to_comp[id2]["expected_group"]:
            ground_truth_pairs.add(tuple(sorted((id1, id2))))

    # Build predicted pairs
    predicted_pairs = set()
    for cl in clusters:
        members = [c["id"] for c in cl["complaints"]]
        for id1, id2 in combinations(members, 2):
            predicted_pairs.add(tuple(sorted((id1, id2))))

    tp = len(predicted_pairs.intersection(ground_truth_pairs))
    fp = len(predicted_pairs - ground_truth_pairs)
    fn = len(ground_truth_pairs - predicted_pairs)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "total_clusters": len(clusters),
        "total_individuals": len(result["individual_reports"]),
        "fp_pairs": list(predicted_pairs - ground_truth_pairs),
        "fn_pairs": list(ground_truth_pairs - predicted_pairs),
    }


import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.clustering import UnionFind


def cluster_improved(complaints, threshold=0.12, category_boost=0.03):
    n = len(complaints)
    if n == 0:
        return {"clusters": [], "individual_reports": []}
    if n == 1:
        return {"clusters": [], "individual_reports": [complaints[0]]}

    texts = []
    for c in complaints:
        t = (c.get("title") or "").strip()
        d = (c.get("description") or "").strip()
        combined = f"{t} {t} {d}".lower()
        # Common domain acronyms and synonym normalization
        combined = re.sub(r"\bwi[- ]?fi\b", "wifi", combined)
        combined = re.sub(r"\ba/?c\b", "air conditioning", combined)
        combined = re.sub(r"\bhvac\b", "air conditioning", combined)
        combined = re.sub(r"\bcafeteria\b", "canteen", combined)
        combined = re.sub(r"\bdining hall\b", "canteen", combined)
        texts.append(combined if combined.strip() else "empty")

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(texts)
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Optional category boost: only applied if semantic similarity is already positive
    for i in range(n):
        for j in range(i + 1, n):
            c1 = complaints[i].get("category")
            c2 = complaints[j].get("category")
            if c1 and c2 and c1 == c2 and similarity_matrix[i][j] > 0.05:
                boosted = similarity_matrix[i][j] + category_boost
                similarity_matrix[i][j] = boosted
                similarity_matrix[j][i] = boosted

    uf = UnionFind(n)
    for i in range(n):
        for j in range(i + 1, n):
            if similarity_matrix[i][j] >= threshold:
                uf.union(i, j)

    groups = {}
    for i in range(n):
        r = uf.find(i)
        groups.setdefault(r, []).append(i)

    clusters = []
    individual_reports = []
    for r, members in groups.items():
        if len(members) == 1:
            individual_reports.append(complaints[members[0]])
        else:
            clusters.append({
                "cluster_id": len(clusters),
                "size": len(members),
                "complaints": [complaints[i] for i in members],
            })

    return {"clusters": clusters, "individual_reports": individual_reports}


if __name__ == "__main__":
    print(f"Total evaluation complaints: {len(EVALUATION_COMPLAINTS)}")
    print("\n--- BASELINE ALGORITHM ---")
    for t in [0.10, 0.12, 0.14, 0.18, 0.22]:
        res = cluster_complaints(EVALUATION_COMPLAINTS, threshold=t)
        m = evaluate_clustering(res, EVALUATION_COMPLAINTS)
        print(f"Threshold: {t:.2f} | Clusters: {m['total_clusters']:2d} | "
              f"P: {m['precision']:.3f} | R: {m['recall']:.3f} | F1: {m['f1']:.3f} | "
              f"TP: {m['tp']:2d} FP: {m['fp']:2d} FN: {m['fn']:2d}")

    print("\n--- SEED COMPLAINTS WITH IMPROVED ALGORITHM (Threshold 0.12) ---")
    from seed import SEED_COMPLAINTS
    seed_res = cluster_improved(SEED_COMPLAINTS, threshold=0.12)
    print(f"Seed clusters found: {len(seed_res['clusters'])}")
    for cl in seed_res['clusters']:
        print(f"  Cluster {cl['cluster_id']} (size {cl['size']}): {[c['title'] for c in cl['complaints']]}")
    print(f"Seed individual reports: {len(seed_res['individual_reports'])}")
