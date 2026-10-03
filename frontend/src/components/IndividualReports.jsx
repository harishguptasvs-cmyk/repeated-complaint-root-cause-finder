import React, { useState } from "react";
import { FileText, CheckCircle, Trash2, User, Clock } from "lucide-react";

export default function IndividualReports({ reports = [], onResolveTicket, onDeleteTicket, isMutating }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!reports || reports.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>No individual unclustered complaints active.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(100, 116, 139, 0.15)",
            border: "1px solid rgba(100, 116, 139, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <FileText size={18} color="#94a3b8" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Individual / Unclustered Reports</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              Unique issues with no detected repetitive patterns
            </p>
          </div>
        </div>

        <span className="badge badge-slate">
          {reports.length} Standalone Tickets
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
        {reports.map((c) => (
          <div
            key={c.id}
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
              border: "1px solid rgba(55, 65, 81, 0.5)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.2s",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)" }}>
                  #{c.id}
                </span>
                {c.category && (
                  <span className="badge badge-slate" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                    {c.category}
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: "0.95rem", color: "#ffffff", marginBottom: "6px" }}>
                {c.title}
              </h4>

              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0 0 12px" }}>
                {c.description}
              </p>
            </div>

            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "10px",
                borderTop: "1px solid rgba(55, 65, 81, 0.4)",
                fontSize: "0.72rem",
                color: "var(--text-dim)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {c.submitter && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <User size={11} /> {c.submitter}
                    </span>
                  )}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <Clock size={11} /> {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => onResolveTicket(c.id)}
                    disabled={isMutating}
                    className="btn btn-success btn-sm"
                    style={{ padding: "4px 8px" }}
                    title="Resolve"
                  >
                    <CheckCircle size={13} />
                    <span>Resolve</span>
                  </button>

                  {confirmDeleteId !== c.id ? (
                    <button
                      onClick={() => setConfirmDeleteId(c.id)}
                      disabled={isMutating}
                      className="btn btn-danger btn-sm"
                      style={{ padding: "4px 6px" }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <button
                        onClick={async () => {
                          await onDeleteTicket(c.id);
                          setConfirmDeleteId(null);
                        }}
                        className="btn btn-danger btn-sm"
                        style={{ padding: "2px 5px", fontSize: "0.7rem" }}
                      >
                        Del
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "2px 5px", fontSize: "0.7rem" }}
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
