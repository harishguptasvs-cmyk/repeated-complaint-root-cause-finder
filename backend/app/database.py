"""
Database configuration for the Repeated Complaint Root-Cause Finder.

Uses SQLAlchemy with SQLite for lightweight, file-based persistence.
The database file is created automatically in the backend directory.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database URL: Reads from DATABASE_URL environment variable (e.g. Render / Railway / Supabase Postgres)
# Falls back to local SQLite for development without breaking local setup.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./complaints.db")

# Render / Heroku compatibility: handle postgres:// schema prefix (SQLAlchemy 1.4+ expects postgresql://)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires check_same_thread=False for multi-threaded FastAPI; PostgreSQL does not support it
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# Create the engine.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
)

# SessionLocal is a factory for database sessions.
# Each request gets its own session via dependency injection.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session to each request.
    Ensures the session is closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
