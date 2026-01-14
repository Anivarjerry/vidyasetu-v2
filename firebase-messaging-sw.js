
// Scripts for firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBX8SHAdbLPxJnFSF02sXcb4E5JBFbxyOI",
  authDomain: "vidyasetu-ai.firebaseapp.com",
  projectId: "vidyasetu-ai",
  storageBucket: "vidyasetu-ai.firebasestorage.app",
  messagingSenderId: "780313942096",
  appId: "1:780313942096:web:b0749c355fae48e38d5955",
  measurementId: "G-TTPBZM3XX3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // Ensure you have an icon or remove this line
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
