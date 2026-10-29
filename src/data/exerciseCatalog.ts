import { Exercise, MuscleCategory, EquipmentType, ExerciseTechniqueGuide } from '../types';

export interface CatalogExerciseItem {
  id: string;
  name: string;
  category: MuscleCategory;
  equipment: EquipmentType;
  animationType: string;
  defaultSets: number;
  minReps: number;
  maxReps: number;
  weightStep: number;
  defaultWeight: number;
  restSeconds: number;
  alternatives: string[]; // IDs of interchangeable exercises
  technique: ExerciseTechniqueGuide;
}

export const EXERCISE_CATALOG: Record<string, CatalogExerciseItem> = {
  // --- ГРУДЬ (CHEST) ---
  'bench-press': {
    id: 'bench-press',
    name: 'Жим штанги лёжа',
    category: 'Chest',
    equipment: 'barbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 75,
    restSeconds: 120,
    alternatives: ['db-bench-press', 'hammer-chest-press', 'smith-bench-press', 'dips-chest'],
    technique: {
      primaryMuscles: 'Большая грудная мышца, передняя дельта, трицепс',
      setup: 'Лягте на скамью так, чтобы гриф был на уровне глаз. Сведите лопатки, слегка прогните поясницу (мост), плотно упритесь стопами в пол. Хват чуть шире плеч.',
      execution: 'Плавно опустите штангу на середину груди (линия сосков), удерживая угол в локтях около 70-75 градусов. Мощным подконтрольным движением выжмите гриф вверх, не разводя лопатки.',
      breathing: 'Вдох при плавном опускании штанги, мощный выдох при выжимании вверх.',
      mistakes: [
        'Разведение локтей перпендикулярно корпусу под 90° (травмирует плечи)',
        'Отрыв таза или пяток от пола',
        'Отбив штанги от грудной клетки'
      ]
    }
  },
  'db-bench-press': {
    id: 'db-bench-press',
    name: 'Жим гантелей лёжа',
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 26,
    restSeconds: 90,
    alternatives: ['bench-press', 'hammer-chest-press', 'incline-db-press'],
    technique: {
      primaryMuscles: 'Грудные мышцы (глубокое растяжение), трицепс',
      setup: 'Сядьте на скамью с гантелями на бедрах. Откиньтесь назад, выводя гантели на вытянутые руки над грудью. Сведите лопатки.',
      execution: 'Опускайте гантели по дуге вниз до глубокого комфортного растяжения грудных мышц. На выдохе сведите гантели в верхней точке, не соударяя их.',
      breathing: 'Вдох при опускании гантелей, выдох на усилии вверх.',
      mistakes: [
        'Удар гантелей друг о друга вверху (теряется напряжение)',
        'Слишком сильное опускание локтей ниже плечевого сустава при плохой мобильности'
      ]
    }
  },
  'incline-db-press': {
    id: 'incline-db-press',
    name: 'Жим гантелей на наклонной скамье (30°)',
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 24,
    restSeconds: 90,
    alternatives: ['incline-barbell-press', 'hammer-chest-press', 'cable-crossover-low'],
    technique: {
      primaryMuscles: 'Верхняя (ключичная) порция грудных, передняя дельта',
      setup: 'Установите скамью под углом 30 градусов (не более 45°, иначе нагрузка уйдет в плечи). Плотно прижмите таз и спину, лопатки сведены.',
      execution: 'Жмите гантели вверх по естественной дуге, фокусируясь на сокращении верхнего сегмента груди.',
      breathing: 'Вдох в нижней точке растяжения, выдох на выжиме.',
      mistakes: ['Чрезмерный угол скамьи (превращает жим в тренировку плеч)', 'Отрыв поясницы']
    }
  },
  'hammer-chest-press': {
    id: 'hammer-chest-press',
    name: 'Жим в тренажере Хаммер (Hammer Press)',
    category: 'Chest',
    equipment: 'machine',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 60,
    restSeconds: 75,
    alternatives: ['bench-press', 'db-bench-press', 'smith-bench-press'],
    technique: {
      primaryMuscles: 'Грудные мышцы (безопасная фиксированная траектория)',
      setup: 'Отрегулируйте высоту сиденья так, чтобы рукояти были на уровне середины груди. Лопатки плотно прижаты к спинке.',
      execution: 'Выжмите рукояти вперед без рывков, прожимая грудные в точке пикового сокращения. Плавно вернитесь в исходное положение.',
      breathing: 'Выдох при жиме, вдох при возврате.',
      mistakes: ['Скругление плеч вперед при жиме', 'Резкий сброс веса']
    }
  },
  'dips-chest': {
    id: 'dips-chest',
    name: 'Отжимания на брусьях (с наклоном корпуса)',
    category: 'Chest',
    equipment: 'bodyweight',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 90,
    alternatives: ['bench-press', 'db-bench-press'],
    technique: {
      primaryMuscles: 'Нижняя часть грудных, трицепс, передняя дельта',
      setup: 'Примите упор на брусьях. Наклоните корпус вперед под углом ~30 градусов, локти слегка разведите в стороны.',
      execution: 'Опуститесь до прямого угла в локтях (или комфортного растяжения). Мощно выжмите корпус вверх за счет груди.',
      breathing: 'Вдох при опускании, выдох при подъеме.',
      mistakes: ['Вертикальный корпус (переводит нагрузку исключительно на трицепс)', 'Резкие падения вниз']
    }
  },

  // --- СПИНА (BACK) ---
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Тяга верхнего блока к груди',
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 65,
    restSeconds: 90,
    alternatives: ['pull-ups', 'hammer-lat-pulldown', 'close-grip-pulldown'],
    technique: {
      primaryMuscles: 'Широчайшие мышцы спины, большая круглая, бицепс',
      setup: 'Отрегулируйте валик для бедер. Возьмитесь за гриф хватом шире плеч. Слегка отклоните корпус назад (на 10-15°), грудь направьте вверх.',
      execution: 'Начните движение со сведения лопаток и ведите локти строго вниз к карманам, касаясь грифом верхней части груди. Сделайте секундную паузу.',
      breathing: 'Выдох при тяге к себе, плавный вдох при возврате рукояти вверх.',
      mistakes: [
        'Тяга за шею (опасно для шейного отдела позвоночника)',
        'Сильное раскачивание корпусом назад (читинг инерцией)',
        'Тяга силой рук вместо широчайших'
      ]
    }
  },
  'pull-ups': {
    id: 'pull-ups',
    name: 'Подтягивания на турнике широким хватом',
    category: 'Back',
    equipment: 'bodyweight',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 120,
    alternatives: ['lat-pulldown', 'gravitron-pullups'],
    technique: {
      primaryMuscles: 'Широчайшие мышцы спины, предплечья, кор',
      setup: 'Хват чуть шире плеч. В висе опустите плечи и сведите лопатки.',
      execution: 'Подтягивайтесь грудью к перекладине, направляя локти вниз и назад. Контролируйте спуск до полного разгибания.',
      breathing: 'Выдох на подъеме вверх, вдох при спуске.',
      mistakes: ['Рывки ногами и переразгибание поясницы (дрыгание)', 'Неполная амплитуда']
    }
  },
  'barbell-row': {
    id: 'barbell-row',
    name: 'Тяга штанги в наклоне',
    category: 'Back',
    equipment: 'barbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 120,
    alternatives: ['db-row', 't-bar-row', 'seated-cable-row'],
    technique: {
      primaryMuscles: 'Толщина широчайших, ромбовидные, трапеции',
      setup: 'Наклонитесь вперед с прямой спиной под углом 45 градусов, колени слегка согнуты. Гриф на уровне колен.',
      execution: 'Потяните штангу к низу живота, прижимая локти к туловищу и сводя лопатки. Медленно опустите вес.',
      breathing: 'Выдох на тяге к поясу, вдох на опускании.',
      mistakes: ['Круглая спина (горб)', 'Слишком вертикальное положение корпуса']
    }
  },
  'db-row': {
    id: 'db-row',
    name: 'Тяга гантели к поясу с упором в скамью',
    category: 'Back',
    equipment: 'dumbbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 26,
    restSeconds: 75,
    alternatives: ['barbell-row', 'seated-cable-row'],
    technique: {
      primaryMuscles: 'Широчайшие мышцы спины (изолированно для каждой стороны)',
      setup: 'Упритесь одним коленом и рукой в скамью. Спина параллельна полу, голова в нейтральном положении.',
      execution: 'Тяните гантель строго к бедру, направляя локоть вверх и назад. Не скручивайте корпус.',
      breathing: 'Выдох при тяге вверх, вдох при опускании.',
      mistakes: ['Вращение туловищем', 'Тяга к плечу вместо тяги к бедру']
    }
  },
  'seated-cable-row': {
    id: 'seated-cable-row',
    name: 'Горизонтальная тяга к поясу в блоке',
    category: 'Back',
    equipment: 'cable',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 50,
    restSeconds: 75,
    alternatives: ['barbell-row', 'db-row', 't-bar-row'],
    technique: {
      primaryMuscles: 'Середина спины, ромбовидные, широчайшие',
      setup: 'Сядьте прямо, упритесь ногами в подставки (колени чуть согнуты). Спина строго вертикально.',
      execution: 'Тяните рукоять к низу живота, максимально сводя лопатки в пиковой точке. Сделайте секундную паузу.',
      breathing: 'Выдох при подтягивании к поясу, вдох при разгибании рук.',
      mistakes: ['Сильные раскачивания вперед-назад корпусом', 'Подъем плеч к ушам']
    }
  },

  // --- НОГИ (LEGS) ---
  'barbell-squat': {
    id: 'barbell-squat',
    name: 'Приседания со штангой на плечах',
    category: 'Legs',
    equipment: 'barbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 5,
    defaultWeight: 90,
    restSeconds: 150,
    alternatives: ['leg-press', 'hack-squat', 'goblet-squat', 'smith-squat'],
    technique: {
      primaryMuscles: 'Квадрицепсы, ягодичные, бицепс бедра, разгибатели спины',
      setup: 'Штанга лежит на верхней части трапеций. Стопы на ширине плеч, носки развернуты наружу на 15-30 градусов. Пресс напряжен.',
      execution: 'Отводя таз назад и сгибая колени, плавно опуститесь до параллели бедер с полом. На выдохе мощно поднимитесь вверх, упираясь всей стопой.',
      breathing: 'Глубокий вдох в живот перед опусканием (внутрибрюшное давление), выдох после преодоления сложной точки.',
      mistakes: [
        'Сведение коленей внутрь (вальгус коленей)',
        'Отрыв пяток от пола',
        'Клевок таза и скругление поясницы в нижней точке'
      ]
    }
  },
  'leg-press': {
    id: 'leg-press',
    name: 'Жим ногами в тренажере',
    category: 'Legs',
    equipment: 'machine',
    animationType: 'leg-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 10,
    defaultWeight: 150,
    restSeconds: 90,
    alternatives: ['barbell-squat', 'hack-squat'],
    technique: {
      primaryMuscles: 'Квадрицепсы, ягодичные мышцы (без осевой нагрузки на спину)',
      setup: 'Сядьте плотно в тренажер, поясница и таз намертво прижаты к спинке. Поставьте стопы на ширину плеч по центру платформы.',
      execution: 'Плавно опустите платформу до прямого угла в коленях. Мощно выжмите платформу, не вставляя (не блокируя) колени в замок вверху.',
      breathing: 'Вдох при сгибании ног, выдох на жиме.',
      mistakes: [
        'Полная блокировка коленных суставов в верхней точке (опасно для суставов!)',
        'Отрыв таза и поясницы от сиденья'
      ]
    }
  },
  'romanian-deadlift': {
    id: 'romanian-deadlift',
    name: 'Румынская тяга со штангой (RDL)',
    category: 'Legs',
    equipment: 'barbell',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 80,
    restSeconds: 120,
    alternatives: ['db-rdl', 'leg-curls-lying'],
    technique: {
      primaryMuscles: 'Бицепс бедра, ягодичные мышцы, поясница',
      setup: 'Стопы на ширине таза. Штанга в руках у бедер. Лопатки сведены, спина прямая.',
      execution: 'Отводя таз назад и слегка согнув колени, ведите штангу вплотную вдоль ног до середины голени, чувствуя мощное растяжение задней поверхности бедра. Вернитесь в стойку за счет сжатия ягодиц.',
      breathing: 'Вдох при наклоне, выдох при выпрямлении корпуса.',
      mistakes: ['Скругление спины', 'Приседание вместо отведения таза назад']
    }
  },

  // --- ПЛЕЧИ (SHOULDERS) ---
  'overhead-press': {
    id: 'overhead-press',
    name: 'Армейский жим стоя (OHP)',
    category: 'Shoulders',
    equipment: 'barbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 42.5,
    restSeconds: 90,
    alternatives: ['seated-db-press', 'hammer-shoulder-press', 'smith-shoulder-press'],
    technique: {
      primaryMuscles: 'Передняя и средняя дельта, трицепс, мышцы кора',
      setup: 'Гриф лежит на ключицах. Хват чуть шире плеч. Ягодицы и пресс жестко напряжены, ноги врозь для стабильности.',
      execution: 'Выжмите штангу вертикально над головой, слегка подавая корпус вперед в верхней точке, когда гриф минует лицо. Зафиксируйте вес над макушкой.',
      breathing: 'Вдох внизу, выдох при прохождении верхней точки.',
      mistakes: ['Чрезмерный прогиб в пояснице назад (риск травмы спины)', 'Выжимание штанги вперед вместо вертикали']
    }
  },
  'seated-db-press': {
    id: 'seated-db-press',
    name: 'Жим гантелей сидя',
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 18,
    restSeconds: 75,
    alternatives: ['overhead-press', 'hammer-shoulder-press'],
    technique: {
      primaryMuscles: 'Дельтовидные мышцы, трицепс',
      setup: 'Скамья со спинкой под углом 80-85 градусов. Гантели у плеч, локти смотрят вперед и в стороны под углом 45°.',
      execution: 'Жмите гантели вверх по естественной траектории до выпрямления рук. Плавно опускайте к плечам.',
      breathing: 'Выдох на жиме, вдох при опускании.',
      mistakes: ['Удары гантелей друг об друга', 'Разведение локтей строго назад в плоскость спины']
    }
  },
  'lateral-raises': {
    id: 'lateral-raises',
    name: 'Махи гантелями в стороны',
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 1,
    defaultWeight: 10,
    restSeconds: 60,
    alternatives: ['cable-lateral-raise', 'machine-lateral-raise'],
    technique: {
      primaryMuscles: 'Средняя дельта (ширина плеч)',
      setup: 'Стойте ровно, колени слегка согнуты, корпус чуть наклонен вперед. Гантели по бокам бедер.',
      execution: 'Поднимайте руки через стороны локтями вверх до уровня плеч. Локти чуть согнуты. В верхней точке мизинец чуть выше большого пальца.',
      breathing: 'Выдох на подъеме, вдох при плавном опускании.',
      mistakes: [
        'Раскачка туловищем и подброс веса ногами (читинг)',
        'Подъем кистей выше локтей (нагрузка уходит в трапецию)'
      ]
    }
  },

  // --- РУКИ (ARMS) ---
  'bicep-curls': {
    id: 'bicep-curls',
    name: 'Сгибания рук со штангой на бицепс',
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 27.5,
    restSeconds: 60,
    alternatives: ['db-incline-curls', 'cable-bicep-curl', 'hammer-curls'],
    technique: {
      primaryMuscles: 'Двуглавая мышца плеча (бицепс)',
      setup: 'Хват снизу на ширине плеч. Локти зафиксированы по бокам туловища.',
      execution: 'Сгибайте руки в локтях за счет бицепса, не выдвигая локти вперед. Задержитесь в точке пикового сокращения на 1 секунду.',
      breathing: 'Выдох при сгибании рук, вдох при разгибании.',
      mistakes: ['Раскачка спиной назад (читинг)', 'Вывод локтей далеко вперед']
    }
  },
  'tricep-pushdown': {
    id: 'tricep-pushdown',
    name: 'Разгибания на трицепс на верхнем блоке',
    category: 'Arms',
    equipment: 'cable',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 30,
    restSeconds: 60,
    alternatives: ['french-press', 'dips-chest', 'overhead-cable-extension'],
    technique: {
      primaryMuscles: 'Трехглавая мышца плеча (трицепс)',
      setup: 'Возьмите рукоять или канаты. Прижмите локти к корпусу, слегка наклонитесь вперед.',
      execution: 'Разгибайте руки вниз до полного выпрямления локтей, прожимая трицепс. Локти остаются неподвижными.',
      breathing: 'Выдох при разгибании вниз, вдох при подъеме.',
      mistakes: ['Движение плечевого сустава и локтей взад-вперед', 'Помощь весом всего тела']
    }
  }
};
