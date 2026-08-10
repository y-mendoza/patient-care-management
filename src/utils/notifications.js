import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

/**
 * Send a new notification to a specific user (using Firestore reference).
 * @param {string} userId - The UID of the target user.
 * @param {string} title - The notification title.
 * @param {string} message - The notification message.
 */
export const sendNotification = async (userId, title, message) => {
  try {
    const recipientRef = doc(db, "users", userId);
    await addDoc(collection(db, "notifications"), {
      recipientId: recipientRef,
      title,
      message,
      read: false,
      timestamp: serverTimestamp(),
    });
    console.log(`Notification sent to user: ${userId}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
/**
 * Mark a specific notification as read.
 * @param {string} notificationId - Firestore document ID.
 */
export const markAsRead = async (notificationId) => {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { read: true });
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};

/**
 * Mark all notifications for a user as read.
 * @param {string} userId - Target user UID.
 */
export const markAllAsRead = async (userId) => {
  try {
    const recipientRef = doc(db, "users", userId);
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", recipientRef)
    );
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      await updateDoc(docSnap.ref, { read: true });
    }
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
};

/**
 * Fetch all notifications for a user, sorted by latest timestamp first.
 * @param {string} userId - Target user UID.
 * @returns {Array} notifications
 */
export const getNotifications = async (userId) => {
  try {
    const recipientRef = doc(db, "users", userId);
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", recipientRef),
      orderBy("timestamp", "desc") // Sort by latest first
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
  
};
