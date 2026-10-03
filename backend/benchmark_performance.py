"""
Performance benchmark script for clustering scalability.
Measures execution time and memory for N=50, N=100, N=250, N=500 complaints.
"""

import time
import random
from app.clustering import cluster_complaints

TEMPLATES = [
    ("WiFi disconnects in Block {x}", "Campus network drops every few minutes in building {x}.", "IT"),
    ("Cold food served at canteen", "Lunch temperature is cold and lukewarm during lunch time.", "Canteen"),
    ("Projector {x} failed in hall", "Display screen turned black and projector shut down in classroom {x}.", "Facilities"),
    ("AC leaking in lab {x}", "Cooling unit is blowing warm air and dripping water in room {x}.", "Facilities"),
    ("Water pressure low in hostel {x}", "Shower taps have barely any water flow in student residence {x}.", "Hostel"),
    ("Parking lot {x} is overcrowded", "No available vehicle spots near entrance {x}.", "Transport"),
    ("Library chair broken at table {x}", "Legs are wobbly and loose on wooden seating {x}.", "Library"),
    ("Student ID card printer delayed", "Badge replacement has not arrived after two weeks.", "Admin"),
]


def generate_synthetic_complaints(n: int):
    complaints = []
    for i in range(n):
        tmpl = random.choice(TEMPLATES)
        var = random.choice(["A", "B", "C", "101", "204", "302", "East", "West"])
        title = tmpl[0].replace("{x}", var)
        desc = tmpl[1].replace("{x}", var)
        cat = tmpl[2]
        complaints.append({
            "id": i + 1,
            "title": title,
            "description": desc,
            "category": cat,
            "submitter": f"User_{i}",
            "status": "open",
        })
    return complaints


def benchmark():
    print("=" * 60)
    print("CLUSTERING SCALABILITY & LATENCY BENCHMARK")
    print("=" * 60)
    for n in [50, 100, 250, 500]:
        data = generate_synthetic_complaints(n)
        start = time.perf_counter()
        result = cluster_complaints(data, threshold=0.12)
        elapsed_ms = (time.perf_counter() - start) * 1000

        clusters = len(result["clusters"])
        explained = sum(c["size"] for c in result["clusters"])
        individuals = len(result["individual_reports"])

        print(f"N = {n:3d} complaints | Latency: {elapsed_ms:6.2f} ms | "
              f"Clusters: {clusters:2d} | Explained: {explained:3d} | Individuals: {individuals:3d}")
    print("=" * 60)


if __name__ == "__main__":
    benchmark()
