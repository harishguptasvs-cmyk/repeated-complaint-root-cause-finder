import React, { useState } from "react";
import { X, Send, Sparkles, AlertCircle } from "lucide-react";

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

const PRESETS = [
  {
    label: "WiFi Issue",
    title: "Campus WiFi drops repeatedly in Block A",
    description: "Wireless network keeps dropping every few minutes in Block A classrooms. Reconnecting disrupts coursework.",
    category: "IT",
    submitter: "Dr. Sharma",
  },
  {
    label: "Cold Food",
    title: "Canteen lunch served cold",
    description: "The food served at the main cafeteria is lukewarm or cold during 1 PM lunch peak.",
    category: "Canteen",
    submitter: "Sneha Reddy",
  },
  {
    label: "Projector Failure",
    title: "Classroom 204 projector display failure",
    description: "Overhead projector powers on but displays no video signal during lecture presentations.",
    category: "Facilities",
    submitter: "Prof. Nair",
  },
];

export default function NewComplaintModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [submitter, setSubmitter] = useState("");
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Both a Title and a Description are required to log an operational ticket.");
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

      // Clear & Close
      setTitle("");
      setDescription("");
      setSubmitter("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit complaint.");
    }
  };

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setSubmitter(preset.submitter);
    setError(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Log Complaint Ticket</h3>
            <p style={{ fontSize: "0.78rem", margin: "2px 0 0", color: "var(--text-muted)" }}>
              Ticket will be processed immediately for incident clustering
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                backgroundColor: "var(--danger-subtle)",
                border: "1px solid var(--danger-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--danger-fg)",
                fontSize: "0.8rem",
                marginBottom: "16px",
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Test Presets */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Sparkles size={12} color="var(--accent)" />
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  1-Click Test Scenarios
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Complaint Title / Summary <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. WiFi dropping in Block A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={180}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Description <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Provide exact symptoms, room location, and frequency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Category & Submitter */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Submitter (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={submitter}
                  onChange={(e) => setSubmitter(e.target.value)}
                  maxLength={80}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              <Send size={14} />
              <span>{isSubmitting ? "Ingesting..." : "Create Ticket"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
