import React from "react";
import { 
  Inbox, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  MapPin, 
  Tag,
  CheckCheck,
  FileQuestion,
  TrendingUp
} from "lucide-react";

export default function OverviewDashboard({ 
  stats, 
  clusters = [], 
  individualReports = [], 
  allComplaints = [], 
  onViewChange, 
  onResolveTicket, 
  onBulkResolve, 
  isMutating 
}) {
  const total = stats?.total_complaints || 0;
  const open = stats?.open_complaints || 0;
  const resolved = stats?.resolved_complaints || 0;
  const clusterCount = stats?.clusters_found || 0;
  const explained = stats?.explained_complaints || 0;

  const clusterRatio = open > 0 ? Math.round((explained / open) * 100) : 0;

  // Real data: Calculate category distribution among active open complaints
  const categoryCounts = {};
  allComplaints.forEach((c) => {
    if (c.status === "open") {
      const cat = c.category || "Unassigned";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "4px" }}>Operational Overview</h1>
        <p style={{ fontSize: "0.875rem", margin: 0 }}>
          Real-time incident intelligence analyzing {open} active tickets across {clusterCount} detected root-cause clusters.
        </p>
      </div>

      {/* Primary KPI Metrics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "14px",
        marginBottom: "24px",
      }}>
        {/* KPI 1 */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Intake
            </span>
            <Inbox size={15} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {total}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            All-time logged reports
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: "16px 18px", borderLeft: "3px solid var(--warning)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warning)", textTransform: "uppercase" }}>
              Unresolved / Open
            </span>
            <AlertCircle size={15} color="var(--warning)" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {open}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Currently in queue
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: "16px 18px", borderLeft: "3px solid var(--accent)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase" }}>
              Detected Clusters
            </span>
            <Layers size={15} color="var(--accent)" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {clusterCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Repeated systemic failures
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ padding: "16px 18px", borderLeft: "3px solid var(--success)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--success)", textTransform: "uppercase" }}>
              Cluster Accounted %
            </span>
            <TrendingUp size={15} color="var(--success)" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {clusterRatio}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {explained} of {open} open tickets linked
          </div>
        </div>
      </div>

      {/* Main Split Layout: Detected Clusters vs Category Breakdown */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        marginBottom: "24px",
      }}>
        {/* Left Column: High Priority Incident Clusters */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ margin: 0 }}>Detected Root-Cause Incidents</h3>
              <p style={{ fontSize: "0.75rem", margin: "2px 0 0" }}>
                Grouped dynamically based on text similarity and graph connectivity
              </p>
            </div>
            <button
              onClick={() => onViewChange("clusters")}
              className="btn btn-secondary btn-sm"
            >
              <span>View All Clusters</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: "0" }}>
            {clusters.length === 0 ? (
              <div className="state-box">
                <div className="state-box-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div className="state-box-title">No Repeated Issue Clusters</div>
                <div className="state-box-desc">
                  Open tickets do not exhibit sufficient textual repetition at the current similarity threshold.
                </div>
              </div>
            ) : (
              <div>
                {clusters.map((cl, idx) => {
                  const simPercent = Math.round(cl.avg_similarity * 100);
                  return (
                    <div
                      key={cl.cluster_id}
                      style={{
                        padding: "16px 20px",
                        borderBottom: idx === clusters.length - 1 ? "none" : "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
                            INCIDENT #{cl.cluster_id + 1}
                          </span>
                          <span className="badge badge-accent">
                            {cl.size} Reports
                          </span>
                          <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>
                            {simPercent}% Similarity
                          </span>
                          {cl.categories?.map((cat) => (
                            <span key={cat} className="badge badge-neutral">
                              {cat}
                            </span>
                          ))}
                        </div>

                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                          {cl.representative_title}
                        </div>

                        {/* Top extracted keywords */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Keywords:</span>
                          {cl.top_keywords?.slice(0, 4).map((kw, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-secondary)",
                                backgroundColor: "var(--bg-subtle)",
                                padding: "1px 6px",
                                borderRadius: "var(--radius-xs)",
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                          {cl.locations?.length > 0 && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.72rem", color: "var(--accent-fg)" }}>
                              <MapPin size={11} />
                              {cl.locations.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Bulk Resolve */}
                      <button
                        onClick={() => onBulkResolve(cl.complaints.map((c) => c.id))}
                        disabled={isMutating}
                        className="btn btn-secondary btn-sm"
                        title="Mark all complaints in this cluster as resolved"
                      >
                        <CheckCheck size={13} color="var(--success)" />
                        <span>Resolve All</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Category Distribution</h3>
          </div>
          <div className="card-body">
            {sortedCategories.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No open complaints logged.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sortedCategories.map(([category, count]) => {
                  const pct = open > 0 ? Math.round((count / open) * 100) : 0;
                  return (
                    <div key={category}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{category}</span>
                        <span style={{ color: "var(--text-muted)" }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{
                        height: "6px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          backgroundColor: "var(--accent)",
                          borderRadius: "3px",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Unclustered / Standalone Reports */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ margin: 0 }}>Unclustered Complaints ({individualReports.length})</h3>
            <p style={{ fontSize: "0.75rem", margin: "2px 0 0" }}>
              Isolated reports that do not match other open complaints
            </p>
          </div>
          <button
            onClick={() => onViewChange("complaints")}
            className="btn btn-secondary btn-sm"
          >
            <span>View Complaints Table</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="data-table-container" style={{ border: "none" }}>
          {individualReports.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
              All current complaints are accounted for within detected clusters.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Submitter</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {individualReports.slice(0, 6).map((c) => (
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
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => onResolveTicket(c.id)}
                        disabled={isMutating}
                        className="btn btn-secondary btn-sm"
                      >
                        <CheckCircle2 size={13} color="var(--success)" />
                        <span>Resolve</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
