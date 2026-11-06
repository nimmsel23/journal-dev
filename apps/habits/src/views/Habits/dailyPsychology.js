// Original daily prompts; no attribution to external authors.
export const PSYCHOLOGY_PROMPTS = [
  "Du musst nicht auf Motivation warten. Ein kleiner Anfang kann ihr vorausgehen.",
  "Eine Gewohnheit wächst mit jeder Wiederholung, nicht mit jedem Vorsatz.",
  "Mach den nächsten Schritt so klein, dass du ihn heute gehen kannst.",
  "Ein ausgelassener Tag entscheidet nicht über deinen Weg. Dein nächster Schritt zählt.",
  "Gestalte deine Umgebung so, dass dir das gewünschte Verhalten leichter fällt.",
  "Du kannst Zweifel mitnehmen und trotzdem anfangen.",
  "Fortschritt darf unspektakulär aussehen. Oft ist er einfach eine weitere Wiederholung.",
  "Verbinde eine neue Gewohnheit mit etwas, das du ohnehin jeden Tag tust.",
  "Beobachte dich mit Neugier. Selbstvorwürfe erklären dir selten, was du brauchst.",
  "Ein konkreter Zeitpunkt gibt einer guten Absicht einen Platz im Alltag.",
  "Du brauchst heute keinen perfekten Plan. Du brauchst einen machbaren nächsten Schritt.",
  "Auch eine kurze Version deiner Gewohnheit ist eine bewusste Entscheidung für sie.",
  "Gefühle dürfen da sein, ohne jede deiner Entscheidungen zu bestimmen.",
  "Frage nach einem Rückschlag: Was würde mir den nächsten Versuch erleichtern?",
  "Wiederholung macht aus einer bewussten Entscheidung nach und nach etwas Vertrautes.",
  "Sprich mit dir so, wie du mit einem Menschen sprechen würdest, den du unterstützen willst.",
  "Wenn du den Einstieg erleichterst, brauchst du weniger Überwindung.",
  "Achte auch auf das, was schon gelingt. Es zeigt dir, worauf du aufbauen kannst.",
  "Eine Pause kann Teil deines Rhythmus sein. Plane auch den Wiedereinstieg.",
  "Du kannst dein Verhalten verändern, ohne deinen Wert infrage zu stellen.",
  "Lege vorher fest, was du tust, wenn dein Tag anders läuft als geplant.",
  "Vergleiche deinen Fortschritt mit deinem Ausgangspunkt, nicht mit dem Höhepunkt anderer.",
  "Nimm wahr, wie es dir nach einer guten Gewohnheit geht. Auch das kann ein Anreiz sein.",
  "Ein klarer Auslöser kann dich im Alltag an deine Absicht erinnern.",
  "Geduld heißt auch, kleinen Veränderungen Zeit zu geben.",
  "Du darfst eine Gewohnheit anpassen, wenn sie nicht zu deinem Alltag passt.",
  "Was hat heute geholfen? Wiederhole nicht nur die Handlung, sondern auch ihre guten Bedingungen.",
  "Erfolg kann heute bedeuten, nach einer Unterbrechung wieder anzufangen.",
  "Ein abgehakter Punkt ist ein Moment. Was du dabei über dich lernst, kannst du mitnehmen.",
  "Wähle für heute eine Handlung, die zu dem Menschen passt, der du sein möchtest.",
];

export function getDailyPsychologyPrompt(date = new Date()) {
  // Count local calendar days in UTC so daylight-saving changes do not skip a prompt.
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const index = ((day % PSYCHOLOGY_PROMPTS.length) + PSYCHOLOGY_PROMPTS.length) % PSYCHOLOGY_PROMPTS.length;
  return PSYCHOLOGY_PROMPTS[index];
}
