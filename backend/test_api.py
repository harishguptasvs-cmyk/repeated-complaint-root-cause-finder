"""
Integration tests for FastAPI REST endpoints.

Uses an isolated in-memory SQLite database to ensure tests are reproducible
and do not mutate production/seed data in complaints.db.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import Base, get_db
from app.main import app

# Create in-memory SQLite engine for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test and drop them afterward."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)


# ---------------------------------------------------------------------------
# Health Check Test
# ---------------------------------------------------------------------------

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Complaint CRUD Tests
# ---------------------------------------------------------------------------

def test_create_complaint_success():
    payload = {
        "title": "WiFi disconnected in Hall",
        "description": "The wireless internet disconnects repeatedly.",
        "category": "IT",
        "submitter": "Alice"
    }
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] > 0
    assert data["title"] == payload["title"]
    assert data["status"] == "open"
    assert data["submitter"] == "Alice"


def test_create_complaint_validation_error():
    # Title and description are required
    response = client.post("/api/complaints", json={"category": "IT"})
    assert response.status_code == 422


def test_list_complaints():
    client.post("/api/complaints", json={"title": "Issue 1", "description": "Desc 1"})
    client.post("/api/complaints", json={"title": "Issue 2", "description": "Desc 2"})

    response = client.get("/api/complaints")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_update_complaint_status():
    res = client.post("/api/complaints", json={"title": "Issue", "description": "Desc"})
    cid = res.json()["id"]

    patch_res = client.patch(f"/api/complaints/{cid}", json={"status": "resolved"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "resolved"


def test_update_complaint_not_found():
    response = client.patch("/api/complaints/9999", json={"status": "resolved"})
    assert response.status_code == 404


def test_delete_complaint():
    res = client.post("/api/complaints", json={"title": "Issue", "description": "Desc"})
    cid = res.json()["id"]

    del_res = client.delete(f"/api/complaints/{cid}")
    assert del_res.status_code == 200

    # Lookup after delete should 404
    get_res = client.patch(f"/api/complaints/{cid}", json={"status": "resolved"})
    assert get_res.status_code == 404


def test_delete_complaint_not_found():
    response = client.delete("/api/complaints/9999")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Bulk Resolve Test
# ---------------------------------------------------------------------------

def test_bulk_resolve():
    r1 = client.post("/api/complaints", json={"title": "WiFi 1", "description": "WiFi drops in Block A"}).json()
    r2 = client.post("/api/complaints", json={"title": "WiFi 2", "description": "WiFi disconnects in Block A"}).json()

    bulk_res = client.post("/api/complaints/bulk-resolve", json={"complaint_ids": [r1["id"], r2["id"]]})
    assert bulk_res.status_code == 200
    assert bulk_res.json()["resolved_count"] == 2

    # Verify both are now resolved
    complaints = client.get("/api/complaints").json()
    for c in complaints:
        assert c["status"] == "resolved"


# ---------------------------------------------------------------------------
# Clustering & Explainability Endpoint Tests
# ---------------------------------------------------------------------------

def test_clusters_endpoint_empty():
    response = client.get("/api/clusters")
    assert response.status_code == 200
    data = response.json()
    assert data["clusters"] == []
    assert data["individual_reports"] == []
    assert data["total_open"] == 0


def test_clusters_endpoint_with_similar_and_unrelated():
    # Insert 3 similar WiFi complaints
    client.post("/api/complaints", json={
        "title": "WiFi drops in Block A",
        "description": "Campus WiFi disconnects in Block A repeatedly.",
        "category": "IT"
    })
    client.post("/api/complaints", json={
        "title": "WiFi keeps disconnecting in Block A",
        "description": "Cannot stay connected to the campus WiFi network in Block A.",
        "category": "IT"
    })
    client.post("/api/complaints", json={
        "title": "Internet unstable in Block A",
        "description": "The wireless connection in Block A keeps dropping.",
        "category": "IT"
    })
    # Insert 1 unrelated complaint
    client.post("/api/complaints", json={
        "title": "Parking lot is full",
        "description": "Not enough parking space near the main campus gate.",
        "category": "Transport"
    })

    response = client.get("/api/clusters?threshold=0.12")
    assert response.status_code == 200
    data = response.json()

    assert len(data["clusters"]) == 1
    cluster = data["clusters"][0]
    assert cluster["size"] == 3
    assert cluster["avg_similarity"] > 0
    assert len(cluster["top_keywords"]) > 0
    assert cluster["representative_title"] is not None
    assert len(data["individual_reports"]) == 1
    assert data["individual_reports"][0]["title"] == "Parking lot is full"


def test_stats_endpoint():
    # Insert 2 complaints
    client.post("/api/complaints", json={"title": "WiFi 1", "description": "WiFi issue", "category": "IT"})
    c2 = client.post("/api/complaints", json={"title": "WiFi 2", "description": "WiFi issue", "category": "IT"}).json()

    # Mark 1 resolved
    client.patch(f"/api/complaints/{c2['id']}", json={"status": "resolved"})

    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_complaints"] == 2
    assert data["open_complaints"] == 1
    assert data["resolved_complaints"] == 1


# ---------------------------------------------------------------------------
# End-to-End Dynamic Recalculation Flow
# ---------------------------------------------------------------------------

def test_end_to_end_cluster_and_resolve_flow():
    # 1. Create 3 related complaints
    r1 = client.post("/api/complaints", json={"title": "Projector broken in Room 204", "description": "No display in 204", "category": "Facilities"}).json()
    r2 = client.post("/api/complaints", json={"title": "Room 204 projector fails", "description": "Display projector shuts down in 204", "category": "Facilities"}).json()
    r3 = client.post("/api/complaints", json={"title": "Projector not working in 204", "description": "Lectures disrupted by 204 projector failure", "category": "Facilities"}).json()

    # 2. Check clusters
    clusters_data = client.get("/api/clusters?threshold=0.12").json()
    assert len(clusters_data["clusters"]) == 1
    assert clusters_data["clusters"][0]["size"] == 3

    # 3. Resolve one complaint
    client.patch(f"/api/complaints/{r1['id']}", json={"status": "resolved"})

    # 4. Check clusters again: cluster size should now be 2
    clusters_data2 = client.get("/api/clusters?threshold=0.12").json()
    assert len(clusters_data2["clusters"]) == 1
    assert clusters_data2["clusters"][0]["size"] == 2

    # 5. Resolve another complaint: now only 1 remains open, so cluster dissolves into individual reports
    client.patch(f"/api/complaints/{r2['id']}", json={"status": "resolved"})
    clusters_data3 = client.get("/api/clusters?threshold=0.12").json()
    assert len(clusters_data3["clusters"]) == 0
    assert len(clusters_data3["individual_reports"]) == 1
    assert clusters_data3["individual_reports"][0]["id"] == r3["id"]

    # 6. Verify stats reflect changes
    stats_data = client.get("/api/stats").json()
    assert stats_data["total_complaints"] == 3
    assert stats_data["open_complaints"] == 1
    assert stats_data["resolved_complaints"] == 2
    assert stats_data["clusters_found"] == 0
    assert stats_data["individual_reports"] == 1
