import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api/client";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import ThresholdControl from "./components/ThresholdControl";
import ComplaintForm from "./components/ComplaintForm";
import ClusterCard from "./components/ClusterCard";
import IndividualReports from "./components/IndividualReports";
import NotificationToast from "./components/NotificationToast";
import { 
  Network, 
  ListFilter, 
  Search, 
  FileCheck, 
  AlertCircle,
  Clock,
  User,
  CheckCircle2,
  Trash2
} from "lucide-react";

export default function App() {
  const [stats, setStats] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [individualReports, setIndividualReports] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  
  const [threshold, setThreshold] = useState(0.12);
  const [activeTab, setActiveTab] = useState("caseboard"); // "caseboard" | "all_tickets"
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadData = useCallback(async (currentThreshold = threshold, isInitial = false) => {
    try {
      if (!isInitial) setIsRefreshing(true);
      
      const [statsRes, clustersRes, allRes] = await Promise.all([
        api.getStats(currentThreshold),
        api.getClusters(currentThreshold),
        api.getComplaints(),
      ]);

      setStats(statsRes);
      setClusters(clustersRes.clusters || []);
      setIndividualReports(clustersRes.individual_reports || []);
      setAllComplaints(allRes || []);
      setIsConnected(true);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setIsConnected(false);
      showToast(err.message || "Cannot connect to backend server.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [threshold]);

  // Initial mount
  useEffect(() => {
    loadData(0.12, true);
  }, []);

  // Threshold change handler
  const handleThresholdChange = (newVal) => {
    setThreshold(newVal);
    loadData(newVal, false);
  };

  // Submit Complaint
  const handleCreateComplaint = async (payload) => {
    setIsMutating(true);
    try {
      await api.createComplaint(payload);
      showToast("Complaint submitted and analyzed into clusters!", "success");
      await loadData(threshold);
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (id) => {
    setIsMutating(true);
    try {
      await api.updateComplaintStatus(id, "resolved");
      showToast(`Complaint #${id} marked as resolved.`, "success");
      await loadData(threshold);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsMutating(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (id) => {
    setIsMutating(true);
    try {
      await api.deleteComplaint(id);
      showToast(`Complaint #${id} deleted.`, "info");
      await loadData(threshold);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsMutating(false);
    }
  };

  // Bulk Resolve Cluster
  const handleBulkResolve = async (ids) => {
    setIsMutating(true);
    try {
      const res = await api.bulkResolveComplaints(ids);
      showToast(`Resolved ${res.resolved_count} complaints in incident cluster!`, "success");
      await loadData(threshold);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsMutating(false);
    }
  };

  // Search filtering for all complaints table
  const filteredAllComplaints = allComplaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.submitter && c.submitter.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(threshold)}
      />

      {/* KPI Metric Summary Cards */}
      <StatsBar stats={stats} />

      {/* Main Content Two-Column Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(320px, 380px) 1fr",
        gap: "24px",
        alignItems: "start",
      }}>
        
        {/* Left Column: Complaint Intake Form */}
        <div>
          <ComplaintForm
            onSubmit={handleCreateComplaint}
            isSubmitting={isMutating}
          />
        </div>

        {/* Right Column: Case Board & Analytics */}
        <div>
          {/* Threshold Tuning Slider */}
          <ThresholdControl
            threshold={threshold}
            onChange={handleThresholdChange}
            disabled={isRefreshing || isMutating}
          />

          {/* Navigation Tabs & Search */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setActiveTab("caseboard")}
                className={`btn ${activeTab === "caseboard" ? "btn-primary" : "btn-secondary"}`}
              >
                <Network size={16} />
                <span>Incident Case Board ({clusters.length} Clusters)</span>
              </button>
              
              <button
                onClick={() => setActiveTab("all_tickets")}
                className={`btn ${activeTab === "all_tickets" ? "btn-primary" : "btn-secondary"}`}
              >
                <FileCheck size={16} />
                <span>All Tickets Log ({allComplaints.length})</span>
              </button>
            </div>

            {activeTab === "all_tickets" && (
              <div style={{ display: "flex", alignItems: "center", position: "relative", minWidth: "240px" }}>
                <Search size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                <input
                  type="text"
                  placeholder="Filter tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "32px", fontSize: "0.825rem", padding: "6px 12px 6px 32px" }}
                />
              </div>
            )}
          </div>

          {/* Tab 1: Incident Case Board */}
          {activeTab === "caseboard" && (
            <div>
              {/* Section 1: Detected Root-Cause Clusters */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.2rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Network size={20} color="var(--accent-purple)" />
                    <span>Discovered Root-Cause Clusters</span>
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Sorted by Incident Size
                  </span>
                </div>

                {clusters.length === 0 ? (
                  <div className="glass-panel" style={{ padding: "36px", textAlign: "center" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}>
                      <Network size={24} color="var(--primary)" />
                    </div>
                    <h4 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>No Repeated Incident Clusters Found</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto" }}>
                      Either there are no open complaints or tickets do not meet similarity threshold ({threshold}). 
                      Try lowering the sensitivity slider above or submit sample tickets.
                    </p>
                  </div>
                ) : (
                  <div>
                    {clusters.map((cluster) => (
                      <ClusterCard
                        key={cluster.cluster_id}
                        cluster={cluster}
                        onResolveTicket={handleResolveTicket}
                        onDeleteTicket={handleDeleteTicket}
                        onBulkResolve={handleBulkResolve}
                        isMutating={isMutating}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Individual / Unclustered Reports */}
              <div>
                <IndividualReports
                  reports={individualReports}
                  onResolveTicket={handleResolveTicket}
                  onDeleteTicket={handleDeleteTicket}
                  isMutating={isMutating}
                />
              </div>
            </div>
          )}

          {/* Tab 2: All Tickets Audit Table */}
          {activeTab === "all_tickets" && (
            <div className="glass-panel" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>All Incident Tickets In SQLite Database</h3>
                <span className="badge badge-slate">{filteredAllComplaints.length} Records</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredAllComplaints.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
                    No matching complaints found.
                  </p>
                ) : (
                  filteredAllComplaints.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 16px",
                        border: "1px solid rgba(55, 65, 81, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "240px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)" }}>
                            #{c.id}
                          </span>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>
                            {c.title}
                          </span>
                          <span className={`badge ${c.status === "open" ? "badge-amber" : "badge-emerald"}`} style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                            {c.status}
                          </span>
                          {c.category && (
                            <span className="badge badge-slate" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                              {c.category}
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0 0 6px" }}>
                          {c.description}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.72rem", color: "var(--text-dim)" }}>
                          {c.submitter && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <User size={11} /> {c.submitter}
                            </span>
                          )}
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <Clock size={11} /> {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {c.status === "open" ? (
                          <button
                            onClick={() => handleResolveTicket(c.id)}
                            disabled={isMutating}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircle2 size={13} />
                            <span>Resolve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => api.updateComplaintStatus(c.id, "open").then(() => loadData(threshold))}
                            disabled={isMutating}
                            className="btn btn-secondary btn-sm"
                            title="Reopen ticket"
                          >
                            <span>Reopen</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTicket(c.id)}
                          disabled={isMutating}
                          className="btn btn-danger btn-sm"
                          title="Delete ticket"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Floating Notification Toast */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
