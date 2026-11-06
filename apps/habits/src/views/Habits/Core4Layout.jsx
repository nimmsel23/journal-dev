import { useState, useMemo } from 'react';
import {
  Activity, Smile, Users, Briefcase, Layers,
  GripVertical, MessageSquare, Plus, Pencil, X, Trash2
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ICON_OPTIONS, ICON_COMPONENTS_MAP, CATEGORY_OPTIONS } from './utils';
import FrequencyPicker from './FrequencyPicker';
import './core4.css';

const DOMAINS = [
  { key: 'body', label: 'Body', colorClass: 'body', Icon: Activity },
  { key: 'being', label: 'Being', colorClass: 'being', Icon: Smile },
  { key: 'balance', label: 'Balance', colorClass: 'balance', Icon: Users },
  { key: 'business', label: 'Business', colorClass: 'business', Icon: Briefcase },
  { key: 'other', label: 'Other', colorClass: 'other', Icon: Layers }
];

function getHabitDomain(habit) {
  if (habit.category && DOMAINS.some(d => d.key === habit.category)) {
    return habit.category;
  }

  const name = (habit.name || '').toLowerCase();
  const icon = (habit.icon || '').toLowerCase();

  if (
    name.includes('fit') || name.includes('gym') || name.includes('run') || name.includes('walk') ||
    name.includes('train') || name.includes('sport') || name.includes('ess') || name.includes('eat') ||
    name.includes('fuel') || name.includes('water') || name.includes('sleep') || name.includes('kraft') ||
    icon.includes('activity') || icon.includes('heart') || icon.includes('zap')
  ) {
    return 'body';
  }
  if (
    name.includes('meditat') || name.includes('journal') || name.includes('memoir') || name.includes('mind') ||
    name.includes('seele') || name.includes('ruhe') || name.includes('geist') || name.includes('read') ||
    name.includes('buch') || name.includes('lesen') || name.includes('study') || name.includes('breathe') ||
    icon.includes('book') || icon.includes('eye') || icon.includes('smile') || icon.includes('star')
  ) {
    return 'being';
  }
  if (
    name.includes('partner') || name.includes('frau') || name.includes('mann') || name.includes('kind') ||
    name.includes('freund') || name.includes('call') || name.includes('check') || name.includes('social') ||
    name.includes('love') || name.includes('haushalt') || name.includes('putzen') || name.includes('beziehung') ||
    icon.includes('users') || icon.includes('message') || icon.includes('phone')
  ) {
    return 'balance';
  }
  if (
    name.includes('work') || name.includes('code') || name.includes('arbeit') || name.includes('lerne') ||
    name.includes('project') || name.includes('business') || name.includes('geld') || name.includes('money') ||
    name.includes('job') || name.includes('career') ||
    icon.includes('briefcase') || icon.includes('code') || icon.includes('trending') || icon.includes('dollar')
  ) {
    return 'business';
  }
  return 'other';
}

function SortableHabitRow({ h, onToggleCheck, onOpenJournal, onEditHabit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: h.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const completionsThisWeek = useMemo(() => {
    // Last 7 days completions
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    return (h.records || []).filter(r => last7Days.includes(r.date) && r.completion === 'DONE').length;
  }, [h.records]);

  const miniOffset = 2 * Math.PI * 12 * (1 - Math.min(completionsThisWeek / 7, 1));

  return (
    <div ref={setNodeRef} style={style} className="core4-theme-habit-row">
      <div
        {...attributes}
        {...listeners}
        className="p-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0"
      >
        <GripVertical size={14} />
      </div>
      <button
        onClick={() => onToggleCheck(h)}
        className={`core4-theme-task-chip ${h.isDoneForSelectedDate ? 'done' : ''}`}
      >
        {h.name}
      </button>

      <button
        onClick={() => onOpenJournal(h)}
        className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <MessageSquare size={13} />
      </button>

      <button
        onClick={() => onEditHabit(h)}
        className="p-1.5 text-slate-500 hover:text-orange-400 transition-colors"
      >
        <Pencil size={13} />
      </button>

      <div className="core4-theme-mini-ring-wrap">
        <svg className="core4-theme-mini-ring-svg" viewBox="0 0 40 40">
          <circle className="core4-theme-mini-ring-bg" cx="20" cy="20" r="12"/>
          <circle
            className={`core4-theme-mini-ring-track ${completionsThisWeek === 0 ? 'empty' : ''}`}
            cx="20"
            cy="20"
            r="12"
            style={{
              strokeDasharray: '75.4',
              strokeDashoffset: miniOffset.toFixed(2)
            }}
          />
        </svg>
        <div className="core4-theme-mini-ring-center">
          <span className={`core4-theme-mini-ring-num ${completionsThisWeek > 0 ? 'active' : ''}`}>
            {completionsThisWeek}
          </span>
        </div>
      </div>
    </div>
  );
}

function AddHabitInline({ newHabit, setNewHabit, selectedIcon, setSelectedIcon, selectedCategory, setSelectedCategory, selectedFrequency, setSelectedFrequency, onSubmit, saving, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="core4-theme-journal-section" style={{ marginBottom: '10px' }}>
      <input
        type="text"
        value={newHabit}
        onChange={(e) => setNewHabit(e.target.value)}
        placeholder="z.B. Früh aufstehen"
        className="core4-theme-journal-input"
        autoFocus
      />
      <div className="core4-theme-picker-row">
        {ICON_OPTIONS.map(iconName => {
          const IconComponent = ICON_COMPONENTS_MAP[iconName];
          return (
            <button type="button" key={iconName}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setSelectedIcon(iconName)}
              className={`core4-theme-picker-chip ${selectedIcon === iconName ? 'active' : ''}`}>
              {IconComponent && <IconComponent size={16} />}
            </button>
          );
        })}
      </div>
      <div className="core4-theme-picker-row">
        {CATEGORY_OPTIONS.map(cat => (
          <button type="button" key={cat.key}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSelectedCategory(cat.key)}
            className={`core4-theme-picker-chip text ${selectedCategory === cat.key ? 'active' : ''}`}>
            {cat.label}
          </button>
        ))}
      </div>
      <FrequencyPicker frequency={selectedFrequency} onChange={setSelectedFrequency} compact />
      <div className="core4-theme-journal-actions">
        <button type="button" onClick={onCancel} className="core4-theme-sheet-cancel">Abbrechen</button>
        <button type="submit" disabled={saving || !newHabit.trim()} className="core4-theme-journal-save">
          Anlegen
        </button>
      </div>
    </form>
  );
}

function HabitEditSheet({ habit, name, onNameChange, icon, onIconChange, category, onCategoryChange, frequency, onFrequencyChange, onSave, onDelete, onClose }) {
  if (!habit) return null;

  return createPortal(
    <div className="core4-theme-sheet-backdrop" onClick={onClose}>
      <div className="core4-theme-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="core4-theme-sheet-head">
          <span>HABIT BEARBEITEN</span>
          <button onClick={onClose} className="core4-theme-sheet-close"><X size={18} /></button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="core4-theme-journal-input"
          autoFocus
        />
        <div className="core4-theme-picker-row">
          {ICON_OPTIONS.map(iconName => {
            const IconComponent = ICON_COMPONENTS_MAP[iconName];
            return (
              <button type="button" key={iconName}
                onClick={() => onIconChange(iconName)}
                className={`core4-theme-picker-chip ${icon === iconName ? 'active' : ''}`}>
                {IconComponent && <IconComponent size={16} />}
              </button>
            );
          })}
        </div>
        <div className="core4-theme-picker-row">
          {CATEGORY_OPTIONS.map(cat => (
            <button type="button" key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`core4-theme-picker-chip text ${category === cat.key ? 'active' : ''}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <FrequencyPicker frequency={frequency} onChange={onFrequencyChange} compact />
        <div className="core4-theme-sheet-actions">
          <button onClick={onDelete} className="core4-theme-sheet-delete"><Trash2 size={14} /> Löschen</button>
          <button onClick={onSave} className="core4-theme-journal-save">Speichern</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Core4Layout({
  habits,
  selectedDate,
  setSelectedDate,
  onToggleCheck,
  onDragEnd,
  onOpenJournal,
  journalText,
  setJournalText,
  onSaveJournal,
  isJournalSaving,
  selectedHabitId,
  setSelectedHabitId,
  newHabit,
  setNewHabit,
  selectedIcon,
  setSelectedIcon,
  selectedCategory,
  setSelectedCategory,
  selectedFrequency,
  setSelectedFrequency,
  onAddHabit,
  saving,
  editingHabitId,
  setEditingHabitId,
  editingIcon,
  setEditingIcon,
  editingCategory,
  setEditingCategory,
  editingFrequency,
  setEditingFrequency,
  onUpdateHabitName,
  onFinishEditing,
  onDeleteHabit,
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group habits by domain, maintaining their sort order
  const groupedHabits = useMemo(() => {
    const groups = { body: [], being: [], balance: [], business: [], other: [] };
    habits.forEach(h => {
      const domain = getHabitDomain(h);
      groups[domain].push(h);
    });
    return groups;
  }, [habits]);

  // Statistics
  const totalHabitsCount = habits.length;
  const doneTodayCount = habits.filter(h => h.isDoneForSelectedDate).length;

  const dailyPct = totalHabitsCount === 0 ? '0%' : Math.round((doneTodayCount / totalHabitsCount) * 100) + '%';
  const ringOffset = useMemo(() => {
    const pct = totalHabitsCount === 0 ? 0 : doneTodayCount / totalHabitsCount;
    return (2 * Math.PI * 50 * (1 - pct)).toFixed(2);
  }, [totalHabitsCount, doneTodayCount]);

  // Weekly score
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
  }, []);

  const weeklyScore = useMemo(() => {
    let score = 0;
    habits.forEach(h => {
      const doneCount = (h.records || []).filter(r => last7Days.includes(r.date) && r.completion === 'DONE').length;
      score += doneCount;
    });
    return score;
  }, [habits, last7Days]);

  const maxWeeklyScore = totalHabitsCount * 7;

  // Day navigation strip
  const dayStrip = useMemo(() => {
    return last7Days.map(dk => {
      const dateObj = new Date(dk);
      const isToday = dk === new Date().toISOString().slice(0, 10);
      return {
        dk,
        name: dateObj.toLocaleDateString('de-DE', { weekday: 'short' }),
        num: dateObj.getDate(),
        isActive: dk === selectedDate,
        isToday
      };
    });
  }, [last7Days, selectedDate]);

  // Heatmap scores for last 7 days
  const heatDays = useMemo(() => {
    return last7Days.map(dk => {
      const totalForDay = habits.filter(h => {
        if (dk === selectedDate) return h.isDoneForSelectedDate;
        return (h.records || []).some(r => r.date === dk && r.completion === 'DONE');
      }).length;

      const ratio = totalHabitsCount === 0 ? 0 : totalForDay / totalHabitsCount;
      let level = 0;
      if (ratio > 0) {
        if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }

      const dateObj = new Date(dk);
      return {
        dk,
        label: dateObj.toLocaleDateString('de-DE', { weekday: 'short' }),
        pts: totalForDay,
        level,
        isToday: dk === new Date().toISOString().slice(0, 10)
      };
    });
  }, [last7Days, habits, totalHabitsCount, selectedDate]);

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    await onAddHabit(e);
    setShowAddForm(false);
  }

  const editingHabit = editingHabitId ? habits.find(h => h.uuid === editingHabitId) : null;

  return (
    <div className="core4-layout-container">
      <div className="core4-theme-wrap">

        {/* Hero Section */}
        <section className="core4-theme-hero">
          <div className="core4-theme-ring-wrap">
            <svg className="core4-theme-ring-svg" viewBox="0 0 120 120">
              <circle className="core4-theme-ring-bg" cx="60" cy="60" r="50" />
              <circle
                className="core4-theme-ring-track"
                cx="60"
                cy="60"
                r="50"
                style={{ strokeDashoffset: ringOffset }}
              />
            </svg>
            <div className="core4-theme-ring-center">
              <span className="core4-theme-ring-pct">{dailyPct}</span>
              <span className="core4-theme-ring-sub">TODAY</span>
            </div>
          </div>
          <div className="core4-theme-hero-scores">
            <div className="hs-block">
              <div className="core4-theme-hs-label">DAILY SCORE</div>
              <div className="core4-theme-hs-value">{doneTodayCount}<span className="core4-theme-hs-max">/{totalHabitsCount}</span></div>
            </div>
            <div className="hs-block">
              <div className="core4-theme-hs-label">WEEKLY SCORE</div>
              <div className="core4-theme-hs-value">{weeklyScore}<span className="core4-theme-hs-max">/{maxWeeklyScore}</span></div>
            </div>
          </div>
        </section>

        {/* Day Navigation */}
        <section className="core4-theme-day-nav">
          <div className="core4-theme-dn-days">
            {dayStrip.map(d => (
              <button
                key={d.dk}
                className={`core4-theme-dn-day ${d.isActive ? 'active' : ''} ${d.isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(d.dk)}
              >
                <span className="core4-theme-dn-name">{d.name}</span>
                <span className="core4-theme-dn-num">{d.num}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Heatmap */}
        <div className="core4-theme-section-label">
          <span>THIS WEEK</span>
          <span className="core4-theme-sl-hint">daily score per day</span>
        </div>
        <section className="core4-theme-heatmap">
          {heatDays.map(d => (
            <div key={d.dk} className="core4-theme-heat-day">
              <div className={`hd-label ${d.isToday ? 'today' : ''}`}>{d.label}</div>
              <div className="core4-theme-hd-bar">
                <div className={`core4-theme-hd-fill q${d.level}`}></div>
              </div>
              <div className="hd-pts">{d.pts > 0 ? d.pts : ''}</div>
            </div>
          ))}
        </section>

        {/* Sortable Habits Cards */}
        <div className="core4-theme-section-label">
          <span>HABITS</span>
          <button type="button" className="core4-theme-add-toggle" onClick={() => setShowAddForm(v => !v)}>
            <Plus size={12} /> {showAddForm ? 'Schließen' : 'Neu'}
          </button>
        </div>

        {showAddForm && (
          <AddHabitInline
            newHabit={newHabit}
            setNewHabit={setNewHabit}
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedFrequency={selectedFrequency}
            setSelectedFrequency={setSelectedFrequency}
            onSubmit={handleAddSubmit}
            saving={saving}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <section className="core4-theme-cards">
            {DOMAINS.map(domain => {
              const domainHabits = groupedHabits[domain.key] || [];
              if (domainHabits.length === 0) return null;

              const domainScore = domainHabits.filter(h => h.isDoneForSelectedDate).length;
              const hasDone = domainScore > 0;
              const barPct = (domainScore / domainHabits.length) * 100;

              return (
                <div key={domain.key} className={`core4-theme-domain-card ${domain.colorClass}`}>
                  <div className="core4-theme-card-body">
                    <div className="core4-theme-card-icon">
                      <domain.Icon />
                    </div>
                    <div className="core4-theme-card-info">
                      <div className="core4-theme-card-name">{domain.label}</div>
                      <div className="core4-theme-card-habits">
                        <SortableContext items={domainHabits.map(h => h.uuid)} strategy={verticalListSortingStrategy}>
                          {domainHabits.map(h => (
                            <SortableHabitRow
                              key={h.uuid}
                              h={h}
                              onToggleCheck={onToggleCheck}
                              onOpenJournal={onOpenJournal}
                              onEditHabit={(habit) => setEditingHabitId(habit.uuid)}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </div>
                    <div className={`core4-theme-card-score ${hasDone ? 'done' : ''}`}>
                      {domainScore}/{domainHabits.length}
                    </div>
                  </div>
                  <div className="core4-theme-card-bar">
                    <div className="core4-theme-card-bar-fill" style={{ width: `${barPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </section>
        </DndContext>

        {/* Journal Section */}
        {selectedHabitId && (
          <>
            <div className="core4-theme-section-label" style={{ marginTop: '20px' }}>
              <span>JOURNAL</span>
            </div>
            <section className="core4-theme-journal-section">
              <div className="core4-theme-journal-controls">
                <select
                  value={selectedHabitId}
                  onChange={(e) => setSelectedHabitId(e.target.value)}
                  className="core4-theme-journal-select"
                >
                  {habits.map(h => (
                    <option key={h.uuid} value={h.uuid}>{h.name}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="core4-theme-journal-input"
                placeholder="Write your journal entry..."
                rows="3"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    onSaveJournal();
                  }
                }}
              ></textarea>
              <div className="core4-theme-journal-actions">
                <span className="core4-theme-journal-status">
                  {isJournalSaving ? 'Saving...' : 'Saved'}
                </span>
                <button
                  className="core4-theme-journal-save"
                  onClick={() => onSaveJournal()}
                  disabled={isJournalSaving}
                >
                  SAVE
                </button>
              </div>
            </section>
          </>
        )}

      </div>

      <HabitEditSheet
        habit={editingHabit}
        name={editingHabit?.name || ''}
        onNameChange={(name) => onUpdateHabitName(editingHabit.uuid, name)}
        icon={editingIcon}
        onIconChange={setEditingIcon}
        category={editingCategory}
        onCategoryChange={setEditingCategory}
        frequency={editingFrequency}
        onFrequencyChange={setEditingFrequency}
        onSave={onFinishEditing}
        onDelete={async () => {
          await onDeleteHabit(editingHabit.uuid);
          setEditingHabitId(null);
        }}
        onClose={() => setEditingHabitId(null)}
      />
    </div>
  );
}
