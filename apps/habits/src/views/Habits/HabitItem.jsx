import { Edit, Check, Trash2, Sparkles, GripVertical } from "lucide-react";
import { ICON_OPTIONS, ICON_COMPONENTS_MAP, CATEGORY_OPTIONS, CATEGORY_LABEL_MAP, formatFrequency } from "./utils";
import { IS_STORE_BUILD } from "./storeEdition.js";
import { isLocalMode } from "@habits-db";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FrequencyPicker from "./FrequencyPicker";

export default function HabitItem({
  h,
  isSelected,
  isEditing,
  editingIcon,
  setEditingIcon,
  editingCategory,
  setEditingCategory,
  editingFrequency,
  setEditingFrequency,
  setEditingHabitId,
  onToggleSelection,
  onToggleCheck,
  onDelete,
  onUpdateName,
  onFinishEditing,
  selectedDate
}) {
  const isCoachHabit = h.source === 'coach';
  const canEdit = isLocalMode() || !isCoachHabit;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: h.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
         ref={setNodeRef}
         style={style}
         onClick={onToggleSelection}
         className={`group card p-3 sm:p-4 flex items-center justify-between transition-all border-l-4 cursor-pointer
               ${h.isDoneForSelectedDate ? 'border-green bg-green/5' : 'border-[#94a3b8] bg-slate-900'}
               ${isSelected ? 'border-orange-400 bg-orange-400/10' : ''}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
        <div
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={h.name}
                onChange={(e) => onUpdateName(h.uuid, e.target.value)}
                onBlur={onFinishEditing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.target.blur();
                  }
                }}
                className="w-full bg-slate-900 border-white/10 rounded-md px-2 py-1 text-sm font-bold focus:border-orange-400 outline-none"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
              <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(iconName => {
                      const IconComponent = ICON_COMPONENTS_MAP[iconName];
                      return (
                          <button type="button" key={iconName}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => { e.stopPropagation(); setEditingIcon(iconName); }}
                              className={`p-2 rounded-full border transition-colors ${editingIcon === iconName ? 'bg-orange-400 border-orange-400 text-black' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-400'}`}>
                              {IconComponent && <IconComponent size={20} />}
                          </button>
                      );
                  })}
              </div>
              {!IS_STORE_BUILD && <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(cat => (
                      <button type="button" key={cat.key}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => { e.stopPropagation(); setEditingCategory(cat.key); }}
                          className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${editingCategory === cat.key ? 'bg-orange-400 border-orange-400 text-black' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-400'}`}>
                          {cat.label}
                      </button>
                  ))}
              </div>}
              <FrequencyPicker frequency={editingFrequency} onChange={setEditingFrequency} compact />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {(() => {
                const IconComponent = ICON_COMPONENTS_MAP[h.icon || 'Activity'];
                return IconComponent && <IconComponent size={16} className="text-slate-400 shrink-0" />;
              })()}
              <div className="text-sm font-black text-slate-100 truncate">{h.name}</div>
              {!IS_STORE_BUILD && h.category && CATEGORY_LABEL_MAP[h.category] && (
                <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-white/10 uppercase tracking-tighter shrink-0">
                  {CATEGORY_LABEL_MAP[h.category]}
                </span>
              )}
              {formatFrequency(h) && (
                <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-white/10 uppercase tracking-tighter shrink-0">
                  {formatFrequency(h)}
                </span>
              )}
              {isCoachHabit && (
                <span className="flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 bg-orange-400/10 text-orange-400 rounded-full border border-orange-400/20 uppercase tracking-tighter shrink-0">
                  <Sparkles size={8} /> Coach
                </span>
              )}
            </div>
          )}
          <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-0.5 text-slate-400 truncate">
            {h.isDoneForSelectedDate ? 'Erledigt' : 'Noch offen'} für {selectedDate}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isEditing && canEdit && (
          <button onClick={(e) => { e.stopPropagation(); setEditingHabitId(h.uuid); }} className="p-2 text-slate-400 hover:text-orange-400 transition-all">
            <Edit size={16} />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggleCheck(h); }}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all ${h.isDoneForSelectedDate ? 'bg-green text-black' : 'bg-slate-900 border border-white/10 text-slate-400 hover:border-orange-400 hover:text-orange-400'}`}>
          <Check size={20} className={h.isDoneForSelectedDate ? 'stroke-[3]' : ''} />
        </button>
        {canEdit && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(h.uuid); }} className="opacity-0 group-hover:opacity-100 hidden sm:block p-2 text-slate-400 hover:text-red-400 transition-all">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
