const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ── Google (Tasks + Calendar) dauerhaft verbinden ──
// Einrichtung: JOURNAL-V2.md, Abschnitt „Google dauerhaft verbinden“. Secret/Parameter:
//   firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET   ·   GOOGLE_OAUTH_CLIENT_ID (beim Deploy abgefragt)
const { defineSecret, defineString } = require("firebase-functions/params");
const { createGoogleHandlers } = require("./google");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_OAUTH_CLIENT_SECRET");
const GOOGLE_CLIENT_ID = defineString("GOOGLE_OAUTH_CLIENT_ID", { default: "" });

const googleCall = (fn) =>
  functions
    .region("europe-west1")
    .runWith({ secrets: [GOOGLE_CLIENT_SECRET] })
    .https.onCall(async (data, context) => {
      if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "login-required");
      const col = admin.firestore().collection("googleTokens");
      const handlers = createGoogleHandlers({
        fetchImpl: fetch,
        store: {
          get: async (uid) => (await col.doc(uid).get()).data() || null,
          set: (uid, value) => col.doc(uid).set(value),
          delete: (uid) => col.doc(uid).delete(),
        },
        clientId: GOOGLE_CLIENT_ID.value(),
        clientSecret: GOOGLE_CLIENT_SECRET.value(),
        HttpsError: functions.https.HttpsError,
      });
      return fn(handlers, context.auth.uid, data || {});
    });

exports.googleLinkConfig = googleCall((h) => h.linkConfig());
exports.googleLink = googleCall((h, uid, data) => h.link(uid, data.code));
exports.googleAccessToken = googleCall((h, uid) => h.accessToken(uid));
exports.googleUnlink = googleCall((h, uid) => h.unlink(uid));

const TIME_ZONE = "Europe/Berlin";
const REMINDER_WINDOW_MINUTES = 5;

function getLocalDateParts(date = new Date(), timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${byType.year}-${byType.month}-${byType.day}`,
    time: `${byType.hour}:${byType.minute}`,
    minutes: Number(byType.hour) * 60 + Number(byType.minute),
  };
}

function parseReminderMinutes(reminderTime) {
  if (typeof reminderTime !== "string" || !/^\d{2}:\d{2}$/.test(reminderTime)) return null;
  const [hour, minute] = reminderTime.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return hour * 60 + minute;
}

function isReminderDue(reminderTime, currentMinutes) {
  const targetMinutes = parseReminderMinutes(reminderTime);
  if (targetMinutes == null) return false;
  const delta = currentMinutes - targetMinutes;
  return delta >= 0 && delta < REMINDER_WINDOW_MINUTES;
}

function normalizeTokens(data = {}) {
  return Array.from(new Set([
    ...(Array.isArray(data.tokens) ? data.tokens : []),
    ...(data.token ? [data.token] : []),
  ].filter(Boolean)));
}

async function sendReminder(uid, tokens, title, body, link) {
  if (!tokens || tokens.length === 0) return { sentCount: 0, failureCount: 0 };

  try {
    const message = {
      data: {
        app: "journal",
        title,
        body,
        link: link || "/",
        tag: "journal-reminder",
      },
      tokens,
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    return {
      sentCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error(`Error sending reminders to ${uid}:`, error);
    return { sentCount: 0, failureCount: tokens.length, error: error.message };
  }
}

exports.scheduledJournalPushReminders = functions
  .region("europe-west1")
  .pubsub.schedule("every 5 minutes")
  .timeZone(TIME_ZONE)
  .onRun(async (context) => {
    const { minutes } = getLocalDateParts();
    const db = admin.firestore();
    let sentCount = 0;
    let failureCount = 0;

    try {
      // "push" is a settings document, not a collection group.
      const users = await db.collection("fitness").listDocuments();
      for (const user of users) {
        const doc = await user.collection("settings").doc("push").get();
        if (!doc.exists) continue;
        const stored = doc.data() || {};
        const data = stored.apps?.journal || {};
        if (!data.enabled) continue;

        const tokens = normalizeTokens(data);
        if (tokens.length === 0) continue;

        if (isReminderDue(data.reminderTime, minutes)) {
          const uid = user.id;
          const result = await sendReminder(
            uid,
            tokens,
            "Journal Reminder",
            "Time to write in your journal",
            "/"
          );
          sentCount += result.sentCount || 0;
          failureCount += result.failureCount || 0;
        }
      }

      console.log(`Push reminders: ${sentCount} sent, ${failureCount} failed`);
      return { sentCount, failureCount };
    } catch (error) {
      console.error("Error in scheduledPushReminders:", error);
      return { error: error.message };
    }
  });
