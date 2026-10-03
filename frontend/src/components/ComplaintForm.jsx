import React, { useState } from "react";
import { PlusCircle, Send, Sparkles, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "IT",
  "Facilities",
  "Canteen",
  "Hostel",
  "Library",
  "Transport",
  "Admin",
  "Sports",
  "Finance",
  "General",
];

const DEMO_TEMPLATES = [
  {
    title: "WiFi disconnecting in Block A Lab",
    description: "Wireless network keeps dropping every 5 minutes when using laptops in Block A. Cannot connect to class resources.",
    category: "IT",
    submitter: "Dev Test",
  },
  {
    title: "Lunch served cold at central cafeteria",
    description: "The food temperature during lunch hour is completely cold. Multiple students are complaining about cold meals.",
    category: "Canteen",
    submitter: "Dev Test",
  },
  {
    title: "Projector lamp failed in Room 204",
    description: "Overhead projector turns on but displays no video signal during class lectures in classroom 204.",
    category: "Facilities",
    submitter: "Dev Test",
  },
  {
    title: "Parking lot gate sensor malfunctioning",
    description: "The RFID barrier arm at the parking entrance is stuck in the down position creating severe morning traffic.",
    category: "Transport",
    submitter: "Dev Test",
  },
];

export default function ComplaintForm({ onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [submitter, setSubmitter] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide both a Title and a Description.");
      return;
    }

    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        submitter: submitter.trim() || null,
      });

      // Clear form on success
      setTitle("");
      setDescription("");
      setSubmitter("");
    } catch (err) {
      setError(err.message || "Failed to submit complaint.");
    }
  };

  const applyTemplate = (tmpl) => {
    setTitle(tmpl.title);
    setDescription(tmpl.description);
    setCategory(tmpl.category);
    setSubmitter(tmpl.submitter);
    setError(null);
  };

  return (
    <div className="glass-panel" style={{ padding: "22px 24px", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <PlusCircle size={18} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>File a Complaint Ticket</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              Tickets are analyzed in real time for root-cause grouping
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          background: "rgba(244, 63, 94, 0.12)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "#fb7185",
          fontSize: "0.825rem",
          marginBottom: "16px",
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick demo templates */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Sparkles size={13} color="#a855f7" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
            Quick Demo Templates (1-Click Test)
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {DEMO_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            >
              {tmpl.category}: {tmpl.title.slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "14px" }}>
          <label className="form-label">
            Complaint Summary / Title <span style={{ color: "var(--accent-rose)" }}>*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. WiFi keeps dropping in Block A"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={180}
            required
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label className="form-label">
            Detailed Description <span style={{ color: "var(--accent-rose)" }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Explain what is happening, exact symptoms, and timing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            maxLength={2000}
            required
            style={{ resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Submitter Name (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Sharma"
              value={submitter}
              onChange={(e) => setSubmitter(e.target.value)}
              disabled={isSubmitting}
              maxLength={80}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ width: "100%", padding: "11px" }}
        >
          <Send size={16} />
          <span>{isSubmitting ? "Ingesting & Clustering..." : "Submit Complaint Ticket"}</span>
        </button>
      </form>
    </div>
  );
}
