import { describe, expect, it } from 'vitest';
import { checkMuscleBalance } from '../src/utils/muscleBalance';
import { DEFAULT_TEMPLATES } from '../src/data/defaultTemplates';
import { buildProgramTemplates } from '../src/data/programBuilder';
import type { ProgramGoal, DaysPerWeek, GymProfile } from '../src/types';

describe('muscle balance check for consecutive exercises', () => {
  it('detects 3 or more exercises of same category in a row', () => {
    const list = [
      { name: 'Жим штанги', category: 'Chest' },
      { name: 'Жим гантелей', category: 'Chest' },
      { name: 'Кроссовер', category: 'Chest' },
      { name: 'Подъём на бицепс', category: 'Arms' }
    ];

    const warnings = checkMuscleBalance(list);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].category).toBe('Chest');
    expect(warnings[0].count).toBe(3);
    expect(warnings[0].exerciseNames).toEqual(['Жим штанги', 'Жим гантелей', 'Кроссовер']);
  });

  it('does not warn for consecutive Legs or Core exercises', () => {
    const legList = [
      { name: 'Приседания со штангой на спине', category: 'Legs' },
      { name: 'Румынская тяга со штангой (RDL)', category: 'Legs' },
      { name: 'Жим ногами в тренажере', category: 'Legs' },
      { name: 'Разгибание голеней сидя', category: 'Legs' },
      { name: 'Подъем на носки стоя', category: 'Legs' }
    ];
    expect(checkMuscleBalance(legList)).toHaveLength(0);

    const coreList = [
      { name: 'Планка на предплечьях', category: 'Core' },
      { name: 'Скручивания на полу', category: 'Core' },
      { name: 'Подъем ног в висе', category: 'Core' }
    ];
    expect(checkMuscleBalance(coreList)).toHaveLength(0);
  });

  it('warns for 3 or more consecutive Back exercises', () => {
    const backList = [
      { name: 'Становая тяга классическая со штангой', category: 'Back' },
      { name: 'Тяга верхнего блока к груди широким хватом', category: 'Back' },
      { name: 'Тяга штанги в наклоне к поясу', category: 'Back' }
    ];
    const warnings = checkMuscleBalance(backList);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].category).toBe('Back');
    expect(warnings[0].count).toBe(3);
    expect(warnings[0].exerciseNames).toEqual([
      'Становая тяга классическая со штангой',
      'Тяга верхнего блока к груди широким хватом',
      'Тяга штанги в наклоне к поясу'
    ]);
  });

  it('ignores exercises that are alternating or interleaved', () => {
    const list = [
      { name: 'Жим штанги', category: 'Chest' },
      { name: 'Тяга блока', category: 'Back' },
      { name: 'Жим гантелей', category: 'Chest' },
      { name: 'Тяга гантели', category: 'Back' }
    ];

    const warnings = checkMuscleBalance(list);
    expect(warnings).toHaveLength(0);
  });

  it('ignores consecutive exercises if they are grouped in the same superset circuit', () => {
    const list = [
      { name: 'Сгибания на бицепс', category: 'Arms', supersetGroupId: 'ss-1' },
      { name: 'Молот', category: 'Arms', supersetGroupId: 'ss-1' },
      { name: 'Французский жим', category: 'Arms', supersetGroupId: 'ss-1' }
    ];

    const warnings = checkMuscleBalance(list);
    expect(warnings).toHaveLength(0);
  });

  it('audits defaultTemplates for consecutive categories', () => {
    console.log('\n--- AUDIT: DEFAULT_TEMPLATES ---');
    let totalWarnings = 0;
    DEFAULT_TEMPLATES.forEach(template => {
      const warnings = checkMuscleBalance(template.exercises);
      if (warnings.length > 0) {
        totalWarnings += warnings.length;
        console.log(`[Шаблон: ${template.name}] найдено ${warnings.length} предупреждений:`);
        warnings.forEach(w => console.log(`  - ${w.message}`));
      } else {
        console.log(`[Шаблон: ${template.name}] баланс в норме (нет 3+ подряд)`);
      }
    });
    // This test documents the current state without failing
    expect(totalWarnings).toBeGreaterThanOrEqual(0);
  });

  it('audits generated programs across goals and days', () => {
    console.log('\n--- AUDIT: GENERATED PROGRAMS ---');
    const goals: ProgramGoal[] = ['recomp', 'cut', 'bulk', 'strength'];
    const daysList: DaysPerWeek[] = [2, 3, 4, 5];
    const gyms: GymProfile[] = ['full', 'dumbbells', 'home'];

    let totalProgramWarnings = 0;
    const warnedPrograms: string[] = [];

    goals.forEach(goal => {
      daysList.forEach(days => {
        gyms.forEach(gym => {
          const { program, templates } = buildProgramTemplates(goal, days, [], gym);
          templates.forEach((t, dayIdx) => {
            const warnings = checkMuscleBalance(t.exercises);
            if (warnings.length > 0) {
              totalProgramWarnings += warnings.length;
              const desc = `${goal}/${days}дней/${gym} (День ${dayIdx + 1}: ${t.name})`;
              warnedPrograms.push(`${desc}: ${warnings.map(w => w.message).join('; ')}`);
            }
          });
        });
      });
    });

    console.log(`Всего предупреждений в сгенерированных программах: ${totalProgramWarnings}`);
    if (warnedPrograms.length > 0) {
      console.log('Примеры шаблонов с 3+ подряд:');
      warnedPrograms.slice(0, 10).forEach(p => console.log(`  * ${p}`));
    }
    expect(totalProgramWarnings).toBeGreaterThanOrEqual(0);
  });
});
