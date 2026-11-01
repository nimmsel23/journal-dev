import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db, getMessagingIfSupported } from "../lib/firebase.js";
import { VAPID_KEY } from "../lib/firebase.config.js";

const PUSH_SW = {
  tent: { url: "/tent-messaging-sw.js", scope: "/tent-push/" },
  journal: { url: "/journal-messaging-sw.js", scope: "/journal-push/" },
  door: { url: "/journal-messaging-sw.js", scope: "/journal-push/" },
};
const pushRef = (uid) => doc(db, "fitness", uid, "settings", "push");

// app: "journal" (Standard) oder "door" — beide teilen sich Service Worker und Push-Token,
// nur Einstellungen (apps.<app>) und Standard-Uhrzeit unterscheiden sich.
function normalize(data = {}, app = "journal") {
  const tokens = Array.from(new Set([...(Array.isArray(data.tokens) ? data.tokens : []), data.token].filter(Boolean)));
  const defaultTime = app === "door" ? "08:00" : app === "tent" ? "14:00" : "18:00";
  return { enabled: false, reminderTime: defaultTime, ...data, token: tokens[0] || null, tokens };
}

export function useJournalPushNotifications(user, app = "journal") {
  const worker = PUSH_SW[app] || PUSH_SW.journal;
  const [settings, setSettings] = useState(null);
  const [permission, setPermission] = useState(() => typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const [busy, setBusy] = useState(false);

  const save = useCallback(async (next) => {
    if (!user?.uid) return;
    const normalized = normalize(next, app);
    setSettings(normalized); // Offline-first: sofort lokal; Firestore hält den Schreibzugriff in der Warteschlange (nie awaiten)
    setDoc(pushRef(user.uid), { apps: { [app]: normalized } }, { merge: true }).catch(() => {});
  }, [user?.uid, app]);

  useEffect(() => {
    if (!user?.uid) { setSettings(null); return; }
    let active = true;
    getDoc(pushRef(user.uid)).then((snap) => {
      if (active) setSettings(normalize(snap.data()?.apps?.[app] || {}, app));
    }).catch(() => { if (active) setSettings(normalize({}, app)); });
    return () => { active = false; };
  }, [user?.uid, app]);

  useEffect(() => {
    if (!user?.uid || permission !== "granted" || !settings?.enabled) return;
    let active = true;
    (async () => {
      try {
        const messaging = await getMessagingIfSupported();
        if (!messaging) return;
        const registration = await navigator.serviceWorker.register(worker.url, { scope: worker.scope });
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
        if (!active || !token || settings.tokens.includes(token)) return;
        await save({ ...settings, token, tokens: [...settings.tokens, token] });
      } catch { /* Registration can be retried on the next app visit. */ }
    })();
    return () => { active = false; };
  }, [user?.uid, permission, settings, save, worker.url, worker.scope]);

  const enable = useCallback(async () => {
    if (!user?.uid) return;
    setBusy(true);
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) throw new Error("Push wird auf diesem Gerät nicht unterstützt.");
      const granted = await Notification.requestPermission();
      setPermission(granted);
      if (granted !== "granted") return;
      const registration = await navigator.serviceWorker.register(worker.url, { scope: worker.scope });
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (!token) throw new Error("Firebase hat kein Push-Token geliefert.");
      await save({ ...settings, enabled: true, token, tokens: [...(settings?.tokens || []), token] });
    } finally { setBusy(false); }
  }, [user?.uid, settings, save, worker.url, worker.scope]);

  const disable = useCallback(() => save({ ...settings, enabled: false }), [settings, save]);
  const updateReminderTime = useCallback((reminderTime) => save({ ...settings, reminderTime }), [settings, save]);
  return { settings, permission, busy, enable, disable, updateReminderTime };
}
