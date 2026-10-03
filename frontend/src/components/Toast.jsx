import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

  const styleConfig = {
    bg: isSuccess ? "var(--success-subtle)" : isError ? "var(--danger-subtle)" : "var(--info-subtle)",
    border: isSuccess ? "var(--success-border)" : isError ? "var(--danger-border)" : "var(--info-border)",
    color: isSuccess ? "var(--success-fg)" : isError ? "var(--danger-fg)" : "var(--info-fg)",
    iconColor: isSuccess ? "var(--success)" : isError ? "var(--danger)" : "var(--info)",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "24px",
        zIndex: 100,
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${styleConfig.border}`,
        borderLeft: `4px solid ${styleConfig.iconColor}`,
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "var(--shadow-md)",
        maxWidth: "420px",
      }}
    >
      <Icon size={16} color={styleConfig.iconColor} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: "0.825rem", color: "var(--text-primary)", fontWeight: 500, flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={onClose}
        className="btn btn-ghost btn-sm"
        style={{ padding: "2px", color: "var(--text-muted)" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
