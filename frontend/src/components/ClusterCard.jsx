import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Trash2, 
  Tag, 
  MapPin, 
  Sparkles, 
  AlertTriangle,
  User,
  Clock,
  CheckCheck
} from "lucide-react";

export default function ClusterCard({ cluster, onResolveTicket, onDeleteTicket, onBulkResolve, isMutating }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const {
    cluster_id,
    size,
    avg_similarity,
    representative_title,
    top_keywords = [],
    locations = [],
    categories = [],
    complaints = [],
  } = cluster;

  const similarityPercent = Math.round(avg_similarity * 100);

  const getConfidenceLevel = (score) => {
    if (score >= 0.25) return { label: "High Confidence", color: "#34d399", bg: "rgba(16, 185, 129, 0.15)" };
    if (score >= 0.15) return { label: "Moderate Confidence", color: "#818cf8", bg: "rgba(99, 102, 241, 0.15)" };
    return { label: "Potential Overlap", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)" };
  };

  const confidence = getConfidenceLevel(avg_similarity);

  const handleBulkConfirm = async () => {
    const ids = complaints.map((c) => c.id);
    await onBulkResolve(ids);
    setConfirmBulk(false);
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: "20px 22px",
        marginBottom: "18px",
        borderLeft: "4px solid var(--accent-purple)",
      }}
    >
      {/* Top Bar: Cluster Info & Global Actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
        
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
              Incident Group #{cluster_id + 1}
            </span>
            <span className="badge badge-purple">
              {size} Related Complaints
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: confidence.color,
                background: confidence.bg,
                padding: "3px 9px",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${confidence.color}40`,
              }}
            >
              {confidence.label} ({similarityPercent}%)
            </span>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Primary Symptom: <strong style={{ color: "#ffffff" }}>{representative_title}</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!confirmBulk ? (
            <button
              onClick={() => setConfirmBulk(true)}
              disabled={isMutating}
              className="btn btn-success btn-sm"
              title="Mark all complaints in this cluster as resolved"
            >
              <CheckCheck size={14} />
              <span>Resolve Entire Cluster ({size})</span>
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(15, 23, 42, 0.9)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>Resolve all {size}?</span>
              <button
                onClick={handleBulkConfirm}
                disabled={isMutating}
                className="btn btn-success btn-sm"
                style={{ padding: "3px 8px", fontSize: "0.72rem" }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmBulk(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: "3px 8px", fontSize: "0.72rem" }}
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary btn-sm"
            style={{ padding: "6px 10px" }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* AI Root-Cause Intelligence Box (Phase 8) */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Sparkles size={14} color="#c084fc" />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Root-Cause Linguistic Extraction & Signatures
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {/* Keywords */}
          {top_keywords.length > 0 && (
            <div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                DISTINCTIVE TF-IDF KEYWORDS:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {top_keywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#a5b4fc",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {locations.length > 0 && (
            <div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                DETECTED LOCATIONS / ENTITIES:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {locations.map((loc, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#fcd34d",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MapPin size={11} />
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
              DOMAINS INVOLVED:
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {categories.map((cat, i) => (
                <span key={i} className="badge badge-slate" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Accordion: Complaints inside this cluster */}
      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {complaints.map((c) => (
            <div
              key={c.id}
              style={{
                background: "rgba(23, 31, 50, 0.7)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                border: "1px solid rgba(55, 65, 81, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)" }}>
                    #{c.id}
                  </span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>
                    {c.title}
                  </span>
                  {c.category && (
                    <span className="badge badge-slate" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                      {c.category}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0 0 6px" }}>
                  {c.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  {c.submitter && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <User size={12} /> {c.submitter}
                    </span>
                  )}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Individual ticket actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => onResolveTicket(c.id)}
                  disabled={isMutating}
                  className="btn btn-success btn-sm"
                  title="Resolve ticket"
                >
                  <CheckCircle size={14} />
                  <span>Resolve</span>
                </button>

                {confirmDeleteId !== c.id ? (
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    disabled={isMutating}
                    className="btn btn-danger btn-sm"
                    title="Delete ticket"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      onClick={async () => {
                        await onDeleteTicket(c.id);
                        setConfirmDeleteId(null);
                      }}
                      className="btn btn-danger btn-sm"
                      style={{ padding: "3px 6px", fontSize: "0.7rem" }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "3px 6px", fontSize: "0.7rem" }}
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
