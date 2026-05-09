import React, { useState } from "react";
import { Flag, X, AlertTriangle, Send } from "lucide-react";
import "./ReportModal.css";

const REASONS = {
  ITEM: [
    "Inappropriate or offensive content",
    "Fake or misleading listing",
    "Item does not exist",
    "Spam or scam",
    "Other",
  ],
  NON_RETURN: [
    "Item not returned after due date",
    "Borrower is unresponsive",
    "Item returned damaged",
    "Other",
  ],
};

const ReportModal = ({ reportType, itemId, itemName, reportedUserId, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reasons = REASONS[reportType] || REASONS.ITEM;
  const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason;

  const handleSubmit = async () => {
    if (!selectedReason) { setError("Please select a reason."); return; }
    if (selectedReason === "Other" && !customReason.trim()) { setError("Please describe the issue."); return; }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reportType,
          itemId,
          itemName,
          reportedUserId: reportedUserId || null,
          reason: finalReason,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");
      onSuccess?.();
      onClose();
    } catch {
      setError("Could not submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-backdrop" onClick={onClose}>
      <div className="rm-card" onClick={(e) => e.stopPropagation()}>
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-icon-wrap">
              <Flag size={16} color="white" />
            </div>
            <div>
              <div className="rm-title">
                {reportType === "NON_RETURN" ? "Report Non-Return" : "Report Item"}
              </div>
              <div className="rm-subtitle">{itemName}</div>
            </div>
          </div>
          <button className="rm-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="rm-body">
          {reportType === "NON_RETURN" && (
            <div className="rm-warning-bar">
              <AlertTriangle size={15} />
              <span>This report will be reviewed by our admin team.</span>
            </div>
          )}

          <p className="rm-label">What's the issue?</p>
          <div className="rm-reasons">
            {reasons.map((r) => (
              <button
                key={r}
                className={`rm-reason-btn ${selectedReason === r ? "selected" : ""}`}
                onClick={() => { setSelectedReason(r); setError(""); }}
              >
                {r}
              </button>
            ))}
          </div>

          {selectedReason === "Other" && (
            <textarea
              className="rm-textarea"
              placeholder="Describe the issue..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
            />
          )}

          {error && <p className="rm-error">{error}</p>}

          <div className="rm-actions">
            <button className="rm-cancel" onClick={onClose}>Cancel</button>
            <button className="rm-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : <><Send size={14} /> Submit Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
