import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export default function NotificationToast({ toast, onClose }) {
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

  const config = {
    color: isSuccess ? "#34d399" : isError ? "#fb7185" : "#60a5fa",
    bg: isSuccess ? "rgba(6, 78, 59, 0.95)" : isError ? "rgba(136, 19, 55, 0.95)" : "rgba(30, 58, 138, 0.95)",
    border: isSuccess ? "rgba(16, 185, 129, 0.4)" : isError ? "rgba(244, 63, 94, 0.4)" : "rgba(59, 130, 246, 0.4)",
    Icon: isSuccess ? CheckCircle : isError ? AlertTriangle : Info,
  };

  const { Icon } = config;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "var(--radius-md)",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
        maxWidth: "420px",
      }}
      className="animate-fade-in"
    >
      <Icon size={18} color={config.color} />
      <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: 500, flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          cursor: "pointer",
          padding: "2px",
          display: "flex",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
