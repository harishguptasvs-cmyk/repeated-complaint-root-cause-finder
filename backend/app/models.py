"""
SQLAlchemy ORM model for the Complaint table.

This is the single main database model. Clusters are NOT stored in the
database — they are computed dynamically from open complaints to prevent
stale data.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime

from .database import Base


class Complaint(Base):
    """
    Represents a single complaint/report submitted by a user.

    Fields:
        id          — Auto-incrementing primary key.
        title       — Short summary of the complaint (required).
        description — Detailed description of the issue (required).
        category    — Optional category tag (e.g. IT, Canteen).
        submitter   — Optional name of the person filing the report.
        status      — Either "open" or "resolved". Defaults to "open".
        created_at  — Timestamp when the complaint was created (UTC).
    """

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    submitter = Column(String, nullable=True)
    status = Column(String, default="open", nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self):
        return f"<Complaint(id={self.id}, title='{self.title}', status='{self.status}')>"
