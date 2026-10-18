// mapDb.js — Freedom- und Focus-Maps je Domain im Firestore des Nutzers:
//   journal/{uid}/{kind}/{view}_{period}_{domain}   (kind = freedom | focus)
// Felder/Fragen stammen aus ~/aos/game/maps/store.py und freedom/model.py (Quarterly ist dort nicht definiert →
// hier analog zum Annual Game ergänzt). Rules: journal/{uid}/** (Besitzer).
import { addMonths, addQuarters, addWeeks, addYears, format, getISOWeek, getISOWeekYear, getQuarter, startOfISOWeek, startOfMonth, startOfQuarter } from "date-fns";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase.js";

export const DOMAINS = ["body", "being", "balance", "business"];

const F = (key, label, prompt) => ({ key, label, prompt });
export const MAP_KINDS = {
  freedom: {
    label: "Freedom",
    views: {
      ipw: {
        label: "Ideal Parallel World", period: null,
        fields: [
          F("lens", "Domain Lens", "Was bedeutet diese Domain für mein gewähltes Leben?"),
          F("vision", "IPW · Vision", "Wenn alles möglich wäre: Welches Leben wähle ich?"),
          F("chosen_man", "IPW · Identität", "Welche Art Mensch entscheide ich mich zu sein?"),
          F("chosen_life", "IPW · Mein Alltag", "Wie sieht ein gewöhnlicher Tag in meinem gewählten Leben aus?"),
          F("meaning", "IPW · Bedeutung", "Warum will ich selbst dieses Leben?"),
          F("horizon", "IPW · Horizont", "Welcher Horizont passt zu meiner Vision? Frei wählbar."),
          F("sacrifice", "Sacrifice", "Was bin ich bereit loszulassen, um dieses Leben zu wählen?"),
          F("law", "Law", "Nach welchem eigenen Gesetz will ich leben?"),
        ],
      },
      annual: {
        label: "Annual", period: "year",
        fields: [
          F("annual_game", "Annual Game · Ergebnis", "Welchen bedeutsamen Durchbruch wähle ich bis zum Ende dieses Jahres?"),
          F("annual_evidence", "Annual Game · Belege", "Welche sichtbaren Tatsachen zeigen, dass ich dieses Ergebnis erreicht habe?"),
        ],
      },
      quarterly: {
        label: "Quarterly", period: "quarter",
        fields: [
          F("quarter_game", "Quarterly Game · Ergebnis", "Welchen bedeutsamen Durchbruch wähle ich bis zum Ende dieses Quartals?"),
          F("quarter_evidence", "Quarterly Game · Belege", "Welche sichtbaren Tatsachen zeigen, dass ich dieses Ergebnis erreicht habe?"),
        ],
      },
    },
  },
  focus: {
    label: "Focus",
    views: {
      month: {
        label: "Monthly", period: "month",
        fields: [
          F("mission", "Focus", "Welches konkrete Ergebnis macht diesen Monat erfolgreich?"),
          F("outcomes", "Ergebnisse", "Ein messbares Monatsergebnis je Zeile."),
          F("bottleneck", "Engpass", "Was verhindert derzeit den nächsten Fortschritt?"),
          F("capacity", "Kapazität", "Welche Zeit und Ressourcen stehen tatsächlich zur Verfügung?"),
          F("habits", "Habits", "Welche Gewohnheiten stützen deinen Focus?"),
          F("routines", "Routines", "Welche wiederkehrenden Abläufe unterstützen sie?"),
          F("additions", "Additions", "Was nehme ich bewusst hinzu?"),
          F("eliminations", "Eliminations", "Was streiche ich, um Platz zu schaffen?"),
          F("first_action", "Set Sail", "What is my first action?"),
        ],
      },
      week: {
        label: "Weekly", period: "week",
        fields: [F("focus", "Focus der Woche", "Was steht diese Woche in dieser Domain im Focus?")],
      },
    },
  },
};

// ── Perioden ──
export function periodKey(type, d) {
  if (type === "year") return String(d.getFullYear());
  if (type === "quarter") return `${d.getFullYear()}-Q${getQuarter(d)}`;
  if (type === "month") return format(d, "yyyy-MM");
  if (type === "week") return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
  return "ipw";
}
export function shiftPeriod(type, d, n) {
  return { year: addYears, quarter: addQuarters, month: addMonths, week: addWeeks }[type](d, n);
}
export function periodLabel(type, d) {
  if (type === "month") return format(startOfMonth(d), "MMMM yyyy");
  if (type === "week") return `${periodKey("week", d)} · ab ${format(startOfISOWeek(d), "d. MMM")}`;
  if (type === "quarter") return `${periodKey("quarter", d)} · ab ${format(startOfQuarter(d), "d. MMM")}`;
  return periodKey(type, d);
}

// ── Firestore ──
const ref = (uid, kind, view, period, domain) => doc(db, "journal", uid, kind, `${view}_${period}_${domain}`);

/** → {body: {answers:{…}}, …} */
export async function fetchMapDocs(uid, kind, view, period) {
  const snaps = await Promise.all(DOMAINS.map((d) => getDoc(ref(uid, kind, view, period, d))));
  return Object.fromEntries(DOMAINS.map((d, i) => [d, snaps[i].exists() ? snaps[i].data() : { answers: {} }]));
}
export async function saveMapAnswer(uid, kind, view, period, domain, key, value) {
  await setDoc(ref(uid, kind, view, period, domain), { kind, view, period, domain, answers: { [key]: value }, updated: serverTimestamp() }, { merge: true });
}
