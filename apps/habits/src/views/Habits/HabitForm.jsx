import { Plus } from "lucide-react";
import { ICON_OPTIONS, ICON_COMPONENTS_MAP, CATEGORY_OPTIONS } from "./utils";
import FrequencyPicker from "./FrequencyPicker";

export default function HabitForm({ newHabit, setNewHabit, selectedIcon, setSelectedIcon, selectedCategory, setSelectedCategory, selectedFrequency, setSelectedFrequency, onAdd, saving }) {
  return (
    <form onSubmit={onAdd} className="card p-6 shadow-xl border-orange-400/10 bg-slate-900 border-white/10">
      <div className="label-caps mb-4 flex items-center gap-2 text-orange-400">
        <Plus size={14} className="text-orange-400" />
        Neuer Habit
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
          placeholder="z.B. Früh aufstehen"
          className="flex-1 bg-slate-900 border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-orange-400 outline-none"
        />
        <button disabled={saving || !newHabit.trim()} className="btn bg-orange-400 text-black !p-3">
          <Plus size={20} />
        </button>
      </div>
      <div className="mb-4">
          <div className="label-caps !mb-2 text-slate-400">Icon wählen</div>
          <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(iconName => {
                  const IconComponent = ICON_COMPONENTS_MAP[iconName];
                  return (
                      <button type="button" key={iconName} onClick={() => setSelectedIcon(iconName)}
                          className={`p-2 rounded-full border transition-colors ${selectedIcon === iconName ? 'bg-orange-400 border-orange-400 text-black' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-400'}`}>
                          {IconComponent && <IconComponent size={20} />}
                      </button>
                  );
              })}
          </div>
      </div>
      <div>
          <div className="label-caps !mb-2 text-slate-400">Kategorie</div>
          <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => (
                  <button type="button" key={cat.key} onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest transition-colors ${selectedCategory === cat.key ? 'bg-orange-400 border-orange-400 text-black' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-400'}`}>
                      {cat.label}
                  </button>
              ))}
          </div>
      </div>
      <div className="mt-4">
          <div className="label-caps !mb-2 text-slate-400">Frequenz</div>
          <FrequencyPicker frequency={selectedFrequency} onChange={setSelectedFrequency} />
      </div>
    </form>
  );
}
