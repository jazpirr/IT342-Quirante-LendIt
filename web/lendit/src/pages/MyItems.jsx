import { useEffect, useState } from "react";
import ItemViewModal from "../components/ItemViewModal";
import "../css/MyItems.css";

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
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
          const reqRes = await fetch(`http://localhost:8080/api/requests/item/${item.itemId}`);
          const requests = await reqRes.json();
          return { item, requests };
        })
      );
      setItems(itemsWithRequests);
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
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="my-items-page">

      {/* Header */}
      <div className="my-items-header">
        <h2 className="my-items-title">My Items</h2>
        <span className="my-items-count">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty */}
      {items.length === 0 ? (
        <div className="my-items-empty">
          <div className="my-items-empty-icon">📦</div>
          <p>You haven't listed any items yet.</p>
        </div>
      ) : (
        items.map(({ item, requests }, cardIdx) => (
          <div
            key={item.itemId}
            className="mi-item-card"
            style={{ animationDelay: `${cardIdx * 0.07}s` }}
          >
            {/* Card Top — clickable to open modal */}
            <div className="mi-card-top" onClick={() => setSelectedItem(item)}>

              {/* Image */}
              <div className="mi-card-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="mi-card-no-image">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <span className="mi-card-status-badge">Available</span>
              </div>

              {/* Info */}
              <div className="mi-card-info">
                <div>
                  <p className="mi-card-name">{item.name}</p>
                  <p className="mi-card-desc">{item.description || "No description provided."}</p>
                </div>
                <div className="mi-card-footer">
                  <span className="mi-card-req-pill">
                    {requests.length} request{requests.length !== 1 ? "s" : ""}
                  </span>
                  <span className="mi-card-view-hint">
                    View details →
                  </span>
                </div>
              </div>
            </div>

            {/* Requests */}
            <div className="mi-requests-label">
              Requests ({requests.length})
            </div>

            {requests.length === 0 ? (
              <p className="mi-requests-empty">No requests yet</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="mi-request-row">
                  <div className="mi-request-avatar">
                    {req.imageUrl ? (
                      <img
                        src={req.imageUrl}
                        alt="profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      getInitials(req.borrowerName)
                    )}
                  </div>
                  <div className="mi-request-info">
                    <p className="mi-request-user">{req.borrowerName || `User #${req.borrowerId}`}</p>
                    <p className="mi-request-date">
                      Requested:{" "}
                      {req.requestedAt
                        ? new Date(req.requestedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "Recently"}
                    </p>

                    {req.returnDate && (
                      <p className="mi-request-return">
                        Return:{" "}
                        {new Date(req.returnDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                  <span className={`mi-status-badge ${req.status?.toLowerCase()}`}>
                    {req.status?.charAt(0) + req.status?.slice(1).toLowerCase()}
                  </span>
                  {req.status === "PENDING" && (
                    <div className="mi-request-actions">
                      <button className="mi-btn-approve" onClick={() => updateStatus(req.id, "APPROVED")}>
                        Approve
                      </button>
                      <button className="mi-btn-reject" onClick={() => updateStatus(req.id, "REJECTED")}>
                        Reject
                      </button>
                    </div>
                  )}
                  {req.status === "APPROVED" && req.returnDate && (
                    <p className="mi-request-return" style={{ color: "#16a34a", fontWeight: "500" }}>
                      Return by: {new Date(req.returnDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
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
    </div>
  );
};

export default MyItems;