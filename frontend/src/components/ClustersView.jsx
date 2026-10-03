import React, { useState } from "react";
import { 
  Layers, 
  MapPin, 
  CheckCheck, 
  CheckCircle, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Sliders,
  User,
  Clock,
  Search,
  AlertTriangle
} from "lucide-react";

export default function ClustersView({ 
  clusters = [], 
  threshold, 
  onThresholdChange, 
  onResolveTicket, 
  onDeleteTicket, 
  onBulkResolve, 
  isMutating 
}) {
  const [expandedClusterId, setExpandedClusterId] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [confirmBulkId, setConfirmBulkId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredClusters = clusters.filter((cl) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      cl.representative_title.toLowerCase().includes(q) ||
      cl.categories?.some((cat) => cat.toLowerCase().includes(q)) ||
      cl.top_keywords?.some((kw) => kw.toLowerCase().includes(q)) ||
      cl.locations?.some((loc) => loc.toLowerCase().includes(q)) ||
      cl.complaints?.some((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ marginBottom: "4px" }}>Incident Clusters</h1>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            Systemic problem groups aggregated from repetitive complaint tickets.
          </p>
        </div>

        {/* Search bar inside clusters */}
        <div style={{ position: "relative", width: "280px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search within clusters..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", fontSize: "0.825rem", height: "34px" }}
          />
        </div>
      </div>

      {/* Sensitivity Tuning Strip */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: "20px", backgroundColor: "var(--bg-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sliders size={16} color="var(--accent)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Similarity Threshold:
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "0.85rem",
              padding: "2px 6px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xs)",
            }}>
              {threshold.toFixed(2)}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              (Adjust sensitivity: lower = broader groupings, higher = stricter exact vocabulary)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "240px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>0.05</span>
            <input
              type="range"
              min="0.05"
              max="0.35"
              step="0.01"
              value={threshold}
              onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>0.35</span>
          </div>
        </div>
      </div>

      {/* Clusters List */}
      {filteredClusters.length === 0 ? (
        <div className="card">
          <div className="state-box">
            <div className="state-box-icon">
              <Layers size={22} />
            </div>
            <div className="state-box-title">No Incident Clusters Detected</div>
            <div className="state-box-desc">
              No open complaints meet the current similarity threshold ({threshold.toFixed(2)}). 
              Adjust the threshold slider or submit new complaints.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredClusters.map((cl) => {
            const isExpanded = expandedClusterId === cl.cluster_id || expandedClusterId === null; // default expanded
            const simPercent = Math.round(cl.avg_similarity * 100);

            return (
              <div key={cl.cluster_id} className="card" style={{ overflow: "hidden" }}>
                {/* Cluster Dossier Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          INCIDENT #{cl.cluster_id + 1}
                        </span>
                        <span className="badge badge-accent">
                          {cl.size} Connected Reports
                        </span>
                        <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>
                          {simPercent}% Average Cosine Similarity
                        </span>
                        <span className="badge badge-warning">
                          Status: Active
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.05rem", margin: "4px 0 6px", color: "var(--text-primary)" }}>
                        {cl.representative_title}
                      </h3>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        {cl.categories?.length > 0 && (
                          <span>Domain: <strong>{cl.categories.join(", ")}</strong></span>
                        )}
                        {cl.locations?.length > 0 && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "var(--accent-fg)" }}>
                            <MapPin size={12} />
                            {cl.locations.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {confirmBulkId !== cl.cluster_id ? (
                        <button
                          onClick={() => setConfirmBulkId(cl.cluster_id)}
                          disabled={isMutating}
                          className="btn btn-secondary btn-sm"
                          title="Resolve all complaints in this incident group"
                        >
                          <CheckCheck size={14} color="var(--success)" />
                          <span>Resolve Entire Cluster ({cl.size})</span>
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--bg-subtle)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Resolve all {cl.size}?</span>
                          <button
                            onClick={async () => {
                              await onBulkResolve(cl.complaints.map((c) => c.id));
                              setConfirmBulkId(null);
                            }}
                            disabled={isMutating}
                            className="btn btn-success btn-sm"
                            style={{ padding: "2px 6px" }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmBulkId(null)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "2px 6px" }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedClusterId(expandedClusterId === cl.cluster_id ? -1 : cl.cluster_id)}
                        className="btn btn-ghost btn-sm"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        <span>{isExpanded ? "Collapse" : "Expand"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evidence Section (Phase 7 - Root-Cause Explanation) */}
                <div style={{
                  padding: "12px 20px",
                  backgroundColor: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "0.8rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Sparkles size={13} color="var(--accent)" />
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                      Evidence for Incident Grouping
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", color: "var(--text-secondary)" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Similarity Confidence: </span>
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{simPercent}%</strong>
                    </div>

                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Distinctive Keywords: </span>
                      <span style={{ display: "inline-flex", gap: "4px", flexWrap: "wrap" }}>
                        {cl.top_keywords?.map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: "var(--bg-surface)",
                              border: "1px solid var(--border-strong)",
                              padding: "0 5px",
                              borderRadius: "var(--radius-xs)",
                              fontSize: "0.72rem",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                            }}
                          >
                            #{kw}
                          </span>
                        ))}
                      </span>
                    </div>

                    {cl.locations?.length > 0 && (
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Shared Entity: </span>
                        <strong>{cl.locations.join(", ")}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Associated Member Tickets Table */}
                {isExpanded && (
                  <div className="data-table-container" style={{ border: "none", borderRadius: "0" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: "60px" }}>ID</th>
                          <th>Complaint Details</th>
                          <th>Category</th>
                          <th>Submitter</th>
                          <th>Timestamp</th>
                          <th style={{ textAlign: "right", width: "130px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cl.complaints.map((c) => (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>#{c.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.description}</div>
                            </td>
                            <td>
                              <span className="badge badge-neutral">{c.category || "General"}</span>
                            </td>
                            <td>{c.submitter || "—"}</td>
                            <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <button
                                  onClick={() => onResolveTicket(c.id)}
                                  disabled={isMutating}
                                  className="btn btn-secondary btn-sm"
                                  title="Resolve this individual ticket"
                                >
                                  <CheckCircle size={12} color="var(--success)" />
                                  <span>Resolve</span>
                                </button>

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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
