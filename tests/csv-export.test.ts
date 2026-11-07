import { describe, expect, it } from 'vitest';
import { csvEscape, workoutsToCsv } from '../src/utils/healthExport';
import type { CompletedWorkout } from '../src/types';

describe('CSV Formula Injection Prevention (H3)', () => {
  it('prepends an apostrophe to text starting with =, +, -, @, tab, or CR', () => {
    expect(csvEscape('=cmd|/C calc!A0')).toBe('\'=cmd|/C calc!A0');
    expect(csvEscape('+SUM(12)')).toBe('\'+SUM(12)');
    expect(csvEscape('+SUM(1, 2)')).toBe('"\' +SUM(1, 2)"'.replace('\' ', '\''));
    expect(csvEscape('-Dips')).toBe('\'-Dips');
    expect(csvEscape('@echo off')).toBe('\'@echo off');
    expect(csvEscape('\ttab_indented')).toBe('\'\ttab_indented');
    expect(csvEscape('\rreturn')).toBe('"\'\rreturn"');
  });

  it('leaves normal text unchanged unless escaping is needed', () => {
    expect(csvEscape('Bench Press')).toBe('Bench Press');
    expect(csvEscape('Squat, Heavy')).toBe('"Squat, Heavy"');
    expect(csvEscape('Deadlift "Classic"')).toBe('"Deadlift ""Classic"""');
  });

  it('leaves numeric columns untouched in workoutsToCsv', () => {
    const workout: CompletedWorkout = {
      id: 'w-1',
      templateId: 't-1',
      templateName: '=MaliciousTemplate',
      startTime: 1000,
      endTime: 1000 + 3600 * 1000,
      durationMinutes: 60,
      totalVolumeKg: 1000,
      totalSets: 3,
      exercises: [
        {
          exerciseId: 'ex-1',
          name: '+MaliciousExercise',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: -10,
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 60,
            targetRepRange: '8-12',
            badgeText: '',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          },
          sets: [
            {
              setNumber: 1,
              weight: -10,
              reps: 10,
              durationSeconds: 30,
              distanceMeters: 0,
              rpe: 8,
              type: '-customType' as any,
              completed: true
            }
          ]
        }
      ]
    };

    const csv = workoutsToCsv([workout]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);

    const dataLine = lines[1];
    // Template name should be protected
    expect(dataLine).toContain('\'=MaliciousTemplate');
    // Exercise name should be protected
    expect(dataLine).toContain('\'+MaliciousExercise');
    // Type should be protected
    expect(dataLine).toContain('\'-customType');
    // Numeric weight -10 must NOT have an apostrophe
    expect(dataLine).toContain(',-10,10,30,0,8,');
    expect(dataLine).not.toContain('\'-10');
  });
});
