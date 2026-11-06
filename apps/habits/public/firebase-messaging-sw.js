/* global importScripts, firebase */

importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD1hvp2UYrvizLOzoSqOX-bwRWcCpJVAlg",
  authDomain: "fitness-aos.firebaseapp.com",
  projectId: "fitness-aos",
  storageBucket: "fitness-aos.firebasestorage.app",
  messagingSenderId: "842575255284",
  appId: "1:842575255284:web:65c4831683a893c110f0a1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = data.title || payload?.notification?.title || "VOS Habits";
  const body = data.body || payload?.notification?.body || "Offene Habits warten auf dich.";
  const link = data.link || "/";

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { link, tab: data.tab || "habits" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification?.data?.link || "/";

  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if ("focus" in client) {
        try {
          await client.navigate(link);
        } catch {}
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(link);
    return null;
  })());
});
