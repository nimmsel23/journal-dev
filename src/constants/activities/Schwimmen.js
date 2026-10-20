import { Waves } from 'lucide-react';

// Note: Swimming style variants (SWIM_STYLE_MUSCLES, SWIM_STYLE_PRIMARY_MUSCLES)
// remain centralized in ActivityConstants.js as cross-cutting logic, not per-type data.

export default {
  value: 'swimming',
  label: 'Schwimmen',
  emoji: '🏊',
  icon: Waves,
  color: '#38bdf8',
  muscleDefault: 'full',
  muscleGroups: ['chest', 'upper_back', 'biceps', 'triceps', 'abs', 'quadriceps', 'hamstrings', 'adductors', 'abductors'],
};

