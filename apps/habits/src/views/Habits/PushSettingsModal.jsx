import { createPortal } from "react-dom";
import { X, Bell, BellOff } from "lucide-react";

export default function PushSettingsModal({ open, onClose, settings, permission, busy, onEnable, onDisable, onReminderTimeChange }) {
  if (!open) return null;

  const enabled = !!settings?.enabled;
  const reminderTime = settings?.reminderTime || "18:00";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl border border-white/10 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {enabled ? <Bell size={20} className="text-orange-400" /> : <BellOff size={20} className="text-slate-400" />}
            <h2 className="text-lg font-black text-slate-100">Erinnerungen</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Wenn du bis zur Erinnerungszeit noch offene Habits hast, bekommst du eine Push-Benachrichtigung —
          auch wenn die App geschlossen ist.
        </p>

        {permission === "denied" && (
          <div className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-4">
            Benachrichtigungen sind im Browser blockiert. Erlaube sie in den Browser-/System-Einstellungen für diese Seite.
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-100">
            {enabled ? "Aktiviert" : "Deaktiviert"}
          </span>
          <button
            onClick={() => (enabled ? onDisable() : onEnable())}
            disabled={busy || permission === "denied"}
            className={`btn !px-4 !py-2 text-xs ${enabled ? "bg-slate-800 text-slate-100 border border-white/10" : "bg-orange-400 text-black"}`}
          >
            {busy ? "..." : enabled ? "Ausschalten" : "Einschalten"}
          </button>
        </div>

        {enabled && (
          <div>
            <div className="label-caps !mb-2 text-slate-400">Erinnerungszeit</div>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => onReminderTimeChange(e.target.value)}
              className="w-full bg-slate-900 border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-orange-400 outline-none"
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
