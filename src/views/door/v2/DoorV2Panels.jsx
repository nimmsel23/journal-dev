// Die vier Phasen-Panels von Door v2. Query-Keys tragen die uid, damit ein
// Nutzerwechsel keine fremden Daten aus dem Cache zeigt.
import { useCallback, useRef, useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { door } from "../../../lib/door/source.js";
import WarstackWizard from "./DoorV2Warstack.jsx";
import ContextMenu, { copyText, menuPos, useContextMenu } from "./DoorV2ContextMenu.jsx";
import * as twDoor from "../../../lib/door/taskwarrior.door.js";
import { fetchProfitGtasks } from "../../../lib/door/gtasks.door.js";
import { fetchProfitReviews } from "../../../lib/door/profitFromJournal.js";
import { fetchProfitTw } from "../../../lib/door/taskwarrior.door.js";

const MSGS = {
  "google-expired": "Google-Verbindung abgelaufen – oben neu verbinden.",
  "google-offline": "Google gerade nicht erreichbar (offline?). Die Verbindung bleibt bestehen.",
  "tc-conflict": "Sync-Konflikt – bitte „Sync“ drücken und erneut versuchen.",
  "tc-unconfigured": "Taskwarrior ist nicht eingerichtet.",
  "tc-decrypt": "Entschlüsselung fehlgeschlagen – Client-ID oder Secret falsch.",
  "tc-body": "Antwort des Sync-Servers brach ab oder war nicht lesbar (Netz/Proxy).",
  "tc-format": "Unerwartetes Datenformat vom Sync-Server.",
  "tc-network": "Sync-Server nicht erreichbar (offline, CORS oder Proxy).",
};
const msg = (e) => MSGS[e?.message] || e?.message || "Fehler";
const selectorFor = (i) => i?.id || i?.task_uuid || i?.tw_uuid || i?.selector || "";
const keyFor = (i) => i.war_uuid || i.id || i.task_uuid || "";

function State({ q, children, empty }) {
  if (q.isLoading) return <div className="dv2-empty">Lade …</div>;
  if (q.isError) {
    return <div className="dv2-empty" role="alert">{msg(q.error)} <button type="button" className="dv2-link" onClick={() => q.refetch()}>Erneut versuchen</button></div>;
  }
  return empty ? <div className="dv2-empty">{empty}</div> : children;
}

/* ── Potential: Hot List ── */
/* Potential: Wischen legt den Plan-Quadranten fest   Q1 «  Q2 ‹  Eintrag  › Q3  » Q4
   (kurz = Q2/Q3, weit = Q1/Q4); Antippen öffnet Notiz + War Stack. */
const SWIPE_SHORT = 56, SWIPE_LONG = 130;
const swipeTarget = (d) => (d <= -SWIPE_LONG ? 1 : d <= -SWIPE_SHORT ? 2 : d >= SWIPE_LONG ? 4 : d >= SWIPE_SHORT ? 3 : null);

function PotentialRow({ item, sel, busy, open, onToggle, onQuadrant, onMenu, D, source, uid, onChanged }) {
  const [dx, setDx] = useState(0);
  const st = useRef(null);
  const dxRef = useRef(0);
  const [note, setNote] = useState("");
  const [ws, setWs] = useState(false);
  const [msgText, setMsgText] = useState("");
  const qc = useQueryClient();
  // vorhandene Notiz anzeigen: Backend lädt sie je Item, Google Tasks bringt sie als description mit
  const noteKey = ["dv2-note", uid, source, sel];
  const noteQ = useQuery({ queryKey: noteKey, enabled: open && !!D.fetchNote, queryFn: () => D.fetchNote(sel), staleTime: 15_000 });
  const oldNote = String((D.fetchNote ? noteQ.data : item.description) || "").trim();
  const move = (v) => { dxRef.current = v; setDx(v); };
  const target = swipeTarget(dx);
  const end = (e) => {
    const s = st.current; st.current = null;
    const d = dxRef.current; move(0);
    if (!s || e.type === "pointercancel") return;
    if (!s.moved) { onToggle(); return; }
    const q = swipeTarget(d);
    if (q) onQuadrant(sel, q);
  };
  const saveNote = async () => {
    setMsgText("");
    try {
      await D.addNote(sel, note); setNote("");
      setMsgText(source === "taskwarrior" ? "Notiz gespeichert – in taskopen verfügbar." : "Notiz gespeichert.");
      qc.invalidateQueries({ queryKey: noteKey }); onChanged();
    }
    catch (e) { setMsgText(msg(e)); }
  };
  const wsApi = source === "taskwarrior" ? twDoor : undefined;
  return (
    <div className={`dv2-swipe${open ? " open" : ""}`}>
      <div className="dv2-swhint" aria-hidden="true">
        <span className={dx > 0 ? "on" : ""}>{dx > 0 && target ? `Q${target}` : ""}</span>
        <span className={dx < 0 ? "on" : ""}>{dx < 0 && target ? `Q${target}` : ""}</span>
      </div>
      <div
        className="dv2-row dv2-swrow" role="button" tabIndex={0} aria-expanded={open}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dx ? "none" : "transform .18s" }}
        onPointerDown={(e) => { if (busy || (e.pointerType === "mouse" && e.button !== 0)) return; st.current = { x: e.clientX, id: e.pointerId, moved: false }; }}
        onPointerMove={(e) => {
          const s = st.current; if (!s) return;
          const d = e.clientX - s.x;
          if (!s.moved && Math.abs(d) > 8) { s.moved = true; try { e.currentTarget.setPointerCapture(s.id); } catch {} }
          if (s.moved) move(Math.max(-220, Math.min(220, d)));
        }}
        onPointerUp={end} onPointerCancel={end}
        onContextMenu={(e) => {
          e.preventDefault();
          st.current = null; move(0); // ein halb begonnener Wisch gilt nicht mehr
          const { x, y } = menuPos(e);
          onMenu(sel, item, x, y);
        }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      >
        <div className="dv2-text">
          <h3>{item.title}</h3>
        </div>
        <span className={`dv2-qbadge${item.quadrant ? " set" : ""}`}>{item.quadrant ? `Q${item.quadrant}` : "–"}</span>
      </div>
      {open && (
        <div className="dv2-sheet">
          <div className="dv2-qs" role="group" aria-label="Quadrant">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} type="button" aria-pressed={item.quadrant === n} disabled={busy} onClick={() => onQuadrant(sel, n)}>Q{n}</button>
            ))}
          </div>
          {D.addNote && (
            <div className="dv2-note">
              {oldNote && <p className="dv2-oldnote">{oldNote}</p>}
              <textarea aria-label="Notiz" rows={3} placeholder={source === "taskwarrior" ? "Notiz – wird als Annotation am Task gespeichert (taskopen)" : "Notiz zu diesem Eintrag …"} value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="button" disabled={!note.trim()} onClick={saveNote}>Notiz speichern</button>
            </div>
          )}
          {msgText && <div className="dv2-none" role="status">{msgText}</div>}
          {(source === "backend" || source === "taskwarrior") && (
            ws
              ? <WarstackWizard uid={uid} api={wsApi} scope={source} autoStart door={{ id: sel, title: item.title }} onDone={() => { setWs(false); onChanged(); }} />
              : <div className="dv2-qs"><button type="button" className="dv2-pick" onClick={() => setWs(true)}>War Stack starten</button></div>
          )}
        </div>
      )}
    </div>
  );
}

export function PotentialPanel({ uid, source = "backend" }) {
  const D = door(source);
  const qc = useQueryClient();
  const key = ["dv2-hotlist", uid, source];
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState(null);
  const [err, setErr] = useState("");
  const [menu, setMenu] = useState(null); // { sel, item, x, y }
  const closeMenu = useCallback(() => setMenu(null), []);
  const q = useQuery({ queryKey: key, queryFn: () => D.fetchHotlist("active"), staleTime: 15_000 });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const run = async (fn) => {
    setErr("");
    try { await fn(); await refresh(); } catch (e) { setErr(msg(e)); }
  };
  const items = (q.data || []).filter((i) => i.status !== "done" && i.status !== "deleted");
  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    run(async () => { await D.addHotlistItem(text); setDraft(""); });
  };
  // Quadrant setzen: sofort im Cache, dann speichern
  const setQuadrant = (sel, n) => {
    qc.setQueryData(key, (d) => (d || []).map((i) => (selectorFor(i) === sel ? { ...i, quadrant: n } : i)));
    run(() => D.assignQuadrant(sel, n));
  };
  // Entfernen: Zeile sofort aus dem Cache nehmen, dann speichern (Fehler → Refetch holt sie zurück)
  const remove = (sel) => {
    qc.setQueryData(key, (d) => (d || []).filter((i) => selectorFor(i) !== sel));
    setOpenId((o) => (o === sel ? null : o));
    run(() => D.deleteHotlistItem(sel));
  };
  const menuItems = (sel, item) => [
    ...[1, 2, 3, 4].map((n) => ({ label: `Quadrant Q${n}`, checked: item.quadrant === n, onSelect: () => setQuadrant(sel, n) })),
    "-",
    { label: openId === sel ? "Notiz / War Stack schließen" : "Notiz / War Stack öffnen", onSelect: () => setOpenId(openId === sel ? null : sel) },
    { label: "Entfernen", danger: true, disabled: !D.deleteHotlistItem, onSelect: () => remove(sel) },
  ];
  return (
    <>
      <div className="dv2-none dv2-swipehelp">Wischen: ‹ Q2 · « Q1 · › Q3 · » Q4 – Antippen: Notiz / War Stack – Rechtsklick: Menü</div>
      <State q={q} empty={!q.isLoading && !q.isError && items.length === 0 ? "Hot List leer." : null}>
        {items.map((i) => {
          const sel = selectorFor(i);
          return (
            <PotentialRow key={sel || i.title} item={i} sel={sel} busy={false} open={openId === sel}
              onToggle={() => setOpenId(openId === sel ? null : sel)} onQuadrant={setQuadrant}
              onMenu={(s, it, x, y) => setMenu({ sel: s, item: it, x, y })}
              D={D} source={source} uid={uid} onChanged={refresh} />
          );
        })}
      </State>
      {menu && <ContextMenu x={menu.x} y={menu.y} label={menu.item.title} items={menuItems(menu.sel, menu.item)} onClose={closeMenu} />}
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      <form className="dv2-compose" onSubmit={submit}>
        <input aria-label="Neues Hot-List-Item" placeholder="Neue Idee …" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" disabled={!draft.trim()}>Add</button>
      </form>
    </>
  );
}

/* ── Plan: Door War ── */
const QLABEL = { 1: "Q1 · Dringend + Wichtig", 2: "Q2 · Wichtig, nicht dringend", 3: "Q3 · Dringend, nicht wichtig", 4: "Q4 · Weder noch" };
/* Plan-Board: Items per Griff (⠿) in Quadranten oder auf „Door der Woche“ ziehen (dnd-kit) */
function PlanItem({ k, item, isDoor, busy, canDrag, onQuadrant, onDoor, bind }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: k, disabled: !canDrag });
  return (
    <div ref={setNodeRef} className={`dv2-row dv2-plan${isDoor ? " door" : ""}${isDragging ? " dragging" : ""}`}
      onContextMenu={bind([
        ...[1, 2, 3, 4].map((n) => ({ label: `Quadrant Q${n}`, checked: item.quadrant === n, disabled: busy, onSelect: () => onQuadrant(k, n) })),
        "-",
        { label: isDoor ? "Ist Door der Woche" : "Als Door der Woche", disabled: busy || isDoor, onSelect: () => onDoor(k) },
      ], item.title)}>
      {canDrag && <button type="button" className="dv2-grip" aria-label={`${item.title} verschieben`} {...listeners} {...attributes}>⠿</button>}
      <div className="dv2-text">
        <h3>{item.title}</h3>
        <div className="dv2-qs">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" aria-pressed={item.quadrant === n} disabled={busy} onClick={() => onQuadrant(k, n)}>Q{n}</button>
          ))}
          {item.quadrant === 2 && (isDoor
            ? <span className="dv2-tag">Door der Woche</span>
            : <button type="button" className="dv2-pick" disabled={busy} onClick={() => onDoor(k)}>Door wählen</button>)}
        </div>
      </div>
    </div>
  );
}
function DropZone({ id, className = "", children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <section ref={setNodeRef} className={`dv2-drop ${className}${isOver ? " over" : ""}`}>{children}</section>;
}

export function PlanPanel({ uid, source = "backend" }) {
  const D = door(source);
  const qc = useQueryClient();
  const key = ["dv2-plan", uid, source];
  const [err, setErr] = useState("");
  const [dragId, setDragId] = useState(null);
  const [bind, menuNode] = useContextMenu();
  const q = useQuery({ queryKey: key, queryFn: D.fetchDoorWar, staleTime: 15_000 });
  const act = useMutation({
    mutationFn: (fn) => fn(),
    onSuccess: () => { setErr(""); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => { setErr(msg(e)); qc.invalidateQueries({ queryKey: key }); },
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const canDrag = true;
  const board = q.data?.board || { 1: [], 2: [], 3: [], 4: [], unsorted: [] };
  const byKey = new Map((q.data?.candidates || []).map((i) => [keyFor(i), i]));
  const selected = q.data?.selected?.selector || q.data?.doorWar?.selected?.selector || "";
  const total = Object.values(board).reduce((n, a) => n + (a?.length || 0), 0);

  // optimistisch im Cache verschieben, dann speichern
  const moveLocal = (k, n) => qc.setQueryData(key, (d) => {
    if (!d) return d;
    const b = Object.fromEntries(Object.entries(d.board).map(([bk, arr]) => [bk, (arr || []).filter((x) => x !== k)]));
    b[n] = [...(b[n] || []), k];
    return { ...d, board: b, candidates: d.candidates.map((c) => (keyFor(c) === k ? { ...c, quadrant: n } : c)) };
  });
  const setQuadrant = (k, n) => { moveLocal(k, n); act.mutate(() => D.assignQuadrant(k, n)); };
  // Door der Woche: liegt das Item nicht in Q2, wandert es zuerst dorthin
  const setDoor = (k) => {
    if (selected === k) return;
    const item = byKey.get(k);
    if (item?.quadrant !== 2) moveLocal(k, 2);
    act.mutate(async () => { if (item?.quadrant !== 2) await D.assignQuadrant(k, 2); await D.selectWeeklyDoor(k); });
  };
  const onDragEnd = ({ active, over }) => {
    setDragId(null);
    if (!over) return;
    const k = String(active.id);
    const item = byKey.get(k);
    if (over.id === "door") setDoor(k);
    else if (String(over.id).startsWith("q")) {
      const n = Number(String(over.id).slice(1));
      if (item?.quadrant !== n) setQuadrant(k, n);
    }
  };
  const row = (k) => byKey.get(k) && (
    <PlanItem key={k} k={k} item={byKey.get(k)} isDoor={selected === k} busy={act.isPending} canDrag={canDrag} onQuadrant={setQuadrant} onDoor={setDoor} bind={bind} />
  );
  return (
    <State q={q} empty={!q.isLoading && !q.isError && total === 0 ? "Keine Kandidaten. Erst Items in Potential anlegen." : null}>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {(source === "backend" || source === "taskwarrior") && (
        <WarstackWizard uid={uid} api={source === "taskwarrior" ? twDoor : undefined} scope={source} door={byKey.get(selected) ? { id: selected, title: byKey.get(selected).title } : null}
          onDone={() => qc.invalidateQueries({ queryKey: key })} />
      )}
      <DndContext sensors={sensors} onDragStart={({ active }) => setDragId(String(active.id))} onDragEnd={onDragEnd} onDragCancel={() => setDragId(null)}>
        {canDrag && dragId && (
          <DropZone id="door" className="dv2-doorslot">
            <b>Door der Woche</b>
            <span>{byKey.get(selected)?.title || "noch keine – hier ablegen"}</span>
          </DropZone>
        )}
        {[1, 2, 3, 4].map((n) => (
          <DropZone key={n} id={`q${n}`}>
            <h4 className="dv2-sec">{QLABEL[n]} <span>{(board[n] || []).length}</span></h4>
            {(board[n] || []).map(row)}
          </DropZone>
        ))}
        {(board.unsorted || []).length > 0 && (
          <section>
            <h4 className="dv2-sec">Unsortiert <span>{board.unsorted.length}</span></h4>
            {board.unsorted.map(row)}
          </section>
        )}
        <DragOverlay>{dragId && byKey.get(dragId) ? <div className="dv2-row dv2-plan dv2-ghost"><div className="dv2-text"><h3>{byKey.get(dragId).title}</h3></div></div> : null}</DragOverlay>
      </DndContext>
      {menuNode}
    </State>
  );
}

/* ── Production: Daily Hits ── */
const DAYS = [["mon", "Mo"], ["tue", "Di"], ["wed", "Mi"], ["thu", "Do"], ["fri", "Fr"], ["sat", "Sa"], ["sun", "So"]];
export function ProductionPanel({ uid, source = "backend" }) {
  const D = door(source);
  const qc = useQueryClient();
  const [err, setErr] = useState("");
  const q = useQuery({ queryKey: ["dv2-prod", uid, source], queryFn: () => D.fetchDailyWeek(), staleTime: 15_000 });
  const s = useQuery({ queryKey: ["dv2-prod-sum", uid, source], queryFn: D.fetchHitsWeek, staleTime: 15_000 });
  const tog = useMutation({
    mutationFn: (id) => D.toggleDailyHit(id),
    onSuccess: () => { setErr(""); qc.invalidateQueries({ queryKey: ["dv2-prod", uid, source] }); qc.invalidateQueries({ queryKey: ["dv2-prod-sum", uid, source] }); },
    onError: (e) => setErr(msg(e)),
  });
  const [bind, menuNode] = useContextMenu();
  const [draft, setDraft] = useState("");
  const [day, setDay] = useState(() => DAYS[Math.min(6, (new Date().getDay() + 6) % 7)][0]);
  const add = useMutation({
    mutationFn: ({ day: d, t }) => D.addDailyHit(d, t),
    onSuccess: () => { setErr(""); setDraft(""); qc.invalidateQueries({ queryKey: ["dv2-prod", uid, source] }); qc.invalidateQueries({ queryKey: ["dv2-prod-sum", uid, source] }); },
    onError: (e) => setErr(msg(e)),
  });
  const days = q.data?.days || {};
  const none = !q.isLoading && !q.isError && !DAYS.some(([d]) => (days[d] || []).length);
  const sum = s.data;
  return (
    <>
      <div className="dv2-sum">
        <b>{sum ? `${sum.completed_hits}/${sum.total_hits}` : "–"}</b>
        <span>Hits der Woche{sum ? ` · ${Math.round((sum.completion_rate || 0) * 100)} %` : ""}{q.data?.week ? ` · ${q.data.week}` : ""}</span>
      </div>
      {err && <div className="dv2-empty" role="alert">{err}</div>}
      {(source === "gtasks" || source === "taskwarrior") && (
        <form className="dv2-compose" onSubmit={(e) => { e.preventDefault(); const t = draft.trim(); if (t) add.mutate({ day, t }); }}>
          <select aria-label="Tag" value={day} onChange={(e) => setDay(e.target.value)}>{DAYS.map(([d, l]) => <option key={d} value={d}>{l}</option>)}</select>
          <input aria-label="Neuer Hit" placeholder="Neuer Hit …" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" disabled={!draft.trim() || add.isPending}>Add</button>
        </form>
      )}
      <State q={q} empty={none ? (source === "gtasks" || source === "taskwarrior" ? "Keine Hits diese Woche. Oben einen anlegen." : "Kein Daily-Plan. Erst einen War Stack im Plan anlegen.") : null}>
        <div className="dv2-grid">
          {DAYS.map(([d, label]) => {
            const items = days[d] || [];
            return (
              <div key={d} className="dv2-day">
                <h4>{label}</h4>
                {items.length === 0 && <span className="dv2-none">–</span>}
                {items.map((it) => (
                  <button key={it.id} type="button" className={`dv2-hit${it.done ? " done" : ""}${it.kind === "big" ? " big" : ""}`} aria-pressed={!!it.done} disabled={tog.isPending} onClick={() => tog.mutate(it.id)}
                    onContextMenu={bind([
                      { label: it.done ? "Wieder öffnen" : "Erledigt", disabled: tog.isPending, onSelect: () => tog.mutate(it.id) },
                      { label: "Text kopieren", onSelect: () => copyText(it.label || it.fact) },
                    ], it.label || it.fact)}>
                    <i>{it.done ? "✓" : ""}</i>
                    <span>{it.label || it.fact || "— leer —"}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </State>
      {menuNode}
    </>
  );
}

/* ── Profit: Auswertung (nur lesen) ── */
export function ProfitPanel({ uid, source = "backend" }) {
  return source === "gtasks" || source === "taskwarrior" ? <ProfitGtasks uid={uid} source={source} /> : <ProfitBackend uid={uid} source={source} />;
}

/* Profit-Zeile (nur lesen): Rechtsklick kopiert den Text */
function CopyRow({ text, children }) {
  const [bind, node] = useContextMenu();
  return (
    <div className="dv2-row" onContextMenu={bind([{ label: "Text kopieren", onSelect: () => copyText(text) }], "Zeile")}>
      {children}{node}
    </div>
  );
}

/* Quelle Google Tasks: Wochen-Auswertung aus erledigten Tasks, keine Reflexionen */
function ProfitGtasks({ uid, source }) {
  const q = useQuery({ queryKey: ["dv2-profit-gt", uid, source], queryFn: source === "taskwarrior" ? fetchProfitTw : fetchProfitGtasks, staleTime: 15_000 });
  const weeks = q.data?.weeks || [];
  const doors = q.data?.doors || [];
  return (
    <State q={q}>
      <h4 className="dv2-sec">Erledigt pro Woche <span>{weeks.length}</span></h4>
      {weeks.map((w) => (
        <CopyRow key={w.week} text={`${w.week}: ${w.potential} Potential · ${w.hits} Hits`}><div className="dv2-text"><h3>{w.week}</h3><p>{w.potential} Potential · {w.hits} Hits</p></div></CopyRow>
      ))}
      <h4 className="dv2-sec">Erledigte Wochen-Doors <span>{doors.length}</span></h4>
      {doors.length === 0 ? <div className="dv2-empty">Noch keine erledigte Door.</div> : doors.map((x) => (
        <CopyRow key={x.id} text={x.door_title}><div className="dv2-text"><h3>{x.door_title}</h3><p>{x.week}</p></div></CopyRow>
      ))}
      <ProfitReviews uid={uid} />
    </State>
  );
}

/* Reviews aus dem Journal: Einträge mit +p / +profit / +review (quelle-unabhängig) */
function ProfitReviews({ uid }) {
  const q = useQuery({ queryKey: ["dv2-profit-reviews", uid], enabled: !!uid, queryFn: () => fetchProfitReviews(uid), staleTime: 15_000 });
  const list = q.data || [];
  return (
    <>
      <h4 className="dv2-sec">Reviews aus dem Journal <span>{list.length}</span></h4>
      {q.isError ? <div className="dv2-empty" role="alert">{msg(q.error)}</div>
        : list.length === 0 ? <div className="dv2-empty">{q.isLoading ? "Lade …" : "Noch keine. Im Journal mit +review, +profit oder +p taggen."}</div>
        : list.map((x) => (
          <CopyRow key={x.id} text={String(x.text || x.title || "").trim()}><div className="dv2-text">
            <h3>{x.title || "—"}</h3>
            <p>{x.week} · {x.date}{String(x.text || "").trim().split("\n").length > 1 ? ` — ${String(x.text).trim().split("\n").slice(1).join(" ").slice(0, 240)}` : ""}</p>
          </div></CopyRow>
        ))}
    </>
  );
}

function ProfitBackend({ uid, source }) {
  const D = door(source);
  const w = useQuery({ queryKey: ["dv2-profit", uid, source], queryFn: () => D.fetchProfitWeek(), staleTime: 15_000 });
  const c = useQuery({ queryKey: ["dv2-profit-done", uid, source], queryFn: D.fetchCompletedWarstacks, staleTime: 15_000 });
  const r = useQuery({ queryKey: ["dv2-profit-refl", uid, source], queryFn: D.fetchReflections, staleTime: 15_000 });
  const ws = w.data?.warstack;
  const title = ws?.door_title || w.data?.selected?.title;
  const done = c.data || [];
  const refl = r.data || [];
  return (
    <>
      <State q={w}>
        <div className="dv2-sum">
          <b>{ws ? `${ws.hit_done_count}/${ws.hit_count}` : "–"}</b>
          <span>{title ? `Door: ${title}` : "Keine Door gewählt"}{ws?.opened ? " · geöffnet" : ""}{w.data?.week ? ` · ${w.data.week}` : ""}</span>
        </div>
        {ws ? (ws.hits || []).map((h) => (
          <CopyRow key={h.id} text={h.fact}>
            <span className={`dv2-check static${h.done ? " done" : ""}`}><i>{h.done ? "✓" : ""}</i></span>
            <div className="dv2-text"><h3>{h.fact || "— leer —"}</h3></div>
          </CopyRow>
        )) : <div className="dv2-empty">Noch kein War Stack für diese Woche.</div>}
      </State>
      <h4 className="dv2-sec">Abgeschlossene War Stacks <span>{done.length}</span></h4>
      {c.isError ? <div className="dv2-empty" role="alert">{msg(c.error)}</div>
        : done.length === 0 ? <div className="dv2-empty">{c.isLoading ? "Lade …" : "Noch keine abgeschlossenen War Stacks."}</div>
        : done.map((x) => (
          <CopyRow key={x.id} text={x.door_title}><div className="dv2-text"><h3>{x.door_title}</h3><p>{x.week} · {x.hit_count} Hits</p></div></CopyRow>
        ))}
      <h4 className="dv2-sec">Reflexionen <span>{refl.length}</span></h4>
      {r.isError ? <div className="dv2-empty" role="alert">{msg(r.error)}</div>
        : refl.length === 0 ? <div className="dv2-empty">{r.isLoading ? "Lade …" : "Keine Reflexionen."}</div>
        : refl.map((x) => (
          <CopyRow key={x.id || x.path} text={[x.door_title, x.reflection].filter(Boolean).join("\n")}><div className="dv2-text"><h3>{x.door_title || "—"}</h3><p>{x.reflection || ""}</p></div></CopyRow>
        ))}
      <ProfitReviews uid={uid} />
    </>
  );
}
