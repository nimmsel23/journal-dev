import { ACTIVITY_TYPES } from './activities';

// Strength split colors (kept as-is, not activity-type dependent)
const STRENGTH_SPLIT_COLORS = {
  push:       "#f472b6",
  pull:       "#34d399",
  legs:       "#fb923c",
  upper:      "#38bdf8",
  lower:      "#a78bfa",
  full:       "#fbbf24",
};

// Build activity-type colors from ACTIVITY_TYPES
const ACTIVITY_TYPE_COLORS = Object.fromEntries(
  ACTIVITY_TYPES.map(activity => [activity.value, activity.color])
);

// Cardio / Endurance — all use orange family to be visually distinct from strength
export const BLOCK_COLORS = {
  ...STRENGTH_SPLIT_COLORS,
  ...ACTIVITY_TYPE_COLORS,
};

// Activity labels
export const ACTIVITY_LABELS = Object.fromEntries(
  ACTIVITY_TYPES.map(activity => [activity.value, activity.label])
);

// Activity emojis
export const ACTIVITY_EMOJI = Object.fromEntries(
  ACTIVITY_TYPES.map(activity => [activity.value, activity.emoji])
);

// Activity lucide-react icons
export const ACTIVITY_ICONS = Object.fromEntries(
  ACTIVITY_TYPES.map(activity => [activity.value, activity.icon])
);


