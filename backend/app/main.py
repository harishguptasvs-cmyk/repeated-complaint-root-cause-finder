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

import os

# ---------------------------------------------------------------------------
# CORS configuration
# ---------------------------------------------------------------------------
# Defaults allow local development Vite and standard dev servers.
# Production origins can be specified via comma-separated CORS_ORIGINS env var.
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
env_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
allowed_origins = list(set(default_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
