import type { WorkoutTemplate } from '../types';

/** Reduce all working weights in a template by percent (default 10%). */
export function applyDeloadToTemplate(
  template: WorkoutTemplate,
  percent = 0.1
): WorkoutTemplate {
  return {
    ...template,
    exercises: template.exercises.map(ex => ({
      ...ex,
      currentWeight: Math.max(
        ex.weightStep,
        Math.round((ex.currentWeight * (1 - percent)) * 2) / 2
      )
    }))
  };
}
