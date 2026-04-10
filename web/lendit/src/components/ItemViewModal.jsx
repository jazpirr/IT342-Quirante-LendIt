import { useEffect, useState } from "react";
import { X, Package, MessageCircle, HandshakeIcon } from "lucide-react";
import "../css/AddItemModal.css";

const ItemViewModal = ({ item, onClose, onMessage, onBorrow }) => {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

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

        {/* ── Header ── */}
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

          {/* ── Gallery ── */}
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

          {/* ── Status pill only ── */}
          <div className="ivm-info-row">
            <span className="ivm-owner">
              Posted by <strong>{item.ownerName || "a member"}</strong>
            </span>
            <span className="ivm-status-pill">Available to Borrow</span>
          </div>

          {/* ── Description ── */}
          <div className="aim-field">
            <label className="aim-label">Description</label>
            <div className="aim-textarea" style={{ background: "#F9FFFE", minHeight: 52 }}>
              {item.description || "No description provided"}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="aim-actions">
            <button className="ivm-btn-message" onClick={onMessage}>
              <MessageCircle size={15} />
              Message
            </button>
            <button className="aim-submit" onClick={onBorrow}>
              <HandshakeIcon size={15} />
              Borrow
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItemViewModal;