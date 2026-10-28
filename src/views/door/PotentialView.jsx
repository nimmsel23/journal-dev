import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Check, Trash2, Pencil, StickyNote, Plus, X } from "lucide-react";

import {
  fetchHotlist,
  addHotlistItem,
  updateHotlistItem,
  completeHotlistItem,
  deleteHotlistItem,
  fetchHotlistNote,
  saveHotlistNote,
} from "../../lib/door/v1.js";
import { googleErrorText } from "../../lib/google/tokens.js";

const MODES = [
  { key: "active", label: "Aktiv" },
  { key: "done", label: "Erledigt" },
  { key: "all", label: "Alle" },
];

function selectorFor(item) {
  return item?.id || item?.task_uuid || item?.tw_uuid || item?.selector || "";
}

function formatCreatedAt(value) {
  if (!value) return "";
  // Google Tasks liefert ISO-Zeit (2026-10-28T17:23:52.000Z)
  const iso = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(String(value)) && !Number.isNaN(iso.getTime())) {
    return iso.toLocaleString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(String(value));
  if (!match) return String(value);
  const [, y, m, d, hh, mm] = match;
  return `${d}.${m}.${y} ${hh}:${mm}`;
}

export default function PotentialView() {
  const qc = useQueryClient();
  const [mode, setMode] = useState("active");
  const [newText, setNewText] = useState("");
  const [editingSelector, setEditingSelector] = useState(null);
  const [editText, setEditText] = useState("");
  const [noteSelector, setNoteSelector] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hotlist", mode],
    queryFn: () => fetchHotlist(mode),
    staleTime: 15_000,
  });

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["hotlist"] });
  }

  const addMutation = useMutation({
    mutationFn: (text) => addHotlistItem(text),
    onSuccess: () => {
      setNewText("");
      invalidateAll();
    },
    onError: (err) => setActionError(err?.message || "Hinzufügen fehlgeschlagen."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ selector, title }) => updateHotlistItem(selector, title),
    onSuccess: () => {
      setEditingSelector(null);
      setEditText("");
      invalidateAll();
    },
    onError: (err) => setActionError(err?.message || "Bearbeiten fehlgeschlagen."),
  });

  const completeMutation = useMutation({
    mutationFn: (selector) => completeHotlistItem(selector),
    onSuccess: invalidateAll,
    onError: (err) => setActionError(err?.message || "Konnte nicht als erledigt markieren."),
  });

  const deleteMutation = useMutation({
    mutationFn: (selector) => deleteHotlistItem(selector),
    onSuccess: invalidateAll,
    onError: (err) => setActionError(err?.message || "Löschen fehlgeschlagen."),
  });

  const noteMutation = useMutation({
    mutationFn: ({ selector, note }) => saveHotlistNote(selector, note),
    onSuccess: () => {
      setNoteSelector(null);
      setNoteText("");
    },
    onError: (err) => setActionError(err?.message || "Notiz speichern fehlgeschlagen."),
  });

  const sorted = useMemo(
    () => [...items].sort((a, b) => Number(b.hot_index || 0) - Number(a.hot_index || 0)),
    [items]
  );

  function handleAdd(event) {
    event.preventDefault();
    const text = newText.trim();
    if (!text) return;
    setActionError("");
    addMutation.mutate(text);
  }

  function startEdit(item) {
    setEditingSelector(selectorFor(item));
    setEditText(item.title || "");
  }

  function submitEdit(event) {
    event.preventDefault();
    const title = editText.trim();
    if (!title || !editingSelector) return;
    setActionError("");
    updateMutation.mutate({ selector: editingSelector, title });
  }

  async function openNote(item) {
    const selector = selectorFor(item);
    setActionError("");
    setNoteSelector(selector);
    setNoteLoading(true);
    try {
      const note = await fetchHotlistNote(selector);
      setNoteText(note || "");
    } catch (err) {
      setActionError(err?.message || "Notiz laden fehlgeschlagen.");
      setNoteText("");
    } finally {
      setNoteLoading(false);
    }
  }

  function submitNote(event) {
    event.preventDefault();
    if (!noteSelector) return;
    setActionError("");
    noteMutation.mutate({ selector: noteSelector, note: noteText });
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/5 px-6 py-5 shadow-glow md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-rose-400">Door · Potential</div>
            <h2 className="text-lg font-semibold text-slate-100">Was gerade brennt (Hot List)</h2>
          </div>
        </div>
        <p className="text-sm text-rose-300/80 md:max-w-md md:text-right">
          Hot List in Google Tasks — Liste „Door · Potential“, gelesen und geschrieben direkt über dein Google-Konto.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-glow">
        <form onSubmit={handleAdd} className="mb-5 flex flex-wrap gap-3">
          <input
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            placeholder="Neue Idee für die Hot List…"
            className="min-w-[240px] flex-1 rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="submit"
            disabled={addMutation.isPending || !newText.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {addMutation.isPending ? "Fügt hinzu…" : "Hinzufügen"}
          </button>
        </form>

        <div className="mb-5 flex flex-wrap gap-2">
          {MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                mode === key
                  ? "border-rose-400/40 bg-rose-400 text-slate-950"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {actionError ? (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <span>{actionError}</span>
            <button onClick={() => setActionError("")} className="text-rose-300 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-500 animate-pulse">Lädt Hot List…</div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
            Hot List nicht erreichbar ({googleErrorText(error)}).
            <button onClick={() => refetch()} className="ml-3 underline hover:text-white">
              Erneut versuchen
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
            Keine Einträge in „{MODES.find((m) => m.key === mode)?.label}“.
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((item) => {
              const selector = selectorFor(item);
              const isEditing = editingSelector === selector;
              const isNoteOpen = noteSelector === selector;
              return (
                <li
                  key={selector}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  {isEditing ? (
                    <form onSubmit={submitEdit} className="flex flex-wrap gap-2">
                      <input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        autoFocus
                        className="min-w-[200px] flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-rose-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
                      >
                        Speichern
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSelector(null)}
                        className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
                      >
                        Abbrechen
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100">{item.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          {item.created_at ? <span>{formatCreatedAt(item.created_at)}</span> : null}
                          {item.source ? (
                            <span className="rounded-full bg-white/5 px-2 py-0.5 uppercase tracking-wide">
                              {item.source}
                            </span>
                          ) : null}
                          <span
                            className={`rounded-full px-2 py-0.5 uppercase tracking-wide ${
                              item.status === "done"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : item.status === "deleted"
                                ? "bg-slate-500/15 text-slate-400"
                                : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.status !== "done" && item.status !== "deleted" ? (
                          <button
                            title="Als erledigt markieren"
                            onClick={() => {
                              setActionError("");
                              completeMutation.mutate(selector);
                            }}
                            className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : null}
                        {item.status !== "deleted" ? (
                          <button
                            title="Bearbeiten"
                            onClick={() => startEdit(item)}
                            className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button
                          title="Notiz"
                          onClick={() => (isNoteOpen ? setNoteSelector(null) : openNote(item))}
                          className="rounded-lg p-2 text-sky-300 hover:bg-sky-500/10"
                        >
                          <StickyNote className="h-4 w-4" />
                        </button>
                        {item.status !== "deleted" ? (
                          <button
                            title="Löschen"
                            onClick={() => {
                              setActionError("");
                              deleteMutation.mutate(selector);
                            }}
                            className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {isNoteOpen ? (
                    <form onSubmit={submitNote} className="mt-3 border-t border-white/10 pt-3">
                      {noteLoading ? (
                        <div className="text-xs text-slate-500">Lädt Notiz…</div>
                      ) : (
                        <>
                          <textarea
                            value={noteText}
                            onChange={(event) => setNoteText(event.target.value)}
                            placeholder="Notiz zu diesem Eintrag…"
                            className="min-h-[80px] w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="submit"
                              disabled={noteMutation.isPending}
                              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                            >
                              Notiz speichern
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteSelector(null)}
                              className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
                            >
                              Schließen
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
