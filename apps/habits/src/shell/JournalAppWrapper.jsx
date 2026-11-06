import { Suspense, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TAB_CONFIG } from '@journal/routes.js'
import '@journal/styles.css'

// Import the full Journal route registry, keeping every lazy view in the build
// and service-worker precache. Habits owns auth, routing, Firebase and updates.
export default function JournalAppWrapper({ user, date, onDateChange, view, mode, onViewChange, onModeChange }) {
  const [queryClient] = useState(() => new QueryClient())
  const tab = TAB_CONFIG.find((item) => item.key === view) || TAB_CONFIG[0]
  const ctx = {
    user,
    activeDate: date,
    setActiveDate: onDateChange,
    setActiveTab: onViewChange,
    v2Mode: mode || 'tag',
    setV2Mode: onModeChange,
    doorMode: mode || 'potential',
    setDoorMode: onModeChange,
    gameMode: mode || 'fire',
    setGameMode: onModeChange,
  }
  const View = tab.View

  return (
    <QueryClientProvider client={queryClient}>
      <section data-journal-embedded aria-label="Journal">
        <nav aria-label="Journal-Bereiche" className="mb-4 flex flex-wrap gap-2">
          {TAB_CONFIG.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              aria-current={tab.key === key ? 'page' : undefined}
              onClick={() => onViewChange(key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${tab.key === key ? 'border-orange-400 bg-orange-400 text-slate-950' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <Suspense fallback={<div role="status" className="py-20 text-center text-slate-500">Journal lädt…</div>}>
          <View {...tab.getProps(ctx)} embedded onNavigateJournal={onViewChange} />
        </Suspense>
      </section>
    </QueryClientProvider>
  )
}
