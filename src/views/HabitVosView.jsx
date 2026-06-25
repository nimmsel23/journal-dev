import { useEffect, useState } from "react";
import { CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import {
  getHabits, addHabit, deleteHabit, recordHabit, unrecordHabit,
  getHabitRecordsForDate, localToday,
} from "../db.js";

export default function HabitVosView({ date }) {
  const activeDate = date || localToday();
  const [habits, setHabits] = useState([]);
  const [doneIds, setDoneIds] = useState(new Set());
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [list, recs] = await Promise.all([getHabits(), getHabitRecordsForDate(activeDate)]);
    setHabits(list || []);
    setDoneIds(new Set(recs || []));
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [activeDate]);

  const toggle = async (habit) => {
    const uuid = habit.uuid;
    const isDone = doneIds.has(uuid);
    setBusy(true);
    try {
      if (isDone) {
        await unrecordHabit(uuid, activeDate);
        const next = new Set(doneIds); next.delete(uuid); setDoneIds(next);
      } else {
        await recordHabit(uuid, activeDate);
        const next = new Set(doneIds); next.add(uuid); setDoneIds(next);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const onAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      await addHabit(name);
      setNewName("");
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (habit) => {
    if (!confirm(`Habit "${habit.name}" löschen?`)) return;
    setBusy(true);
    try {
      await deleteHabit(habit.uuid);
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-2">
        <CheckSquare className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold">Habits · {activeDate}</h2>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); onAdd(); }}
        className="flex items-center gap-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neuer Habit…"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {habits.length === 0 ? (
        <p className="text-sm text-zinc-500">Noch keine Habits.</p>
      ) : (
        <ul className="space-y-2">
          {habits.map((h) => {
            const isDone = doneIds.has(h.uuid);
            return (
              <li
                key={h.uuid}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/60 p-3"
              >
                <button
                  onClick={() => toggle(h)}
                  disabled={busy}
                  className="flex items-center gap-3 flex-1 text-left disabled:opacity-50"
                >
                  {isDone
                    ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                    : <Square className="w-5 h-5 text-zinc-500" />}
                  <span className={isDone ? "line-through text-zinc-500" : "text-zinc-100"}>
                    {h.name}
                  </span>
                </button>
                <button
                  onClick={() => onDelete(h)}
                  disabled={busy}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 disabled:opacity-50"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
