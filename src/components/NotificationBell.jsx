import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";
import { NavLink } from "react-router-dom";

export default function NotificationBell() {
  const { user, profile } = useAuth();
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const q = query(collection(db, "notifications"), where("recipientId", "==", userRef));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter((doc) => !doc.data().read);
      const unreadCount = unread.length;

      if (
        unreadCount > prevCount &&
        Notification.permission === "granted" &&
        unread.length > 0
      ) {
        const latest = unread[0].data();
        new Notification("New Notification", {
          body: latest.message || "You have a new alert.",
          icon: "/icons/notification.png",
        });
      }

      setPrevCount(unreadCount);
      setCount(unreadCount);
    });

    return () => unsubscribe();
  }, [user, prevCount]);

  const rolePath = profile?.role?.toLowerCase() || "patient";
  const targetPath = `/${rolePath}/notifications`;

  return ( <NavLink to={targetPath}> <FaBell /> Notifications ({count}) </NavLink>
  );
}
