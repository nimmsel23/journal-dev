import { useId, useState } from 'react';
import { CATEGORIES, DEFAULT_FREQUENCY, WEEKDAYS, dueOnDate, habitStats } from './habitsModel.js';

function HabitEditor({ habit, onSave, onCancel, pending }) {
  const id = useId();
  const [name, setName] = useState(habit?.name || '');
  const [category, setCategory] = useState(habit?.category || '');
  const [frequency, setFrequency] = useState(habit?.frequency || DEFAULT_FREQUENCY);
  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || pending) return;
    if (await onSave({ name, category, frequency })) {
      if (onCancel) onCancel();
      else { setName(''); setCategory(''); setFrequency(DEFAULT_FREQUENCY); }
    }
  };
  return (
    <form className="jv2-heditor" onSubmit={submit} aria-label={habit ? `${habit.name} bearbeiten` : 'Habit anlegen'}>
      <fieldset disabled={pending}>
        <label htmlFor={`${id}-name`}>Name</label>
        <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Neues Habit …" required />
        <label htmlFor={`${id}-category`}>Core4-Kategorie</label>
        <select id={`${id}-category`} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Ohne Kategorie</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
        </select>
        <label htmlFor={`${id}-frequency`}>Frequenz</label>
        <select id={`${id}-frequency`} value={frequency.type} onChange={(e) => setFrequency({ ...frequency, type: e.target.value })}>
          <option value="daily">Täglich</option><option value="weekly">Wochentage</option><option value="monthly">Monatsziel</option>
        </select>
        {frequency.type === 'weekly' && <div className="jv2-hweekdays" role="group" aria-label="Wochentage">
          {WEEKDAYS.map(([day, label]) => <button key={day} type="button" aria-pressed={frequency.weekdays?.includes(day) || false} onClick={() => setFrequency({ ...frequency, weekdays: frequency.weekdays?.includes(day) ? frequency.weekdays.filter((d) => d !== day) : [...(frequency.weekdays || []), day] })}>{label}</button>)}
          <small>Ohne Auswahl: jeden Tag.</small>
        </div>}
        {frequency.type === 'monthly' && <><label htmlFor={`${id}-target`}>Mal pro Monat</label><input id={`${id}-target`} type="number" min="1" max="31" required value={frequency.timesPerPeriod ?? 1} onChange={(e) => setFrequency({ ...frequency, timesPerPeriod: e.target.value })} /></>}
        <div className="jv2-hactions"><button type="submit" disabled={!name.trim()}>{habit ? 'Speichern' : 'Anlegen'}</button>{onCancel && <button type="button" onClick={onCancel}>Abbrechen</button>}</div>
      </fieldset>
    </form>
  );
}

export default function HabitsView({ date, today, habits, onToggle, onAdd, onUpdate, onArchive, onRestore, pending, loading, error, onRetry }) {
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const visible = habits.filter((h) => (filter === 'archived' ? h.deleted : !h.deleted)
    && (filter !== 'open' || !h.hasRecord(date)) && (filter !== 'done' || h.hasRecord(date))
    && String(h.name || '').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <div className="jv2-hab" aria-busy={pending || loading}>
      <div className="jv2-hfilters">
        <input aria-label="Habits suchen" placeholder="Suchen …" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Habits filtern" value={filter} onChange={(e) => { setFilter(e.target.value); setConfirmId(null); }}>
          <option value="active">Aktive</option><option value="open">Offen</option><option value="done">Erledigt</option><option value="archived">Archiv</option>
        </select>
      </div>
      {loading && <div className="jv2-empty" role="status">Habits laden…</div>}
      {error && <div className="jv2-empty" role="alert">{error} <button type="button" className="jv2-link" disabled={pending} onClick={onRetry}>Erneut laden</button></div>}
      {!loading && !error && !visible.length && <div className="jv2-empty">{habits.length ? 'Keine Habits für diesen Filter.' : 'Noch keine Habits. Unten anlegen.'}</div>}
      {visible.map((h) => {
        const done = h.hasRecord(date);
        const stats = habitStats(h, date, today);
        return (
          <div key={h.uuid}>
            <div className={`jv2-hrow${done ? ' done' : ''}`}>
              <button type="button" className="jv2-htoggle" disabled={pending || h.deleted || date > today} aria-pressed={done} aria-label={`${h.name} für ${date} ${done ? 'zurücknehmen' : 'erledigen'}`} onClick={() => onToggle(h, date)}><i>{done ? '✓' : ''}</i></button>
              <div className="jv2-hmain">
                <h3>{h.name}</h3>
                <div className="jv2-hstats">
                  {h.category && <span>{h.category}</span>}
                  {stats.monthly ? <span>Monatsziel {stats.monthHits}/{stats.target}</span> : <><span>Serie {stats.streak}</span><span>{stats.rate} % · {stats.hits}/{stats.total} geplant</span></>}
                  {!dueOnDate(h, date) && <span>An diesem Tag nicht geplant</span>}
                </div>
                <div className="jv2-hstrip" role="group" aria-label={`28 Tage ${h.name}`}>
                  {stats.days.map((d) => <button key={d} type="button" className={`${h.hasRecord(d) ? 'on' : ''}${!dueOnDate(h, d) ? ' unplanned' : ''}`} disabled={pending || h.deleted || d > today} aria-pressed={h.hasRecord(d)} aria-label={`${h.name} ${d} ${h.hasRecord(d) ? 'erledigt, zurücknehmen' : 'offen, erledigen'}`} title={d} onClick={() => onToggle(h, d)}>{d.slice(-2)}</button>)}
                </div>
                <div className="jv2-hactions">
                  {h.deleted ? <button type="button" disabled={pending} onClick={() => onRestore(h)}>Wiederherstellen</button> : <>
                    <button type="button" disabled={pending} onClick={() => { setEditingId(h.uuid); setConfirmId(null); }}>Bearbeiten</button>
                    {confirmId === h.uuid ? <><button type="button" disabled={pending} onClick={async () => { if (await onArchive(h)) setConfirmId(null); }}>Archivieren bestätigen</button><button type="button" disabled={pending} onClick={() => setConfirmId(null)}>Abbrechen</button></> : <button type="button" disabled={pending} onClick={() => setConfirmId(h.uuid)}>Archivieren</button>}
                  </>}
                </div>
              </div>
            </div>
            {editingId === h.uuid && !h.deleted && <HabitEditor key={h.uuid} habit={h} pending={pending} onSave={(fields) => onUpdate(h, fields)} onCancel={() => setEditingId(null)} />}
          </div>
        );
      })}
      <HabitEditor pending={pending} onSave={onAdd} />
    </div>
  );
}
