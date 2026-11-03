import type { CompletedWorkout } from '../types';

function toDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayOffset(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m, d);
  date.setDate(date.getDate() + days);
  return toDayKey(date.getTime());
}

/** Consecutive calendar days with ≥1 completed workout, counting back from today (or yesterday if rest today). */
export function calculateStreak(history: CompletedWorkout[]): number {
  if (!history.length) return 0;

  const days = new Set(history.map(w => toDayKey(w.endTime)));
  const today = toDayKey(Date.now());
  let cursor = days.has(today) ? today : dayOffset(today, -1);
  if (!days.has(cursor)) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = dayOffset(cursor, -1);
  }
  return streak;
}

export function workoutsThisWeek(history: CompletedWorkout[]): number {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  return history.filter(w => w.endTime >= start.getTime()).length;
}

export const WEEKDAY_LABELS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;
