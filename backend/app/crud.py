"""
CRUD (Create, Read, Update, Delete) operations for complaints.

All database interactions are isolated here so that route handlers
remain thin and focused on HTTP concerns.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_complaints(db: Session) -> List[models.Complaint]:
    """Return all complaints, newest first."""
    return (
        db.query(models.Complaint)
        .order_by(models.Complaint.created_at.desc())
        .all()
    )


def get_open_complaints(db: Session) -> List[models.Complaint]:
    """Return only open complaints (used for clustering)."""
    return (
        db.query(models.Complaint)
        .filter(models.Complaint.status == "open")
        .order_by(models.Complaint.created_at.desc())
        .all()
    )


def get_complaint(db: Session, complaint_id: int) -> Optional[models.Complaint]:
    """Return a single complaint by ID, or None if not found."""
    return db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()


def create_complaint(db: Session, complaint: schemas.ComplaintCreate) -> models.Complaint:
    """Insert a new complaint into the database."""
    db_complaint = models.Complaint(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        submitter=complaint.submitter,
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint


def update_complaint(
    db: Session,
    complaint_id: int,
    updates: schemas.ComplaintUpdate,
) -> Optional[models.Complaint]:
    """
    Update fields of an existing complaint.
    Only non-None fields from the update schema are applied.
    Returns the updated complaint, or None if not found.
    """
    db_complaint = get_complaint(db, complaint_id)
    if db_complaint is None:
        return None

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_complaint, field, value)

    db.commit()
    db.refresh(db_complaint)
    return db_complaint


def delete_complaint(db: Session, complaint_id: int) -> bool:
    """
    Delete a complaint by ID.
    Returns True if deletion was successful, False if not found.
    """
    db_complaint = get_complaint(db, complaint_id)
    if db_complaint is None:
        return False

    db.delete(db_complaint)
    db.commit()
    return True


def bulk_resolve_complaints(db: Session, complaint_ids: List[int]) -> int:
    """
    Mark multiple complaints as resolved in a single transaction.
    Returns the count of complaints successfully updated.
    """
    count = (
        db.query(models.Complaint)
        .filter(models.Complaint.id.in_(complaint_ids))
        .update({models.Complaint.status: "resolved"}, synchronize_session=False)
    )
    db.commit()
    return count


def count_complaints(db: Session) -> dict:
    """Return counts of total, open, and resolved complaints."""
    total = db.query(models.Complaint).count()
    open_count = (
        db.query(models.Complaint)
        .filter(models.Complaint.status == "open")
        .count()
    )
    resolved = (
        db.query(models.Complaint)
        .filter(models.Complaint.status == "resolved")
        .count()
    )
    return {
        "total": total,
        "open": open_count,
        "resolved": resolved,
    }
