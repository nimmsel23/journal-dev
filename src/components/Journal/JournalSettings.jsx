import TabSettingsModal from '../../components/TabSettingsModal.jsx';

function Toggle({ active, onClick, label, desc, accent = 'var(--j-accent)' }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left"
      style={active
        ? { borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`, backgroundColor: `color-mix(in srgb, ${accent} 5%, transparent)` }
        : { borderColor: 'var(--j-line)', backgroundColor: 'var(--j-bg2)', opacity: 0.6 }}
    >
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--j-ink)]">{label}</div>
        <div className="text-[10px] text-[var(--j-dim)] mt-0.5">{desc}</div>
      </div>
      <div
        className="w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all"
        style={active ? { borderColor: accent, backgroundColor: accent } : { borderColor: 'var(--j-dim)' }}
      >
        {active && <div className="w-2 h-2 rounded-sm bg-white" />}
      </div>
    </button>
  );
}

export default function JournalSettings({ onClose, settings, onChange, showIntegrations = false }) {
  return (
    <TabSettingsModal title="Journal · Einstellungen" onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--j-dim)] mb-2">Darstellung</h4>
          <Toggle
            active={settings.colorActivities}
            onClick={() => onChange('colorActivities', !settings.colorActivities)}
            label="Ausdauer farbig"
            desc="Cardio-Einträge in sportartspezifischer Farbe"
          />
        </div>

        {showIntegrations && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--j-dim)] mb-2">Integrationen</h4>
            <Toggle
              active={settings.telegramEnabled}
              onClick={() => onChange('telegramEnabled', !settings.telegramEnabled)}
              label="Telegram Bot"
              desc="Erhalte Logs und Zusammenfassungen"
              accent="#3b82f6"
            />

            {settings.telegramEnabled && (
              <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Telegram Chat-ID</label>
                <input
                  type="text"
                  value={settings.telegramChatId || ''}
                  onChange={(e) => onChange('telegramChatId', e.target.value)}
                  placeholder="z.B. 123456789"
                  className="w-full bg-[var(--j-bg)] border border-[var(--j-line)] rounded-xl px-4 py-3 text-sm text-[var(--j-ink)] placeholder:text-[var(--j-dim)] focus:outline-none focus:border-blue-500/50"
                />
                <p className="text-[10px] text-[var(--j-dim)]">Du findest deine ID über @userinfobot auf Telegram.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </TabSettingsModal>
  );
}
