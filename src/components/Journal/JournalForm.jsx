import { Book, X } from "lucide-react";

export default function JournalForm({ text, setText, onSubmit, saving, editingEntry, onCancelEdit }) {
  return (
    <div className="sticky top-6 space-y-6">
      <div className={`card p-6 shadow-2xl bg-gradient-to-b from-slate-900 to-[#0f172a] border relative overflow-hidden group transition-colors ${editingEntry ? 'border-orange-400/50 shadow-[#fb923c]/10' : 'border-white/10'}`}>
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <Book size={120} />
        </div>
        
        {editingEntry && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10/50 animate-in slide-in-from-top-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Bearbeitungs-Modus</span>
             </div>
             <button onClick={onCancelEdit} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 transition-all">
                <X size={14} />
             </button>
          </div>
        )}

        <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
          placeholder="Gedanken, Erkenntnisse, Fokus..."
          className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-slate-100 font-medium placeholder:opacity-30"
          autoFocus={!!editingEntry}
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10/50">
           <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Shift + Enter für Umbruch</span>
           <div className="flex items-center gap-3">
             {editingEntry && (
               <button onClick={onCancelEdit} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-100 transition-all px-2">
                  Abbrechen
               </button>
             )}
             <button onClick={onSubmit} disabled={saving || !text.trim()}
               className="btn btn-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-400/20">
               {saving ? "..." : editingEntry ? "Aktualisieren" : "Sichern"}
             </button>
           </div>
        </div>
      </div>

    </div>
  );
}
