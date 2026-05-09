import React, { useState, useEffect, useCallback } from "react";
import { Users, Package, HandshakeIcon, Flag, CheckCircle, XCircle, LogOut, ShieldCheck, Trash2, UserX } from "lucide-react";
import "./AdminDashboard.css";

const API = "http://localhost:8080/api";

const StatusPill = ({ status }) => {
  const map = {
    PENDING:   { cls: "ad-pill-pending",   label: "Pending" },
    RESOLVED:  { cls: "ad-pill-resolved",  label: "Resolved" },
    DISMISSED: { cls: "ad-pill-dismissed", label: "Dismissed" },
  };
  const { cls, label } = map[status] || { cls: "ad-pill-pending", label: status };
  return <span className={`ad-pill ${cls}`}>{label}</span>;
};

const TypeBadge = ({ type }) => (
  <span className={`ad-type-badge ${type === "NON_RETURN" ? "ad-type-nonreturn" : "ad-type-item"}`}>
    {type === "NON_RETURN" ? "Non-Return" : "Item"}
  </span>
);

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers });
      setStats(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${API}/reports?status=${filter}`, { headers });
      setReports(await res.json());
    } catch { /* silent */ }
  }, [filter]);

  useEffect(() => {
    Promise.all([fetchStats(), fetchReports()]).finally(() => setLoading(false));
  }, [fetchStats, fetchReports]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/reports/${id}/status`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchReports();
    fetchStats();
  };

  const deleteItem = async (itemId, reportId) => {
    if (!window.confirm("Delete this item permanently? This cannot be undone.")) return;
    await fetch(`${API}/admin/items/${itemId}?reportId=${reportId}`, {
      method: "DELETE",
      headers,
    });
    fetchReports();
    fetchStats();
  };

  const blockUser = async (reportedUserId, reportId) => {
    if (!window.confirm("Block this user? They will no longer be able to log in.")) return;
    await fetch(`${API}/admin/users/${reportedUserId}/block?reportId=${reportId}`, {
      method: "PUT",
      headers,
    });
    fetchReports();
    fetchStats();
  };

  const initials = `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "A";

  return (
    <div className="ad-root">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo">
          <ShieldCheck size={22} />
          <span>Admin Panel</span>
        </div>

        <div className="ad-sidebar-user">
          <div className="ad-user-avatar">{initials}</div>
          <div>
            <div className="ad-user-name">{user?.fName} {user?.lName}</div>
            <div className="ad-user-role">Administrator</div>
          </div>
        </div>

        <nav className="ad-nav">
          <button className="ad-nav-item active">
            <Flag size={16} /> Reports
          </button>
        </nav>

        <button className="ad-logout" onClick={onLogout}>
          <LogOut size={15} /> Log Out
        </button>
      </aside>

      {/* Main content */}
      <main className="ad-main">
        <div className="ad-topbar">
          <h1 className="ad-page-title">Dashboard</h1>
          <p className="ad-page-sub">Monitor platform activity and manage reports.</p>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="ad-stats-grid">
            <div className="ad-stat-card ad-stat-blue">
              <div className="ad-stat-icon"><Users size={22} /></div>
              <div className="ad-stat-info">
                <div className="ad-stat-num">{stats.totalUsers}</div>
                <div className="ad-stat-label">Total Users</div>
              </div>
            </div>
            <div className="ad-stat-card ad-stat-green">
              <div className="ad-stat-icon"><Package size={22} /></div>
              <div className="ad-stat-info">
                <div className="ad-stat-num">{stats.totalItems}</div>
                <div className="ad-stat-label">Listed Items</div>
              </div>
            </div>
            <div className="ad-stat-card ad-stat-teal">
              <div className="ad-stat-icon"><HandshakeIcon size={22} /></div>
              <div className="ad-stat-info">
                <div className="ad-stat-num">{stats.activeBorrows}</div>
                <div className="ad-stat-label">Active Borrows</div>
              </div>
            </div>
            <div className="ad-stat-card ad-stat-red">
              <div className="ad-stat-icon"><Flag size={22} /></div>
              <div className="ad-stat-info">
                <div className="ad-stat-num">{stats.pendingReports}</div>
                <div className="ad-stat-label">Pending Reports</div>
              </div>
            </div>
          </div>
        )}

        {/* Reports table */}
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Reports</h2>
            <div className="ad-filter-tabs">
              {["ALL", "PENDING", "RESOLVED", "DISMISSED"].map((f) => (
                <button
                  key={f}
                  className={`ad-filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="ad-loading">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="ad-empty">
              <Flag size={32} className="ad-empty-icon" />
              <p>No reports found.</p>
            </div>
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reporter</th>
                    <th>Reported</th>
                    <th>Item</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td><TypeBadge type={r.reportType} /></td>
                      <td className="ad-td-name">{r.reporterName}</td>
                      <td className="ad-td-name">{r.reportedUserName || "—"}</td>
                      <td className="ad-td-item">{r.itemName || "—"}</td>
                      <td className="ad-td-reason">{r.reason}</td>
                      <td className="ad-td-date">{fmt(r.createdAt)}</td>
                      <td><StatusPill status={r.status} /></td>
                      <td>
                        {r.status === "PENDING" ? (
                          <div className="ad-actions">
                            {r.reportType === "ITEM" && r.itemId && (
                              <button
                                className="ad-btn-delete"
                                onClick={() => deleteItem(r.itemId, r.id)}
                                title="Delete item"
                              >
                                <Trash2 size={14} /> Delete Item
                              </button>
                            )}
                            {r.reportType === "NON_RETURN" && r.reportedUserId && (
                              <button
                                className="ad-btn-block"
                                onClick={() => blockUser(r.reportedUserId, r.id)}
                                title="Block user"
                              >
                                <UserX size={14} /> Block User
                              </button>
                            )}
                            <button
                              className="ad-btn-dismiss"
                              onClick={() => updateStatus(r.id, "DISMISSED")}
                              title="Dismiss"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="ad-td-done">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
