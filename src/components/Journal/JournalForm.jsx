import { Book, X } from "lucide-react";

export default function JournalForm({ text, setText, onSubmit, saving, editingEntry, onCancelEdit }) {
  return (
    <div className="sticky top-6 space-y-6">
      <div className={`p-6 rounded-2xl bg-[var(--j-card)] border relative overflow-hidden group transition-colors ${editingEntry ? 'border-[var(--j-accent)]/50' : 'border-[var(--j-line)]'}`}>
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-[var(--j-ink)]">
          <Book size={120} />
        </div>

        {editingEntry && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--j-line)] animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--j-accent)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--j-accent)]">Bearbeitungs-Modus</span>
            </div>
            <button onClick={onCancelEdit} className="p-1 rounded-lg hover:bg-[var(--j-bg2)] text-[var(--j-dim)] transition-all">
              <X size={14} />
            </button>
          </div>
        )}

        <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
          placeholder="Gedanken, Erkenntnisse, Fokus..."
          className="w-full bg-transparent border-none outline-none text-[15px] leading-relaxed resize-none text-[var(--j-ink)] placeholder:text-[var(--j-dim)] placeholder:opacity-50"
          autoFocus={!!editingEntry}
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-[var(--j-line)]">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-dim)]">Shift + Enter für Umbruch</span>
          <div className="flex items-center gap-3">
            {editingEntry && (
              <button onClick={onCancelEdit} className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-dim)] hover:text-[var(--j-ink)] transition-all px-2">
                Abbrechen
              </button>
            )}
            <button onClick={onSubmit} disabled={saving || !text.trim()}
              className="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--j-accent)] text-[var(--j-bg)] transition-opacity hover:opacity-90 disabled:opacity-30">
              {saving ? "..." : editingEntry ? "Aktualisieren" : "Sichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
