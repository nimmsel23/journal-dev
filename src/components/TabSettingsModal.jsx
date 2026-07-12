import { X } from 'lucide-react'

// Eigene Fallback-Kette: das Modal kann außerhalb des JournalTimeline-Scopes
// gerendert werden, wo die --j-*-Tokens (noch) nicht gesetzt sind.
const TOKENS = {
  "--j-bg2": "var(--bg2, #131b29)",
  "--j-card": "var(--card, #111827)",
  "--j-line": "var(--line, rgba(148,163,184,0.14))",
  "--j-ink": "var(--ink, #e7edf6)",
  "--j-dim": "var(--dim, #8b98ab)",
  "--j-accent": "var(--accent, #4a9eff)",
}

export default function TabSettingsModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" style={TOKENS}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--j-card)] border border-[var(--j-line)] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--j-line)]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--j-accent)]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--j-bg2)] flex items-center justify-center text-[var(--j-dim)] hover:text-[var(--j-ink)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
