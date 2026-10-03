import React from "react";
import { Inbox, AlertCircle, CheckCircle2, Network, PieChart, FileText } from "lucide-react";

export default function StatsBar({ stats }) {
  if (!stats) return null;

  const total = stats.total_complaints || 0;
  const open = stats.open_complaints || 0;
  const resolved = stats.resolved_complaints || 0;
  const clusters = stats.clusters_found || 0;
  const explained = stats.explained_complaints || 0;
  const individual = stats.individual_reports || 0;

  const explainedPercent = open > 0 ? Math.round((explained / open) * 100) : 0;

  const cards = [
    {
      label: "Total Tickets",
      value: total,
      sub: "Historical intake",
      icon: Inbox,
      color: "#60a5fa",
      bg: "rgba(59, 130, 246, 0.12)",
      border: "rgba(59, 130, 246, 0.25)",
    },
    {
      label: "Active / Open",
      value: open,
      sub: "Awaiting resolution",
      icon: AlertCircle,
      color: "#fbbf24",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.25)",
    },
    {
      label: "Root-Cause Clusters",
      value: clusters,
      sub: "Common incident groups",
      icon: Network,
      color: "#c084fc",
      bg: "rgba(168, 85, 247, 0.12)",
      border: "rgba(168, 85, 247, 0.25)",
    },
    {
      label: "Explained by Root Cause",
      value: `${explained} (${explainedPercent}%)`,
      sub: "Grouped multi-ticket incidents",
      icon: PieChart,
      color: "#818cf8",
      bg: "rgba(99, 102, 241, 0.12)",
      border: "rgba(99, 102, 241, 0.25)",
    },
    {
      label: "Individual Reports",
      value: individual,
      sub: "Uncorrelated issues",
      icon: FileText,
      color: "#94a3b8",
      bg: "rgba(100, 116, 139, 0.12)",
      border: "rgba(100, 116, 139, 0.25)",
    },
    {
      label: "Resolved",
      value: resolved,
      sub: "Completed tickets",
      icon: CheckCircle2,
      color: "#34d399",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.25)",
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "14px",
      marginBottom: "24px",
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: "16px 18px",
              borderLeft: `4px solid ${card.color}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {card.label}
              </span>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: card.bg,
                border: `1px solid ${card.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon size={16} color={card.color} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
