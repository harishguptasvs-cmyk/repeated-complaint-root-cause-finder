import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  Layers, 
  User, 
  Clock,
  ArrowUpDown
} from "lucide-react";

export default function ComplaintsTableView({ 
  complaints = [], 
  clusters = [], 
  onResolveTicket, 
  onReopenTicket, 
  onDeleteTicket, 
  isMutating 
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "open" | "resolved"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Map each complaint ID to its cluster ID (if any)
  const complaintToClusterMap = {};
  clusters.forEach((cl) => {
    cl.complaints?.forEach((c) => {
      complaintToClusterMap[c.id] = cl.cluster_id + 1;
    });
  });

  // Extract all unique categories
  const categories = Array.from(new Set(complaints.map((c) => c.category || "General"))).sort();

  // Filter complaints
  const filtered = complaints.filter((c) => {
    // Status filter
    if (statusFilter !== "all" && c.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== "all" && (c.category || "General") !== categoryFilter) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchSubmitter = c.submitter && c.submitter.toLowerCase().includes(q);
      const matchCategory = c.category && c.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSubmitter && !matchCategory) return false;
    }

    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "4px" }}>Complaints Directory</h1>
        <p style={{ fontSize: "0.875rem", margin: 0 }}>
          Full operational log of all {complaints.length} registered complaint tickets.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--bg-subtle)", padding: "3px", borderRadius: "var(--radius-sm)" }}>
            <button
              onClick={() => setStatusFilter("all")}
              className={`btn btn-sm ${statusFilter === "all" ? "btn-secondary" : "btn-ghost"}`}
              style={{ fontSize: "0.75rem" }}
            >
              All ({complaints.length})
            </button>
            <button
              onClick={() => setStatusFilter("open")}
              className={`btn btn-sm ${statusFilter === "open" ? "btn-secondary" : "btn-ghost"}`}
              style={{ fontSize: "0.75rem" }}
            >
              Open ({complaints.filter((c) => c.status === "open").length})
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`btn btn-sm ${statusFilter === "resolved" ? "btn-secondary" : "btn-ghost"}`}
              style={{ fontSize: "0.75rem" }}
            >
              Resolved ({complaints.filter((c) => c.status === "resolved").length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: "240px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "0.8rem", height: "32px" }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: "160px", fontSize: "0.8rem", height: "32px", padding: "4px 8px" }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Data Table */}
      <div className="data-table-container">
        {filtered.length === 0 ? (
          <div className="state-box">
            <div className="state-box-title">No Complaints Found</div>
            <div className="state-box-desc">
              No tickets match your active status, category, or search filters.
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>ID</th>
                <th>Complaint Subject & Description</th>
                <th>Category</th>
                <th>Incident Group</th>
                <th>Status</th>
                <th>Submitter</th>
                <th>Logged</th>
                <th style={{ textAlign: "right", width: "130px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const clusterId = complaintToClusterMap[c.id];
                const isOpen = c.status === "open";

                return (
                  <tr key={c.id} className={!isOpen ? "row-resolved" : ""}>
                    <td style={{ fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      #{c.id}
                    </td>

                    <td style={{ maxWidth: "360px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                        {c.title}
                      </div>
                      <div style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "340px",
                      }}>
                        {c.description}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {c.category || "General"}
                      </span>
                    </td>

                    <td>
                      {clusterId ? (
                        <span className="badge badge-accent">
                          Incident #{clusterId}
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ color: "var(--text-muted)" }}>
                          Unclustered
                        </span>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${isOpen ? "badge-warning" : "badge-success"}`}>
                        {c.status}
                      </span>
                    </td>

                    <td style={{ fontSize: "0.78rem" }}>
                      {c.submitter || "—"}
                    </td>

                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(c.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {isOpen ? (
                          <button
                            onClick={() => onResolveTicket(c.id)}
                            disabled={isMutating}
                            className="btn btn-secondary btn-sm"
                            title="Mark ticket as resolved"
                          >
                            <CheckCircle size={12} color="var(--success)" />
                            <span>Resolve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onReopenTicket(c.id)}
                            disabled={isMutating}
                            className="btn btn-ghost btn-sm"
                            title="Reopen ticket"
                          >
                            <RotateCcw size={12} />
                            <span>Reopen</span>
                          </button>
                        )}

                        {confirmDeleteId !== c.id ? (
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
                            disabled={isMutating}
                            className="btn btn-ghost btn-sm"
                            title="Delete"
                          >
                            <Trash2 size={12} color="var(--danger)" />
                          </button>
                        ) : (
                          <div style={{ display: "inline-flex", gap: "2px" }}>
                            <button
                              onClick={async () => {
                                await onDeleteTicket(c.id);
                                setConfirmDeleteId(null);
                              }}
                              className="btn btn-destructive btn-sm"
                              style={{ padding: "2px 5px" }}
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: "2px 5px" }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
