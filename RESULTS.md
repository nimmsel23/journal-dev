# Results

## 2026-10-19

- Journal push reminders now use the `apps.journal` lane in the shared push settings document. The Journal client registers its own `/journal-messaging-sw.js` worker at `/journal-push/`, and its reminder function queries only enabled Journal settings and tags outgoing messages with `app: journal`.
- Added Journal reminder enable/disable controls and reminder time to Journal settings. Legacy shared tokens are not adopted as Journal tokens.
