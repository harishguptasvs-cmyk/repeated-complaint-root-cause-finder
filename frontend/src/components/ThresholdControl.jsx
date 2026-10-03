import React from "react";
import { Sliders, Info, RotateCcw } from "lucide-react";

export default function ThresholdControl({ threshold, onChange, disabled }) {
  const getSensitivityLabel = (val) => {
    if (val < 0.09) return { text: "Very Permissive (Broad Grouping)", color: "#f59e0b" };
    if (val <= 0.15) return { text: "Calibrated / Optimal (Balanced)", color: "#10b981" };
    if (val <= 0.22) return { text: "Strict (High Vocabulary Match)", color: "#6366f1" };
    return { text: "Very Strict (Near Identical Wording)", color: "#f43f5e" };
  };

  const labelInfo = getSensitivityLabel(threshold);

  return (
    <div className="glass-panel" style={{ padding: "16px 20px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={18} color="var(--primary)" />
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>
            Clustering Similarity Threshold:
          </span>
          <span style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            fontFamily: "monospace",
            color: "#ffffff",
            background: "rgba(99, 102, 241, 0.2)",
            padding: "2px 8px",
            borderRadius: "6px",
            border: "1px solid rgba(99, 102, 241, 0.4)",
          }}>
            {threshold.toFixed(2)}
          </span>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: labelInfo.color,
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${labelInfo.color}40`,
          }}>
            {labelInfo.text}
          </span>
        </div>

        {threshold !== 0.12 && (
          <button
            onClick={() => onChange(0.12)}
            disabled={disabled}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            <RotateCcw size={12} />
            <span>Reset to Calibrated (0.12)</span>
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: "40px" }}>0.05</span>
        <input
          type="range"
          min="0.05"
          max="0.35"
          step="0.01"
          value={threshold}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          style={{
            flex: 1,
            height: "6px",
            borderRadius: "3px",
            accentColor: "var(--primary)",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: "40px" }}>0.35</span>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "10px",
        fontSize: "0.775rem",
        color: "var(--text-dim)",
      }}>
        <Info size={13} />
        <span>
          Lowering the threshold connects transitively related complaints with differing vocabulary; increasing it requires higher text similarity.
        </span>
      </div>
    </div>
  );
}
