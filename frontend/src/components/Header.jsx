import React from "react";
import { Activity, RefreshCw, Cpu, Layers, ShieldCheck } from "lucide-react";

export default function Header({ isConnected, isRefreshing, onRefresh }) {
  return (
    <header className="glass-panel" style={{ padding: "16px 24px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        
        {/* Left: Branding & Tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
          }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
                Repeated Complaint Root-Cause Finder
              </h1>
              <span className="badge badge-purple" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                AI / NLP Incident Hub
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
              Dynamic TF-IDF + Cosine Similarity + Union-Find transitive incident clustering
            </p>
          </div>
        </div>

        {/* Right: Status Indicator & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            background: isConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
            border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            fontSize: "0.8rem",
            fontWeight: 600,
            color: isConnected ? "#34d399" : "#fb7185",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "#10b981" : "#f43f5e",
            }} className={isConnected ? "pulse-dot" : ""} />
            {isConnected ? "Engine Connected (FastAPI)" : "Backend Disconnected"}
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            title="Refresh clusters and stats"
            style={{ padding: "8px 14px" }}
          >
            <RefreshCw size={16} className={isRefreshing ? "spin" : ""} style={{
              animation: isRefreshing ? "spin 1s linear infinite" : "none"
            }} />
            <span>Refresh</span>
          </button>
        </div>

      </div>
    </header>
  );
}
