import TabSettingsModal from '../../components/TabSettingsModal.jsx';

const SETTINGS = [
  {
    key: 'colorActivities',
    label: 'Ausdauer farbig',
    desc: 'Cardio-Einträge in sportartspezifischer Farbe',
    storage: 'journal_colorActivities',
    default: false,
  },
];

export default function JournalSettings({ onClose, settings, onChange }) {
  return (
    <TabSettingsModal title="Journal · Einstellungen" onClose={onClose}>
      <div className="space-y-3">
        {SETTINGS.map(({ key, label, desc }) => {
          const active = settings[key] ?? false;
          return (
            <button
              key={key}
              onClick={() => onChange(key, !active)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                active ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5' : 'border-[var(--line)] bg-[var(--bg2)] opacity-60'
              }`}
            >
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-[var(--ink)]">{label}</div>
                <div className="text-[10px] text-[var(--dim)] mt-0.5">{desc}</div>
              </div>
              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                active ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--dim)]'
              }`}>
                {active && <div className="w-2 h-2 rounded-sm bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </TabSettingsModal>
  );
}
