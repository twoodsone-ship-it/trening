import type { CompletedWorkout } from '../types';

/** CSV suitable for Apple Health / Google Fit / spreadsheet imports */
export function workoutsToCsv(history: CompletedWorkout[]): string {
  const header = [
    'Date',
    'Workout',
    'Duration_min',
    'Total_Volume_kg',
    'Total_Sets',
    'Exercise',
    'Weight_kg',
    'Reps',
    'Duration_sec',
    'Distance_m',
    'RPE',
    'Set_Type'
  ].join(',');

  const rows: string[] = [header];

  history.forEach(w => {
    const date = new Date(w.endTime).toISOString();
    w.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        rows.push([
          date,
          csvEscape(w.templateName),
          w.durationMinutes,
          w.totalVolumeKg,
          w.totalSets,
          csvEscape(ex.name),
          s.weight,
          s.reps,
          s.durationSeconds ?? '',
          s.distanceMeters ?? '',
          s.rpe ?? '',
          s.type || (s.isWarmup ? 'warmup' : 'working')
        ].join(','));
      });
    });
  });

  return rows.join('\n');
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareWorkoutSummary(workout: CompletedWorkout): Promise<boolean> {
  const text = [
    `IronForge: ${workout.templateName}`,
    `⏱ ${workout.durationMinutes} мин · 🏋️ ${workout.totalVolumeKg} кг · ${workout.totalSets} сетов`,
    ...(workout.totalCardioSeconds ? [`🚴 Кардио: ${Math.round(workout.totalCardioSeconds / 60)} мин`] : []),
    ...workout.exercises.map(ex => {
      const best = ex.sets.reduce((m, s) => Math.max(m, s.weight * s.reps), 0);
      return `• ${ex.name}: ${ex.workingWeight} кг (объём ${best})`;
    })
  ].join('\n');

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'IronForge тренировка', text });
      return true;
    } catch {
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
