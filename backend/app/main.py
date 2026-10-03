"""
FastAPI application entry point.

Configures CORS, registers route modules, and creates database tables
on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import complaints, clusters, stats

# Create all database tables (safe to call multiple times — it's idempotent)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Repeated Complaint Root-Cause Finder",
    description=(
        "Analyse open complaints to discover groups that likely describe "
        "the same underlying problem using TF-IDF, cosine similarity, "
        "and Union-Find clustering."
    ),
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS configuration
# ---------------------------------------------------------------------------
# Allow the local Vite dev server to communicate with the backend.
# In production, replace these with the actual frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register route modules
# ---------------------------------------------------------------------------
app.include_router(complaints.router)
app.include_router(clusters.router)
app.include_router(stats.router)


@app.get("/", tags=["health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "application": "Repeated Complaint Root-Cause Finder"}
