import { useCallback, useEffect, useState } from "react";
import { isLocalMode, getPushSettings, savePushSettings } from "@habits-db";
import { getMessagingIfSupported } from "../../lib/firebase.js";
import { getToken } from "firebase/messaging";
import { VAPID_KEY } from "../../lib/firebase.config.js";

const PUSH_SW_URL = "/vitalos-messaging-sw.js";
const PUSH_SW_SCOPE = "/vitalos-push/";

function mergePushSettings(base = {}, patch = {}) {
  const merged = { ...base, ...patch };
  const tokens = Array.from(new Set([
    ...(Array.isArray(base?.tokens) ? base.tokens : []),
    ...(base?.token ? [base.token] : []),
    ...(Array.isArray(patch?.tokens) ? patch.tokens : []),
    ...(patch?.token ? [patch.token] : []),
  ].filter(Boolean)));
  return {
    enabled: false,
    types: {},
    reminderTime: "18:00",
    ...merged,
    token: tokens[0] || merged.token || null,
    tokens,
  };
}

// VitalOS and Fitness share the Firestore document, but keep preferences and
// device tokens in separate app lanes.
export function usePushNotifications(user) {
  const [settings, setSettings] = useState(null);
  const [permission, setPermission] = useState(() =>
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLocalMode() || !user) return;
    let alive = true;
    getPushSettings().then((s) => alive && setSettings(mergePushSettings({}, s)));
    return () => { alive = false; };
  }, [user]);

  useEffect(() => {
    if (isLocalMode() || !user || permission !== "granted" || !settings?.enabled) return;
    let alive = true;
    (async () => {
      try {
        const messaging = await getMessagingIfSupported();
        if (!messaging) return;
        const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE });
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
        if (!alive || !token || settings.tokens?.includes(token)) return;
        const next = mergePushSettings(settings, { token, tokens: [...(settings.tokens || []), token] });
        await savePushSettings(next);
        if (alive) setSettings(next);
      } catch {
        // Keep existing preferences if this browser cannot migrate now.
      }
    })();
    return () => { alive = false; };
  }, [user, permission, settings]);

  const enable = useCallback(async () => {
    if (isLocalMode() || !user) return;
    setBusy(true);
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) throw new Error("Push wird auf diesem Gerät/Browser nicht unterstützt");

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE });
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (!token) throw new Error("Kein Push-Token erhalten");

      const next = mergePushSettings(settings, { enabled: true, token, types: { ...(settings?.types || {}), habit: true } });
      await savePushSettings(next);
      setSettings(next);
    } finally {
      setBusy(false);
    }
  }, [user, settings]);

  const disable = useCallback(async () => {
    if (isLocalMode() || !user) return;
    setBusy(true);
    try {
      const next = mergePushSettings(settings, { enabled: false });
      await savePushSettings(next);
      setSettings(next);
    } finally {
      setBusy(false);
    }
  }, [user, settings]);

  const updateReminderTime = useCallback(async (reminderTime) => {
    if (isLocalMode() || !user) return;
    const next = mergePushSettings(settings, { reminderTime });
    setSettings(next);
    await savePushSettings(next);
  }, [user, settings]);

  return { settings, permission, busy, enable, disable, updateReminderTime };
}
