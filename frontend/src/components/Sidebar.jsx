import React from "react";
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Sliders, 
  ShieldCheck, 
  Server
} from "lucide-react";

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  clusterCount = 0, 
  openCount = 0, 
  isConnected 
}) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "clusters",
      label: "Incident Clusters",
      icon: Layers,
      badge: clusterCount > 0 ? `${clusterCount} active` : null,
      badgeVariant: "badge-accent",
    },
    {
      id: "complaints",
      label: "All Complaints",
      icon: FileText,
      badge: openCount > 0 ? `${openCount} open` : null,
      badgeVariant: "badge-warning",
    },
    {
      id: "settings",
      label: "Algorithm & Sensitivity",
      icon: Sliders,
      badge: null,
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Identity */}
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}>
            RC
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Root-Cause Finder
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Operations Incident Hub
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Group */}
      <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        <div className="nav-group-title">Incident Analysis</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-item-content">
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge ${item.badgeVariant || "badge-neutral"}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Engine Status / System Info */}
      <div style={{
        padding: "14px 18px",
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Backend Engine
          </span>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: isConnected ? "var(--success)" : "var(--danger)",
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "var(--success)" : "var(--danger)",
            }} />
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Local TF-IDF / DSU (v1.0.0)
        </div>
      </div>
    </aside>
  );
}
