import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import "../Notifications.css";

export default function PatientNotifications() {
  const { user } = useAuth();
  const { role } = useParams();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const userRef = doc(db, "users", user.uid);
      const q = query(collection(db, "notifications"), where("recipientId", "==", userRef));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id, currentState) => {
    const notifRef = doc(db, "notifications", id);
    await updateDoc(notifRef, { read: !currentState });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !currentState } : n))
    );
  };

  return (
    <div className="notifications-container">
      <div className="notifications-card">
        <h2 className="notifications-title">Notifications</h2>

        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet.</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li key={n.id} className={`notification-item ${n.read ? "read" : "unread"}`}>
                <div className="notification-header">
                  <h4 className="notification-title">{n.title || "Untitled Notification"}</h4>
                  <p className="notification-message">{n.message}</p>
                  <button
                    className={`mark-button ${n.read ? "mark-unread" : "mark-read"}`}
                    onClick={() => markAsRead(n.id, n.read)}
                  >
                    {n.read ? "Mark as Unread" : "Mark as Read"}
                  </button>
                </div>
                <small className="notification-timestamp">
                  {n.timestamp?.toDate().toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}