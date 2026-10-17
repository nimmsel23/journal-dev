// gcal.js — Google-Calendar-Lesezugriff für Journal v2 (Review von Terminen).
// Direkt aus dem Browser: Firebase-Google-Login wird per reauthenticateWithPopup
// um den Scope calendar.readonly erweitert. Der Access-Token lebt ~1 h, wird nur
// in sessionStorage gehalten und nie nach Firestore geschrieben.
//
// Voraussetzung (Google Cloud, Projekt hinter firebase.config.js): Google
// Calendar API aktiviert + Scope calendar.readonly im OAuth-Consent-Screen.
import { GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { addDays, eachDayOfInterval, format, isBefore, parseISO } from "date-fns";
import { auth } from "../../lib/firebase.js";

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const API = "https://www.googleapis.com/calendar/v3";
const STORE_KEY = "jv2:gcal-token";

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const { token, exp } = JSON.parse(raw);
    return exp > Date.now() ? token : null;
  } catch {
    return null;
  }
}

function store(token) {
  try {
    // Google-Tokens halten 3600 s; 5 min Puffer
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ token, exp: Date.now() + 55 * 60 * 1000 }));
  } catch {}
}

export function clearCalendarToken() {
  try { sessionStorage.removeItem(STORE_KEY); } catch {}
}

export function calendarConnected() {
  return !!readStored();
}

export async function connectCalendar() {
  if (!auth?.currentUser) throw new Error("not authenticated");
  const provider = new GoogleAuthProvider();
  provider.addScope(SCOPE);
  const result = await reauthenticateWithPopup(auth.currentUser, provider);
  const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error("kein Calendar-Token erhalten");
  store(token);
  return token;
}

async function api(path, params) {
  const token = readStored();
  if (!token) throw new Error("calendar-expired");
  const url = `${API}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    clearCalendarToken();
    throw new Error("calendar-expired");
  }
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
export async function fetchEvents(from, to) {
  const calendars = (await api("/users/me/calendarList", { minAccessRole: "reader" })).items || [];
  const picked = calendars.filter((c) => c.selected !== false);
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
