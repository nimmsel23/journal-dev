// Door > Plan — War Stack Wizard-Schritte, 1:1 aus ~/aos/door/routes/door/
// shared.js (WARSTACK_STEPS) übernommen. Wird vom REST-Backend serverseitig
// durchlaufen; im Firestore-Backend (cloud) läuft dieselbe State-Machine
// hier im Client, damit beide Seiten denselben War Stack produzieren.
export const WARSTACK_STEPS = [
  { key: "domain", question: "Domain (Power / Production / Process / Protection)?" },
  { key: "subdomain", question: "Sub-domain (z.B. Business / Systems / Sales / ...)?" },
  { key: "domino_door", question: "Domino Door (was genau soll diese Door öffnen)?" },
  { key: "trigger", question: "Trigger: welches Event/Person hat das ausgelöst?" },
  { key: "narrative", question: "Narrative: welche Story erzählst du dir?" },
  { key: "validation", question: "Validation: warum muss diese Door aufgehen?" },
  { key: "impact_opening", question: "Impact on opening: was ändert sich im Business, wenn sie aufgeht?" },
  { key: "consequences", question: "Consequences of inaction: was passiert, wenn sie zu bleibt?" },
  { key: "hits", question: "Definiere die 4 Hits (Fact / Obstacle / Strike / Responsibility)." },
  { key: "insights", question: "Insights: welche neuen Realizations gab es?" },
  { key: "lessons", question: "Lessons learned: wichtigste Lesson?" },
];

export function buildWarStackHits() {
  return Array.from({ length: 4 }, () => ({
    id: crypto.randomUUID(),
    fact: "",
    obstacle: "",
    strike: "",
    responsibility: "",
    done: false,
    completed_at: null,
  }));
}

export function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
