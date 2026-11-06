import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { ICON_COMPONENTS_MAP } from "./utils";

export default function HabitJournalModal({
  open,
  onClose,
  habit,
  date,
  journalText,
  setJournalText,
  isJournalSaving,
  onSaveJournal,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        onSaveJournal();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onSaveJournal]);

  if (!open || !habit) return null;

  const Icon = ICON_COMPONENTS_MAP[habit.icon || "Activity"];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="absolute inset-0"
        onClick={() => { onSaveJournal(); onClose(); }}
      />
      <div className="relative w-full max-w-3xl max-h-full bg-slate-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10/40">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={28} className="text-slate-100" />}
            <div>
              <h2 className="text-2xl font-black text-slate-100 leading-tight">{habit.name}</h2>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">{date}</div>
            </div>
          </div>
          <button
            onClick={() => { onSaveJournal(); onClose(); }}
            className="p-2 text-slate-400 hover:text-red-400 transition-all"
            aria-label="Schließen"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            onBlur={() => onSaveJournal()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onSaveJournal();
                onClose();
              }
            }}
            placeholder=""
            className="w-full min-h-[60vh] bg-transparent border-0 text-base font-medium leading-relaxed text-slate-100 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between px-8 py-4 border-t border-white/10/40 text-[10px] font-black uppercase tracking-widest opacity-40">
          <span>Esc · schließen + speichern</span>
          <div className="flex items-center gap-2">
            {isJournalSaving && <Save size={12} className="text-orange-400 animate-pulse" />}
            <span>Strg + Enter · speichern</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
