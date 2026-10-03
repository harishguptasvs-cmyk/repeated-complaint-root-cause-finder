/**
 * API Client for Repeated Complaint Root-Cause Finder.
 * Communicates with the FastAPI backend at http://localhost:8000.
 */

const API_BASE = "http://localhost:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorDetail = typeof errorData.detail === "string" 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server. Make sure FastAPI is running on port 8000.");
    }
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request("/"),

  // Complaints
  getComplaints: () => request("/api/complaints"),
  
  createComplaint: (data) =>
    request("/api/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateComplaintStatus: (id, status) =>
    request(`/api/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteComplaint: (id) =>
    request(`/api/complaints/${id}`, {
      method: "DELETE",
    }),

  bulkResolveComplaints: (complaintIds) =>
    request("/api/complaints/bulk-resolve", {
      method: "POST",
      body: JSON.stringify({ complaint_ids: complaintIds }),
    }),

  // Clusters
  getClusters: (threshold = 0.12) =>
    request(`/api/clusters?threshold=${threshold}`),

  // Statistics
  getStats: (threshold = 0.12) =>
    request(`/api/stats?threshold=${threshold}`),
};
