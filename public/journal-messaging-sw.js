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

firebase.messaging().onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  if (data.app !== "journal" && data.app !== "door") return;
  const door = data.app === "door";
  self.registration.showNotification(data.title || (door ? "Door · Production" : "VitalOS Journal"), {
    body: data.body || (door ? "Offene Hits für heute." : "Zeit für deinen Journal-Eintrag."),
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || `${data.app}-reminder`,
    data: { link: data.link || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification?.data?.link || "/";
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if ("focus" in client) {
        try { await client.navigate(link); } catch {}
        return client.focus();
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(link) : null;
  })());
});
