import { ChevronLeft, ChevronRight, Book, Settings2 } from "lucide-react";

export default function JournalHeader({ date, setDate, localToday, formatRelativeDate, onOpenSettings }) {
  return (
    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-2 text-[var(--j-accent)] font-bold uppercase tracking-[0.3em] text-[10px] mb-2">
          <Book size={14} />
          Daily Reflection
        </div>
        <h1 className="text-4xl font-black text-[var(--j-ink)] tracking-tighter">
          {formatRelativeDate(date)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] flex items-center justify-center text-[var(--j-dim)] hover:text-[var(--j-accent)] hover:border-[var(--j-accent)]/40 transition-all"
          >
            <Settings2 size={16} />
          </button>
        )}
        <div className="flex items-center gap-2 bg-[var(--j-card)] p-1.5 rounded-2xl border border-[var(--j-line)]">
          <button onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            setDate(d.toISOString().slice(0, 10));
          }} className="p-2.5 rounded-xl hover:bg-[var(--j-bg2)] text-[var(--j-dim)] transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="relative">
            <input type="date" value={date} max={localToday}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent px-4 py-2 text-sm font-bold text-[var(--j-ink)] outline-none cursor-pointer uppercase tracking-widest"
            />
          </div>
          <button
            disabled={date === localToday}
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() + 1);
              setDate(d.toISOString().slice(0, 10));
            }} className="p-2.5 rounded-xl hover:bg-[var(--j-bg2)] text-[var(--j-dim)] transition-all disabled:opacity-10">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
