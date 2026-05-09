import React, { useEffect, useState } from "react";
import "./BorrowItems.css";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const config = {
    pending:  { label: "Pending",  cls: "status-pending" },
    approved: { label: "Approved", cls: "status-approved" },
    rejected: { label: "Rejected", cls: "status-rejected" },
    returned: { label: "Returned", cls: "status-returned" },
  };
  const { label, cls } = config[s] || { label: status, cls: "status-pending" };
  return <span className={`borrow-status-badge ${cls}`}>{label}</span>;
};

const BorrowItems = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/requests/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        setRequests(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    const p = name.split(" ");
    return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";

  if (loading) {
    return (
      <div className="borrow-loading-wrap">
        <div className="borrow-loading-spinner" />
        <p>Loading your requests…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>
      <main className="borrow-layout">

        {/* PAGE HEADER */}
        <div className="borrow-page-header">
          <div className="borrow-page-title-row">
            <div className="borrow-page-icon">
              <BookOpen size={22} color="white" />
            </div>
            <div>
              <h1 className="borrow-page-title">My Borrow Requests</h1>
              <p className="borrow-page-sub">Track all the items you've requested to borrow.</p>
            </div>
          </div>
          <div className="borrow-page-count">
            {requests.length} request{requests.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* EMPTY STATE */}
        {requests.length === 0 ? (
          <div className="borrow-empty">
            <div className="borrow-empty-icon">📭</div>
            <p className="borrow-empty-title">No borrow requests yet.</p>
            <p className="borrow-empty-sub">Head to Home to find something to borrow!</p>
          </div>
        ) : (
          <div className="borrow-list">
            {requests.map((req, i) => (
              <div
                key={req.id}
                className="borrow-card"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* AVATAR */}
                <div className="borrow-avatar">
                  {req.imageUrl ? (
                    <img src={req.imageUrl} alt="profile" className="borrow-avatar-img" />
                  ) : (
                    <span className="borrow-avatar-initials">{getInitials(req.borrowerName)}</span>
                  )}
                </div>

                {/* DETAILS */}
                <div className="borrow-details">
                  <div className="borrow-card-top">
                    <h3 className="borrow-name">{req.borrowerName || "Unknown"}</h3>
                    <StatusBadge status={req.status} />
                  </div>

                  {req.itemName && (
                    <p className="borrow-item-name">📦 {req.itemName}</p>
                  )}

                  <div className="borrow-dates">
                    <span className="borrow-date-chip">
                      <Clock size={12} /> Requested: {formatDate(req.requestedAt)}
                    </span>
                    {req.returnDate && (
                      <span className="borrow-date-chip">
                        <CheckCircle size={12} /> Return: {formatDate(req.returnDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BorrowItems;
