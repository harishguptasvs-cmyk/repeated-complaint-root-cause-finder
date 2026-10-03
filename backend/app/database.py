"""
Database configuration for the Repeated Complaint Root-Cause Finder.

Uses SQLAlchemy with SQLite for lightweight, file-based persistence.
The database file is created automatically in the backend directory.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database URL — stores the file in the backend/ directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./complaints.db"

# Create the engine. check_same_thread=False is required for SQLite
# when using it with FastAPI (which is multi-threaded).
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
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
