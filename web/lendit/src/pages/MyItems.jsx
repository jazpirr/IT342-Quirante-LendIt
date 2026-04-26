import { useEffect, useState } from "react";
import ItemViewModal from "../components/ItemViewModal";
import "../css/MyItems.css";
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const ImgPlaceholder = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: "Pending",  cls: "mi-badge-pending" },
    approved: { label: "Approved", cls: "mi-badge-approved" },
    rejected: { label: "Rejected", cls: "mi-badge-rejected" },
    returned: { label: "Returned", cls: "mi-badge-returned" },
  };
  const { label, cls } = map[status?.toLowerCase()] || { label: status, cls: "mi-badge-pending" };
  return <span className={`mi-status-badge ${cls}`}>{label}</span>;
};

const MyItems = () => {
  const [items, setItems]         = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expanded, setExpanded]   = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => { fetchMyItems(); }, []);

  const fetchMyItems = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/items/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const itemsWithRequests = await Promise.all(
        data.map(async (item) => {
          const reqRes  = await fetch(`http://localhost:8080/api/requests/item/${item.itemId}`);
          const requests = await reqRes.json();
          return { item, requests };
        })
      );
      setItems(itemsWithRequests);
      // auto-expand all by default
      const init = {};
      itemsWithRequests.forEach(({ item }) => { init[item.itemId] = true; });
      setExpanded(init);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:8080/api/requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchMyItems();
    } catch (err) { console.error(err); }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const p = name.trim().split(" ");
    return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.substring(0, 2)).toUpperCase();
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>
      <main className="my-items-layout">

        {/* PAGE HEADER */}
        <div className="mi-page-header">
          <div className="mi-page-title-row">
            <div className="mi-page-icon">
              <Package size={22} color="white" />
            </div>
            <div>
              <h1 className="mi-page-title">My Items</h1>
              <p className="mi-page-sub">Manage your listed items and incoming borrow requests.</p>
            </div>
          </div>
          <div className="mi-page-count">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* EMPTY */}
        {items.length === 0 ? (
          <div className="mi-empty">
            <div className="mi-empty-icon">📦</div>
            <p className="mi-empty-title">No items listed yet.</p>
            <p className="mi-empty-sub">Tap the + button to add your first item.</p>
          </div>
        ) : (
          items.map(({ item, requests }, cardIdx) => (
            <div
              key={item.itemId}
              className="mi-card"
              style={{ animationDelay: `${cardIdx * 0.07}s` }}
            >
              {/* ── CARD HEADER ── */}
              <div className="mi-card-header" onClick={() => setSelectedItem(item)}>
                <div className="mi-card-thumb">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} />
                    : <div className="mi-card-thumb-placeholder"><ImgPlaceholder /></div>
                  }
                  <span className={`mi-avail-badge ${item.availability === "AVAILABLE" ? "avail" : "borrowed"}`}>
                    {item.availability === "AVAILABLE" ? "Available" : "Borrowed"}
                  </span>
                </div>

                <div className="mi-card-meta">
                  <div className="mi-card-meta-top">
                    <h3 className="mi-card-name">{item.name}</h3>
                    <div className="mi-card-meta-right">
                      {requests.length > 0 && (
                        <span className="mi-req-count-pill">
                          {requests.length} request{requests.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="mi-view-btn">
                        View <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                  <p className="mi-card-desc">{item.description || "No description provided."}</p>

                  {/* mini stats row */}
                  <div className="mi-card-stats">
                    <span className="mi-stat-chip">
                      <Clock size={11} />
                      {requests.filter(r => r.status === "PENDING").length} pending
                    </span>
                    <span className="mi-stat-chip mi-stat-green">
                      <CheckCircle size={11} />
                      {requests.filter(r => r.status === "APPROVED").length} approved
                    </span>
                    {requests.filter(r => r.status === "REJECTED").length > 0 && (
                      <span className="mi-stat-chip mi-stat-red">
                        <XCircle size={11} />
                        {requests.filter(r => r.status === "REJECTED").length} rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── REQUESTS ACCORDION ── */}
              <div
                className="mi-requests-toggle"
                onClick={() => toggleExpand(item.itemId)}
              >
                <span>Requests ({requests.length})</span>
                <ChevronRight
                  size={15}
                  className={`mi-toggle-icon ${expanded[item.itemId] ? "open" : ""}`}
                />
              </div>

              {expanded[item.itemId] && (
                <div className="mi-requests-body">
                  {requests.length === 0 ? (
                    <p className="mi-no-requests">No requests yet.</p>
                  ) : (
                    requests.map((req) => (
                      <div key={req.id} className="mi-req-row">
                        {/* Avatar */}
                        <div className="mi-req-avatar">
                          {req.imageUrl
                            ? <img src={req.imageUrl} alt="profile" />
                            : getInitials(req.borrowerName)
                          }
                        </div>

                        {/* Info */}
                        <div className="mi-req-info">
                          <p className="mi-req-name">{req.borrowerName || `User #${req.borrowerId}`}</p>
                          <div className="mi-req-dates">
                            <span className="mi-req-date-chip">
                              <Clock size={10} /> {fmt(req.requestedAt)}
                            </span>
                            {req.returnDate && (
                              <span className="mi-req-date-chip">
                                <CheckCircle size={10} /> Return: {fmt(req.returnDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status + Actions */}
                        <div className="mi-req-right">
                          <StatusBadge status={req.status} />
                          {req.status === "PENDING" && (
                            <div className="mi-req-actions">
                              <button
                                className="mi-btn-approve"
                                onClick={() => updateStatus(req.id, "APPROVED")}
                              >
                                Approve
                              </button>
                              <button
                                className="mi-btn-reject"
                                onClick={() => updateStatus(req.id, "REJECTED")}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {selectedItem && (
          <ItemViewModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            viewOnly
          />
        )}
      </main>
    </div>
  );
};

export default MyItems;