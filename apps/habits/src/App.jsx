import { useState, useEffect } from 'react'
import { CheckSquare, LogIn, Loader, RotateCcw } from 'lucide-react'
import { watchAuth, signIn, isLocalMode, localToday } from '@db'
import Habits from './views/Habits/index.jsx'
import JournalAppWrapper from './shell/JournalAppWrapper.jsx'
import { useRegisterSW } from "virtual:pwa-register/react"

function parseHashState(today) {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return { tab: null, date: null }
  const [tab = null, rawDate = null, view = 'journal', mode = null] = raw.split('/')
  if (!tab) return { tab: null, date: null }
  if (!rawDate) return { tab, date: null }
  if (rawDate === 'today') return { tab, date: today, view, mode }
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return { tab, date: rawDate, view, mode }
  return { tab, date: null }
}

function buildHashState(tab, date, today, view, mode) {
  if (!tab) return '#'
  if (!date) return `#${tab}`
  return `#${tab}/${date === today ? 'today' : date}${tab === 'journal' && view !== 'journal' ? `/${view}${mode ? `/${mode}` : ''}` : ''}`
}

export default function App() {
  const [user, setUser]     = useState(undefined)
  const [signing, setSigning] = useState(false)
  const [activeTab, setActiveTab] = useState(() => parseHashState(localToday()).tab === 'journal' ? 'journal' : 'habits')
  const [journalDate, setJournalDate] = useState(() => parseHashState(localToday()).date || localToday())
  const [journalView, setJournalView] = useState(() => parseHashState(localToday()).view || 'journal')
  const [journalMode, setJournalMode] = useState(() => parseHashState(localToday()).mode)
  const habitsV2Active = activeTab === 'journal' && journalView === 'journal-v2' && journalMode === 'habits'
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    if (isLocalMode()) { setUser({ displayName: 'Local' }); return }
    return watchAuth(u => setUser(u ?? null))
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const { tab, date, view, mode } = parseHashState(localToday())
      if (tab === 'habits' || tab === 'journal') setActiveTab(tab)
      if (date) setJournalDate(date)
      if (tab === 'journal') {
        setJournalView(view || 'journal')
        setJournalMode(mode || null)
      }
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const today = localToday()
    const nextHash = buildHashState(activeTab, journalDate, today, journalView, journalMode)
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }, [activeTab, journalDate, journalView, journalMode])

  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0a0a0f' }}>
      <Loader size={24} style={{ color:'#475569' }} />
    </div>
  )

  if (!user) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0a0a0f', color:'#e2e8f0', gap:16 }}>
      <CheckSquare size={32} style={{ color:'#3b82f6' }} />
      <div style={{ fontSize:16, fontWeight:600 }}>Habits</div>
      <div style={{ fontSize:13, color:'#64748b' }}>Bitte anmelden um fortzufahren</div>
      <button
        onClick={async () => { setSigning(true); try { await signIn() } finally { setSigning(false) } }}
        disabled={signing}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'1px solid #334155', background:'#0f172a', color:'#e2e8f0', cursor:'pointer', fontSize:14 }}
      >
        <LogIn size={16} />{signing ? 'Anmelden…' : 'Mit Google anmelden'}
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg, #0a0a0f)', color:'var(--text, #e2e8f0)', fontFamily:'system-ui, sans-serif' }}>
      <header style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('habits')}
            style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'habits' ? '#3b82f6' : 'transparent', color: activeTab === 'habits' ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Habits
          </button>
          <button
            onClick={() => { setActiveTab('journal'); setJournalView('journal-v2'); setJournalMode('habits') }}
            aria-current={habitsV2Active ? 'page' : undefined}
            style={{ padding: '8px 16px', borderRadius: '8px', background: habitsV2Active ? '#f59e0b' : 'transparent', color: habitsV2Active ? '#1e293b' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Habits v2
          </button>
          <button
            onClick={() => { setActiveTab('journal'); setJournalView('journal'); setJournalMode(null) }}
            style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'journal' && !habitsV2Active ? '#f59e0b' : 'transparent', color: activeTab === 'journal' && !habitsV2Active ? '#1e293b' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Journal
          </button>
        </div>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'100px', background:'#f59e0b20', color:'#fcd34d', border:'1px solid #f59e0b40', cursor:'pointer', fontSize:'12px', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px' }}
          >
            <RotateCcw size={14} /> Update
          </button>
        )}
      </header>
      <main style={{ padding: '16px' }}>
        {activeTab === 'habits' ? (
          <Habits user={user} selectedDate={journalDate} onSelectedDateChange={setJournalDate} />
        ) : (
          <JournalAppWrapper
            view={journalView}
            mode={journalMode}
            onViewChange={(view) => { setJournalView(view); setJournalMode(null) }}
            onModeChange={setJournalMode}
            user={user}
            date={journalDate}
            onDateChange={setJournalDate}
          />
        )}
      </main>
    </div>
  )
}
