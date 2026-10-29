import type { MuscleCategory, EquipmentType, ExerciseTechniqueGuide } from '../types/index.ts';

export interface CatalogExerciseItem {
  id: string;
  name: string;
  category: MuscleCategory;
  equipment: EquipmentType;
  animationType: string;
  gifUrl?: string; // Verified accurate 3D animated GIF from ExerciseDB
  defaultSets: number;
  minReps: number;
  maxReps: number;
  weightStep: number;
  defaultWeight: number;
  restSeconds: number;
  alternatives: string[]; // Guaranteed to exist in EXERCISE_CATALOG
  technique: ExerciseTechniqueGuide;
}

export const EXERCISE_GIF_MAP: Record<string, string> = {
  // Грудь (Chest)
  'bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/EIeI8Vf.gif',
  'db-bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/SpYC0Kp.gif',
  'incline-db-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ns0SIbU.gif',
  'incline-barbell-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/3TZduzM.gif',
  'hammer-chest-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DOoWcnA.gif',
  'smith-bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/trqKQv2.gif',
  'dips-chest': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/O2K9Vb5.gif',
  'cable-crossover': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Pr9Rhf4.gif',
  'pec-deck-fly': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/xLYSdtg.gif',

  // Спина (Back)
  'lat-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/qdRxqCj.gif',
  'pull-ups': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/lBDjFxJ.gif',
  'close-grip-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ecpY0rH.gif',
  'hammer-lat-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/7F1DVzn.gif',
  'barbell-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/eZyBC3j.gif',
  'db-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/C0MA9bC.gif',
  'seated-cable-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/fUBheHs.gif',
  't-bar-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/9pQSkH8.gif',

  // Ноги (Legs)
  'barbell-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DhMl549.gif',
  'leg-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/2Qh2J1e.gif',
  'hack-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Qa55kX1.gif',
  'smith-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/jFtipLl.gif',
  'goblet-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/yn8yg1r.gif',
  'romanian-deadlift': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/wQ2c4XD.gif',
  'db-rdl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/rR0LJzx.gif',
  'leg-curls-lying': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/17lJ1kr.gif',

  // Плечи (Shoulders)
  'overhead-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/wdRZISl.gif',
  'seated-db-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/znQUdHY.gif',
  'hammer-shoulder-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DOoWcnA.gif',
  'smith-shoulder-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/jjUPrze.gif',
  'lateral-raises': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DsgkuIt.gif',
  'cable-lateral-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/goJ6ezq.gif',
  'face-pulls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/CvPn9WV.gif',

  // Руки (Arms)
  'bicep-curls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/4dUn2iv.gif',
  'db-incline-curls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ae9UoXQ.gif',
  'hammer-curls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/GNhAeJ0.gif',
  'cable-bicep-curl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/G08RZcQ.gif',
  'tricep-pushdown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/3ZflifB.gif',
  'french-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/iZop9xO.gif',
  'overhead-cable-extension': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/2IxROQ1.gif',

  // Кор и Пресс (Core)
  'plank': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/VBAWRPG.gif',
  'hanging-leg-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/I3tsCnC.gif',
  'cable-crunch': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/WW95auq.gif',
  'cable-woodchopper': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/aVs3BR3.gif',
  'ab-wheel-rollout': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/KtRomty.gif'
};

export const EXERCISE_CATALOG: Record<string, CatalogExerciseItem> = {
  // ==========================================
  // ГРУДЬ (CHEST)
  // ==========================================
  'bench-press': {
    id: 'bench-press',
    name: 'Жим штанги лёжа на горизонтальной скамье',
    category: 'Chest',
    equipment: 'barbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 75,
    restSeconds: 120,
    alternatives: ['db-bench-press', 'hammer-chest-press', 'smith-bench-press', 'dips-chest', 'cable-crossover', 'incline-db-press'],
    technique: {
      primaryMuscles: 'Большая грудная мышца (стернальная часть), передняя дельта, трицепс',
      setup: 'Глаза под грифом. Лопатки жестко сведены и опущены к тазу (грудь колесом). Ноги всей стопой упираются в пол. Хват шире плеч, предплечья вертикальны в нижней точке.',
      execution: 'Опустите штангу по дуге на линию сосков. Локти под углом 70-75° к корпусу (не 90°!). Мощно выжмите гриф вверх и чуть к лицу, не отрывая лопатки от скамьи.',
      breathing: 'Глубокий вдох при опускании штанги к груди, мощный выдох после прохождения критической точки подъема.',
      mistakes: [
        'Разведение локтей на 90° перпендикулярно корпусу (перегрузка плечевых суставов)',
        'Отрыв ягодиц от скамьи и отбив грифа от грудной клетки',
        'Потеря сведения лопаток в верхней точке'
      ]
    }
  },
  'db-bench-press': {
    id: 'db-bench-press',
    name: 'Жим гантелей лёжа на горизонтальной скамье',
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 26,
    restSeconds: 90,
    alternatives: ['bench-press', 'hammer-chest-press', 'smith-bench-press', 'incline-db-press', 'cable-crossover'],
    technique: {
      primaryMuscles: 'Большая грудная мышца (увеличенная амплитуда растяжения), трицепс',
      setup: 'Забросьте гантели с коленей при откидывании на скамью. Лопатки сведены. Гантели держите под небольшим углом (стрела), а не в одну линию.',
      execution: 'Опускайте гантели по дуге до глубокого комфортного растяжения грудных. На выдохе сведите их вверх по дуге над грудью, не соударяя блинами.',
      breathing: 'Вдох при глубоком подконтрольном опускании, выдох на жиме вверх.',
      mistakes: [
        'Соударение гантелей в верхней точке (снимает полезную нагрузку)',
        'Чрезмерное опускание локтей ниже допустимой мобильности плеча'
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
    alternatives: ['incline-barbell-press', 'bench-press', 'db-bench-press', 'hammer-chest-press', 'cable-crossover'],
    technique: {
      primaryMuscles: 'Верхняя (ключичная) порция грудных мышц, передняя дельта',
      setup: 'Угол скамьи 30° (максимум 45°). Стопы прочно на полу, поясница прижата с естественным прогибом, лопатки сведены.',
      execution: 'Опускайте гантели к верху груди. На выдохе жмите строго вертикально, фокусируясь на сжатии верхних волокон груди.',
      breathing: 'Вдох на спуске, выдох на жиме вверх.',
      mistakes: ['Слишком высокий наклон скамьи (нагрузка уходит с груди в дельты)', 'Разведение локтей в стороны']
    }
  },
  'incline-barbell-press': {
    id: 'incline-barbell-press',
    name: 'Жим штанги на наклонной скамье',
    category: 'Chest',
    equipment: 'barbell',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 90,
    alternatives: ['incline-db-press', 'bench-press', 'hammer-chest-press', 'smith-bench-press'],
    technique: {
      primaryMuscles: 'Верхняя часть груди, трицепсы, передние дельтовидные',
      setup: 'Угол наклона скамьи 30°. Лопатки сведены, хват средний. Гриф на уровне подбородка в старте.',
      execution: 'Опускайте гриф на верхнюю треть груди под ключицы. Мощным подконтрольным усилием жмите вверх.',
      breathing: 'Вдох в эксцентрической фазе, выдох в концентрической.',
      mistakes: ['Опускание грифа на горло или живот', 'Отрыв таза от скамьи']
    }
  },
  'hammer-chest-press': {
    id: 'hammer-chest-press',
    name: 'Жим от груди в тренажере Хаммер (Hammer Press)',
    category: 'Chest',
    equipment: 'machine',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 60,
    restSeconds: 75,
    alternatives: ['bench-press', 'db-bench-press', 'smith-bench-press', 'cable-crossover', 'dips-chest'],
    technique: {
      primaryMuscles: 'Большая грудная мышца (изолированная безопасная траектория)',
      setup: 'Высота сиденья настраивается так, чтобы рукоятки находились на высоте сосков. Лопатки сведены и прижаты к спинке.',
      execution: 'Выжмите рукоятки вперед, сжимая грудь в пиковой точке на 1 секунду. Медленно вернитесь назад до легкого растяжения.',
      breathing: 'Выдох при жиме от себя, вдох при возврате.',
      mistakes: ['Выдвижение плеч вперед в конце движения', 'Резкое падение веса']
    }
  },
  'smith-bench-press': {
    id: 'smith-bench-press',
    name: 'Жим лёжа в тренажере Смита',
    category: 'Chest',
    equipment: 'machine',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 65,
    restSeconds: 90,
    alternatives: ['bench-press', 'hammer-chest-press', 'db-bench-press'],
    technique: {
      primaryMuscles: 'Грудные мышцы, трицепсы (стабилизация направляющими)',
      setup: 'Скамья точно по центру направляющих. Гриф опускается на середину груди.',
      execution: 'Снимите гриф с крюков поворотом кисти. Плавно опустите и выжмите вверх.',
      breathing: 'Вдох при опускании, выдох при жиме.',
      mistakes: ['Неправильное позиционирование скамьи (гриф режет плечо)', 'Резкая блокировка локтей']
    }
  },
  'dips-chest': {
    id: 'dips-chest',
    name: 'Отжимания на брусьях с наклоном вперед',
    category: 'Chest',
    equipment: 'bodyweight',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 90,
    alternatives: ['bench-press', 'db-bench-press', 'hammer-chest-press', 'cable-crossover'],
    technique: {
      primaryMuscles: 'Нижняя порция грудных мышц, трицепс, передняя дельта',
      setup: 'Упор на брусьях. Наклоните корпус вперед на 30°, локти слегка разведите в стороны, подбородок прижат к груди.',
      execution: 'Опускайтесь до угла 90° в локтях. Мощно выжимайте себя вверх за счет сведения груди.',
      breathing: 'Вдох при спуске, выдох на подъеме.',
      mistakes: ['Строго вертикальный корпус (смещает нагрузку на трицепс)', 'Слишком глубокий провал с перегрузкой связок плеча']
    }
  },
  'cable-crossover': {
    id: 'cable-crossover',
    name: 'Сведение рук в кроссовере на блоках',
    category: 'Chest',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 20,
    restSeconds: 60,
    alternatives: ['pec-deck-fly', 'bench-press', 'db-bench-press', 'hammer-chest-press'],
    technique: {
      primaryMuscles: 'Грудные мышцы (пиковое сокращение и сведение)',
      setup: 'Блоки на уровне плеч или выше. Шаг вперед в разножку для баланса, корпус чуть наклонен. Руки слегка согнуты в локтях.',
      execution: 'Сводите рукоятки по широкой дуге перед собой, сжимая грудные мышцы в точке касания. Медленно разводите назад.',
      breathing: 'Выдох на сведении рук, вдох на разведении.',
      mistakes: ['Сгибание и разгибание рук как при жиме', 'Раскачка корпусом']
    }
  },
  'pec-deck-fly': {
    id: 'pec-deck-fly',
    name: 'Сведение рук в тренажере Бабочка (Pec-Deck)',
    category: 'Chest',
    equipment: 'machine',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 60,
    alternatives: ['cable-crossover', 'db-bench-press', 'hammer-chest-press'],
    technique: {
      primaryMuscles: 'Изолированное сведение грудных мышц',
      setup: 'Спина и затылок прижаты к спинке. Рукоятки на уровне середины груди, локти мягкие.',
      execution: 'Сводите рукоятки перед грудью усилием грудных мышц. Фиксация на 1 секунду.',
      breathing: 'Выдох на сведении, вдох при раскрытии грудной клетки.',
      mistakes: ['Чрезмерное переразгибание плеча назад', 'Отрыв спины от подушки']
    }
  },

  // ==========================================
  // СПИНА (BACK)
  // ==========================================
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Тяга верхнего блока к груди широким хватом',
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 65,
    restSeconds: 90,
    alternatives: ['pull-ups', 'close-grip-pulldown', 'hammer-lat-pulldown', 'barbell-row', 'seated-cable-row'],
    technique: {
      primaryMuscles: 'Широчайшие мышцы спины, большая круглая, бицепс, ромбовидные',
      setup: 'Бедра зафиксированы валиками. Хват шире плеч. Корпус отклонен назад всего на 10-15°, грудь направлена к грифу.',
      execution: 'Движение начинается со сведения лопаток. Ведите локти вниз и слегка назад к карманам, касаясь верхней части груди.',
      breathing: 'Выдох при опускании рукояти к груди, вдох при плавном контролируемом возврате вверх.',
      mistakes: [
        'Тяга за шею (высокий риск травмы шейного отдела)',
        'Сильное раскачивание корпусом назад (читинг)',
        'Тяга кистями и бицепсом вместо спины'
      ]
    }
  },
  'pull-ups': {
    id: 'pull-ups',
    name: 'Подтягивания на перекладине широким хватом',
    category: 'Back',
    equipment: 'bodyweight',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 120,
    alternatives: ['lat-pulldown', 'close-grip-pulldown', 'hammer-lat-pulldown'],
    technique: {
      primaryMuscles: 'Широчайшие мышцы спины, бицепсы, предплечья, мышцы кора',
      setup: 'Хват закрытый шире плеч. В висе активируйте плечевой пояс (лопатки опущены). Пресс напряжен.',
      execution: 'Подтягивайтесь грудью к перекладине, направляя локти вниз. В верхней точке подбородок выше перекладины.',
      breathing: 'Выдох при движении вверх, вдох при спуске.',
      mistakes: ['Рывки ногами и переразгибание поясницы (дрыгание)', 'Неполная амплитуда без растяжения внизу']
    }
  },
  'close-grip-pulldown': {
    id: 'close-grip-pulldown',
    name: 'Тяга верхнего блока узким параллельным хватом',
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 75,
    alternatives: ['lat-pulldown', 'pull-ups', 'seated-cable-row', 'hammer-lat-pulldown'],
    technique: {
      primaryMuscles: 'Нижняя часть широчайших, брахиалис, бицепс',
      setup: 'Установите V-образную рукоять. Сядьте ровно, грудь подайте вперед.',
      execution: 'Тяните V-рукоять к верху груди, максимально уводя локти вниз вдоль тела.',
      breathing: 'Выдох при тяге, вдох при растяжении вверх.',
      mistakes: ['Скругление грудного отдела', 'Отклонение назад дальше 25 градусов']
    }
  },
  'hammer-lat-pulldown': {
    id: 'hammer-lat-pulldown',
    name: 'Рычажная вертикальная тяга в тренажере Хаммер',
    category: 'Back',
    equipment: 'machine',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 70,
    restSeconds: 90,
    alternatives: ['lat-pulldown', 'pull-ups', 'seated-cable-row'],
    technique: {
      primaryMuscles: 'Широчайшие мышцы спины (независимая работа левой и правой сторон)',
      setup: 'Отрегулируйте сиденье так, чтобы руки в верхней точке были полностью вытянуты.',
      execution: 'Тяните рукояти книзу, прожимая спину в нижней точке.',
      breathing: 'Выдох на усилии, вдох на возврате.',
      mistakes: ['Асимметричная тяга одной рукой', 'Подъем плеч к ушам']
    }
  },
  'barbell-row': {
    id: 'barbell-row',
    name: 'Тяга штанги в наклоне к поясу',
    category: 'Back',
    equipment: 'barbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 120,
    alternatives: ['db-row', 'seated-cable-row', 't-bar-row', 'lat-pulldown'],
    technique: {
      primaryMuscles: 'Толщина широчайших, ромбовидные, средняя трапеция, разгибатели спины',
      setup: 'Наклон корпуса 45-60°, колени согнуты. Спина абсолютно прямая с естественным прогибом. Хват на ширине плеч.',
      execution: 'Тяните штангу к низу живота (к пупку), ведя локти вдоль корпуса и максимально сводя лопатки.',
      breathing: 'Выдох при тяге к поясу, вдох при контролируемом опускании грифа к коленям.',
      mistakes: ['Скругление поясницы горбом (опасно для межпозвоночных дисков)', 'Тяга к груди вместо живота']
    }
  },
  'db-row': {
    id: 'db-row',
    name: 'Тяга гантели к поясу в наклоне с упором в скамью',
    category: 'Back',
    equipment: 'dumbbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 26,
    restSeconds: 75,
    alternatives: ['barbell-row', 'seated-cable-row', 't-bar-row'],
    technique: {
      primaryMuscles: 'Широчайшая мышца спины (глубокая растяжка и изолированная работа стороны)',
      setup: 'Колено и ладонь на скамье. Опорная нога на полу. Спина параллельна полу. Гантель висит на прямой руке.',
      execution: 'Ведите локоть строго по дуге назад к карману брюк, сжимая ширчайшую. Корпус не разворачивать!',
      breathing: 'Выдох при подъеме гантели, вдох при растяжении книзу.',
      mistakes: ['Вращение корпуса вокруг своей оси (читинг)', 'Тяга к плечу силой бицепса']
    }
  },
  'seated-cable-row': {
    id: 'seated-cable-row',
    name: 'Горизонтальная тяга блока к поясу сидя',
    category: 'Back',
    equipment: 'cable',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 50,
    restSeconds: 75,
    alternatives: ['barbell-row', 'db-row', 't-bar-row', 'lat-pulldown'],
    technique: {
      primaryMuscles: 'Середина спины, ромбовидные мышцы, широчайшие',
      setup: 'Сядьте прямо, стопы в упорах, колени слегка согнуты. Спина перпендикулярна полу.',
      execution: 'Тяните рукоять к пупку, разводя плечи назад и сводя лопатки вместе. Пауза 1 секунда.',
      breathing: 'Выдох при подтягивании рукояти, вдох при выпрямлении рук.',
      mistakes: ['Раскачка корпусом вперед-назад по инерции', 'Подъем плеч к ушам']
    }
  },
  't-bar-row': {
    id: 't-bar-row',
    name: 'Тяга Т-грифа с упором',
    category: 'Back',
    equipment: 'barbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 90,
    alternatives: ['barbell-row', 'db-row', 'seated-cable-row'],
    technique: {
      primaryMuscles: 'Массив спины, ромбовидные, трапециевидные',
      setup: 'Ноги по сторонам грифа, наклон 45°. Хват параллельный или широкий.',
      execution: 'Тяните рукоять к груди/животу, мощно сводя лопатки.',
      breathing: 'Выдох на тяге, вдох на опускании.',
      mistakes: ['Скругление спины', 'Использование веса, ломающего технику']
    }
  },

  // ==========================================
  // НОГИ (LEGS)
  // ==========================================
  'barbell-squat': {
    id: 'barbell-squat',
    name: 'Приседания со штангой на спине',
    category: 'Legs',
    equipment: 'barbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 5,
    defaultWeight: 90,
    restSeconds: 150,
    alternatives: ['leg-press', 'hack-squat', 'smith-squat', 'goblet-squat', 'romanian-deadlift'],
    technique: {
      primaryMuscles: 'Квадрицепсы, большая ягодичная мышца, приводящие, разгибатели позвоночника',
      setup: 'Гриф на верхней части трапеции. Стопы чуть шире плеч, носки развернуты на 20-30°. Пресс жестко напряжен (внутрибрюшное давление).',
      execution: 'Отводя таз назад и одновременно сгибая колени, опуститесь до параллели бедер с полом. На выдохе мощно встаньте, толкаясь всей стопой.',
      breathing: 'Глубокий вдох в живот перед опусканием, задержка дыхания на спуске, выдох после прохождения параллели.',
      mistakes: [
        'Сведение коленей внутрь (вальгус — риск травмы менисков)',
        'Отрыв пяток от пола (перегрузка коленных связок)',
        'Клевок таза и скругление поясницы в нижней точке'
      ]
    }
  },
  'leg-press': {
    id: 'leg-press',
    name: 'Жим ногами в тренажере под углом 45°',
    category: 'Legs',
    equipment: 'machine',
    animationType: 'leg-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 10,
    defaultWeight: 150,
    restSeconds: 90,
    alternatives: ['barbell-squat', 'hack-squat', 'smith-squat', 'goblet-squat'],
    technique: {
      primaryMuscles: 'Квадрицепсы, ягодичные мышцы (без осевой нагрузки на позвоночник)',
      setup: 'Спина и таз плотно вжаты в кресло. Стопы на ширине плеч по центру платформы.',
      execution: 'Опускайте платформу до прямого угла в коленях. Выжимайте платформу пятками, не разгибая колени до щелчка в замок.',
      breathing: 'Вдох при опускании платформы, выдох при выжимании вверх.',
      mistakes: [
        'Полная блокировка коленных суставов в верхней точке (крайне травмоопасно!)',
        'Отрыв поясницы и крестца от спинки сиденья'
      ]
    }
  },
  'hack-squat': {
    id: 'hack-squat',
    name: 'Приседания в Гакк-тренажере (Hack Squat)',
    category: 'Legs',
    equipment: 'machine',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 80,
    restSeconds: 90,
    alternatives: ['barbell-squat', 'leg-press', 'smith-squat'],
    technique: {
      primaryMuscles: 'Изолированная нагрузка на квадрицепсы',
      setup: 'Плечи под подушками, спина прижата к каретке. Стопы ближе к нижнему краю для квадрицепса.',
      execution: 'Опускайтесь плавно до глубокого сгибания в коленях, мощно выжимайте каретку вверх.',
      breathing: 'Вдох при спуске, выдох при подъеме.',
      mistakes: ['Отрыв пяток от платформы', 'Блокировка коленей вверху']
    }
  },
  'smith-squat': {
    id: 'smith-squat',
    name: 'Приседания в тренажере Смита',
    category: 'Legs',
    equipment: 'machine',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 70,
    restSeconds: 90,
    alternatives: ['barbell-squat', 'leg-press', 'hack-squat'],
    technique: {
      primaryMuscles: 'Квадрицепсы и ягодицы с поддержкой равновесия',
      setup: 'Стопы выставьте на 15-20 см вперед от линии грифа. Гриф на трапециях.',
      execution: 'Приседайте как будто садитесь на стул. Вертикальная спина благодаря траектории Смита.',
      breathing: 'Вдох на опускании, выдох на подъеме.',
      mistakes: ['Стопы строго под грифом (ломает колени)', 'Слишком большой наклон вперед']
    }
  },
  'goblet-squat': {
    id: 'goblet-squat',
    name: 'Кубковые приседания с гантелью у груди (Goblet Squat)',
    category: 'Legs',
    equipment: 'dumbbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2,
    defaultWeight: 24,
    restSeconds: 60,
    alternatives: ['barbell-squat', 'leg-press'],
    technique: {
      primaryMuscles: 'Квадрицепсы, ягодичные, мышцы кора',
      setup: 'Держите гантель вертикально обеими ладонями перед грудью. Локти направлены вниз.',
      execution: 'Опускайтесь глубоко, разводя колени в стороны. Локти проходят внутри коленей.',
      breathing: 'Вдох на опускании, выдох на подъеме.',
      mistakes: ['Наклон корпуса вперед и отрыв пятки']
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
    alternatives: ['db-rdl', 'leg-curls-lying', 'barbell-squat', 'leg-press'],
    technique: {
      primaryMuscles: 'Бицепс бедра, большая ягодичная мышца, разгибатели поясницы',
      setup: 'Стопы на ширине таза. Штанга в руках у бедер. Лопатки сведены, спина прямая.',
      execution: 'Отводя таз назад и слегка согнув колени, ведите штангу вдоль бедер и голеней до середины голени, растягивая заднюю поверхность бедра.',
      breathing: 'Вдох при наклоне и отведении таза, мощный выдох при сжатии ягодиц на подъеме.',
      mistakes: [
        'Скругление спины горбом',
        'Приседание коленями вперед вместо отведения таза назад'
      ]
    }
  },
  'db-rdl': {
    id: 'db-rdl',
    name: 'Румынская тяга с гантелями',
    category: 'Legs',
    equipment: 'dumbbell',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 24,
    restSeconds: 75,
    alternatives: ['romanian-deadlift', 'leg-curls-lying'],
    technique: {
      primaryMuscles: 'Задняя поверхность бедра, ягодичные мышцы',
      setup: 'Гантели перед бедрами. Плечи расправлены, взгляд вперед-вниз.',
      execution: 'Отводите ягодицы назад, ведя гантели вплотную к ногам до уровня колен или чуть ниже.',
      breathing: 'Вдох на спуске, выдох при разгибании корпуса.',
      mistakes: ['Отведение гантелей далеко от ног', 'Сгибание коленей как в приседе']
    }
  },
  'leg-curls-lying': {
    id: 'leg-curls-lying',
    name: 'Сгибания ног лёжа в тренажере',
    category: 'Legs',
    equipment: 'machine',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 40,
    restSeconds: 60,
    alternatives: ['romanian-deadlift', 'db-rdl'],
    technique: {
      primaryMuscles: 'Изолированная проработка бицепса бедра',
      setup: 'Ложитесь на живот, валик упирается чуть выше ахиллова сухожилия. Колени чуть свисают со скамьи.',
      execution: 'Сгибайте ноги усилием бицепса бедра до касания ягодиц. Медленно опускайте вес.',
      breathing: 'Выдох при сгибании ног, вдох при разгибании.',
      mistakes: ['Отрыв таза от скамьи при сгибании']
    }
  },

  // ==========================================
  // ПЛЕЧИ (SHOULDERS)
  // ==========================================
  'overhead-press': {
    id: 'overhead-press',
    name: 'Армейский жим стоя со штангой (OHP)',
    category: 'Shoulders',
    equipment: 'barbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 42.5,
    restSeconds: 90,
    alternatives: ['seated-db-press', 'hammer-shoulder-press', 'smith-shoulder-press', 'lateral-raises'],
    technique: {
      primaryMuscles: 'Передняя и средняя дельтовидные, трицепсы, верх трапеций, кор',
      setup: 'Гриф на ключицах. Хват чуть шире плеч, предплечья строго вертикальны. Ягодицы и мышцы пресса сжаты как камень.',
      execution: 'Выжмите штангу строго вверх, отклонив подбородок. Как только гриф пройдет лоб, верните голову в нейтраль и зафиксируйте штангу над макушкой.',
      breathing: 'Вдох внизу, выдох в верхней точке выпрямления рук.',
      mistakes: [
        'Сильный прогиб в пояснице назад (компрессионная травма позвоночника)',
        'Выжимание штанги по диагонали вперед'
      ]
    }
  },
  'seated-db-press': {
    id: 'seated-db-press',
    name: 'Жим гантелей сидя на скамье со спинкой',
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 18,
    restSeconds: 75,
    alternatives: ['overhead-press', 'hammer-shoulder-press', 'smith-shoulder-press', 'lateral-raises'],
    technique: {
      primaryMuscles: 'Дельтовидные мышцы (передняя и средняя), трицепс',
      setup: 'Спинка скамьи под углом 80-85° (не строго 90° для защиты плеча). Гантели на высоте ушей, локти направлены вперед под 45°.',
      execution: 'Жмите гантели вверх по естественной дуге. Не бейте их друг об друга вверху.',
      breathing: 'Выдох при жиме над головой, вдох при контролируемом спуске.',
      mistakes: ['Разведение локтей строго назад в одну линию со спиной']
    }
  },
  'hammer-shoulder-press': {
    id: 'hammer-shoulder-press',
    name: 'Жим на плечи в тренажере Хаммер',
    category: 'Shoulders',
    equipment: 'machine',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 75,
    alternatives: ['overhead-press', 'seated-db-press', 'smith-shoulder-press'],
    technique: {
      primaryMuscles: 'Изолированная проработка дельт без балансировки',
      setup: 'Отрегулируйте сиденье: рукояти на уровне ушей. Спина прижата.',
      execution: 'Выжимайте рукояти вверх, плавно опускайте до уровня мочек ушей.',
      breathing: 'Выдох на жиме, вдох на возврате.',
      mistakes: ['Резкое бросание веса вниз']
    }
  },
  'smith-shoulder-press': {
    id: 'smith-shoulder-press',
    name: 'Жим сидя в тренажере Смита с груди',
    category: 'Shoulders',
    equipment: 'machine',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 40,
    restSeconds: 75,
    alternatives: ['overhead-press', 'seated-db-press', 'hammer-shoulder-press'],
    technique: {
      primaryMuscles: 'Передние и средние дельтовидные мышцы',
      setup: 'Скамья под углом 80° внутри рамы Смита. Гриф опускается к ключицам.',
      execution: 'Выжмите гриф вверх по траектории, контролируя опускание.',
      breathing: 'Выдох на жиме, вдох при опускании.',
      mistakes: ['Опускание за голову']
    }
  },
  'lateral-raises': {
    id: 'lateral-raises',
    name: 'Махи гантелями через стороны стоя',
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 1,
    defaultWeight: 10,
    restSeconds: 60,
    alternatives: ['cable-lateral-raise', 'face-pulls', 'overhead-press'],
    technique: {
      primaryMuscles: 'Средняя дельтовидная мышца (создает ширину плеч)',
      setup: 'Корпус чуть наклонен вперед (на 5-10°), локти слегка согнуты и зафиксированы. Гантели у бедер.',
      execution: 'Поднимайте руки через стороны локтями вверх до уровня плеч. Представьте, что выливаете воду из кувшинов.',
      breathing: 'Выдох при подъеме в стороны, плавный вдох при опускании.',
      mistakes: [
        'Подброс гантелей за счет раскачки корпуса и толчка ногами (читинг)',
        'Кисти поднимаются выше локтей (нагрузка крадется трапецией)'
      ]
    }
  },
  'cable-lateral-raise': {
    id: 'cable-lateral-raise',
    name: 'Махи в стороны на нижнем блоке кроссовера',
    category: 'Shoulders',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 1.25,
    defaultWeight: 7.5,
    restSeconds: 60,
    alternatives: ['lateral-raises', 'face-pulls'],
    technique: {
      primaryMuscles: 'Средняя дельта с постоянным натяжением троса по всей траектории',
      setup: 'Трос проходит позади или спереди тела. Возьмитесь за рукоять противоположной рукой.',
      execution: 'Ведите локоть вверх и в сторону до уровня плеча.',
      breathing: 'Выдох на подъеме, вдох на опускании.',
      mistakes: ['Рывки плечом вверх']
    }
  },
  'face-pulls': {
    id: 'face-pulls',
    name: 'Тяга каната к лицу на блоке (Face Pulls)',
    category: 'Shoulders',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 2.5,
    defaultWeight: 22.5,
    restSeconds: 60,
    alternatives: ['lateral-raises', 'cable-lateral-raise'],
    technique: {
      primaryMuscles: 'Задняя дельтовидная мышца, ротаторная манжета, ромбовидные',
      setup: 'Канатная рукоять на уровне глаз или лба. Шаг назад, корпус стабилен.',
      execution: 'Тяните узел каната к переносице, разводя кулаки в стороны с внешней ротацией плеча (двойной бицепс).',
      breathing: 'Выдох на тяге к лицу, вдох при возврате.',
      mistakes: ['Тяга к шее без разведения кистей']
    }
  },

  // ==========================================
  // РУКИ: БИЦЕПС & ТРИЦЕПС (ARMS)
  // ==========================================
  'bicep-curls': {
    id: 'bicep-curls',
    name: 'Сгибания рук со штангой стоя на бицепс',
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 27.5,
    restSeconds: 60,
    alternatives: ['db-incline-curls', 'hammer-curls', 'cable-bicep-curl'],
    technique: {
      primaryMuscles: 'Двуглавая мышца плеча (бицепс), плечелучевая мышца',
      setup: 'Хват снизу на ширине плеч. Локти строго прижаты к бокам туловища. Лопатки сведены.',
      execution: 'Сгибайте руки в локтях за счет силы бицепса. В верхней точке задержитесь на 1 секунду. Не выводите локти вперед!',
      breathing: 'Выдох при подъеме штанги, вдох при плавном опускании.',
      mistakes: [
        'Раскачивание корпусом назад (читинг поясницей)',
        'Вывод локтей далеко вперед (снимает пиковую нагрузку с бицепса)'
      ]
    }
  },
  'db-incline-curls': {
    id: 'db-incline-curls',
    name: 'Сгибания с гантелями на наклонной скамье (растяжение бицепса)',
    category: 'Arms',
    equipment: 'dumbbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 12,
    restSeconds: 60,
    alternatives: ['bicep-curls', 'hammer-curls', 'cable-bicep-curl'],
    technique: {
      primaryMuscles: 'Длинная головка бицепса (максимальное растяжение)',
      setup: 'Скамья под углом 60°. Спина прижата, руки с гантелями свободно свисают вертикально вниз.',
      execution: 'Сгибайте руки с супинацией кисти (разворот мизинца наружу в верхней точке). Локти неподвижны.',
      breathing: 'Выдох на подъеме, вдох на опускании.',
      mistakes: ['Отрыв плеч от скамьи', 'Слишком большой вес']
    }
  },
  'hammer-curls': {
    id: 'hammer-curls',
    name: 'Молотковые сгибания с гантелями (Хаммер)',
    category: 'Arms',
    equipment: 'dumbbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 14,
    restSeconds: 60,
    alternatives: ['bicep-curls', 'db-incline-curls', 'cable-bicep-curl'],
    technique: {
      primaryMuscles: 'Брахиалис (плечевая мышца) и плечелучевая мышца',
      setup: 'Стоя или сидя. Гантели удерживаются нейтральным хватом (ладони смотрят друг на друга).',
      execution: 'Поднимайте гантели вверх без супинации кисти, сжимая внешнюю сторону плеча.',
      breathing: 'Выдох при подъеме, вдох при опускании.',
      mistakes: ['Раскачка спиной']
    }
  },
  'cable-bicep-curl': {
    id: 'cable-bicep-curl',
    name: 'Сгибания на бицепс на нижнем блоке',
    category: 'Arms',
    equipment: 'cable',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 25,
    restSeconds: 60,
    alternatives: ['bicep-curls', 'db-incline-curls', 'hammer-curls'],
    technique: {
      primaryMuscles: 'Бицепс с постоянным сопротивлением троса',
      setup: 'Прямая или изогнутая рукоять на нижнем блоке. Локти прижаты к ребрам.',
      execution: 'Сгибайте руки вверх, контролируя негативную фазу.',
      breathing: 'Выдох на сгибании, вдох на разгибании.',
      mistakes: ['Бросание веса вниз']
    }
  },
  'tricep-pushdown': {
    id: 'tricep-pushdown',
    name: 'Разгибания рук на трицепс на верхнем блоке',
    category: 'Arms',
    equipment: 'cable',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 30,
    restSeconds: 60,
    alternatives: ['french-press', 'overhead-cable-extension', 'dips-chest'],
    technique: {
      primaryMuscles: 'Трехглавая мышца плеча (латеральная и медиальная головки)',
      setup: 'Возьмите прямую рукоять или канат. Локти строго по бокам ребер, корпус слегка наклонен вперед.',
      execution: 'Разгибайте руки вниз до полного выпрямления локтей, мощно прожимая трицепс. Локти остаются на месте!',
      breathing: 'Выдох при разгибании вниз, вдох при возврате рукояти до прямого угла.',
      mistakes: [
        'Движение плеч и локтей взад-вперед',
        'Наваливание на рукоять весом всего тела'
      ]
    }
  },
  'french-press': {
    id: 'french-press',
    name: 'Французский жим со штангой лёжа',
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 32.5,
    restSeconds: 75,
    alternatives: ['tricep-pushdown', 'overhead-cable-extension', 'dips-chest'],
    technique: {
      primaryMuscles: 'Длинная и медиальная головки трицепса',
      setup: 'Лягте на скамью с EZ-грифом. Руки отведены назад на 15° от вертикали.',
      execution: 'Сгибайте руки только в локтях, опуская гриф за макушку головы. Разгибайте мощным усилием.',
      breathing: 'Вдох при сгибании, выдох при выпрямлении.',
      mistakes: ['Разведение локтей в стороны шире плеч', 'Удар грифом по лбу']
    }
  },
  'overhead-cable-extension': {
    id: 'overhead-cable-extension',
    name: 'Разгибания из-за головы на блоке с канатом',
    category: 'Arms',
    equipment: 'cable',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 25,
    restSeconds: 60,
    alternatives: ['tricep-pushdown', 'french-press'],
    technique: {
      primaryMuscles: 'Длинная головка трицепса в состоянии предельного растяжения',
      setup: 'Шаг вперед от блока, корпус наклонен вперед под 45°. Локти направлены вперед рядом с головой.',
      execution: 'Разгибайте руки вперед-вверх, разводя канаты в стороны в пиковой точке.',
      breathing: 'Выдох на разгибании, вдох на опускании за голову.',
      mistakes: ['Движение локтями вверх-вниз']
    }
  },

  // ==========================================
  // КОР И ПРЕСС (CORE)
  // ==========================================
  'plank': {
    id: 'plank',
    name: 'Планка на предплечьях',
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 30,
    maxReps: 60,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ['hanging-leg-raise', 'cable-crunch', 'ab-wheel-rollout'],
    technique: {
      primaryMuscles: 'Прямая и поперечная мышцы живота, глубокие стабилизаторы позвоночника',
      setup: 'Упор на предплечья и носки стоп. Локти строго под плечевыми суставами. Тело вытянуто в единую прямую линию.',
      execution: 'Напрягите пресс и ягодицы, удерживайте таз в нейтральном положении без провисания в пояснице.',
      breathing: 'Ровное глубокое дыхание без задержки воздуха.',
      mistakes: ['Провисание таза вниз', 'Чрезмерный подъем ягодиц вверх', 'Задержка дыхания']
    }
  },
  'hanging-leg-raise': {
    id: 'hanging-leg-raise',
    name: 'Подъем ног в висе на турнике',
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ['plank', 'cable-crunch', 'ab-wheel-rollout'],
    technique: {
      primaryMuscles: 'Нижняя порция прямой мышцы живота, подвздошно-поясничная мышца',
      setup: 'Вис на перекладине хватом на ширине плеч. Плечи опущены, лопатки стабилизированы.',
      execution: 'Мощным усилием пресса поднимите прямые или согнутые ноги выше уровня таза, подкручивая таз вперед.',
      breathing: 'Выдох при подъеме ног, плавный вдох при опускании.',
      mistakes: ['Раскачка телом по инерции', 'Подъем ног только за счет мышц бедра без подкручивания таза']
    }
  },
  'cable-crunch': {
    id: 'cable-crunch',
    name: 'Скручивания на блоке стоя на коленях (Молитва)',
    category: 'Core',
    equipment: 'cable',
    animationType: 'row',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 2.5,
    defaultWeight: 35,
    restSeconds: 60,
    alternatives: ['hanging-leg-raise', 'cable-woodchopper', 'ab-wheel-rollout'],
    technique: {
      primaryMuscles: 'Прямая мышца живота с акцентом на верхнюю и среднюю часть',
      setup: 'Встаньте на колени перед верхним блоком с канатной рукоятью. Руки зафиксированы у лба или висков.',
      execution: 'Скручивайте грудную клетку по направлению к тазу исключительно силой пресса. Бедра неподвижны.',
      breathing: 'Мощный выдох при скручивании вниз, вдох при подконтрольном разгибании.',
      mistakes: ['Движение за счет сгибания в тазобедренных суставах', 'Тяга руками вместо сокращения пресса']
    }
  },
  'cable-woodchopper': {
    id: 'cable-woodchopper',
    name: 'Дровосек на блоке по диагонали',
    category: 'Core',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 20,
    restSeconds: 60,
    alternatives: ['cable-crunch', 'hanging-leg-raise', 'plank'],
    technique: {
      primaryMuscles: 'Косые мышцы живота, поперечная мышца, кор',
      setup: 'Боком к блоку на ширине плеч. Рукоять удерживается двумя руками на уровне груди.',
      execution: 'По диагонали поверните корпус с контролем бедер, прожимая косые мышцы.',
      breathing: 'Выдох на вращении, вдох при возврате в исходную точку.',
      mistakes: ['Вращение только в коленях', 'Резкий неконтролируемый возврат веса']
    }
  },
  'ab-wheel-rollout': {
    id: 'ab-wheel-rollout',
    name: 'Прокатка с гимнастическим роликом',
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 75,
    alternatives: ['plank', 'hanging-leg-raise', 'cable-crunch'],
    technique: {
      primaryMuscles: 'Прямая мышца живота, глубокие стабилизаторы позвоночника',
      setup: 'Стоя на коленях, ролик перед собой. Руки прямые, таз подкручен вперед.',
      execution: 'Катите ролик вперед, растягивая тело до параллели с полом. Прессом вернитесь назад.',
      breathing: 'Вдох при движении вперед, мощный выдох при возврате в исходную позицию.',
      mistakes: ['Прогиб в пояснице в нижней точке', 'Сгибание в локтях']
    }
  }
};

// Automatically attach verified 3D animated GIF URLs to all catalog exercises
for (const [id, item] of Object.entries(EXERCISE_CATALOG)) {
  if (EXERCISE_GIF_MAP[id]) {
    item.gifUrl = EXERCISE_GIF_MAP[id];
  }
}
