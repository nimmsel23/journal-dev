import { Book, X } from "lucide-react";

export default function JournalForm({ text, setText, onSubmit, saving, editingEntry, onCancelEdit }) {
  return (
    <div className="sticky top-6 space-y-6">
      <div className={`card p-6 shadow-2xl bg-gradient-to-b from-[var(--card)] to-[var(--bg2)] border relative overflow-hidden group transition-colors ${editingEntry ? 'border-[var(--accent)]/50 shadow-[var(--accent)]/10' : 'border-[var(--line)]'}`}>
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <Book size={120} />
        </div>
        
        {editingEntry && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--line)]/50 animate-in slide-in-from-top-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Bearbeitungs-Modus</span>
             </div>
             <button onClick={onCancelEdit} className="p-1 rounded-lg hover:bg-[var(--bg2)] text-[var(--dim)] transition-all">
                <X size={14} />
             </button>
          </div>
        )}

        <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
          placeholder="Gedanken, Erkenntnisse, Fokus..."
          className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-[var(--ink)] font-medium placeholder:opacity-30"
          autoFocus={!!editingEntry}
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-[var(--line)]/50">
           <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Shift + Enter für Umbruch</span>
           <div className="flex items-center gap-3">
             {editingEntry && (
               <button onClick={onCancelEdit} className="text-[9px] font-black uppercase tracking-widest text-[var(--dim)] hover:text-[var(--ink)] transition-all px-2">
                  Abbrechen
               </button>
             )}
             <button onClick={onSubmit} disabled={saving || !text.trim()}
               className="btn btn-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent)]/20">
               {saving ? "..." : editingEntry ? "Aktualisieren" : "Sichern"}
             </button>
           </div>
        </div>
      </div>

    </div>
  );
}
