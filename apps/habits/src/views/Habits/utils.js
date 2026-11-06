import {
  Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap,
  Bike, Brain, Briefcase, Calendar, Camera, Cloud, Code, DollarSign, Flame, Gift, Guitar, Headphones, Laptop, Leaf,
  Music, Palette, Phone, Plane, Puzzle, Rocket, Salad, Scissors, Smile, Sparkles, Star, Target, Timer, Trophy, Users,
  Utensils, Wallet, Wind, Book, MessageCircle, PiggyBank, TrendingUp, GraduationCap, HeartHandshake,
} from "lucide-react";

export const ICON_OPTIONS = [
  "Activity", "Footprints", "Apple", "BookOpen", "Coffee", "Droplet", "Dumbbell", "Feather", "Heart", "Home", "Moon", "Sunrise", "Sun", "Zap",
  "Bike", "Brain", "Briefcase", "Calendar", "Camera", "Cloud", "Code", "DollarSign", "Flame", "Gift", "Guitar", "Headphones", "Laptop", "Leaf",
  "Music", "Palette", "Phone", "Plane", "Puzzle", "Rocket", "Salad", "Scissors", "Smile", "Sparkles", "Star", "Target", "Timer", "Trophy", "Users",
  "Utensils", "Wallet", "Wind", "Book", "MessageCircle", "PiggyBank", "TrendingUp", "GraduationCap", "HeartHandshake",
];

export const ICON_COMPONENTS_MAP = {
  Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap,
  Bike, Brain, Briefcase, Calendar, Camera, Cloud, Code, DollarSign, Flame, Gift, Guitar, Headphones, Laptop, Leaf,
  Music, Palette, Phone, Plane, Puzzle, Rocket, Salad, Scissors, Smile, Sparkles, Star, Target, Timer, Trophy, Users,
  Utensils, Wallet, Wind, Book, MessageCircle, PiggyBank, TrendingUp, GraduationCap, HeartHandshake,
};

// Feste Core4-Kategorien statt frei anlegbarer Kategorien — deckt sich mit
// den Domänen aus Core4Layout.jsx (dort bislang nur per Keyword-Heuristik
// aus dem Namen geraten, hier explizit am Habit gespeichert).
export const CATEGORY_OPTIONS = [
  { key: "body", label: "Body" },
  { key: "being", label: "Being" },
  { key: "balance", label: "Balance" },
  { key: "business", label: "Business" },
];

export const CATEGORY_LABEL_MAP = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.key, c.label])
);

// Frequenz statt "immer täglich fällig" — flexibel nach Typ:
// daily: jeden Tag fällig.
// weekly: nur an gewählten Wochentagen fällig (leer = wie daily, damit alte
//   Habits ohne frequency nicht plötzlich verschwinden).
// monthly: kein fester Tag, sondern ein Ziel "N mal pro Monat" (Kalendertage
//   sind zu starr für reale Gewohnheiten wie "2x im Monat Großputz").
export const FREQUENCY_TYPES = [
  { key: "daily", label: "Täglich" },
  { key: "weekly", label: "Wöchentlich" },
  { key: "monthly", label: "Monatlich" },
];

export const WEEKDAY_OPTIONS = [
  { key: 1, label: "Mo" },
  { key: 2, label: "Di" },
  { key: 3, label: "Mi" },
  { key: 4, label: "Do" },
  { key: 5, label: "Fr" },
  { key: 6, label: "Sa" },
  { key: 0, label: "So" },
];

export const DEFAULT_FREQUENCY = { type: "daily", weekdays: [], timesPerPeriod: 1 };

export function isHabitDueOnDate(habit, dateStr) {
  const freq = habit.frequency || DEFAULT_FREQUENCY;
  if (freq.type === "weekly" && Array.isArray(freq.weekdays) && freq.weekdays.length > 0) {
    const day = new Date(`${dateStr}T00:00:00`).getDay();
    return freq.weekdays.includes(day);
  }
  return true;
}

export function formatFrequency(habit) {
  const freq = habit.frequency || DEFAULT_FREQUENCY;
  if (freq.type === "weekly" && Array.isArray(freq.weekdays) && freq.weekdays.length > 0) {
    return freq.weekdays
      .slice()
      .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
      .map((d) => WEEKDAY_OPTIONS.find((w) => w.key === d)?.label)
      .join(" ");
  }
  if (freq.type === "monthly") {
    return `${freq.timesPerPeriod || 1}x / Monat`;
  }
  return null; // täglich = kein Badge nötig, ist der Normalfall
}

export function getRollingDays(count) {
  const dates = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
