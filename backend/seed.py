"""
Seed script — populates the database with ~15 realistic complaints.

Creates intentional patterns that the clustering algorithm should discover:
  • WiFi / IT cluster (4 complaints)
  • Canteen / food cluster (3 complaints)
  • Projector / classroom cluster (3 complaints)
  • Unrelated individual complaints (5 complaints)

Usage:
    cd backend
    python seed.py
"""

import sys
import os

# Ensure the app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import Complaint

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

SEED_COMPLAINTS = [
    # --- WiFi / IT cluster ---
    {
        "title": "WiFi keeps disconnecting in Block A",
        "description": "The campus WiFi drops every few minutes when I'm in Block A. I have to reconnect each time which disrupts my work.",
        "category": "IT",
        "submitter": "Rahul Sharma",
    },
    {
        "title": "Campus WiFi drops every few minutes",
        "description": "Internet connection on campus is very unstable. WiFi disconnects repeatedly, especially in the engineering block.",
        "category": "IT",
        "submitter": "Priya Patel",
    },
    {
        "title": "Internet connection unstable in Block A",
        "description": "The network connection in Block A keeps dropping. Cannot stay connected to the campus WiFi for more than a couple of minutes.",
        "category": "IT",
        "submitter": "Amit Kumar",
    },
    {
        "title": "Unable to stay connected to campus WiFi",
        "description": "WiFi on campus is unreliable. The connection drops frequently and reconnecting takes several minutes.",
        "category": "IT",
        "submitter": None,
    },

    # --- Canteen / food cluster ---
    {
        "title": "Canteen food is served cold",
        "description": "The food served at the main canteen is often lukewarm or cold. This has been happening consistently during lunch hours.",
        "category": "Canteen",
        "submitter": "Sneha Reddy",
    },
    {
        "title": "Lunch is often cold at the canteen",
        "description": "Food temperature at the canteen during lunch is unacceptable. Meals are cold by the time they are served to students.",
        "category": "Canteen",
        "submitter": "Vikram Singh",
    },
    {
        "title": "Food temperature is poor during lunch",
        "description": "The canteen food is not served hot. Multiple students have noticed that lunch items are cold and not fresh.",
        "category": "Canteen",
        "submitter": None,
    },

    # --- Projector / classroom cluster ---
    {
        "title": "Projector not working in Room 204",
        "description": "The projector in classroom 204 has stopped working. It turns on but shows no display output during lectures.",
        "category": "Facilities",
        "submitter": "Dr. Meena Iyer",
    },
    {
        "title": "Classroom projector keeps shutting down",
        "description": "The projector in the lecture hall shuts down randomly during presentations. This disrupts classes regularly.",
        "category": "Facilities",
        "submitter": "Prof. Arjun Nair",
    },
    {
        "title": "Display projector fails during lectures",
        "description": "Projector equipment in classrooms is unreliable. The display fails mid-lecture causing delays and disruption.",
        "category": "Facilities",
        "submitter": "Kavitha Menon",
    },

    # --- Unrelated / individual complaints ---
    {
        "title": "Parking area is overcrowded",
        "description": "The main parking lot is always full by 9 AM. There is not enough space for all students and staff vehicles.",
        "category": "Transport",
        "submitter": "Rajesh Gupta",
    },
    {
        "title": "Library needs more study chairs",
        "description": "The central library does not have enough seating. During exam season, students have to stand or sit on the floor.",
        "category": "Library",
        "submitter": "Ananya Das",
    },
    {
        "title": "Hostel water pressure is low",
        "description": "Water pressure in the hostel bathrooms has been very low for the past two weeks. Showers barely work.",
        "category": "Hostel",
        "submitter": "Farhan Khan",
    },
    {
        "title": "ID card printing is delayed",
        "description": "Applied for a new ID card three weeks ago and still haven't received it. The admin office says they are backed up.",
        "category": "Other",
        "submitter": "Deepa Nair",
    },
    {
        "title": "Broken bench outside the science block",
        "description": "One of the wooden benches outside the science building is broken. The seat plank has snapped and it's a safety hazard.",
        "category": "Facilities",
        "submitter": None,
    },
]


def seed():
    """Insert seed complaints into the database."""
    db = SessionLocal()
    try:
        existing = db.query(Complaint).count()
        if existing > 0:
            print(f"Database already contains {existing} complaints. Skipping seed.")
            print("To re-seed, delete complaints.db and run again.")
            return

        for data in SEED_COMPLAINTS:
            complaint = Complaint(**data)
            db.add(complaint)

        db.commit()
        print(f"[OK] Seeded {len(SEED_COMPLAINTS)} complaints successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
