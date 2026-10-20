# Journal standalone build

Preview and live CI check out Journal only. No VitalOS checkout, sibling repos,
submodules, or cross-app alias package is required. Journal tracks its own lockfile.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:firebase
```

All modules use Journal's Firebase/auth instance. Shared Firestore collection paths
and hosting targets remain unchanged; no data migration is needed. The existing
browser Firebase configuration is checked in. Deployment uses the CI service account.

## Source of local copies

These revisions are the ones used by the previously failing VitalOS CI checkout:

- fitness-dev `432ba4e416205b7e6fd123d96feba9c96d8f7b98`: activity presentation constants and activity definitions; timeline Journal/HabitJournal functions in `src/lib/db/firestore/legacyJournal.js`; settings functions only in `settings.js`.
- habits-dev `0910f9fd0609d8a05715f874b3266560709c8d34`: journal modal and icon map in `src/components/Journal/habits/`.
- fuel-dev `acf7b61733bb17ea8c05780b51c8724f3fb0500a`: `getSupplementsHistory` only in `src/lib/db/firestore/supplements.js`.
- relax-dev `9aa6bb4ad1296deff13352c7bf648faad6418999`: `getRelaxSessionHistory` only in `src/lib/db/firestore/relax.js`.

The timeline retains its existing Journal API. V2 continues to use
`src/lib/db/journal.js`; auth uses the existing `lib/db/core.js`. The unused
Habits wrapper now selects Journal's existing v2 Habits screen.

Future updates to these copies are explicit Journal changes. The standalone test
rejects source symlinks, imports outside this repository, undeclared external
imports, and dependencies requiring another local checkout. CI tests and builds
before deployment. Running Journal inside a VitalOS workspace remains possible.
