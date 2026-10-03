"""
Cluster API route.

Endpoint:
    GET /api/clusters — Dynamically compute and return root-cause clusters.

Clusters are NEVER stored in the database. Every request:
    1. Fetches all open complaints
    2. Runs the TF-IDF + cosine similarity + Union-Find pipeline
    3. Returns fresh cluster results with root-cause explanations
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud
from ..clustering import cluster_complaints
from ..schemas import ClustersResponse

router = APIRouter(prefix="/api/clusters", tags=["clusters"])


@router.get("", response_model=ClustersResponse)
def get_clusters(
    threshold: float = Query(
        0.12,
        ge=0.05,
        le=0.50,
        description="Cosine similarity threshold for clustering complaints",
    ),
    db: Session = Depends(get_db),
):
    """
    Compute root-cause clusters from all currently-open complaints.

    Returns clusters (groups of 2+ related complaints) and
    individual reports (unmatched open complaints), along with
    top keywords, locations, and representative titles.
    """
    open_complaints = crud.get_open_complaints(db)

    complaint_dicts = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "submitter": c.submitter,
            "status": c.status,
            "created_at": c.created_at,
        }
        for c in open_complaints
    ]

    result = cluster_complaints(complaint_dicts, threshold=threshold)
    return result
