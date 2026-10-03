import React from "react";
import { Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";

export default function TopBar({ 
  onOpenNewComplaintModal, 
  onRefresh, 
  isRefreshing, 
  threshold,
  searchQuery,
  onSearchChange
}) {
  return (
    <header className="top-bar">
      {/* Search Input */}
      <div style={{ position: "relative", width: "320px", maxWidth: "100%" }}>
        <Search 
          size={14} 
          style={{ 
            position: "absolute", 
            left: "10px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            color: "var(--text-muted)" 
          }} 
        />
        <input
          type="text"
          placeholder="Search complaints, categories, locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: "32px",
            height: "32px",
            fontSize: "0.8rem",
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-subtle)",
          }}
        />
      </div>

      {/* Action Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Active Threshold Indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-subtle)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}>
          <SlidersHorizontal size={13} color="var(--text-muted)" />
          <span>Threshold:</span>
          <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {threshold.toFixed(2)}
          </span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn btn-secondary btn-sm"
          title="Refresh live clustering and database state"
        >
          <RefreshCw size={13} style={{
            animation: isRefreshing ? "spin 1s linear infinite" : "none"
          }} />
          <span>Refresh</span>
        </button>

        {/* New Ticket Modal Trigger */}
        <button
          onClick={onOpenNewComplaintModal}
          className="btn btn-primary btn-sm"
        >
          <Plus size={14} />
          <span>Log Complaint</span>
        </button>
      </div>
    </header>
  );
}
