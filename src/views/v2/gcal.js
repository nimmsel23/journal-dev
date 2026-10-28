// gcal.js — Google-Calendar-Lesezugriff (Journal v2 Review, Game v2 → Fire).
// Auth und Token liegen im gemeinsamen Dienst src/lib/google/ (derselbe wie für Google Tasks):
// dauerhafte Verknüpfung über die Cloud Function, Rückfall Firebase-Popup (~1 h). Hier nur REST.
// Fehler: "google-expired" (neu verbinden), "google-offline" (Verbindung bleibt) – siehe tokens.js.
//
// Voraussetzung (Google Cloud, Projekt hinter firebase.config.js): Google
// Calendar API aktiviert + Scope calendar.readonly im OAuth-Consent-Screen.
import { addDays, eachDayOfInterval, format, isBefore, parseISO } from "date-fns";
import { google } from "../../lib/google/auth.js";

const API = "https://www.googleapis.com/calendar/v3";

async function api(path, params) {
  const res = await google.authFetch(`${API}${path}?${new URLSearchParams(params)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `calendar ${res.status}`);
  }
  return res.json();
}

const iso = (d) => format(d, "yyyy-MM-dd");

/**
 * Termine aller ausgewählten Kalender im Zeitraum [from, to] (Date, inklusive).
 * Mehrtägige Termine werden pro Tag aufgeteilt; jeder Eintrag hat `date`.
 */
const FIRE_RE = /fire/i;

export async function fetchEvents(from, to, { all = false } = {}) {
  const calendars = (await api("/users/me/calendarList", { minAccessRole: "reader" })).items || [];
  const visible = calendars.filter((c) => c.selected !== false);
  // Standard: nur der Kalender „Fire Map“ (Taskwarrior-Termine, von `firectl gcal due` gepusht)
  const picked = all ? visible : visible.filter((c) => FIRE_RE.test(c.summaryOverride || c.summary || ""));
  if (!all && picked.length === 0) throw new Error("fire-calendar-missing");
  const params = {
    timeMin: new Date(`${iso(from)}T00:00:00`).toISOString(),
    timeMax: new Date(`${iso(addDays(to, 1))}T00:00:00`).toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  };
  const lists = await Promise.all(
    picked.map(async (cal) => {
      const data = await api(`/calendars/${encodeURIComponent(cal.id)}/events`, params);
      return (data.items || []).map((ev) => ({ ev, cal }));
    }),
  );

  const out = [];
  lists.flat().forEach(({ ev, cal }) => {
    if (ev.status === "cancelled") return;
    const self = (ev.attendees || []).find((a) => a.self);
    if (self?.responseStatus === "declined") return;
    const allDay = !!ev.start?.date;
    const startStr = ev.start?.date || ev.start?.dateTime;
    const endStr = ev.end?.date || ev.end?.dateTime || startStr;
    const startDay = parseISO(startStr.slice(0, 10));
    // Ganztägige Enddaten sind exklusiv
    let endDay = parseISO(endStr.slice(0, 10));
    if (allDay || endStr.slice(11, 16) === "00:00") endDay = addDays(endDay, -1);
    if (isBefore(endDay, startDay)) endDay = startDay;
    eachDayOfInterval({ start: startDay, end: endDay }).forEach((day) => {
      if (isBefore(day, from) && iso(day) !== iso(from)) return;
      if (isBefore(to, day) && iso(day) !== iso(to)) return;
      out.push({
        id: `${cal.id}:${ev.id}:${iso(day)}`,
        date: iso(day),
        title: ev.summary || "(ohne Titel)",
        time: allDay ? null : new Date(startStr).toTimeString().slice(0, 5),
        allDay,
        location: ev.location || "",
        calendar: cal.summaryOverride || cal.summary || "",
        link: ev.htmlLink,
      });
    });
  });
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
}
