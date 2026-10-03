"""
Complaint CRUD API routes.

Endpoints:
    POST   /api/complaints              — Create a new complaint
    GET    /api/complaints              — List all complaints (newest first)
    POST   /api/complaints/bulk-resolve — Bulk resolve multiple complaints in a cluster
    PATCH  /api/complaints/{id}         — Update a complaint (e.g. mark resolved)
    DELETE /api/complaints/{id}         — Delete a complaint
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.post("", response_model=schemas.ComplaintResponse, status_code=201)
def create_complaint(
    complaint: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
):
    """Create a new complaint. Title and description are required."""
    return crud.create_complaint(db, complaint)


@router.get("", response_model=List[schemas.ComplaintResponse])
def list_complaints(db: Session = Depends(get_db)):
    """Return all complaints, ordered newest first."""
    return crud.get_complaints(db)


@router.post("/bulk-resolve", response_model=schemas.BulkActionResponse)
def bulk_resolve(
    payload: schemas.BulkResolveRequest,
    db: Session = Depends(get_db),
):
    """
    Bulk-resolve multiple complaints by ID (used for cluster-level resolution).
    """
    count = crud.bulk_resolve_complaints(db, payload.complaint_ids)
    return schemas.BulkActionResponse(
        resolved_count=count,
        complaint_ids=payload.complaint_ids,
        message=f"Successfully marked {count} complaints as resolved.",
    )


@router.patch("/{complaint_id}", response_model=schemas.ComplaintResponse)
def update_complaint(
    complaint_id: int,
    updates: schemas.ComplaintUpdate,
    db: Session = Depends(get_db),
):
    """
    Update fields of an existing complaint.
    Primary use: change status to 'resolved'.
    Status must be one of: 'open', 'resolved'.
    """
    result = crud.update_complaint(db, complaint_id, updates)
    if result is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return result


@router.delete("/{complaint_id}", status_code=200)
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    """Delete a complaint by ID."""
    success = crud.delete_complaint(db, complaint_id)
    if not success:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"detail": "Complaint deleted successfully"}
