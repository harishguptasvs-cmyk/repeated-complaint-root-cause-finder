import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api/client";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import OverviewDashboard from "./components/OverviewDashboard";
import ClustersView from "./components/ClustersView";
import ComplaintsTableView from "./components/ComplaintsTableView";
import SettingsView from "./components/SettingsView";
import NewComplaintModal from "./components/NewComplaintModal";
import Toast from "./components/Toast";

export default function App() {
  const [currentView, setCurrentView] = useState("overview"); // "overview" | "clusters" | "complaints" | "settings"
  const [stats, setStats] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [individualReports, setIndividualReports] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  
  const [threshold, setThreshold] = useState(0.12);
  const [globalSearch, setGlobalSearch] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Centralized data loader
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
      console.error("Backend fetch error:", err);
      setIsConnected(false);
      showToast(err.message || "Cannot connect to backend server.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [threshold]);

  // Initial load
  useEffect(() => {
    loadData(0.12, true);
  }, []);

  // Threshold change
  const handleThresholdChange = (newVal) => {
    setThreshold(newVal);
    loadData(newVal, false);
  };

  // Submit Complaint
  const handleCreateComplaint = async (payload) => {
    setIsMutating(true);
    try {
      await api.createComplaint(payload);
      showToast("Complaint ticket created and processed.", "success");
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

  // Reopen Ticket
  const handleReopenTicket = async (id) => {
    setIsMutating(true);
    try {
      await api.updateComplaintStatus(id, "open");
      showToast(`Complaint #${id} reopened.`, "info");
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
      showToast(`Complaint #${id} removed.`, "info");
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
      showToast(`Resolved ${res.resolved_count} complaints in incident cluster.`, "success");
      await loadData(threshold);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Left Operational Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo(0, 0);
        }}
        clusterCount={clusters.length}
        openCount={stats?.open_complaints || 0}
        isConnected={isConnected}
      />

      {/* Main Work Area */}
      <div className="main-content-wrapper">
        {/* Top Header Bar */}
        <TopBar
          onOpenNewComplaintModal={() => setIsNewModalOpen(true)}
          onRefresh={() => loadData(threshold)}
          isRefreshing={isRefreshing}
          threshold={threshold}
          searchQuery={globalSearch}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (q.trim() && currentView === "overview") {
              setCurrentView("complaints");
            }
          }}
        />

        {/* Dynamic Page Views */}
        <main className="page-body">
          {currentView === "overview" && (
            <OverviewDashboard
              stats={stats}
              clusters={clusters}
              individualReports={individualReports}
              allComplaints={allComplaints}
              onViewChange={setCurrentView}
              onResolveTicket={handleResolveTicket}
              onBulkResolve={handleBulkResolve}
              isMutating={isMutating}
            />
          )}

          {currentView === "clusters" && (
            <ClustersView
              clusters={clusters}
              threshold={threshold}
              onThresholdChange={handleThresholdChange}
              onResolveTicket={handleResolveTicket}
              onDeleteTicket={handleDeleteTicket}
              onBulkResolve={handleBulkResolve}
              isMutating={isMutating}
            />
          )}

          {currentView === "complaints" && (
            <ComplaintsTableView
              complaints={allComplaints}
              clusters={clusters}
              onResolveTicket={handleResolveTicket}
              onReopenTicket={handleReopenTicket}
              onDeleteTicket={handleDeleteTicket}
              isMutating={isMutating}
            />
          )}

          {currentView === "settings" && (
            <SettingsView
              threshold={threshold}
              onThresholdChange={handleThresholdChange}
              stats={stats}
            />
          )}
        </main>
      </div>

      {/* Complaint Submission Dialog */}
      <NewComplaintModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateComplaint}
        isSubmitting={isMutating}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
