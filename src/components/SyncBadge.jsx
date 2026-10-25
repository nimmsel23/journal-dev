// SyncBadge — zeigt, ob lokale Änderungen noch auf den Server warten. Bei sauberem Stand unsichtbar.
import { useSyncState } from "../lib/offline.js";

export default function SyncBadge() {
  const { online, pending, outbox, error } = useSyncState();
  const open = pending + outbox;
  if (error) return <div className="dv2-empty" role="alert">{error}</div>;
  if (!online) return <div className="dv2-src" role="status"><span>Offline – alles wird lokal gespeichert{open ? ` · ${open} warten auf Sync` : ""}</span></div>;
  if (open) return <div className="dv2-src" role="status"><span>Synchronisiere … ({open})</span></div>;
  return null;
}
