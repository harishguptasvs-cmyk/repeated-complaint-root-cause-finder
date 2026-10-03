"""
Statistics API route.

Endpoint:
    GET /api/stats — Return dynamically computed dashboard statistics.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud
from ..clustering import cluster_complaints
from ..schemas import StatsResponse

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=StatsResponse)
def get_stats(
    threshold: float = Query(
        0.12,
        ge=0.05,
        le=0.50,
        description="Cosine similarity threshold for deriving cluster metrics",
    ),
    db: Session = Depends(get_db),
):
    """
    Compute and return all dashboard statistics dynamically.

    Stats include total/open/resolved counts, plus cluster-derived
    metrics (clusters found, explained complaints, individual reports).
    """
    counts = crud.count_complaints(db)

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

    clusters_found = len(result["clusters"])
    explained = sum(c["size"] for c in result["clusters"])
    individual = len(result["individual_reports"])

    return StatsResponse(
        total_complaints=counts["total"],
        open_complaints=counts["open"],
        resolved_complaints=counts["resolved"],
        clusters_found=clusters_found,
        explained_complaints=explained,
        individual_reports=individual,
        threshold=threshold,
    )
