# Finale Variante `vos-journal` — Konzept (Entwurf 2026-11-12)

Status: Entwurf, nicht umgesetzt. Umsetzung im Meta-Repo `~/vitalos/prod` beauftragt der Koordinator.

## Zweck
Eine schlanke Standalone-Variante aus Journal + Habits („Dein Tag“), die auch dann funktioniert,
wenn die VitalOS-Shell oder die Owner-Version gerade nicht gesund ist. Gleiches Muster wie
`prod/vos-fitness` (Wrapper über fitness-app, eigene Site, eigene Pulse-Oberfläche). Für Klienten
und als Journal-M1-Kern der Store-Linie. Kein Door, Game, Focus, Tent, Voice, Taskwarrior, Google, KI.

## Namensfrage (vorab klären)
`vos-journal` ist laut `docs/HOSTING-TARGETS.md` bereits der Kanon für das **volle** Journal
(journal-dev master, plus `/mini/{door,voice,game,tent,habits}`, Legacy-301). Site-IDs sind bei
Firebase global eindeutig. Zwei Wege:
1. **Empfohlen:** Der Wrapper-Ordner heißt `prod/vos-journal/` (Codename), die Site heißt `vos-dein-tag`
   (oder `vos-journal-lite`) im Projekt `vitalos-prod`; `vos-journal` bleibt die Owner-Surface.
2. `vos-journal` im Projekt `vitalos-prod` neu belegen — nur falls die Site-ID dort frei ist
   (vor Anlage `firebase hosting:sites:list --project vitalos-prod` prüfen); verwirrt Auth-/OAuth-Listen.
Auth-SOT je Origin eintragen (authDomain, OAuth-Redirect, `bin/vos-authdomains`).

## Aufbau (analog vos-fitness)
```
prod/vos-journal/
  AGENTS.md           Besitz: Oberfläche + Produktanbindung; Fachcode bleibt in journal-dev/habits-dev
  index.html, package.json, tailwind.config.cjs, postcss.config.cjs
  vite.config.cjs     Aliase auf ../journal-app und ../habit-app; setzt VITE_VOS_EDITION=store;
                      verlangt VITE_VOS_PRODUCT_BUILD=1 und .product-config/firebase.config.js
  src/main.jsx        Auth-Gate, Tab-Leiste „Dein Tag“ (Habits) / „Journal“, Theme-Tokens der Shell
  src/DeinTagApp.jsx  bindet @view/habits (Daily-Four) ein
  src/JournalApp.jsx  bindet @view/journal-v2, QueryClient wie prod/src/shell/JournalApp.jsx
  public/             manifest (Name, Icons), assetlinks falls TWA
  firebase.json       nur Hosting, Ziel vitalos-prod (nie das geerbte Legacy-Deploy)
```
Aliase wie im Shell-Produkt (`prod/vite.config.js`): `@view/habits` → `habit-app/src/views/Habits`,
`@view/journal-v2` → `journal-app/src/views/v2/JournalV2View.jsx`, `@journal-db`, `@habits-db`,
`@db` → Firestore-Schicht, `@firebase-config` → `.product-config`. Keine Kopien der Fachlogik.

## Inhalt
- Dein Tag (Entry-Tab): vier Ebenen Doing/Thinking/Feeling/Being, Ein-Klick-Start mit vier Gewohnheiten,
  „Alle Habits“ als Verwaltung, Erinnerungen (Push).
- Journal v2: Tag/Woche/Monat/Jahr/Suche, Habit-Streifen, Tags (+fitness/+fuel/+relax), Entwürfe, Zeitleiste.
- Weglassen: Smart Log (Gemini), Kalender-Anbindung, +hot-Routing, Door/Game-Links, 4B-Bereichsspur.
- Skill-Verknüpfungen (Fitness/Ernährung/Relax) nur, wenn die Zielseite im Wrapper existiert; sonst
  `onOpenSkill` auf einen Hinweis „in der VitalOS-App“ lenken.

## Daten
Gleiche Firestore-Pfade wie im Produkt (u. a. `fitness/{uid}/habits`, `habitRecords`, Journal-Einträge,
Tagesstand der vier Ebenen); kein neues Schema. Regeln: Root-`firestore.product.rules` (projektweit, Rules-SSOT).
Ein Konto, mehrere Origins: Geräte-ID und Offline-Cache gelten pro Origin.

## Build und Release
- Build: neues Script im Produkt-Paket analog `build:fitness:product`
  (`pnpm --filter @vitalos/product run build:journal:product`), Ausgabe `prod/vos-journal/dist-firebase`.
- Deploy: eigene `firebase.product-journal-hosting.json` (Target neben `fitness-product`),
  getrennt von Rules/Functions (siehe `prod/docs/FIREBASE.md`). Kein CI-Auto-Deploy, bis stabil verifiziert.
- Service Worker + Splash über `packages/mini-app-shell` (`stamp --app vos-journal`).
- Pin-Reihenfolge: journal-dev und habits-dev nach `master`, dann Pointer im Meta-Repo (`vos-release`).

## Voraussetzung vor der Umsetzung
1. habits-dev ist FROZEN (Push-CI aus, Promote nach master nur per workflow_dispatch). Der Wrapper braucht
   eine einzige Habits-Quelle: entweder habits-dev reaktivieren oder `habit-app` auf journal-dev/apps/habits
   umstellen (Quelle laut AGENTS.md). Beide Stände sind aktuell nur teilweise identisch.
2. Entscheidung Namensfrage (oben) und Hosting-Target in `.firebaserc`.
3. Datenschutz-/Kontolöschungs-Seite der Store-Linie (`prod/src/cloud/deleteAccount.js`) im Wrapper wiederverwenden.

## Nicht-Ziele
Kein Redesign, kein Feature-Zuwachs, keine Owner-Surfaces. Der Wrapper bleibt klein und zieht Fachänderungen
nur über die Pins.
