import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildAiReviewReport, detectStagnation, AI_REVIEW_PROMPT_TEMPLATE } from '../src/utils/aiReview';
import { AnalyticsView } from '../src/components/AnalyticsView';
import { AiReviewModal } from '../src/components/AiReviewModal';
import type { CompletedWorkout, AppSettings, ProgressionRecommendation } from '../src/types';

const makeProgression = (nextWeight: number): ProgressionRecommendation => ({
  decision: 'CONSOLIDATE_WEIGHT',
  nextWeight,
  targetRepRange: '8-10',
  badgeText: '',
  badgeColor: 'blue',
  analysis: '',
  suggestedAction: '',
  consecutivePlateauCount: 0
});

const defaultSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: true,
  audioDuckingEnabled: true,
  focusModeDefault: false,
  defaultRestSeconds: 90,
  barbellWeightKg: 20,
  unit: 'kg',
  theme: 'dark',
  currentWeek: 'A',
  activeProgram: {
    goal: 'recomp',
    daysPerWeek: 3,
    gymProfile: 'full',
    title: '3-Day Recomp Full Gym',
    startedAt: '2026-01-01',
    templateIds: ['t1', 't2', 't3']
  }
};

const makeWorkout = (
  id: string,
  endTime: number,
  templateName: string,
  exercises: CompletedWorkout['exercises'],
  overrides: Partial<CompletedWorkout> = {}
): CompletedWorkout => ({
  id,
  templateId: `tpl-${id}`,
  templateName,
  readiness: 'optimal',
  startTime: endTime - 50 * 60 * 1000,
  endTime,
  durationMinutes: 50,
  totalVolumeKg: 5000,
  totalSets: exercises.reduce((acc, e) => acc + e.sets.length, 0),
  cycleWeek: 2,
  cyclePhase: 'progress',
  exercises,
  ...overrides
});

describe('AI review report generator (aiReview.ts)', () => {
  const FIXED_NOW = new Date('2026-02-15T12:00:00Z').getTime();

  it('handles empty history and less than 2 workouts gracefully', () => {
    // 0 workouts
    const emptyReport = buildAiReviewReport([], defaultSettings, { period: '2w', now: FIXED_NOW });
    expect(emptyReport).toContain('Проанализировано тренировок: 0');
    expect(emptyReport).toContain('В истории нет завершённых тренировок');
    expect(emptyReport).toContain(AI_REVIEW_PROMPT_TEMPLATE);

    // 1 workout
    const oneWorkout = [
      makeWorkout('w1', FIXED_NOW - 86400000, 'Верх А', [
        {
          exerciseId: 'bench-press',
          name: 'Жим штанги лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 10,
          workingWeight: 70,
          sets: [
            { setNumber: 1, weight: 70, reps: 10, rpe: 8, completed: true }
          ],
          progression: makeProgression(70)
        }
      ])
    ];

    const singleReport = buildAiReviewReport(oneWorkout, defaultSettings, { period: '2w', now: FIXED_NOW });
    expect(singleReport).toContain('Проанализировано тренировок: 1');
    expect(singleReport).toContain('Жим штанги лёжа [id: bench-press]');
    expect(singleReport).toContain('70×10 @RPE8');
  });

  it('excludes warmup sets from working sets list and counts them separately', () => {
    const workouts = [
      makeWorkout('w1', FIXED_NOW - 86400000, 'Верх А', [
        {
          exerciseId: 'bench-press',
          name: 'Жим штанги лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 10,
          workingWeight: 80,
          sets: [
            { setNumber: 0, weight: 40, reps: 8, isWarmup: true, type: 'warmup', completed: true },
            { setNumber: 0, weight: 60, reps: 5, isWarmup: true, type: 'warmup', completed: true },
            { setNumber: 1, weight: 80, reps: 10, rpe: 8, completed: true },
            { setNumber: 2, weight: 80, reps: 9, rpe: 9, completed: true },
            { setNumber: 3, weight: 80, reps: 8, rpe: 10, completed: false } // failed set
          ],
          progression: makeProgression(80)
        }
      ]),
      makeWorkout('w2', FIXED_NOW - 3 * 86400000, 'Низ А', [])
    ];

    const report = buildAiReviewReport(workouts, defaultSettings, { period: '2w', now: FIXED_NOW });

    // Working sets formatted properly
    expect(report).toContain('80×10 @RPE8, 80×9 @RPE9');
    // Failed set (completed === false) not included
    expect(report).not.toContain('80×8 @RPE10');
    // Warmup weights 40 and 60 NOT in the working sets string
    expect(report).not.toContain('40×8');
    expect(report).not.toContain('60×5');
    // Warmup counter noted
    expect(report).toContain('[разминка: 2 подхода]');
  });

  it('detects stagnation accurately across 3 appearances without false alarms on growth', () => {
    const day = 86400000;

    // Stalled: 80x8 -> 80x8 -> 80x8
    const stalledWorkout1 = makeWorkout('s1', FIXED_NOW - 10 * day, 'T', [
      {
        exerciseId: 'bench-press',
        name: 'Жим штанги лёжа',
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 10,
        workingWeight: 80,
        sets: [{ setNumber: 1, weight: 80, reps: 8, completed: true }],
        progression: makeProgression(80)
      }
    ]);
    const stalledWorkout2 = makeWorkout('s2', FIXED_NOW - 6 * day, 'T', [
      {
        exerciseId: 'bench-press',
        name: 'Жим штанги лёжа',
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 10,
        workingWeight: 80,
        sets: [{ setNumber: 1, weight: 80, reps: 8, completed: true }],
        progression: makeProgression(80)
      }
    ]);
    const stalledWorkout3 = makeWorkout('s3', FIXED_NOW - 2 * day, 'T', [
      {
        exerciseId: 'bench-press',
        name: 'Жим штанги лёжа',
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 10,
        workingWeight: 80,
        sets: [{ setNumber: 1, weight: 80, reps: 8, completed: true }],
        progression: makeProgression(80)
      }
    ]);

    const stalledResult = detectStagnation([stalledWorkout1, stalledWorkout2, stalledWorkout3]);
    expect(stalledResult).toHaveLength(1);
    expect(stalledResult[0].exerciseId).toBe('bench-press');

    // Progressing in reps: 80x8 -> 80x9 -> 80x10 -> NOT stalled
    const progressingRepsWorkout = makeWorkout('s3-prog', FIXED_NOW - 2 * day, 'T', [
      {
        exerciseId: 'bench-press',
        name: 'Жим штанги лёжа',
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 10,
        workingWeight: 80,
        sets: [{ setNumber: 1, weight: 80, reps: 10, completed: true }],
        progression: makeProgression(80)
      }
    ]);

    const progressingResult = detectStagnation([stalledWorkout1, stalledWorkout2, progressingRepsWorkout]);
    expect(progressingResult).toHaveLength(0);

    // Progressing in weight: 80x8 -> 80x8 -> 82.5x6 -> NOT stalled
    const progressingWeightWorkout = makeWorkout('s3-weight', FIXED_NOW - 2 * day, 'T', [
      {
        exerciseId: 'bench-press',
        name: 'Жим штанги лёжа',
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 10,
        workingWeight: 82.5,
        sets: [{ setNumber: 1, weight: 82.5, reps: 6, completed: true }],
        progression: makeProgression(82.5)
      }
    ]);

    const progressingWeightResult = detectStagnation([stalledWorkout1, stalledWorkout2, progressingWeightWorkout]);
    expect(progressingWeightResult).toHaveLength(0);
  });

  it('aggregates weekly summary correctly by category', () => {
    const workouts = [
      makeWorkout('w1', FIXED_NOW - 2 * 86400000, 'Верх', [
        {
          exerciseId: 'bench-press',
          name: 'Жим',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 10,
          workingWeight: 70,
          sets: [
            { setNumber: 1, weight: 70, reps: 10, completed: true },
            { setNumber: 2, weight: 70, reps: 10, completed: true },
            { setNumber: 3, weight: 70, reps: 10, completed: true }
          ],
          progression: makeProgression(70)
        },
        {
          exerciseId: 'lat-pulldown',
          name: 'Тяга блока',
          category: 'Back',
          targetSets: 2,
          minReps: 10,
          maxReps: 12,
          workingWeight: 45,
          sets: [
            { setNumber: 1, weight: 45, reps: 12, completed: true },
            { setNumber: 2, weight: 45, reps: 12, completed: true }
          ],
          progression: makeProgression(45)
        }
      ]),
      makeWorkout('w2', FIXED_NOW - 4 * 86400000, 'Низ', [
        {
          exerciseId: 'squat',
          name: 'Присед',
          category: 'Legs',
          targetSets: 4,
          minReps: 6,
          maxReps: 8,
          workingWeight: 100,
          sets: [
            { setNumber: 1, weight: 100, reps: 8, completed: true },
            { setNumber: 2, weight: 100, reps: 8, completed: true },
            { setNumber: 3, weight: 100, reps: 8, completed: true },
            { setNumber: 4, weight: 100, reps: 8, completed: true }
          ],
          progression: makeProgression(100)
        }
      ])
    ];

    const report = buildAiReviewReport(workouts, defaultSettings, { period: '2w', now: FIXED_NOW });
    expect(report).toContain('СВОДКА РАБОЧЕГО ОБЪЁМА ПО НЕДЕЛЯМ');
    expect(report).toContain('Грудь (Chest): 3 подхода');
    expect(report).toContain('Спина (Back): 2 подхода');
    expect(report).toContain('Ноги (Legs): 4 подхода');
  });

  it('keeps top 3 workouts detailed and compresses older ones when text length exceeds limit', () => {
    // Generate 15 extensive workouts that exceed 12 000 characters
    const day = 86400000;
    const manyWorkouts: CompletedWorkout[] = [];

    for (let i = 0; i < 15; i++) {
      manyWorkouts.push(
        makeWorkout(`big-${i}`, FIXED_NOW - (i + 1) * day, `День ${i + 1}: Фулбоди нагрузка`, [
          {
            exerciseId: 'squat',
            name: 'Приседания со штангой на спине классические с паузой в нижней точке',
            category: 'Legs',
            targetSets: 4,
            minReps: 8,
            maxReps: 10,
            workingWeight: 100,
            sets: [
              { setNumber: 1, weight: 100, reps: 10, rpe: 8, completed: true },
              { setNumber: 2, weight: 100, reps: 10, rpe: 8.5, completed: true },
              { setNumber: 3, weight: 100, reps: 9, rpe: 9, completed: true },
              { setNumber: 4, weight: 100, reps: 8, rpe: 9.5, completed: true }
            ],
            progression: makeProgression(100)
          },
          {
            exerciseId: 'bench-press',
            name: 'Жим штанги на горизонтальной скамье с контролем опускания',
            category: 'Chest',
            targetSets: 4,
            minReps: 8,
            maxReps: 10,
            workingWeight: 80,
            sets: [
              { setNumber: 1, weight: 80, reps: 10, rpe: 8, completed: true },
              { setNumber: 2, weight: 80, reps: 10, rpe: 8.5, completed: true },
              { setNumber: 3, weight: 80, reps: 9, rpe: 9, completed: true },
              { setNumber: 4, weight: 80, reps: 9, rpe: 9, completed: true }
            ],
            progression: makeProgression(80)
          },
          {
            exerciseId: 'lat-pulldown',
            name: 'Тяга верхнего блока к груди широким хватом с фиксацией в пиковом сокращении',
            category: 'Back',
            targetSets: 4,
            minReps: 10,
            maxReps: 12,
            workingWeight: 54,
            sets: [
              { setNumber: 1, weight: 54, reps: 12, rpe: 8, completed: true },
              { setNumber: 2, weight: 54, reps: 12, rpe: 8, completed: true },
              { setNumber: 3, weight: 54, reps: 11, rpe: 8.5, completed: true },
              { setNumber: 4, weight: 54, reps: 10, rpe: 9, completed: true }
            ],
            progression: makeProgression(54)
          },
          {
            exerciseId: 'romanian-deadlift',
            name: 'Румынская тяга со штангой с глубоким растяжением задней поверхности бедра',
            category: 'Legs',
            targetSets: 4,
            minReps: 8,
            maxReps: 10,
            workingWeight: 90,
            sets: [
              { setNumber: 1, weight: 90, reps: 10, rpe: 8, completed: true },
              { setNumber: 2, weight: 90, reps: 10, rpe: 8, completed: true },
              { setNumber: 3, weight: 90, reps: 9, rpe: 8.5, completed: true },
              { setNumber: 4, weight: 90, reps: 8, rpe: 9, completed: true }
            ],
            progression: makeProgression(90)
          }
        ])
      );
    }

    const report = buildAiReviewReport(manyWorkouts, defaultSettings, { period: '4w', now: FIXED_NOW });

    // Top 3 workouts remain detailed
    expect(report).toContain('Тренировка 1:');
    expect(report).toContain('100×10 @RPE8, 100×10 @RPE8.5, 100×9 @RPE9, 100×8 @RPE9.5');

    // 4th and older workouts are compressed to one-line summaries with "лучший"
    expect(report).toContain('Тренировка 4:');
    expect(report).toContain('лучший 100×10 @RPE8 (всего 4 раб. подх.');
  });

  it('provides deterministic output when now is fixed', () => {
    const workouts = [
      makeWorkout('w1', FIXED_NOW - 86400000, 'Верх', [
        {
          exerciseId: 'bench-press',
          name: 'Жим',
          category: 'Chest',
          targetSets: 2,
          minReps: 8,
          maxReps: 10,
          workingWeight: 75,
          sets: [{ setNumber: 1, weight: 75, reps: 9, completed: true }],
          progression: makeProgression(75)
        }
      ]),
      makeWorkout('w2', FIXED_NOW - 2 * 86400000, 'Низ', [
        {
          exerciseId: 'squat',
          name: 'Присед',
          category: 'Legs',
          targetSets: 3,
          minReps: 6,
          maxReps: 8,
          workingWeight: 90,
          sets: [{ setNumber: 1, weight: 90, reps: 8, completed: true }],
          progression: makeProgression(90)
        }
      ])
    ];

    const report1 = buildAiReviewReport(workouts, defaultSettings, {
      period: '2w',
      userNote: 'Болит плечо на жиме',
      now: FIXED_NOW
    });

    const report2 = buildAiReviewReport(workouts, defaultSettings, {
      period: '2w',
      userNote: 'Болит плечо на жиме',
      now: FIXED_NOW
    });

    expect(report1).toBe(report2);
    expect(report1).toContain('Что меня сейчас волнует: Болит плечо на жиме');
    expect(report1).toContain('ОСОБЕННОСТИ СНАРЯЖЕНИЯ В ЗАЛЕ');
    expect(report1).toContain('Блочные тренажёры (cable): шаг веса 4.5 кг');
    expect(report1).toContain('Армейский жим (overhead-press): цельная штанга фиксированного веса');
    expect(report1).toContain('15, 20, 25, 30, 35, 40, 45, 50 кг');
  });

  describe('UI Integration: AnalyticsView button and AiReviewModal', () => {
    it('disables the "Разбор для ИИ" button when history has fewer than 2 workouts', () => {
      const singleWorkout = [
        makeWorkout('w1', FIXED_NOW - 86400000, 'Верх', [])
      ];

      const html = renderToString(
        React.createElement(AnalyticsView, {
          history: singleWorkout,
          templates: []
        })
      );

      expect(html).toContain('Разбор для ИИ');
      expect(html).toContain('disabled=""');
      expect(html).toContain('Нужно хотя бы 2 тренировки');
    });

    it('enables the "Разбор для ИИ" button when history has 2 or more workouts', () => {
      const workouts = [
        makeWorkout('w1', FIXED_NOW - 86400000, 'Верх', []),
        makeWorkout('w2', FIXED_NOW - 2 * 86400000, 'Низ', [])
      ];

      const html = renderToString(
        React.createElement(AnalyticsView, {
          history: workouts,
          templates: []
        })
      );

      expect(html).toContain('Разбор для ИИ');
      // The button should NOT be disabled
      expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Разбор для ИИ/);
    });

    it('renders AiReviewModal with period selector, user note, and copy actions', () => {
      const workouts = [
        makeWorkout('w1', FIXED_NOW - 86400000, 'Верх', []),
        makeWorkout('w2', FIXED_NOW - 2 * 86400000, 'Низ', [])
      ];

      const html = renderToString(
        React.createElement(AiReviewModal, {
          isOpen: true,
          history: workouts,
          settings: defaultSettings,
          onClose: () => {}
        })
      );

      expect(html).toContain('Разбор тренировок для ИИ');
      expect(html).toContain('2 недели');
      expect(html).toContain('4 недели');
      expect(html).toContain('Последние 8');
      expect(html).toContain('О чём спросить, что беспокоит');
      expect(html).toContain('Превью итогового текста для ИИ');
      expect(html).toContain('Скопировать отчёт');
    });
  });
});
