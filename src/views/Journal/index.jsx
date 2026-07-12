// Einstiegspunkt für fitness-dev: dessen src/views/Journal ist ein
// Verzeichnis-Symlink auf diesen Ordner, App.jsx importiert
// './views/Journal/index.jsx'.
//
// Bewusst via @journal-Alias statt relativ: bei Verzeichnis-Symlinks bleibt
// der Importer-Pfad symbolisch, relative Imports aus diesem Ordner heraus
// lösen im HOST-Repo auf (fitness-dev hat kein components/Journal). Der
// Alias zwingt in den journal-dev-Realpath — alle Konsumenten (fitness,
// fuel, vitalos, journal selbst) definieren @journal → journal-dev/src.
export { default } from "@journal/components/Journal/JournalTimeline.jsx";
