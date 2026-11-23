import { Callout, Divider, Grid, H1, H2, H3, Stack, Stat, Table, Text } from "cursor/canvas";

export default function JournalInventory() {
  return (
    <Stack gap={24}>
      <Stack gap={6}>
        <H1>Journal-dev Bestandsaufnahme</H1>
        <Text tone="secondary">
          Stand origin/master c22c061, gelesen 2026-11-12. Live vos-journal.web.app (Last-Modified 10:23 UTC). Keine Codeänderung.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="192/192" label="pnpm test, 0 Fehler" tone="success" />
        <Stat value="3 von 4" label="iOS-Login-Klassen aus Fuel PR 24" tone="warning" />
        <Stat value="1 Draft" label="Offener PR, #42 nicht angefasst" tone="info" />
        <Stat value="#v2" label="Kanon-Start, ohne Fuel-Timeline" tone="warning" />
      </Grid>

      <Callout tone="warning" title="Produktionslücke der Shell">
        Der Live-Start ist Journal v2 und speichert eigene Einträge unter fitness/uid/journal. Fuel-Notizen, Mahlzeiten, Wasser und Fasten sowie Fitness-Sessions landen nur in der v1-Timeline (#journal), und auch dort ohne Wasser und ohne Fasten.
      </Callout>

      <H2>Architektur</H2>
      <Text>
        React 19, Vite 8.3.6, Tailwind 4, TanStack Query, Firebase 13. Firestore-Projekt fitness-aos, Auth-Domain fest fitness-aos.firebaseapp.com. Ein Codebaum, Hosting-Target v2 ist die kanonische Site vos-journal.web.app; journal-vos, vos-door, vos-voice, vos-game, vos-tent und habit-vos sind 301 auf /mini/*. Solo-Builds setzen VITE_SOLO_TABS. Fuel und Fitness sind keine Submodule: Journal liest ihre Firestore-Pfade selbst. Die Gitlinks aos-game c8b9d0e, aos-door 3f502e7e, aos-core4 6b9e25c, aos-voice 74a3e4d werden vom Frontend nicht importiert.
      </Text>

      <H2>Views</H2>
      <Table
        headers={["View", "Route", "Verdrahtung", "Lücke"]}
        columnAlign={["left", "left", "left", "left"]}
        rowTone={["warning", "success", "success", "info", "info", "warning", "neutral", "neutral", "warning"]}
        rows={[
          ["Journal v2 Tag/Woche/Monat/Jahr/Suche", "#v2", "Schreibt und liest fitness/uid/journal, Habits, optional Kalender und Smart Log", "Keine Fuel- oder Fitness-Karten"],
          ["Journal v2 Habits", "#v2/habits", "CRUD fitness/uid/habits und habitRecords, Fehler mit Retry", "Daily-Four-Sperre ist nicht an die UI gehängt"],
          ["Journal v1 Timeline", "#journal", "Aggregator: Journal, Habits, Meals, Notizen, Sessions, Relax, Supplements", "Wasser und Fasten fehlen; Limit ist Dokumentzahl"],
          ["Door v2", "#door2", "Backend-Firestore, Google Tasks offline, Taskwarrior-Sync", "Sync-Server muss der Nutzer einrichten"],
          ["Game Fire/Focus/Freedom/Frame", "#fire … #frame", "Taskwarrior plus Firestore-Maps, Kalender nur lesen", "Im Store-Build ausgeblendet"],
          ["Voice", "#voice", "Entwurf lokal, Speichern als Journal-Eintrag mit Login", "Kalender-Folge nutzt Popup-Reauth"],
          ["Tent", "#tent2", "Scores aus Habits und Taskwarrior, Abschluss als Journal-Eintrag", "Geräte-Push nicht abgenommen"],
          ["Smart Log", "#ai-log", "Dieselbe v2-Ansicht mit Analyse und Apply auf Fuel/Fitness/Relax", "Vertex-Quota, im Store-Build aus"],
          ["Door v1", "#door", "Nur Google Tasks, Popup etwa eine Stunde", "Parallelweg zu Door v2"],
        ]}
        striped
        stickyHeader
      />

      <H2>Fuel und Fitness</H2>
      <Table
        headers={["Quelle", "Kommt in v1 an", "Kommt in v2 an"]}
        rows={[
          ["Notizen nutrition/uid/journal/date.content", "Ja, als Ernährungs-Notiz", "Nein"],
          ["Mahlzeiten nutrition/uid/logs", "Ja, wenn meals.length > 0", "Nur als Smart-Log-Schreibziel"],
          ["Wasser-only", "Nein, Filter und keine water_ml-Anzeige", "Nein"],
          ["Fasten", "Nein, getFastingWindows fehlt", "Nein"],
          ["Fitness-Sessions fitness/uid/sessions", "Ja, Workout- oder Activity-Karte", "Nur als Smart-Log-Schreibziel"],
        ]}
        rowTone={["info", "warning", "danger", "danger", "warning"]}
        striped
      />
      <Text tone="secondary" size="small">
        Datumsschlüssel YYYY-MM-DD. Journal localToday() ist die Browser-Zeitzone. Fuel rechnet lokal, damit Mitternacht in Europe/Vienna nicht auf den UTC-Vortag rutscht. Dieselbe Zone trifft sich; eine andere Gerätezone verschiebt den Tag.
      </Text>

      <H2>iOS-Login gegen Fuel PR 24</H2>
      <Table
        headers={["Klasse", "Im Journal", "Beleg"]}
        rows={[
          ["Fremde authDomain", "Ja", "firebase.config.js und Live-Chunk firebase-BamyhzO5.js"],
          ["signInWithPopup in der Home-Screen-PWA", "Ja", "src/lib/db/core.js signIn, kein Redirect"],
          ["Persistence-Race", "Ja, ohne Redirect-Lesen", "firebase.js setPersistence ohne await"],
          ["Service Worker schluckt /__/auth", "Nein auf dem Live-Build", "sw.js denylist /^\\/__\\//, Handler HTTP 200"],
        ]}
        rowTone={["danger", "danger", "warning", "success"]}
        striped
      />

      <H2>Bis Produktionsreife</H2>
      <H3>P0</H3>
      <Text>iOS-Login wie Fuel (authDomain der Seiten-Domain, Redirect auf iPhone/iPad/PWA, Persistence vor dem ersten Auth-Call). Aufwand M, wenige Auth-Dateien plus Test. Daneben Fuel und Fitness in die Startansicht #v2, inklusive Wasser und Fasten. Aufwand L.</Text>
      <H3>P1</H3>
      <Text>v1-Fenster als echte Tage statt Dokument-Limit, UTC-Cutoff der Habit-Zeile, Wien festnageln, Smart Log und Tent-Push am Gerät abnehmen, Door-v1-Doppelweg. Aufwand je S bis M.</Text>
      <H3>P2</H3>
      <Text>Draft-PR 42 nicht mergen (Auto-Squash auf master, Repair rot, automerge.yml deckt dev nach master ab). Legacy apps/habits, toter public/index.html, Submodule ohne Import, UI-Tests. Aufwand S.</Text>

      <Divider />
      <Text tone="tertiary" size="small">
        Tests: pnpm test 192 bestanden in 1,8 s. apps/habits/tests zusätzlich 20/20, nicht im Script. Emulator-Test braucht FIRESTORE_EMULATOR_HOST. Quelle: journal-dev master c22c061 und fuel-dev PR 24.
      </Text>
    </Stack>
  );
}
