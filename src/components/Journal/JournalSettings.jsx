import TabSettingsModal from '../../components/TabSettingsModal.jsx';

export default function JournalSettings({ onClose, settings, onChange }) {
  return (
    <TabSettingsModal title="Journal · Einstellungen" onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Darstellung</h4>
          <button
            onClick={() => onChange('colorActivities', !settings.colorActivities)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
              settings.colorActivities ? 'border-orange-400/40 bg-orange-400/5' : 'border-white/10 bg-slate-900 opacity-60'
            }`}
          >
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-100">Ausdauer farbig</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cardio-Einträge in sportartspezifischer Farbe</div>
            </div>
            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
              settings.colorActivities ? 'border-orange-400 bg-orange-400' : 'border-[#94a3b8]'
            }`}>
              {settings.colorActivities && <div className="w-2 h-2 rounded-sm bg-white" />}
            </div>
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Integrationen</h4>
          <button
            onClick={() => onChange('telegramEnabled', !settings.telegramEnabled)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
              settings.telegramEnabled ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 bg-slate-900 opacity-60'
            }`}
          >
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-100">Telegram Bot</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Erhalte Logs und Zusammenfassungen</div>
            </div>
            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
              settings.telegramEnabled ? 'border-blue-500 bg-blue-500' : 'border-[#94a3b8]'
            }`}>
              {settings.telegramEnabled && <div className="w-2 h-2 rounded-sm bg-white" />}
            </div>
          </button>
          
          {settings.telegramEnabled && (
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Telegram Chat-ID</label>
              <input 
                type="text" 
                value={settings.telegramChatId || ''} 
                onChange={(e) => onChange('telegramChatId', e.target.value)}
                placeholder="z.B. 123456789"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-[10px] text-slate-500">Du findest deine ID über @userinfobot auf Telegram.</p>
            </div>
          )}
        </div>
      </div>
    </TabSettingsModal>
  );
}
