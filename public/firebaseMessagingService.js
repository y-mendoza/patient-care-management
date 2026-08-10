importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js");

// Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyBlI04ySruuL_zJ-n_sBF_q4WOkCp2Grzo",
  authDomain: "salamatdoc-its120l-project.firebaseapp.com",
  projectId: "salamatdoc-its120l-project",
  storageBucket: "salamatdoc-its120l-project.firebasestorage.app",
  messagingSenderId: "793384134765",
  appId: "1:793384134765:web:01c5d9920619818d6db764"
});

// Retrieve messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebaseMessagingService.js] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "SalamatDoc Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message.",
    icon: "/favicon.ico"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
