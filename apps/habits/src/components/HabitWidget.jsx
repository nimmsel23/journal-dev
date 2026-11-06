import { useEffect, useMemo, useState } from 'react'
import { Check, BookOpen } from 'lucide-react'
import { getHabits, recordHabit, localToday, getHabitJournal, saveHabitJournal } from '@db'
import HabitJournalModal from '../views/Habits/HabitJournalModal.jsx'

function epochDayNow() {
  return Math.floor(Date.now() / 86400000)
}

function todayCompletion(habit, todayEpochDay) {
  const rec = (habit?.records || []).find(r => r.epochDay === todayEpochDay)
  return rec?.completion || 'MISSED'
}

function compactStatusLabel(completion) {
  if (completion === 'DONE') return 'Done'
  if (completion === 'PARTIAL') return 'Partial'
  return 'Missed'
}

export default function HabitWidget() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [modalHabit, setModalHabit] = useState(null)
  const [journalText, setJournalText] = useState('')
  const [isJournalSaving, setIsJournalSaving] = useState(false)
  const todayEpochDay = useMemo(() => epochDayNow(), [])
  const today = localToday()

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setErr('')
      try {
        const data = await getHabits()
        if (!alive) return
        setHabits(data)
      } catch {
        if (!alive) return
        setErr('Habits nicht erreichbar')
        setHabits([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  async function openJournal(habit) {
    setJournalText('')
    setModalHabit(habit)
    const j = await getHabitJournal(habit.uuid, today)
    if (j?.text) setJournalText(j.text)
  }

  async function onSaveJournal() {
    if (!modalHabit) return
    setIsJournalSaving(true)
    try {
      await saveHabitJournal(modalHabit.uuid, today, journalText)
    } finally {
      setIsJournalSaving(false)
    }
  }

  async function checkIn(uuid) {
    setHabits(prev => prev.map(h => {
      if (h.uuid !== uuid) return h
      const records = Array.isArray(h.records) ? [...h.records] : []
      const i = records.findIndex(r => r.epochDay === todayEpochDay)
      const nextRec = { epochDay: todayEpochDay, recordValue: 1.0, completion: 'DONE' }
      if (i >= 0) records[i] = { ...records[i], ...nextRec }
      else records.push(nextRec)
      return { ...h, records }
    }))
    try {
      await recordHabit(uuid)
    } catch {
      setHabits(prev => prev.map(h => {
        if (h.uuid !== uuid) return h
        const records = (h.records || []).filter(r => r.epochDay !== todayEpochDay)
        return { ...h, records }
      }))
      setErr('Check-in fehlgeschlagen')
      setTimeout(() => setErr(''), 1800)
    }
  }

  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
        Habits (heute)
      </div>

      {loading && <div className="text-sm" style={{ color: 'var(--dim)' }}>Lade…</div>}
      {!loading && err && <div className="text-sm" style={{ color: 'var(--red)' }}>{err}</div>}

      <div className="flex flex-col gap-2">
        {habits.map(h => {
          const completion = todayCompletion(h, todayEpochDay)
          const done = completion === 'DONE'
          return (
            <div
              key={h.uuid}
              className="p-3 rounded-2xl flex items-center justify-between"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderLeft: done ? '3px solid var(--green)' : '3px solid transparent',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                  {h.name || 'Habit'}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: done ? 'var(--green)' : 'var(--dim)' }}>
                  {compactStatusLabel(completion)}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openJournal(h)}
                  className="p-2 rounded-xl transition-all"
                  style={{ border: '1px solid var(--line)', color: 'var(--dim)' }}
                >
                  <BookOpen size={16} />
                </button>
                {done ? (
                  <div className="flex items-center justify-center w-10 h-9" style={{ color: 'var(--green)' }}>
                    <Check size={18} className="stroke-[3]" />
                  </div>
                ) : (
                  <button
                    onClick={() => checkIn(h.uuid)}
                    className="text-xs px-3 py-2 rounded-xl border font-semibold"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                  >
                    Abhaken
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <HabitJournalModal
        open={!!modalHabit}
        onClose={() => setModalHabit(null)}
        habit={modalHabit}
        date={today}
        journalText={journalText}
        setJournalText={setJournalText}
        isJournalSaving={isJournalSaving}
        onSaveJournal={onSaveJournal}
      />
    </div>
  )
}
