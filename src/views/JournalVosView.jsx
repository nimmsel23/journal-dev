import { useEffect, useState } from "react";
import { NotebookPen, Save } from "lucide-react";
import { getJournal, saveJournal, getJournalHistory, localToday } from "../db.js";

export default function JournalVosView({ date }) {
  const activeDate = date || localToday();
  const [text, setText] = useState("");
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await getJournal(activeDate);
      const hist = await getJournalHistory(20);
      if (!mounted) return;
      setText(entries?.[0]?.text || "");
      setHistory(hist || []);
      setLoaded(true);
    })();
    return () => { mounted = false; };
  }, [activeDate]);

  const onSave = async () => {
    setSaving(true);
    try {
      await saveJournal(activeDate, text);
      const hist = await getJournalHistory(20);
      setHistory(hist || []);
    } catch (e) {
      console.error("save journal failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NotebookPen className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold">Journal · {activeDate}</h2>
        </div>
        <button
          onClick={onSave}
          disabled={saving || !loaded}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Speichere…" : "Speichern"}
        </button>
      </header>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Was bewegt dich heute?"
        rows={12}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-y"
      />

      {history.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">Verlauf</h3>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-500 mb-1">{h.date}</div>
                <div className="text-sm text-zinc-200 whitespace-pre-wrap">{h.text}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
