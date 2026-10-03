"""
Pydantic schemas for request validation and response serialization.

These schemas enforce data contracts between the frontend and backend,
ensuring that required fields are present and values are valid.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ComplaintStatus(str, Enum):
    """Allowed status values for a complaint."""
    open = "open"
    resolved = "resolved"


# ---------------------------------------------------------------------------
# Complaint schemas
# ---------------------------------------------------------------------------

class ComplaintCreate(BaseModel):
    """Schema for creating a new complaint. Title and description are required."""
    title: str = Field(..., min_length=1, description="Short summary of the complaint")
    description: str = Field(..., min_length=1, description="Detailed description of the issue")
    category: Optional[str] = None
    submitter: Optional[str] = None


class ComplaintUpdate(BaseModel):
    """Schema for updating a complaint (primarily used to change status)."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    submitter: Optional[str] = None
    status: Optional[ComplaintStatus] = None


class ComplaintResponse(BaseModel):
    """Schema for returning a complaint in API responses."""
    id: int
    title: str
    description: str
    category: Optional[str] = None
    submitter: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BulkResolveRequest(BaseModel):
    """Schema for bulk-resolving a list of complaints."""
    complaint_ids: List[int] = Field(..., min_length=1, description="List of complaint IDs to resolve")


class BulkActionResponse(BaseModel):
    """Response after performing a bulk operation."""
    resolved_count: int
    complaint_ids: List[int]
    message: str


# ---------------------------------------------------------------------------
# Cluster schemas
# ---------------------------------------------------------------------------

class ClusterComplaint(BaseModel):
    """A complaint within a cluster, with its full details."""
    id: int
    title: str
    description: str
    category: Optional[str] = None
    submitter: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ClusterResponse(BaseModel):
    """A single root-cause cluster containing related complaints and AI explanation."""
    cluster_id: int
    size: int
    avg_similarity: float
    representative_title: str
    top_keywords: List[str]
    locations: List[str]
    categories: List[str]
    complaints: List[ClusterComplaint]


class ClustersResponse(BaseModel):
    """Top-level response for the /api/clusters endpoint."""
    clusters: List[ClusterResponse]
    individual_reports: List[ClusterComplaint]
    threshold: float
    total_open: int


# ---------------------------------------------------------------------------
# Stats schemas
# ---------------------------------------------------------------------------

class StatsResponse(BaseModel):
    """Dashboard statistics, all computed dynamically."""
    total_complaints: int
    open_complaints: int
    resolved_complaints: int
    clusters_found: int
    explained_complaints: int
    individual_reports: int
    threshold: float
