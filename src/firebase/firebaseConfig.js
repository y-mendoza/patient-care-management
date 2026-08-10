// src/firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlI04ySruuL_zJ-n_sBF_q4WOkCp2Grzo",
  authDomain: "salamatdoc-its120l-project.firebaseapp.com",
  projectId: "salamatdoc-its120l-project",
  storageBucket: "salamatdoc-its120l-project.firebasestorage.app",
  messagingSenderId: "793384134765",
  appId: "1:793384134765:web:01c5d9920619818d6db764",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

let messaging;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Firebase Messaging not supported in this environment:", err);
}

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: "BH1EvVN-OEulgeiNus5-UExr1-h2R6NDnD98gaFHWK8dIkO31t0ZbdWzwV-foBu2_othyEzDTbp0WJmFaUJpWdM" // ✅ your Web Push key
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available. Request permission first.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      resolve(payload);
    });
  });

export { app, auth, db, messaging };
