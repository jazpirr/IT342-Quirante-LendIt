import React, { useEffect, useState } from "react";
import "../css/BorrowItems.css";

const BorrowItems = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/requests/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setRequests(data);
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
    const parts = name.split(" ");
    return (
      (parts[0]?.charAt(0) || "") +
      (parts[1]?.charAt(0) || "")
    ).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="borrow-loading">Loading...</div>;
  }

  return (
    <div className="borrow-container">
      <h2 className="borrow-title">My Borrow Requests</h2>

      {requests.length === 0 ? (
        <div className="borrow-empty">
          <p>No borrow requests yet.</p>
        </div>
      ) : (
        <div className="borrow-list">
          {requests.map((req) => (
            <div key={req.id} className="borrow-card">

              {/* LEFT (PROFILE) */}
              <div className="borrow-avatar">
                {req.imageUrl ? (
                  <img src={req.imageUrl} alt="profile" />
                ) : (
                  <div className="avatar-fallback">
                    {getInitials(req.borrowerName)}
                  </div>
                )}
              </div>

              {/* RIGHT (INFO) */}
              <div className="borrow-details">
                <h3 className="borrow-name">{req.borrowerName}</h3>

                <p className="borrow-status">
                  Status:
                  <span className={`status ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>

                <p className="borrow-date">
                  Requested: {formatDate(req.requestedAt)}
                </p>

                {req.returnDate && (
                  <p className="borrow-return">
                    Return: {formatDate(req.returnDate)}
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowItems;