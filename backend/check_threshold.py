"""Quick test to check projector complaint similarity at different thresholds."""
from app.clustering import cluster_complaints

projector_complaints = [
    {"id": 1, "title": "Projector not working in Room 204",
     "description": "The projector in classroom 204 has stopped working. It turns on but shows no display output during lectures."},
    {"id": 2, "title": "Classroom projector keeps shutting down",
     "description": "The projector in the lecture hall shuts down randomly during presentations. This disrupts classes regularly."},
    {"id": 3, "title": "Display projector fails during lectures",
     "description": "Projector equipment in classrooms is unreliable. The display fails mid-lecture causing delays and disruption."},
]

for t in [0.10, 0.15, 0.18, 0.20, 0.22]:
    result = cluster_complaints(projector_complaints, threshold=t)
    cl = len(result["clusters"])
    ind = len(result["individual_reports"])
    sizes = [c["size"] for c in result["clusters"]]
    print(f"Threshold={t:.2f}: clusters={cl} sizes={sizes} individuals={ind}")
