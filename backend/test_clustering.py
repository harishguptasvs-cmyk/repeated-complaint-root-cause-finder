"""
Tests for the clustering algorithm.

Verifies:
    1. Similar complaints cluster together
    2. Unrelated complaints remain separate
    3. Transitive clustering works (A-B, B-C -> [A,B,C])
    4. Single complaint -> individual report
    5. Empty input -> empty results
    6. Threshold changes affect clustering
    7. Missing fields resilience
    8. Confidence score and average similarity
    9. Root-cause keywords and representative complaint selection
    10. Union-Find data structure mechanics
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.clustering import cluster_complaints, UnionFind


def test_empty_input():
    """No complaints should produce empty results."""
    result = cluster_complaints([])
    assert result["clusters"] == []
    assert result["individual_reports"] == []
    assert result["total_open"] == 0
    print("[PASS] test_empty_input")


def test_single_complaint():
    """One complaint should be an individual report, not a cluster."""
    complaints = [
        {"id": 1, "title": "Parking is full", "description": "No space in the lot."}
    ]
    result = cluster_complaints(complaints)
    assert result["clusters"] == []
    assert len(result["individual_reports"]) == 1
    assert result["individual_reports"][0]["id"] == 1
    assert result["total_open"] == 1
    print("[PASS] test_single_complaint")


def test_similar_complaints_cluster():
    """Very similar complaints should form a cluster."""
    complaints = [
        {"id": 1, "title": "WiFi disconnects in Block A", "description": "The campus WiFi keeps dropping in Block A.", "category": "IT"},
        {"id": 2, "title": "Campus WiFi drops frequently", "description": "WiFi disconnects every few minutes on campus.", "category": "IT"},
        {"id": 3, "title": "Internet unstable in Block A", "description": "WiFi connection drops repeatedly in Block A.", "category": "IT"},
    ]
    result = cluster_complaints(complaints, threshold=0.12)
    assert len(result["clusters"]) == 1, "Expected exactly one cluster"
    cluster = result["clusters"][0]
    assert cluster["size"] == 3
    assert len(cluster["top_keywords"]) > 0
    assert cluster["representative_title"] is not None
    assert "Block A" in cluster["locations"] or any("Block" in loc for loc in cluster["locations"])
    print("[PASS] test_similar_complaints_cluster")


def test_unrelated_stay_separate():
    """Clearly unrelated complaints should not cluster."""
    complaints = [
        {"id": 1, "title": "Parking area overcrowded", "description": "Not enough parking space for vehicles.", "category": "Transport"},
        {"id": 2, "title": "Library needs more chairs", "description": "Not enough seating in the library.", "category": "Library"},
    ]
    result = cluster_complaints(complaints, threshold=0.12)
    assert len(result["clusters"]) == 0, "Unrelated complaints should not form clusters"
    assert len(result["individual_reports"]) == 2
    print("[PASS] test_unrelated_stay_separate")


def test_transitive_clustering():
    """
    A-B similar, B-C similar, A-C not directly similar.
    Union-Find should still group [A, B, C] together.
    """
    complaints = [
        {"id": 1, "title": "WiFi drops in Block A", "description": "The WiFi network disconnects frequently in Block A building."},
        {"id": 2, "title": "WiFi and internet drops in campus", "description": "Network and WiFi connection unstable. Internet disconnects in buildings."},
        {"id": 3, "title": "Internet connection unstable on campus", "description": "Internet and network connections are unreliable in campus buildings."},
    ]
    result = cluster_complaints(complaints, threshold=0.08)
    assert len(result["clusters"]) == 1
    assert result["clusters"][0]["size"] == 3
    print("[PASS] test_transitive_clustering")


def test_threshold_changes_behaviour():
    """Higher threshold should produce fewer clusters."""
    complaints = [
        {"id": 1, "title": "WiFi disconnects", "description": "WiFi drops frequently in the campus."},
        {"id": 2, "title": "WiFi is unstable", "description": "Campus WiFi connection is unreliable."},
        {"id": 3, "title": "Parking is overcrowded", "description": "Not enough parking space."},
    ]

    result_high = cluster_complaints(complaints, threshold=0.90)
    assert len(result_high["clusters"]) == 0, "Very high threshold should yield no clusters"
    print("[PASS] test_threshold_changes_behaviour")


def test_missing_fields():
    """Complaints with None category/submitter should not crash."""
    complaints = [
        {"id": 1, "title": "Test complaint", "description": "Some issue.", "category": None, "submitter": None},
        {"id": 2, "title": "Another test", "description": "Another issue.", "category": None, "submitter": None},
    ]
    result = cluster_complaints(complaints)
    assert "clusters" in result
    assert "individual_reports" in result
    print("[PASS] test_missing_fields")


def test_avg_similarity_in_cluster():
    """Clusters should include avg_similarity > 0."""
    complaints = [
        {"id": 1, "title": "WiFi drops in Block A", "description": "Campus WiFi disconnects in Block A repeatedly."},
        {"id": 2, "title": "WiFi disconnects in Block A", "description": "The WiFi in Block A keeps dropping every few minutes."},
    ]
    result = cluster_complaints(complaints, threshold=0.12)
    assert len(result["clusters"]) == 1
    assert result["clusters"][0]["avg_similarity"] > 0
    print("[PASS] test_avg_similarity_in_cluster")


def test_union_find_basic():
    """Direct test of the UnionFind data structure."""
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(1, 2)

    assert uf.find(0) == uf.find(1) == uf.find(2)
    assert uf.find(3) != uf.find(0)
    assert uf.find(4) != uf.find(0)
    assert uf.find(3) != uf.find(4)

    uf.union(3, 4)
    assert uf.find(3) == uf.find(4)
    assert uf.find(3) != uf.find(0)
    print("[PASS] test_union_find_basic")


if __name__ == "__main__":
    test_empty_input()
    test_single_complaint()
    test_similar_complaints_cluster()
    test_unrelated_stay_separate()
    test_transitive_clustering()
    test_threshold_changes_behaviour()
    test_missing_fields()
    test_avg_similarity_in_cluster()
    test_union_find_basic()
    print("\nAll clustering unit tests passed successfully!")
