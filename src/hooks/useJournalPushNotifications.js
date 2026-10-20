import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db, getMessagingIfSupported } from "../lib/firebase.js";
import { VAPID_KEY } from "../lib/firebase.config.js";

const PUSH_SW_URL = "/journal-messaging-sw.js";
const PUSH_SW_SCOPE = "/journal-push/";
const pushRef = (uid) => doc(db, "fitness", uid, "settings", "push");

function normalize(data = {}) {
  const tokens = Array.from(new Set([...(Array.isArray(data.tokens) ? data.tokens : []), data.token].filter(Boolean)));
  return { enabled: false, reminderTime: "18:00", ...data, token: tokens[0] || null, tokens };
}

export function useJournalPushNotifications(user) {
  const [settings, setSettings] = useState(null);
  const [permission, setPermission] = useState(() => typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const [busy, setBusy] = useState(false);

  const save = useCallback(async (next) => {
    if (!user?.uid) return;
    const normalized = normalize(next);
    await setDoc(pushRef(user.uid), { apps: { journal: normalized } }, { merge: true });
    setSettings(normalized);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) { setSettings(null); return; }
    let active = true;
    getDoc(pushRef(user.uid)).then((snap) => {
      if (active) setSettings(normalize(snap.data()?.apps?.journal || {}));
    }).catch(() => { if (active) setSettings(normalize()); });
    return () => { active = false; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || permission !== "granted" || !settings?.enabled) return;
    let active = true;
    (async () => {
      try {
        const messaging = await getMessagingIfSupported();
        if (!messaging) return;
        const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE });
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
        if (!active || !token || settings.tokens.includes(token)) return;
        await save({ ...settings, token, tokens: [...settings.tokens, token] });
      } catch { /* Registration can be retried on the next app visit. */ }
    })();
    return () => { active = false; };
  }, [user?.uid, permission, settings, save]);

  const enable = useCallback(async () => {
    if (!user?.uid) return;
    setBusy(true);
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) throw new Error("Push wird auf diesem Gerät nicht unterstützt.");
      const granted = await Notification.requestPermission();
      setPermission(granted);
      if (granted !== "granted") return;
      const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE });
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (!token) throw new Error("Firebase hat kein Push-Token geliefert.");
      await save({ ...settings, enabled: true, token, tokens: [...(settings?.tokens || []), token] });
    } finally { setBusy(false); }
  }, [user?.uid, settings, save]);

  const disable = useCallback(() => save({ ...settings, enabled: false }), [settings, save]);
  const updateReminderTime = useCallback((reminderTime) => save({ ...settings, reminderTime }), [settings, save]);
  return { settings, permission, busy, enable, disable, updateReminderTime };
}
