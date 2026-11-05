// AutosaveArea — Textfeld für Frame/Focus/Freedom-Antworten: Entwurf im localStorage, entprelltes Autosave
// (lokal, Abgleich im Hintergrund), stabil beim Tippen (siehe lib/useAutosaveField.js, lib/draftStore.js).
import { useAutosaveField } from "../../lib/useAutosaveField.js";

export default function AutosaveArea(props) {
  // Unmount the old field before installing the next account/period callback;
  // its pending draft must never flush through the new field's save function.
  return <AutosaveField key={props.storageKey} {...props} />;
}

function AutosaveField({ storageKey, remote, ready, onSave, rows = 3 }) {
  const f = useAutosaveField({ storageKey, remote, ready, save: onSave });
  return <textarea rows={rows} value={f.value} onChange={f.onChange} onBlur={f.onBlur} />;
}
