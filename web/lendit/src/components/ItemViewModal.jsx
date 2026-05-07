import { useEffect, useState } from "react";
import { Package, MessageCircle, HandshakeIcon, Flag } from "lucide-react";
import "../css/AddItemModal.css";
import ReportModal from "./ReportModal";

const ItemViewModal = ({ item, user, onClose, onMessage, onBorrow, viewOnly = false }) => {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [returnDate, setReturnDate] = useState("");
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/api/requests/item/${item.itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const myRequest = data.find(
          r =>
            r.borrowerId === user.id &&
            (r.status === "PENDING" || r.status === "APPROVED")
        );

        if (myRequest) {
          setAlreadyRequested(true);
        }
      })
      .catch(err => console.error(err));
  }, [item, user]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/items/${item.itemId}/images`)
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
  }, [item]);

  return (
    <div className="aim-backdrop" onClick={onClose}>
      <div className="aim-card" onClick={e => e.stopPropagation()}>
        <div className="aim-stripe" />

        {/* Header */}
        <div className="aim-header">
          <div className="aim-title-group">
            <div className="aim-icon-wrap">
              <Package size={18} color="white" />
            </div>
            <div>
              <div className="aim-title">{item.name}</div>
              <div className="aim-subtitle">Item Details</div>
            </div>
          </div>
        </div>

        <div className="aim-body">

          {/* Gallery */}
          {images.length > 0 ? (
            <div className="ivm-gallery">
              <div className="ivm-featured-wrap">
                <img
                  src={images[activeIdx].imageUrl}
                  className="ivm-featured-img"
                  alt="Item photo"
                />
                <span className="ivm-featured-badge">
                  {activeIdx === 0 ? "Cover Photo" : `Photo ${activeIdx + 1}`}
                </span>
                <span className="ivm-img-count">
                  {activeIdx + 1} / {images.length}
                </span>
              </div>
              {images.length > 1 && (
                <div className="ivm-strip">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`ivm-thumb ${i === activeIdx ? "active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      <img src={img.imageUrl} alt={`thumb-${i}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ivm-no-image">No images available</div>
          )}

          {/* Status row */}
          <div className="ivm-info-row">
            <span className="ivm-owner">
              Posted by <strong>{item.ownerName || "a member"}</strong>
            </span>
            <span className="ivm-status-pill">Available to Borrow</span>
          </div>

          {/* Description */}
          <div className="aim-field">
            <label className="aim-label">Description</label>
            <div className="aim-textarea" style={{ background: "#F9FFFE", minHeight: 52 }}>
              {item.description || "No description provided"}
            </div>
          </div>

          {/* Return Date — hidden in viewOnly mode */}
          {!viewOnly && (
            <div className="aim-field">
              <label className="aim-label">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="aim-input"
              />
            </div>
          )}

          {/* Actions — hidden in viewOnly mode */}
          {!viewOnly && (
            <div className="aim-actions">
              <button className="ivm-btn-message" onClick={onMessage}>
                <MessageCircle size={15} /> Message
              </button>
              <button
                className="aim-submit"
                disabled={alreadyRequested}
                onClick={() => onBorrow(item, returnDate)}
              >
                <HandshakeIcon size={15} />
                {alreadyRequested ? "Already Requested" : "Borrow"}
              </button>
            </div>
          )}

          {/* Report button — visible for non-owners */}
          {user && item.ownerId !== user.id && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <button
                className="ivm-btn-report"
                onClick={() => setShowReport(true)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: "#999", padding: "4px 8px",
                  borderRadius: 8, transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
                onMouseLeave={e => e.currentTarget.style.color = "#999"}
              >
                <Flag size={12} /> Report this item
              </button>
            </div>
          )}

        </div>
      </div>

      {showReport && (
        <ReportModal
          reportType="ITEM"
          itemId={item.itemId}
          itemName={item.name}
          reportedUserId={item.ownerId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default ItemViewModal;