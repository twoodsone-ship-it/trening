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
  // ГРУДЬ (CHEST)
  'bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/EIeI8Vf.gif',
  'db-bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/SpYC0Kp.gif',
  'incline-db-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ns0SIbU.gif',
  'incline-barbell-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/3TZduzM.gif',
  'hammer-chest-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DOoWcnA.gif',
  'smith-bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/trqKQv2.gif',
  'dips-chest': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/O2K9Vb5.gif',
  'cable-crossover': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Pr9Rhf4.gif',
  'pec-deck-fly': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/xLYSdtg.gif',
  'cable-crossover-low': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/FVmZVhk.gif',
  'incline-db-fly': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ESOd5Pl.gif',
  'push-ups': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/I4hDWkc.gif',
  'decline-bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/GrO65fd.gif',
  'chest-dips-machine': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/PAgTVaK.gif',
  'dumbbell-pullover': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/9XjtHvS.gif',

  // СПИНА (BACK)
  'lat-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/qdRxqCj.gif',
  'pull-ups': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/lBDjFxJ.gif',
  'close-grip-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ecpY0rH.gif',
  'hammer-lat-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/7F1DVzn.gif',
  'barbell-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/eZyBC3j.gif',
  'db-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/C0MA9bC.gif',
  'seated-cable-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/fUBheHs.gif',
  't-bar-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/9pQSkH8.gif',
  'straight-arm-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/x69MAlq.gif',
  'chest-supported-db-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/7vG5o25.gif',
  'neutral-grip-pulldown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/rkg41Fb.gif',
  'deadlift-conventional': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ila4NZS.gif',
  'hyperextension': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/zhMwOwE.gif',
  'single-arm-cable-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/vpp9Ku2.gif',

  // НОГИ (LEGS)
  'barbell-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DhMl549.gif',
  'leg-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/2Qh2J1e.gif',
  'hack-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Qa55kX1.gif',
  'smith-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/jFtipLl.gif',
  'goblet-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/yn8yg1r.gif',
  'romanian-deadlift': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/wQ2c4XD.gif',
  'db-rdl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/rR0LJzx.gif',
  'leg-curls-lying': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/17lJ1kr.gif',
  'leg-extension': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/my33uHU.gif',
  'seated-leg-curl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Zg3XY7P.gif',
  'bulgarian-split-squat': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/qx4fgX7.gif',
  'walking-lunges': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/IZVHb27.gif',
  'standing-calf-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ykUOVze.gif',
  'seated-calf-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/bOOdeyc.gif',
  'hip-thrust': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/qg2PGl6.gif',
  'calf-press-leg-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ykHcWme.gif',

  // ПЛЕЧИ (SHOULDERS)
  'overhead-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/wdRZISl.gif',
  'seated-db-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/znQUdHY.gif',
  'hammer-shoulder-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DOoWcnA.gif',
  'smith-shoulder-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/jjUPrze.gif',
  'lateral-raises': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/DsgkuIt.gif',
  'cable-lateral-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/goJ6ezq.gif',
  'face-pulls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/CvPn9WV.gif',
  'arnold-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Xy4jlWA.gif',
  'rear-delt-fly-machine': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/myfUsKf.gif',
  'incline-rear-delt-fly': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/EAs3xL9.gif',
  'cable-upright-row': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/cALKspW.gif',
  'cable-front-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/u2X71Np.gif',
  'upright-row-barbell': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/UDlhcO8.gif',

  // РУКИ (ARMS)
  'bicep-curls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/4dUn2iv.gif',
  'db-incline-curls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/ae9UoXQ.gif',
  'hammer-curls': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/GNhAeJ0.gif',
  'cable-bicep-curl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/G08RZcQ.gif',
  'tricep-pushdown': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/3ZflifB.gif',
  'french-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/iZop9xO.gif',
  'overhead-cable-extension': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/2IxROQ1.gif',
  'preacher-curl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/hacCyUv.gif',
  'concentration-curl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/gvsWLQw.gif',
  'cable-rope-hammer-curl': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/HPlPoQA.gif',
  'skull-crushers': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/h8LFzo9.gif',
  'close-grip-bench-press': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/J6Dx1Mu.gif',
  'overhead-rope-extension': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/NN8nSNT.gif',
  'tricep-dips': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/X6C6i5Y.gif',
  'bench-dips': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/Wgbn9qo.gif',

  // КОР И ПРЕСС (CORE)
  'plank': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/VBAWRPG.gif',
  'hanging-leg-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/I3tsCnC.gif',
  'cable-crunch': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/WW95auq.gif',
  'cable-woodchopper': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/aVs3BR3.gif',
  'ab-wheel-rollout': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/KtRomty.gif',
  'decline-crunch': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/9Ap7miY.gif',
  'hanging-knee-raise': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/03lzqwk.gif',
  'russian-twist': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/WU9BLIs.gif',
  'cable-side-bend': 'https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/media/wPypxFY.gif',
};

export const EXERCISE_CATALOG: Record<string, CatalogExerciseItem> = {
  // ==========================================
  // ГРУДЬ (CHEST)
  // ==========================================
  'bench-press': {
    id: 'bench-press',
    name: "Жим штанги лёжа на горизонтальной скамье",
    category: 'Chest',
    equipment: 'barbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 75,
    restSeconds: 120,
    alternatives: ["db-bench-press","hammer-chest-press","smith-bench-press","dips-chest","cable-crossover","incline-db-press","decline-bench-press","push-ups"],
    technique: {
      primaryMuscles: "Большая грудная мышца (стернальная часть), передняя дельта, трицепс",
      setup: "Глаза под грифом. Лопатки жестко сведены и опущены к тазу (грудь колесом). Ноги всей стопой упираются в пол. Хват шире плеч, предплечья вертикальны в нижней точке.",
      execution: "Опустите штангу по дуге на линию сосков. Локти под углом 70-75° к корпусу (не 90°!). Мощно выжмите гриф вверх и чуть к лицу, не отрывая лопатки от скамьи.",
      breathing: "Глубокий вдох при опускании штанги к груди, мощный выдох после прохождения критической точки подъема.",
      mistakes: [
        "Разведение локтей на 90° перпендикулярно корпусу (перегрузка плечевых суставов)",
        "Отрыв ягодиц от скамьи и отбив грифа от грудной клетки",
        "Потеря сведения лопаток в верхней точке"
      ]
    }
  },
  'db-bench-press': {
    id: 'db-bench-press',
    name: "Жим гантелей лёжа на горизонтальной скамье",
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 26,
    restSeconds: 90,
    alternatives: ["bench-press","hammer-chest-press","smith-bench-press","incline-db-press","cable-crossover","decline-bench-press","push-ups","incline-db-fly"],
    technique: {
      primaryMuscles: "Большая грудная мышца (увеличенная амплитуда растяжения), трицепс",
      setup: "Забросьте гантели с коленей при откидывании на скамью. Лопатки сведены. Гантели держите под небольшим углом (стрела), а не в одну линию.",
      execution: "Опускайте гантели по дуге до глубокого комфортного растяжения грудных. На выдохе сведите их вверх по дуге над грудью, не соударяя блинами.",
      breathing: "Вдох при глубоком подконтрольном опускании, выдох на жиме вверх.",
      mistakes: [
        "Соударение гантелей в верхней точке (снимает полезную нагрузку)",
        "Чрезмерное опускание локтей ниже допустимой мобильности плеча"
      ]
    }
  },
  'incline-db-press': {
    id: 'incline-db-press',
    name: "Жим гантелей на наклонной скамье (30°)",
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 24,
    restSeconds: 90,
    alternatives: ["incline-barbell-press","bench-press","db-bench-press","hammer-chest-press","cable-crossover","incline-db-fly","cable-crossover-low"],
    technique: {
      primaryMuscles: "Верхняя (ключичная) порция грудных мышц, передняя дельта",
      setup: "Угол скамьи 30° (максимум 45°). Стопы прочно на полу, поясница прижата с естественным прогибом, лопатки сведены.",
      execution: "Опускайте гантели к верху груди. На выдохе жмите строго вертикально, фокусируясь на сжатии верхних волокон груди.",
      breathing: "Вдох на спуске, выдох на жиме вверх.",
      mistakes: [
        "Слишком высокий наклон скамьи (нагрузка уходит с груди в дельты)",
        "Разведение локтей в стороны"
      ]
    }
  },
  'incline-barbell-press': {
    id: 'incline-barbell-press',
    name: "Жим штанги на наклонной скамье",
    category: 'Chest',
    equipment: 'barbell',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 90,
    alternatives: ["incline-db-press","bench-press","hammer-chest-press","smith-bench-press","incline-db-fly","cable-crossover-low"],
    technique: {
      primaryMuscles: "Верхняя часть груди, трицепсы, передние дельтовидные",
      setup: "Угол наклона скамьи 30°. Лопатки сведены, хват средний. Гриф на уровне подбородка в старте.",
      execution: "Опускайте гриф на верхнюю треть груди под ключицы. Мощным подконтрольным усилием жмите вверх.",
      breathing: "Вдох в эксцентрической фазе, выдох в концентрической.",
      mistakes: [
        "Опускание грифа на горло или живот",
        "Отрыв таза от скамьи"
      ]
    }
  },
  'hammer-chest-press': {
    id: 'hammer-chest-press',
    name: "Жим от груди в тренажере Хаммер (Hammer Press)",
    category: 'Chest',
    equipment: 'machine',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 60,
    restSeconds: 75,
    alternatives: ["bench-press","db-bench-press","smith-bench-press","cable-crossover","dips-chest","chest-dips-machine","decline-bench-press"],
    technique: {
      primaryMuscles: "Большая грудная мышца (изолированная безопасная траектория)",
      setup: "Высота сиденья настраивается так, чтобы рукоятки находились на высоте сосков. Лопатки сведены и прижаты к спинке.",
      execution: "Выжмите рукоятки вперед, сжимая грудь в пиковой точке на 1 секунду. Медленно вернитесь назад до легкого растяжения.",
      breathing: "Выдох при жиме от себя, вдох при возврате.",
      mistakes: [
        "Выдвижение плеч вперед в конце движения",
        "Резкое падение веса"
      ]
    }
  },
  'smith-bench-press': {
    id: 'smith-bench-press',
    name: "Жим лёжа в тренажере Смита",
    category: 'Chest',
    equipment: 'machine',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 65,
    restSeconds: 90,
    alternatives: ["bench-press","hammer-chest-press","db-bench-press","decline-bench-press","push-ups"],
    technique: {
      primaryMuscles: "Грудные мышцы, трицепсы (стабилизация направляющими)",
      setup: "Скамья точно по центру направляющих. Гриф опускается на середину груди.",
      execution: "Снимите гриф с крюков поворотом кисти. Плавно опустите и выжмите вверх.",
      breathing: "Вдох при опускании, выдох при жиме.",
      mistakes: [
        "Неправильное позиционирование скамьи (гриф режет плечо)",
        "Резкая блокировка локтей"
      ]
    }
  },
  'dips-chest': {
    id: 'dips-chest',
    name: "Отжимания на брусьях с наклоном вперед",
    category: 'Chest',
    equipment: 'bodyweight',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 90,
    alternatives: ["bench-press","db-bench-press","hammer-chest-press","cable-crossover","chest-dips-machine","decline-bench-press","push-ups"],
    technique: {
      primaryMuscles: "Нижняя порция грудных мышц, трицепс, передняя дельта",
      setup: "Упор на брусьях. Наклоните корпус вперед на 30°, локти слегка разведите в стороны, подбородок прижат к груди.",
      execution: "Опускайтесь до угла 90° в локтях. Мощно выжимайте себя вверх за счет сведения груди.",
      breathing: "Вдох при спуске, выдох на подъеме.",
      mistakes: [
        "Строго вертикальный корпус (смещает нагрузку на трицепс)",
        "Слишком глубокий провал с перегрузкой связок плеча"
      ]
    }
  },
  'cable-crossover': {
    id: 'cable-crossover',
    name: "Сведение рук в кроссовере на блоках",
    category: 'Chest',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 20,
    restSeconds: 60,
    alternatives: ["pec-deck-fly","bench-press","db-bench-press","hammer-chest-press","cable-crossover-low","incline-db-fly","dumbbell-pullover"],
    technique: {
      primaryMuscles: "Грудные мышцы (пиковое сокращение и сведение)",
      setup: "Блоки на уровне плеч или выше. Шаг вперед в разножку для баланса, корпус чуть наклонен. Руки слегка согнуты в локтях.",
      execution: "Сводите рукоятки по широкой дуге перед собой, сжимая грудные мышцы в точке касания. Медленно разводите назад.",
      breathing: "Выдох на сведении рук, вдох на разведении.",
      mistakes: [
        "Сгибание и разгибание рук как при жиме",
        "Раскачка корпусом"
      ]
    }
  },
  'pec-deck-fly': {
    id: 'pec-deck-fly',
    name: "Сведение рук в тренажере Бабочка (Pec-Deck)",
    category: 'Chest',
    equipment: 'machine',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 60,
    alternatives: ["cable-crossover","db-bench-press","hammer-chest-press","incline-db-fly","cable-crossover-low","dumbbell-pullover"],
    technique: {
      primaryMuscles: "Изолированное сведение грудных мышц",
      setup: "Спина и затылок прижаты к спинке. Рукоятки на уровне середины груди, локти мягкие.",
      execution: "Сводите рукоятки перед грудью усилием грудных мышц. Фиксация на 1 секунду.",
      breathing: "Выдох на сведении, вдох при раскрытии грудной клетки.",
      mistakes: [
        "Чрезмерное переразгибание плеча назад",
        "Отрыв спины от подушки"
      ]
    }
  },
  'cable-crossover-low': {
    id: 'cable-crossover-low',
    name: "Сведение рук на нижних блоках снизу вверх (кроссовер)",
    category: 'Chest',
    equipment: 'cable',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 1.25,
    defaultWeight: 12.5,
    restSeconds: 60,
    alternatives: ["cable-crossover","incline-db-press","incline-db-fly","pec-deck-fly"],
    technique: {
      primaryMuscles: "Ключичная (верхняя) часть большой грудной мышцы, передняя дельта",
      setup: "Блоки установлены в самое нижнее положение. Возьмите D-рукояти, сделайте небольшой шаг вперед для натяжения тросов. Корпус чуть наклонен вперед, грудь расправлена, локти слегка согнуты.",
      execution: "По дугообразной траектории сводите руки снизу вверх перед собой на уровне верхней части груди или подбородка. В верхней точке задержитесь на 1 секунду для пикового сокращения.",
      breathing: "Выдох при сведении рук вверх, вдох при подконтрольном опускании в исходное положение.",
      mistakes: [
        "Помощь корпусом и раскачка (читинг)",
        "Чрезмерное сгибание локтей, превращающее движение в подъем на бицепс",
        "Потеря контроля и скругление плеч в нижней точке"
      ]
    }
  },
  'incline-db-fly': {
    id: 'incline-db-fly',
    name: "Разводка гантелей на наклонной скамье",
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 14,
    restSeconds: 75,
    alternatives: ["incline-db-press","cable-crossover-low","pec-deck-fly","cable-crossover","incline-barbell-press"],
    technique: {
      primaryMuscles: "Верхняя часть большой грудной мышцы (ключичный пучок), передняя дельта",
      setup: "Установите скамью под углом 30-45°. Возьмите гантели, плотно прижмите лопатки к скамье, ступни надежно уприте в пол. Руки подняты над грудью, локти слегка согнуты и зафиксированы.",
      execution: "Медленно разводите руки в стороны по широкой дуге, растягивая верх груди, пока локти не окажутся на уровне плеч. Мощным сведением грудных мышц верните гантели в верхнюю точку по той же траектории.",
      breathing: "Глубокий вдох при растяжении груди вниз, мощный выдох при сведении гантелей вверху.",
      mistakes: [
        "Опускание локтей слишком низко с риском для плечевого сустава",
        "Выпрямление локтей в замок или их чрезмерное сгибание",
        "Отрыв лопаток и поясницы от скамьи"
      ]
    }
  },
  'push-ups': {
    id: 'push-ups',
    name: "Отжимания от пола с паузой в нижней точке",
    category: 'Chest',
    equipment: 'bodyweight',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 12,
    maxReps: 20,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ["bench-press","db-bench-press","dips-chest","chest-dips-machine"],
    technique: {
      primaryMuscles: "Большая грудная мышца, передняя дельта, трицепс, мышцы кора",
      setup: "Упор лежа на прямых руках. Кисти чуть шире плеч, пальцы направлены слегка наружу. Тело составляет прямую линию от макушки до пяток, ягодицы и пресс жестко напряжены.",
      execution: "Контролируемо опускайтесь вниз, направляя локти под углом 45-60° к корпусу, почти касаясь грудью пола. Задержитесь в нижней точке на 1 секунду для устранения инерции, затем мощно выжмите себя вверх.",
      breathing: "Вдох при опускании тела вниз, мощный выдох при выжимании наверх.",
      mistakes: [
        "Провисание таза и прогиб в пояснице",
        "Разведение локтей в стороны под 90° (стрела вместо Т-положения)",
        "Неполная амплитуда без касания пола грудью"
      ]
    }
  },
  'decline-bench-press': {
    id: 'decline-bench-press',
    name: "Жим штанги на скамье с обратным наклоном",
    category: 'Chest',
    equipment: 'barbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 70,
    restSeconds: 120,
    alternatives: ["bench-press","dips-chest","chest-dips-machine","db-bench-press"],
    technique: {
      primaryMuscles: "Нижняя (абдоминальная) часть большой грудной мышцы, трицепс",
      setup: "Отрегулируйте скамью на обратный наклон 15-30°. Надежно зафиксируйте голени под валиками. Лопатки жестко сведены и вдавлены в скамью. Хват средний, чуть шире плеч.",
      execution: "Снимите штангу и плавно опустите гриф на нижний край грудных мышц (под соски). Локти держите под углом 60-70° к корпусу. Мощным усилием нижней части груди выжмите гриф вверх.",
      breathing: "Вдох при подконтрольном опускании грифа, акцентированный выдох при прохождении мертвой точки подъема.",
      mistakes: [
        "Слишком крутой угол наклона скамьи с приливом крови к голове",
        "Опускание грифа слишком высоко к горлу",
        "Отрыв таза или поясницы от поверхности скамьи"
      ]
    }
  },
  'chest-dips-machine': {
    id: 'chest-dips-machine',
    name: "Отжимания на брусьях в гравитроне (тренажере с компенсацией)",
    category: 'Chest',
    equipment: 'machine',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 25,
    restSeconds: 90,
    alternatives: ["dips-chest","push-ups","decline-bench-press","cable-crossover"],
    technique: {
      primaryMuscles: "Нижняя и стернальная части большой грудной мышцы, передняя дельта, трицепс",
      setup: "Установите нужный противовес на стеке тренажера. Встаньте коленями на платформу, возьмитесь за широкие рукояти. Наклоните корпус вперед примерно на 30°, локти направьте слегка в стороны.",
      execution: "Плавно опускайтесь вниз до угла 90° в локтях, чувствуя растяжение грудных мышц. Сохраняя наклон корпуса вперед, мощно выжмите себя вверх усилием грудных.",
      breathing: "Вдох при плавном опускании вниз, выдох при подъеме наверх.",
      mistakes: [
        "Строго вертикальное положение корпуса (переносит нагрузку на трицепс)",
        "Слишком глубокий провал с чрезмерным растяжением плечевых связок",
        "Резкие рывки платформы"
      ]
    }
  },
  'dumbbell-pullover': {
    id: 'dumbbell-pullover',
    name: "Пулловер с гантелью лёжа на скамье",
    category: 'Chest',
    equipment: 'dumbbell',
    animationType: 'incline-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 22,
    restSeconds: 75,
    alternatives: ["cable-crossover","incline-db-fly","straight-arm-pulldown","pec-deck-fly"],
    technique: {
      primaryMuscles: "Большая грудная мышца (верхняя часть), широчайшие мышцы спины, зубчатые мышцы",
      setup: "Лягте поперек или вдоль скамьи. Возьмите гантель обеими руками за верхний диск изнутри открытым хватом в замок. Поднимите ее над грудью, слегка согнув руки в локтях.",
      execution: "Медленно опускайте гантель за голову по широкой дуге, ощущая глубокое растяжение грудной клетки и широчайших. Достигнув уровня скамьи, усилием грудных верните гантель в исходное положение.",
      breathing: "Глубокий вдох при опускании гантели за голову для максимального раскрытия грудной клетки, выдох при возвращении.",
      mistakes: [
        "Сгибание и разгибание рук в локтях (превращение в разгибание на трицепс)",
        "Опускание таза вниз синхронно с гантелью",
        "Использование избыточного веса с перегрузкой плечевых суставов"
      ]
    }
  },
  // ==========================================
  // СПИНА (BACK)
  // ==========================================
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: "Тяга верхнего блока к груди широким хватом",
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 65,
    restSeconds: 90,
    alternatives: ["pull-ups","close-grip-pulldown","hammer-lat-pulldown","barbell-row","seated-cable-row","neutral-grip-pulldown","straight-arm-pulldown"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины, большая круглая, бицепс, ромбовидные",
      setup: "Бедра зафиксированы валиками. Хват шире плеч. Корпус отклонен назад всего на 10-15°, грудь направлена к грифу.",
      execution: "Движение начинается со сведения лопаток. Ведите локти вниз и слегка назад к карманам, касаясь верхней части груди.",
      breathing: "Выдох при опускании рукояти к груди, вдох при плавном контролируемом возврате вверх.",
      mistakes: [
        "Тяга за шею (высокий риск травмы шейного отдела)",
        "Сильное раскачивание корпусом назад (читинг)",
        "Тяга кистями и бицепсом вместо спины"
      ]
    }
  },
  'pull-ups': {
    id: 'pull-ups',
    name: "Подтягивания на перекладине широким хватом",
    category: 'Back',
    equipment: 'bodyweight',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 120,
    alternatives: ["lat-pulldown","close-grip-pulldown","hammer-lat-pulldown","neutral-grip-pulldown","straight-arm-pulldown"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины, бицепсы, предплечья, мышцы кора",
      setup: "Хват закрытый шире плеч. В висе активируйте плечевой пояс (лопатки опущены). Пресс напряжен.",
      execution: "Подтягивайтесь грудью к перекладине, направляя локти вниз. В верхней точке подбородок выше перекладины.",
      breathing: "Выдох при движении вверх, вдох при спуске.",
      mistakes: [
        "Рывки ногами и переразгибание поясницы (дрыгание)",
        "Неполная амплитуда без растяжения внизу"
      ]
    }
  },
  'close-grip-pulldown': {
    id: 'close-grip-pulldown',
    name: "Тяга верхнего блока узким параллельным хватом",
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 75,
    alternatives: ["lat-pulldown","pull-ups","seated-cable-row","hammer-lat-pulldown","neutral-grip-pulldown","straight-arm-pulldown"],
    technique: {
      primaryMuscles: "Нижняя часть широчайших, брахиалис, бицепс",
      setup: "Установите V-образную рукоять. Сядьте ровно, грудь подайте вперед.",
      execution: "Тяните V-рукоять к верху груди, максимально уводя локти вниз вдоль тела.",
      breathing: "Выдох при тяге, вдох при растяжении вверх.",
      mistakes: [
        "Скругление грудного отдела",
        "Отклонение назад дальше 25 градусов"
      ]
    }
  },
  'hammer-lat-pulldown': {
    id: 'hammer-lat-pulldown',
    name: "Рычажная вертикальная тяга в тренажере Хаммер",
    category: 'Back',
    equipment: 'machine',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 70,
    restSeconds: 90,
    alternatives: ["lat-pulldown","pull-ups","seated-cable-row","neutral-grip-pulldown","straight-arm-pulldown"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины (независимая работа левой и правой сторон)",
      setup: "Отрегулируйте сиденье так, чтобы руки в верхней точке были полностью вытянуты.",
      execution: "Тяните рукояти книзу, прожимая спину в нижней точке.",
      breathing: "Выдох на усилии, вдох на возврате.",
      mistakes: [
        "Асимметричная тяга одной рукой",
        "Подъем плеч к ушам"
      ]
    }
  },
  'barbell-row': {
    id: 'barbell-row',
    name: "Тяга штанги в наклоне к поясу",
    category: 'Back',
    equipment: 'barbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 120,
    alternatives: ["db-row","seated-cable-row","t-bar-row","lat-pulldown","chest-supported-db-row","deadlift-conventional"],
    technique: {
      primaryMuscles: "Толщина широчайших, ромбовидные, средняя трапеция, разгибатели спины",
      setup: "Наклон корпуса 45-60°, колени согнуты. Спина абсолютно прямая с естественным прогибом. Хват на ширине плеч.",
      execution: "Тяните штангу к низу живота (к пупку), ведя локти вдоль корпуса и максимально сводя лопатки.",
      breathing: "Выдох при тяге к поясу, вдох при контролируемом опускании грифа к коленям.",
      mistakes: [
        "Скругление поясницы горбом (опасно для межпозвоночных дисков)",
        "Тяга к груди вместо живота"
      ]
    }
  },
  'db-row': {
    id: 'db-row',
    name: "Тяга гантели к поясу в наклоне с упором в скамью",
    category: 'Back',
    equipment: 'dumbbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 26,
    restSeconds: 75,
    alternatives: ["barbell-row","seated-cable-row","t-bar-row","chest-supported-db-row","single-arm-cable-row"],
    technique: {
      primaryMuscles: "Широчайшая мышца спины (глубокая растяжка и изолированная работа стороны)",
      setup: "Колено и ладонь на скамье. Опорная нога на полу. Спина параллельна полу. Гантель висит на прямой руке.",
      execution: "Ведите локоть строго по дуге назад к карману брюк, сжимая ширчайшую. Корпус не разворачивать!",
      breathing: "Выдох при подъеме гантели, вдох при растяжении книзу.",
      mistakes: [
        "Вращение корпуса вокруг своей оси (читинг)",
        "Тяга к плечу силой бицепса"
      ]
    }
  },
  'seated-cable-row': {
    id: 'seated-cable-row',
    name: "Горизонтальная тяга блока к поясу сидя",
    category: 'Back',
    equipment: 'cable',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 50,
    restSeconds: 75,
    alternatives: ["barbell-row","db-row","t-bar-row","lat-pulldown","single-arm-cable-row","chest-supported-db-row"],
    technique: {
      primaryMuscles: "Середина спины, ромбовидные мышцы, широчайшие",
      setup: "Сядьте прямо, стопы в упорах, колени слегка согнуты. Спина перпендикулярна полу.",
      execution: "Тяните рукоять к пупку, разводя плечи назад и сводя лопатки вместе. Пауза 1 секунда.",
      breathing: "Выдох при подтягивании рукояти, вдох при выпрямлении рук.",
      mistakes: [
        "Раскачка корпусом вперед-назад по инерции",
        "Подъем плеч к ушам"
      ]
    }
  },
  't-bar-row': {
    id: 't-bar-row',
    name: "Тяга Т-грифа с упором",
    category: 'Back',
    equipment: 'barbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 90,
    alternatives: ["barbell-row","db-row","seated-cable-row","chest-supported-db-row","deadlift-conventional"],
    technique: {
      primaryMuscles: "Массив спины, ромбовидные, трапециевидные",
      setup: "Ноги по сторонам грифа, наклон 45°. Хват параллельный или широкий.",
      execution: "Тяните рукоять к груди/животу, мощно сводя лопатки.",
      breathing: "Выдох на тяге, вдох на опускании.",
      mistakes: [
        "Скругление спины",
        "Использование веса, ломающего технику"
      ]
    }
  },
  'straight-arm-pulldown': {
    id: 'straight-arm-pulldown',
    name: "Пуловер на блоке прямыми руками на широчайшие",
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 30,
    restSeconds: 60,
    alternatives: ["lat-pulldown","close-grip-pulldown","neutral-grip-pulldown","dumbbell-pullover"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины, большая круглая мышца, зубчатые мышцы",
      setup: "Закрепите прямую или канатную рукоять на верхнем блоке. Отойдите на шаг назад, наклоните корпус вперед на 30-45°, колени слегка согнуты. Руки выпрямлены перед собой с легким мягким изгибом в локтях.",
      execution: "Не сгибая руки в локтях, мощно притяните рукоять по широкой дуге вниз к бедрам исключительно усилием широчайших. В нижней точке прижмите локти к корпусу и зафиксируйте пиковое сокращение на 1 секунду.",
      breathing: "Вдох в исходной позиции при растяжении широчайших вверх, мощный выдох при протяжке рукояти к бедрам.",
      mistakes: [
        "Сгибание рук в локтях (включение трицепса)",
        "Сильная раскачка корпусом вперед-назад",
        "Подъем плеч к ушам"
      ]
    }
  },
  'chest-supported-db-row': {
    id: 'chest-supported-db-row',
    name: "Тяга гантелей с упором грудью на наклонную скамью",
    category: 'Back',
    equipment: 'dumbbell',
    animationType: 'row',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 22,
    restSeconds: 90,
    alternatives: ["barbell-row","db-row","t-bar-row","seated-cable-row"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины, ромбовидные, средняя и нижняя части трапеции",
      setup: "Установите скамью под углом 30-40°. Лягте грудью на спинку, ноги жестко уприте в пол. Возьмите гантели нейтральным или полупронированным хватом, руки свободно опущены вниз.",
      execution: "На выдохе потяните локти назад и вверх вдоль корпуса, сводя лопатки в верхней точке. Не отрывайте грудь от скамьи! Плавно опустите гантели, полностью растягивая мышцы спины.",
      breathing: "Вдох при опускании гантелей вниз, выдох при мощной тяге к поясу.",
      mistakes: [
        "Отрыв груди от скамьи за счет разгибания поясницы",
        "Тяга предплечьями и бицепсом вместо движения локтями назад",
        "Рывки и резкое бросание веса"
      ]
    }
  },
  'neutral-grip-pulldown': {
    id: 'neutral-grip-pulldown',
    name: "Тяга верхнего блока параллельным хватом",
    category: 'Back',
    equipment: 'cable',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 55,
    restSeconds: 75,
    alternatives: ["lat-pulldown","close-grip-pulldown","pull-ups","straight-arm-pulldown"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины, плечелучевая мышца, ромбовидные мышцы",
      setup: "Закрепите V-образную или двухручную параллельную рукоять на верхнем блоке. Сядьте в тренажер, плотно зафиксировав бедра под валиками. Возьмитесь за рукояти нейтральным хватом (ладони внутрь).",
      execution: "Слегка отклоните торс назад (10-15°), расправьте грудь. На выдохе потяните локти строго вниз и назад, направляя рукоять к верхней части груди. Задержитесь на полсекунды в нижней точке.",
      breathing: "Вдох при подконтрольном возвращении вверх с полным растяжением, выдох на усилии тяги вниз.",
      mistakes: [
        "Чрезмерный наклон корпуса назад превращающий тягу в горизонтальную",
        "Сутулость и скругление плеч вперед в нижней точке",
        "Инерционный читинг рывком спины"
      ]
    }
  },
  'deadlift-conventional': {
    id: 'deadlift-conventional',
    name: "Становая тяга классическая со штангой",
    category: 'Back',
    equipment: 'barbell',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 5,
    maxReps: 8,
    weightStep: 5,
    defaultWeight: 90,
    restSeconds: 150,
    alternatives: ["romanian-deadlift","barbell-row","hyperextension","t-bar-row"],
    technique: {
      primaryMuscles: "Разгибатели позвоночника, ягодичные мышцы, бицепс бедра, широчайшие и трапециевидные",
      setup: "Подойдите к штанге так, чтобы гриф проходил над серединой стоп. Стопы на ширине плеч. Наклонитесь и возьмитесь за гриф прямым хватом чуть шире бедер. Опустите таз, сведите лопатки, грудь подайте вперед, спина идеально прямая.",
      execution: "Сделайте глубокий вдох, напрягите кор. Мощным толчком ног в пол начните подъем, ведя гриф вплотную вдоль голеней и бедер. Полностью выпрямитесь в тазобедренных суставах, не переразгибая поясницу.",
      breathing: "Глубокий вдох внизу, задержка дыхания на фазе подъема (маневр Вальсальвы), выдох в верхней точке фиксации.",
      mistakes: [
        "Скругление спины горбом («рыбалка»)",
        "Отдаление штанги от тела во время движения",
        "Переразгибание назад в верхней точке",
        "Опережающий подъем таза в начале движения"
      ]
    }
  },
  'hyperextension': {
    id: 'hyperextension',
    name: "Гиперэкстензия для разгибателей спины и ягодиц",
    category: 'Back',
    equipment: 'bodyweight',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 10,
    restSeconds: 60,
    alternatives: ["deadlift-conventional","romanian-deadlift","db-rdl","barbell-row"],
    technique: {
      primaryMuscles: "Разгибатели позвоночника (поясница), большая ягодичная мышца, задняя поверхность бедра",
      setup: "Отрегулируйте подушки тренажера так, чтобы их верхний край находился чуть ниже уровня тазобедренного сгиба (для свободного движения таза). Заведите стопы под валики, скрестите руки на груди.",
      execution: "Плавно опустите корпус вниз до угла около 70-90°, сохраняя естественный нейтральный прогиб в позвоночнике. Усилием ягодиц и поясницы плавно поднимитесь до образования прямой линии с ногами. Не переразгибайтесь назад!",
      breathing: "Вдох при плавном наклоне вниз, выдох при подъеме корпуса вверх.",
      mistakes: [
        "Чрезмерное переразгибание туловища назад в верхней точке",
        "Резкие рывковые движения с закидыванием шеи",
        "Слишком высокая настройка подушек, блокирующая сгибание в тазу"
      ]
    }
  },
  'single-arm-cable-row': {
    id: 'single-arm-cable-row',
    name: "Тяга нижнего блока одной рукой",
    category: 'Back',
    equipment: 'cable',
    animationType: 'row',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 27.5,
    restSeconds: 60,
    alternatives: ["seated-cable-row","db-row","chest-supported-db-row","t-bar-row"],
    technique: {
      primaryMuscles: "Широчайшие мышцы спины (глубокая проработка), ромбовидные, задняя дельта",
      setup: "Прикрепите D-рукоять к нижнему блоку. Сядьте на скамью, упритесь ногами в упоры с легким изгибом в коленях. Возьмите рукоять одной рукой, выпрямите спину, плечо вытянуто вперед для предрастяжения широчайшей.",
      execution: "Потяните рукоять к поясу, направляя локоть назад вплотную к корпусу и одновременно слегка разворачивая кисть ладонью вверх (супинация). Сожмите широчайшую в пиковой точке, затем плавно вернитесь вперед.",
      breathing: "Вдох на растяжении вперед, акцентированный выдох на тяге к поясу.",
      mistakes: [
        "Чрезмерная ротация и закручивание корпуса",
        "Тяга бицепсом без отведения плеча и локтя назад",
        "Скругление грудного отдела спины"
      ]
    }
  },
  // ==========================================
  // НОГИ (LEGS)
  // ==========================================
  'barbell-squat': {
    id: 'barbell-squat',
    name: "Приседания со штангой на спине",
    category: 'Legs',
    equipment: 'barbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 5,
    defaultWeight: 90,
    restSeconds: 150,
    alternatives: ["leg-press","hack-squat","smith-squat","goblet-squat","romanian-deadlift","bulgarian-split-squat","walking-lunges","leg-extension"],
    technique: {
      primaryMuscles: "Квадрицепсы, большая ягодичная мышца, приводящие, разгибатели позвоночника",
      setup: "Гриф на верхней части трапеции. Стопы чуть шире плеч, носки развернуты на 20-30°. Пресс жестко напряжен (внутрибрюшное давление).",
      execution: "Отводя таз назад и одновременно сгибая колени, опуститесь до параллели бедер с полом. На выдохе мощно встаньте, толкаясь всей стопой.",
      breathing: "Глубокий вдох в живот перед опусканием, задержка дыхания на спуске, выдох после прохождения параллели.",
      mistakes: [
        "Сведение коленей внутрь (вальгус — риск травмы менисков)",
        "Отрыв пяток от пола (перегрузка коленных связок)",
        "Клевок таза и скругление поясницы в нижней точке"
      ]
    }
  },
  'leg-press': {
    id: 'leg-press',
    name: "Жим ногами в тренажере под углом 45°",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'leg-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 10,
    defaultWeight: 150,
    restSeconds: 90,
    alternatives: ["barbell-squat","hack-squat","smith-squat","goblet-squat","calf-press-leg-press","leg-extension","bulgarian-split-squat"],
    technique: {
      primaryMuscles: "Квадрицепсы, ягодичные мышцы (без осевой нагрузки на позвоночник)",
      setup: "Спина и таз плотно вжаты в кресло. Стопы на ширине плеч по центру платформы.",
      execution: "Опускайте платформу до прямого угла в коленях. Выжимайте платформу пятками, не разгибая колени до щелчка в замок.",
      breathing: "Вдох при опускании платформы, выдох при выжимании вверх.",
      mistakes: [
        "Полная блокировка коленных суставов в верхней точке (крайне травмоопасно!)",
        "Отрыв поясницы и крестца от спинки сиденья"
      ]
    }
  },
  'hack-squat': {
    id: 'hack-squat',
    name: "Приседания в Гакк-тренажере (Hack Squat)",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 80,
    restSeconds: 90,
    alternatives: ["barbell-squat","leg-press","smith-squat","leg-extension","bulgarian-split-squat"],
    technique: {
      primaryMuscles: "Изолированная нагрузка на квадрицепсы",
      setup: "Плечи под подушками, спина прижата к каретке. Стопы ближе к нижнему краю для квадрицепса.",
      execution: "Опускайтесь плавно до глубокого сгибания в коленях, мощно выжимайте каретку вверх.",
      breathing: "Вдох при спуске, выдох при подъеме.",
      mistakes: [
        "Отрыв пяток от платформы",
        "Блокировка коленей вверху"
      ]
    }
  },
  'smith-squat': {
    id: 'smith-squat',
    name: "Приседания в тренажере Смита",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 70,
    restSeconds: 90,
    alternatives: ["barbell-squat","leg-press","hack-squat","bulgarian-split-squat","walking-lunges"],
    technique: {
      primaryMuscles: "Квадрицепсы и ягодицы с поддержкой равновесия",
      setup: "Стопы выставьте на 15-20 см вперед от линии грифа. Гриф на трапециях.",
      execution: "Приседайте как будто садитесь на стул. Вертикальная спина благодаря траектории Смита.",
      breathing: "Вдох на опускании, выдох на подъеме.",
      mistakes: [
        "Стопы строго под грифом (ломает колени)",
        "Слишком большой наклон вперед"
      ]
    }
  },
  'goblet-squat': {
    id: 'goblet-squat',
    name: "Кубковые приседания с гантелью у груди (Goblet Squat)",
    category: 'Legs',
    equipment: 'dumbbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2,
    defaultWeight: 24,
    restSeconds: 60,
    alternatives: ["barbell-squat","leg-press","bulgarian-split-squat","walking-lunges"],
    technique: {
      primaryMuscles: "Квадрицепсы, ягодичные, мышцы кора",
      setup: "Держите гантель вертикально обеими ладонями перед грудью. Локти направлены вниз.",
      execution: "Опускайтесь глубоко, разводя колени в стороны. Локти проходят внутри коленей.",
      breathing: "Вдох на опускании, выдох на подъеме.",
      mistakes: [
        "Наклон корпуса вперед и отрыв пятки"
      ]
    }
  },
  'romanian-deadlift': {
    id: 'romanian-deadlift',
    name: "Румынская тяга со штангой (RDL)",
    category: 'Legs',
    equipment: 'barbell',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 80,
    restSeconds: 120,
    alternatives: ["db-rdl","leg-curls-lying","barbell-squat","leg-press","deadlift-conventional","hyperextension","seated-leg-curl","hip-thrust"],
    technique: {
      primaryMuscles: "Бицепс бедра, большая ягодичная мышца, разгибатели поясницы",
      setup: "Стопы на ширине таза. Штанга в руках у бедер. Лопатки сведены, спина прямая.",
      execution: "Отводя таз назад и слегка согнув колени, ведите штангу вдоль бедер и голеней до середины голени, растягивая заднюю поверхность бедра.",
      breathing: "Вдох при наклоне и отведении таза, мощный выдох при сжатии ягодиц на подъеме.",
      mistakes: [
        "Скругление спины горбом",
        "Приседание коленями вперед вместо отведения таза назад"
      ]
    }
  },
  'db-rdl': {
    id: 'db-rdl',
    name: "Румынская тяга с гантелями",
    category: 'Legs',
    equipment: 'dumbbell',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 24,
    restSeconds: 75,
    alternatives: ["romanian-deadlift","leg-curls-lying","seated-leg-curl","hyperextension","hip-thrust"],
    technique: {
      primaryMuscles: "Задняя поверхность бедра, ягодичные мышцы",
      setup: "Гантели перед бедрами. Плечи расправлены, взгляд вперед-вниз.",
      execution: "Отводите ягодицы назад, ведя гантели вплотную к ногам до уровня колен или чуть ниже.",
      breathing: "Вдох на спуске, выдох при разгибании корпуса.",
      mistakes: [
        "Отведение гантелей далеко от ног",
        "Сгибание коленей как в приседе"
      ]
    }
  },
  'leg-curls-lying': {
    id: 'leg-curls-lying',
    name: "Сгибания ног лёжа в тренажере",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 40,
    restSeconds: 60,
    alternatives: ["romanian-deadlift","db-rdl","seated-leg-curl"],
    technique: {
      primaryMuscles: "Изолированная проработка бицепса бедра",
      setup: "Ложитесь на живот, валик упирается чуть выше ахиллова сухожилия. Колени чуть свисают со скамьи.",
      execution: "Сгибайте ноги усилием бицепса бедра до касания ягодиц. Медленно опускайте вес.",
      breathing: "Выдох при сгибании ног, вдох при разгибании.",
      mistakes: [
        "Отрыв таза от скамьи при сгибании"
      ]
    }
  },
  'leg-extension': {
    id: 'leg-extension',
    name: "Разгибание голеней сидя в тренажере на квадрицепс",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'leg-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 60,
    alternatives: ["barbell-squat","leg-press","hack-squat","goblet-squat"],
    technique: {
      primaryMuscles: "Четырехглавая мышца бедра (прямая мышца бедра и каплевидные головки)",
      setup: "Отрегулируйте спинку тренажера так, чтобы колени совпадали с осью вращения тренажера, а валик упирался в нижнюю часть голени чуть выше стопы. Плотно прижмите таз и спину, крепко держитесь за боковые рукояти.",
      execution: "Мощным, но подконтрольным усилием квадрицепсов разогните ноги в коленях почти до конца (без жесткой блокировки сустава). Зафиксируйте верхнюю точку на 1 секунду, затем за 2-3 секунды плавно опустите вес.",
      breathing: "Выдох при разгибании ног вверх, вдох при медленном опускании валика.",
      mistakes: [
        "Отрыв таза от сиденья при тяжелом весе",
        "Бросание веса вниз без негативной фазы",
        "Резкие «удары» в коленный сустав в верхней точке"
      ]
    }
  },
  'seated-leg-curl': {
    id: 'seated-leg-curl',
    name: "Сгибание голеней сидя в тренажере на бицепс бедра",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 40,
    restSeconds: 60,
    alternatives: ["leg-curls-lying","romanian-deadlift","db-rdl","deadlift-conventional"],
    technique: {
      primaryMuscles: "Двуглавая мышца бедра (бицепс бедра), полусухожильная и полуперепончатая мышцы",
      setup: "Отрегулируйте тренажер: ось вращения напротив коленных суставов, верхний прижимной валик плотно фиксирует бедра сверху, нижний валик лежит на задней поверхности ахиллова сухожилия.",
      execution: "Мощным движением согните ноги в коленях вниз и назад до максимального сокращения задней поверхности бедра. Задержитесь на 1 секунду, затем плавно под контролем разогните ноги.",
      breathing: "Выдох при сгибании ног вниз, вдох при плавном возврате вверх.",
      mistakes: [
        "Слабая фиксация бедер, приводящая к подскакиванию ног",
        "Неполная амплитуда сгибания",
        "Использование инерции и раскачки туловища"
      ]
    }
  },
  'bulgarian-split-squat': {
    id: 'bulgarian-split-squat',
    name: "Болгарские сплит-выпады с гантелями",
    category: 'Legs',
    equipment: 'dumbbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 14,
    restSeconds: 90,
    alternatives: ["barbell-squat","walking-lunges","leg-press","goblet-squat"],
    technique: {
      primaryMuscles: "Квадрицепс, большая ягодичная мышца, мышцы-стабилизаторы таза",
      setup: "Встаньте спиной к скамье на расстоянии широкого шага. Положите носок задней ноги на край скамьи. В руках гантели вдоль корпуса. Корпус слегка наклонен вперед (15-20°) для идеальной нагрузки на рабочую ягодицу.",
      execution: "Плавно опускайтесь вниз, сгибая переднюю ногу в колене и тазобедренном суставе, пока бедро передней ноги не станет параллельным полу. Мощно оттолкнитесь пяткой передней ноги и вернитесь вверх.",
      breathing: "Вдох при опускании вниз, мощный выдох при подъеме.",
      mistakes: [
        "Завал колена передней ноги внутрь (вальгус)",
        "Слишком короткий шаг, при котором пятка отрывается от пола",
        "Чрезмерный прогиб в пояснице"
      ]
    }
  },
  'walking-lunges': {
    id: 'walking-lunges',
    name: "Выпады с гантелями в шаге",
    category: 'Legs',
    equipment: 'dumbbell',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 12,
    restSeconds: 90,
    alternatives: ["bulgarian-split-squat","goblet-squat","barbell-squat","leg-press"],
    technique: {
      primaryMuscles: "Большая ягодичная мышца, квадрицепсы, приводящие мышцы бедра",
      setup: "Возьмите гантели в обе руки, встаньте прямо, взгляд перед собой. Плечи опущены, мышцы кора напряжены.",
      execution: "Сделайте широкий шаг вперед и плавно опуститесь в выпад до прямого угла в обоих коленях. Заднее колено касается или почти касается пола. Оттолкнитесь пяткой передней ноги и сразу сделайте шаг вперед другой ногой.",
      breathing: "Вдох во время шага и опускания в выпад, выдох при подъеме и выходе в следующий шаг.",
      mistakes: [
        "Удар задним коленом о жесткий пол",
        "Слишком короткий шаг с выходом колена далеко за носок",
        "Наклоны и раскачивание корпуса из стороны в сторону"
      ]
    }
  },
  'standing-calf-raise': {
    id: 'standing-calf-raise',
    name: "Подъем на носки стоя в тренажере / со штангой",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 12,
    maxReps: 18,
    weightStep: 2.5,
    defaultWeight: 50,
    restSeconds: 60,
    alternatives: ["seated-calf-raise","calf-press-leg-press","barbell-squat"],
    technique: {
      primaryMuscles: "Икроножная мышца (медиальная и латеральная головки)",
      setup: "Встаньте носками стоп на платформу так, чтобы пятки свободно свисали вниз. Положите подушки тренажера на плечи, колени чуть мягкие (не заблокированы). Тело прямое.",
      execution: "Максимально опустите пятки вниз, почувствовав глубокое растяжение икроножных (пауза 1 секунда). Мощным движением поднимитесь на носки как можно выше и задержитесь на секунду в пиковом сокращении.",
      breathing: "Вдох при опускании пяток вниз, акцентированный выдох при подъеме на носки.",
      mistakes: [
        "Пружинящие быстрые рывки за счет ахиллова сухожилия без фиксации",
        "Сгибание коленей и превращение движения в приседание",
        "Неполная амплитуда без растяжения в нижней точке"
      ]
    }
  },
  'seated-calf-raise': {
    id: 'seated-calf-raise',
    name: "Подъем на носки сидя в тренажере на камбаловидную мышцу",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'leg-press',
    defaultSets: 3,
    minReps: 12,
    maxReps: 18,
    weightStep: 2.5,
    defaultWeight: 35,
    restSeconds: 60,
    alternatives: ["standing-calf-raise","calf-press-leg-press","leg-press"],
    technique: {
      primaryMuscles: "Камбаловидная мышца (глубокий массив голени, работающий при согнутом колене)",
      setup: "Сядьте в тренажер, поставьте носки стоп на платформу, опустите фиксирующие валики на нижнюю часть бедер (над коленями) и снимите страховочный рычаг.",
      execution: "Медленно опустите пятки вниз до предела для максимального растяжения камбаловидной мышцы. Мощным изолированным усилием голеней выжмите платформу носками вверх и задержитесь вверху.",
      breathing: "Вдох при опускании пяток, выдох при подъеме на носки.",
      mistakes: [
        "Отскок в нижней точке за счет упругости связок",
        "Помощь руками за валики тренажера",
        "Слишком быстрый темп без паузы в растянутой позиции"
      ]
    }
  },
  'hip-thrust': {
    id: 'hip-thrust',
    name: "Ягодичный мост со штангой с упором на скамью",
    category: 'Legs',
    equipment: 'barbell',
    animationType: 'deadlift',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 5,
    defaultWeight: 60,
    restSeconds: 90,
    alternatives: ["romanian-deadlift","barbell-squat","bulgarian-split-squat","leg-press"],
    technique: {
      primaryMuscles: "Большая ягодичная мышца (максимальное натяжение в верхней точке), бицепс бедра",
      setup: "Сядьте на пол, уперев верх спины (нижний край лопаток) в надежную скамью. Положите штангу с мягкой накладкой на тазобедренный сгиб. Стопы на ширине плеч, голени вертикальны в верхней точке.",
      execution: "Мощным толчком через пятки вытолкните таз вверх до горизонтального положения бедер и корпуса. В верхней точке жестко сожмите ягодицы на 1-2 секунды, удерживая подбородок прижатым к груди.",
      breathing: "Вдох при подконтрольном опускании таза к полу, мощный выдох при подъеме таза вверх.",
      mistakes: [
        "Задирание головы назад и переразгибание поясницы вместо работы тазом",
        "Постановка стоп слишком далеко (нагрузка уходит в бицепс бедра) или слишком близко (в квадрицепс)",
        "Отсутствие паузы сжатия в верхней точке"
      ]
    }
  },
  'calf-press-leg-press': {
    id: 'calf-press-leg-press',
    name: "Жим носками в тренажере для жима ногами",
    category: 'Legs',
    equipment: 'machine',
    animationType: 'leg-press',
    defaultSets: 3,
    minReps: 12,
    maxReps: 18,
    weightStep: 5,
    defaultWeight: 90,
    restSeconds: 60,
    alternatives: ["standing-calf-raise","seated-calf-raise","leg-press"],
    technique: {
      primaryMuscles: "Икроножные и камбаловидные мышцы",
      setup: "Сядьте в тренажер для жима ногами, плотно прижмите поясницу. Поставьте носки стоп на нижний край платформы так, чтобы пятки свободно выступали за край. Разогните ноги с легким изгибом в коленях и снимите стопоры.",
      execution: "Плавно согните стопы на себя, опуская платформу и глубоко растягивая икры. Мощно разогните стопы от себя до предельного сокращения мышц голени. Задержитесь на 1 секунду.",
      breathing: "Вдох при опускании платформы на себя, выдох при жиме носками вперед.",
      mistakes: [
        "Соскальзывание носков с края платформы (всегда используйте рифленую поверхность)",
        "Сгибание коленей во время движения (включение квадрицепсов)",
        "Полное блокирование коленных суставов под тяжелым весом"
      ]
    }
  },
  // ==========================================
  // ПЛЕЧИ (SHOULDERS)
  // ==========================================
  'overhead-press': {
    id: 'overhead-press',
    name: "Армейский жим стоя со штангой (OHP)",
    category: 'Shoulders',
    equipment: 'barbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 42.5,
    restSeconds: 90,
    alternatives: ["seated-db-press","hammer-shoulder-press","smith-shoulder-press","lateral-raises","arnold-press","cable-front-raise"],
    technique: {
      primaryMuscles: "Передняя и средняя дельтовидные, трицепсы, верх трапеций, кор",
      setup: "Гриф на ключицах. Хват чуть шире плеч, предплечья строго вертикальны. Ягодицы и мышцы пресса сжаты как камень.",
      execution: "Выжмите штангу строго вверх, отклонив подбородок. Как только гриф пройдет лоб, верните голову в нейтраль и зафиксируйте штангу над макушкой.",
      breathing: "Вдох внизу, выдох в верхней точке выпрямления рук.",
      mistakes: [
        "Сильный прогиб в пояснице назад (компрессионная травма позвоночника)",
        "Выжимание штанги по диагонали вперед"
      ]
    }
  },
  'seated-db-press': {
    id: 'seated-db-press',
    name: "Жим гантелей сидя на скамье со спинкой",
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 18,
    restSeconds: 75,
    alternatives: ["overhead-press","hammer-shoulder-press","smith-shoulder-press","lateral-raises","arnold-press","cable-front-raise"],
    technique: {
      primaryMuscles: "Дельтовидные мышцы (передняя и средняя), трицепс",
      setup: "Спинка скамьи под углом 80-85° (не строго 90° для защиты плеча). Гантели на высоте ушей, локти направлены вперед под 45°.",
      execution: "Жмите гантели вверх по естественной дуге. Не бейте их друг об друга вверху.",
      breathing: "Выдох при жиме над головой, вдох при контролируемом спуске.",
      mistakes: [
        "Разведение локтей строго назад в одну линию со спиной"
      ]
    }
  },
  'hammer-shoulder-press': {
    id: 'hammer-shoulder-press',
    name: "Жим на плечи в тренажере Хаммер",
    category: 'Shoulders',
    equipment: 'machine',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 45,
    restSeconds: 75,
    alternatives: ["overhead-press","seated-db-press","smith-shoulder-press","arnold-press","cable-front-raise"],
    technique: {
      primaryMuscles: "Изолированная проработка дельт без балансировки",
      setup: "Отрегулируйте сиденье: рукояти на уровне ушей. Спина прижата.",
      execution: "Выжимайте рукояти вверх, плавно опускайте до уровня мочек ушей.",
      breathing: "Выдох на жиме, вдох на возврате.",
      mistakes: [
        "Резкое бросание веса вниз"
      ]
    }
  },
  'smith-shoulder-press': {
    id: 'smith-shoulder-press',
    name: "Жим сидя в тренажере Смита с груди",
    category: 'Shoulders',
    equipment: 'machine',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 40,
    restSeconds: 75,
    alternatives: ["overhead-press","seated-db-press","hammer-shoulder-press","arnold-press","cable-front-raise"],
    technique: {
      primaryMuscles: "Передние и средние дельтовидные мышцы",
      setup: "Скамья под углом 80° внутри рамы Смита. Гриф опускается к ключицам.",
      execution: "Выжмите гриф вверх по траектории, контролируя опускание.",
      breathing: "Выдох на жиме, вдох при опускании.",
      mistakes: [
        "Опускание за голову"
      ]
    }
  },
  'lateral-raises': {
    id: 'lateral-raises',
    name: "Махи гантелями через стороны стоя",
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 1,
    defaultWeight: 10,
    restSeconds: 60,
    alternatives: ["cable-lateral-raise","face-pulls","overhead-press","cable-upright-row","upright-row-barbell"],
    technique: {
      primaryMuscles: "Средняя дельтовидная мышца (создает ширину плеч)",
      setup: "Корпус чуть наклонен вперед (на 5-10°), локти слегка согнуты и зафиксированы. Гантели у бедер.",
      execution: "Поднимайте руки через стороны локтями вверх до уровня плеч. Представьте, что выливаете воду из кувшинов.",
      breathing: "Выдох при подъеме в стороны, плавный вдох при опускании.",
      mistakes: [
        "Подброс гантелей за счет раскачки корпуса и толчка ногами (читинг)",
        "Кисти поднимаются выше локтей (нагрузка крадется трапецией)"
      ]
    }
  },
  'cable-lateral-raise': {
    id: 'cable-lateral-raise',
    name: "Махи в стороны на нижнем блоке кроссовера",
    category: 'Shoulders',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 1.25,
    defaultWeight: 7.5,
    restSeconds: 60,
    alternatives: ["lateral-raises","face-pulls","cable-upright-row","upright-row-barbell"],
    technique: {
      primaryMuscles: "Средняя дельта с постоянным натяжением троса по всей траектории",
      setup: "Трос проходит позади или спереди тела. Возьмитесь за рукоять противоположной рукой.",
      execution: "Ведите локоть вверх и в сторону до уровня плеча.",
      breathing: "Выдох на подъеме, вдох на опускании.",
      mistakes: [
        "Рывки плечом вверх"
      ]
    }
  },
  'face-pulls': {
    id: 'face-pulls',
    name: "Тяга каната к лицу на блоке (Face Pulls)",
    category: 'Shoulders',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 2.5,
    defaultWeight: 22.5,
    restSeconds: 60,
    alternatives: ["lateral-raises","cable-lateral-raise","rear-delt-fly-machine","incline-rear-delt-fly"],
    technique: {
      primaryMuscles: "Задняя дельтовидная мышца, ротаторная манжета, ромбовидные",
      setup: "Канатная рукоять на уровне глаз или лба. Шаг назад, корпус стабилен.",
      execution: "Тяните узел каната к переносице, разводя кулаки в стороны с внешней ротацией плеча (двойной бицепс).",
      breathing: "Выдох на тяге к лицу, вдох при возврате.",
      mistakes: [
        "Тяга к шее без разведения кистей"
      ]
    }
  },
  'arnold-press': {
    id: 'arnold-press',
    name: "Жим Арнольда с гантелями сидя",
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2,
    defaultWeight: 16,
    restSeconds: 90,
    alternatives: ["seated-db-press","overhead-press","hammer-shoulder-press","smith-shoulder-press"],
    technique: {
      primaryMuscles: "Передняя и средняя дельтовидные мышцы, верх трапеций, трицепс",
      setup: "Сядьте на скамью с вертикальной спинкой. Возьмите гантели на уровне ключиц ладонями к себе (супинированный хват), локти согнуты и прижаты к корпусу.",
      execution: "Выжимая гантели вверх, плавно разворачивайте кисти на 180° наружу так, чтобы в верхней точке ладони смотрели вперед. Опускайте гантели по той же траектории с обратным разворотом.",
      breathing: "Вдох в исходной позиции, мощный выдох во время жима вверх с вращением.",
      mistakes: [
        "Резкие несинхронные рывки при развороте кистей",
        "Соударение гантелей в верхней точке",
        "Отрыв поясницы от спинки скамьи"
      ]
    }
  },
  'rear-delt-fly-machine': {
    id: 'rear-delt-fly-machine',
    name: "Разведение в бабочке на заднюю дельту (Reverse Pec-Deck)",
    category: 'Shoulders',
    equipment: 'machine',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 35,
    restSeconds: 60,
    alternatives: ["incline-rear-delt-fly","face-pulls","cable-lateral-raise","lateral-raises"],
    technique: {
      primaryMuscles: "Задняя дельтовидная мышца, подостная мышца, ромбовидные мышцы",
      setup: "Сядьте лицом к тренажеру «бабочка», плотно прижмите грудь к опорной подушке. Отрегулируйте высоту сиденья так, чтобы рукояти находились на уровне плеч. Возьмитесь за рукояти нейтральным или прямым хватом, руки чуть согнуты в локтях.",
      execution: "Усилием задних дельт разведите рукояти назад по широкой дуге до линии плеч. Сохраняйте угол в локтях неизменным! Не сводите лопатки слишком сильно, чтобы нагрузка не ушла в трапеции.",
      breathing: "Выдох при разведении рук назад, вдох при подконтрольном сведении вперед.",
      mistakes: [
        "Сведение лопаток и перехват нагрузки трапециевидными мышцами",
        "Сгибание и разгибание рук в локтевых суставах",
        "Отрыв груди от подушки с раскачкой корпуса"
      ]
    }
  },
  'incline-rear-delt-fly': {
    id: 'incline-rear-delt-fly',
    name: "Разведение гантелей на наклонной скамье на заднюю дельту",
    category: 'Shoulders',
    equipment: 'dumbbell',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 1,
    defaultWeight: 8,
    restSeconds: 60,
    alternatives: ["rear-delt-fly-machine","face-pulls","lateral-raises","cable-lateral-raise"],
    technique: {
      primaryMuscles: "Задняя дельта, малая круглая мышца, ромбовидные мышцы",
      setup: "Установите скамью под углом 30-45°. Лягте на нее грудью, ноги на полу. Возьмите нетяжелые гантели нейтральным хватом, руки свисают вниз, локти слегка согнуты.",
      execution: "Разведите гантели в стороны через локти, поднимая их до уровня плеч. В верхней точке мизинцы направлены чуть вверх. Задержитесь на мгновение и плавно опустите гантели вниз.",
      breathing: "Вдох в нижней точке, акцентированный выдох при подъеме гантелей в стороны.",
      mistakes: [
        "Использование слишком тяжелых гантелей с рывками спиной",
        "Подъем через кисти вместо ведения движения локтями",
        "Сведение лопаток в самом начале амплитуды"
      ]
    }
  },
  'cable-upright-row': {
    id: 'cable-upright-row',
    name: "Тяга на блоке к подбородку широким хватом",
    category: 'Shoulders',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 35,
    restSeconds: 60,
    alternatives: ["lateral-raises","cable-lateral-raise","upright-row-barbell","face-pulls"],
    technique: {
      primaryMuscles: "Средняя дельтовидная мышца, верхняя часть трапециевидной мышцы",
      setup: "Прикрепите прямую или изогнутую рукоять к нижнему блоку. Встаньте прямо, возьмитесь за гриф хватом чуть шире плеч. Руки опущены перед бедрами, спина прямая.",
      execution: "Тяните локти вверх и в стороны, ведя рукоять близко вдоль корпуса до уровня грудины (не выше!). Локти всегда должны оставаться выше уровня кистей.",
      breathing: "Вдох в исходном положении, выдох во время тяги вверх.",
      mistakes: [
        "Слишком узкий хват (приводит к субакромиальному импинджменту плеча)",
        "Подъем локтей выше уровня ушей с перегрузкой суставов",
        "Раскачивание корпусом назад"
      ]
    }
  },
  'cable-front-raise': {
    id: 'cable-front-raise',
    name: "Подъем рукояти на нижнем блоке перед собой",
    category: 'Shoulders',
    equipment: 'cable',
    animationType: 'overhead-press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 1.25,
    defaultWeight: 12.5,
    restSeconds: 60,
    alternatives: ["overhead-press","seated-db-press","arnold-press","lateral-raises"],
    technique: {
      primaryMuscles: "Передняя дельтовидная мышца, ключичная часть грудной мышцы",
      setup: "Встаньте спиной к нижнему блоку, трос проходит между ног (или встаньте лицом к блоку). Возьмите рукоять прямым хватом, руки опущены перед бедрами с мягким изгибом в локтях.",
      execution: "Не сгибая руки в локтях, поднимите рукоять вперед перед собой до уровня плеч или глаз. Зафиксируйте пиковое напряжение на секунду и медленно опустите вниз.",
      breathing: "Выдох при подъеме рукояти перед собой, вдох при медленном опускании.",
      mistakes: [
        "Подъем веса за счет отклонения корпуса назад",
        "Сгибание рук в локтях при подъеме",
        "Опускание веса без сопротивления"
      ]
    }
  },
  'upright-row-barbell': {
    id: 'upright-row-barbell',
    name: "Тяга штанги к подбородку широким хватом",
    category: 'Shoulders',
    equipment: 'barbell',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 35,
    restSeconds: 75,
    alternatives: ["cable-upright-row","lateral-raises","cable-lateral-raise","face-pulls"],
    technique: {
      primaryMuscles: "Средняя дельта, трапециевидная мышца, плечелучевая мышца",
      setup: "Возьмите штангу хватом шире плеч (примерно в 1.5 раза шире плеч для безопасности суставов). Встаньте прямо, грудь колесом, гриф касается передней поверхности бедер.",
      execution: "На выдохе направляйте локти вверх и в стороны, поднимая гриф вдоль тела до уровня нижней или средней части груди. В верхней точке локти выше кистей.",
      breathing: "Вдох внизу, выдох при тяге штанги вверх.",
      mistakes: [
        "Узкий хват вплотную кулаками (вызывает защемление вращательной манжеты)",
        "Подъем штанги рывком за счет ног и спины",
        "Отвод грифа далеко вперед от тела"
      ]
    }
  },
  // ==========================================
  // РУКИ (ARMS)
  // ==========================================
  'bicep-curls': {
    id: 'bicep-curls',
    name: "Сгибания рук со штангой стоя на бицепс",
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 27.5,
    restSeconds: 60,
    alternatives: ["db-incline-curls","hammer-curls","cable-bicep-curl","preacher-curl","concentration-curl","cable-rope-hammer-curl"],
    technique: {
      primaryMuscles: "Двуглавая мышца плеча (бицепс), плечелучевая мышца",
      setup: "Хват снизу на ширине плеч. Локти строго прижаты к бокам туловища. Лопатки сведены.",
      execution: "Сгибайте руки в локтях за счет силы бицепса. В верхней точке задержитесь на 1 секунду. Не выводите локти вперед!",
      breathing: "Выдох при подъеме штанги, вдох при плавном опускании.",
      mistakes: [
        "Раскачивание корпусом назад (читинг поясницей)",
        "Вывод локтей далеко вперед (снимает пиковую нагрузку с бицепса)"
      ]
    }
  },
  'db-incline-curls': {
    id: 'db-incline-curls',
    name: "Сгибания с гантелями на наклонной скамье (растяжение бицепса)",
    category: 'Arms',
    equipment: 'dumbbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 12,
    restSeconds: 60,
    alternatives: ["bicep-curls","hammer-curls","cable-bicep-curl","preacher-curl","concentration-curl"],
    technique: {
      primaryMuscles: "Длинная головка бицепса (максимальное растяжение)",
      setup: "Скамья под углом 60°. Спина прижата, руки с гантелями свободно свисают вертикально вниз.",
      execution: "Сгибайте руки с супинацией кисти (разворот мизинца наружу в верхней точке). Локти неподвижны.",
      breathing: "Выдох на подъеме, вдох на опускании.",
      mistakes: [
        "Отрыв плеч от скамьи",
        "Слишком большой вес"
      ]
    }
  },
  'hammer-curls': {
    id: 'hammer-curls',
    name: "Молотковые сгибания с гантелями (Хаммер)",
    category: 'Arms',
    equipment: 'dumbbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2,
    defaultWeight: 14,
    restSeconds: 60,
    alternatives: ["bicep-curls","db-incline-curls","cable-bicep-curl","cable-rope-hammer-curl","preacher-curl"],
    technique: {
      primaryMuscles: "Брахиалис (плечевая мышца) и плечелучевая мышца",
      setup: "Стоя или сидя. Гантели удерживаются нейтральным хватом (ладони смотрят друг на друга).",
      execution: "Поднимайте гантели вверх без супинации кисти, сжимая внешнюю сторону плеча.",
      breathing: "Выдох при подъеме, вдох при опускании.",
      mistakes: [
        "Раскачка спиной"
      ]
    }
  },
  'cable-bicep-curl': {
    id: 'cable-bicep-curl',
    name: "Сгибания на бицепс на нижнем блоке",
    category: 'Arms',
    equipment: 'cable',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 25,
    restSeconds: 60,
    alternatives: ["bicep-curls","db-incline-curls","hammer-curls","cable-rope-hammer-curl","preacher-curl"],
    technique: {
      primaryMuscles: "Бицепс с постоянным сопротивлением троса",
      setup: "Прямая или изогнутая рукоять на нижнем блоке. Локти прижаты к ребрам.",
      execution: "Сгибайте руки вверх, контролируя негативную фазу.",
      breathing: "Выдох на сгибании, вдох на разгибании.",
      mistakes: [
        "Бросание веса вниз"
      ]
    }
  },
  'tricep-pushdown': {
    id: 'tricep-pushdown',
    name: "Разгибания рук на трицепс на верхнем блоке",
    category: 'Arms',
    equipment: 'cable',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 30,
    restSeconds: 60,
    alternatives: ["french-press","overhead-cable-extension","dips-chest","overhead-rope-extension","skull-crushers","close-grip-bench-press","tricep-dips"],
    technique: {
      primaryMuscles: "Трехглавая мышца плеча (латеральная и медиальная головки)",
      setup: "Возьмите прямую рукоять или канат. Локти строго по бокам ребер, корпус слегка наклонен вперед.",
      execution: "Разгибайте руки вниз до полного выпрямления локтей, мощно прожимая трицепс. Локти остаются на месте!",
      breathing: "Выдох при разгибании вниз, вдох при возврате рукояти до прямого угла.",
      mistakes: [
        "Движение плеч и локтей взад-вперед",
        "Наваливание на рукоять весом всего тела"
      ]
    }
  },
  'french-press': {
    id: 'french-press',
    name: "Французский жим со штангой лёжа",
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 32.5,
    restSeconds: 75,
    alternatives: ["tricep-pushdown","overhead-cable-extension","dips-chest","skull-crushers","close-grip-bench-press","overhead-rope-extension"],
    technique: {
      primaryMuscles: "Длинная и медиальная головки трицепса",
      setup: "Лягте на скамью с EZ-грифом. Руки отведены назад на 15° от вертикали.",
      execution: "Сгибайте руки только в локтях, опуская гриф за макушку головы. Разгибайте мощным усилием.",
      breathing: "Вдох при сгибании, выдох при выпрямлении.",
      mistakes: [
        "Разведение локтей в стороны шире плеч",
        "Удар грифом по лбу"
      ]
    }
  },
  'overhead-cable-extension': {
    id: 'overhead-cable-extension',
    name: "Разгибания из-за головы на блоке с канатом",
    category: 'Arms',
    equipment: 'cable',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 25,
    restSeconds: 60,
    alternatives: ["tricep-pushdown","french-press","overhead-rope-extension","skull-crushers","tricep-dips"],
    technique: {
      primaryMuscles: "Длинная головка трицепса в состоянии предельного растяжения",
      setup: "Шаг вперед от блока, корпус наклонен вперед под 45°. Локти направлены вперед рядом с головой.",
      execution: "Разгибайте руки вперед-вверх, разводя канаты в стороны в пиковой точке.",
      breathing: "Выдох на разгибании, вдох на опускании за голову.",
      mistakes: [
        "Движение локтями вверх-вниз"
      ]
    }
  },
  'preacher-curl': {
    id: 'preacher-curl',
    name: "Сгибание рук на скамье Скотта с EZ-штангой",
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 27.5,
    restSeconds: 75,
    alternatives: ["bicep-curls","db-incline-curls","concentration-curl","cable-bicep-curl"],
    technique: {
      primaryMuscles: "Короткая (внутренняя) головка бицепса, плечевая мышца (брахиалис)",
      setup: "Отрегулируйте высоту сиденья скамьи Скотта так, чтобы подмышки плотно легли на верхний край парты, а грудь уперлась в подушку. Возьмите EZ-гриф хватом снизу на ширине плеч.",
      execution: "Мощным сокращением бицепсов согните руки в локтях, поднимая гриф до угла около 60-70° (не доводите до вертикали, чтобы не терять напряжение). Медленно и подконтрольно опустите гриф вниз, не допуская опасного переразгибания локтей.",
      breathing: "Выдох при сгибании рук вверх, вдох при медленном опускании штанги.",
      mistakes: [
        "Полное \"бросание\" веса в нижней точке с переразгибанием суставов",
        "Отрыв локтей или груди от парты во время подъема",
        "Заведение штанги вертикально с потерей нагрузки на бицепс"
      ]
    }
  },
  'concentration-curl': {
    id: 'concentration-curl',
    name: "Концентрированный подъем на бицепс с гантелью сидя",
    category: 'Arms',
    equipment: 'dumbbell',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 1,
    defaultWeight: 12,
    restSeconds: 60,
    alternatives: ["bicep-curls","preacher-curl","cable-bicep-curl","hammer-curls"],
    technique: {
      primaryMuscles: "Бицепс плеча (акцент на пик и максимальную изоляцию)",
      setup: "Сядьте на скамью, расставьте ноги широко. Возьмите гантель в одну руку, уприте нижнюю треть плеча (чуть выше локтя) во внутреннюю поверхность бедра. Свободная рука упирается в другое бедро.",
      execution: "Изолированным сокращением бицепса поднимите гантель вверх к плечу, одновременно слегка супинируя кисть (мизинец вверх). Сожмите бицепс в верхней точке на 1 секунду, затем плавно опустите.",
      breathing: "Выдох при сгибании руки, вдох при медленном опускании гантели.",
      mistakes: [
        "Помощь раскачкой плеч и спины",
        "Отрыв локтя от внутренней стороны бедра",
        "Быстрое падение веса вниз без контроля"
      ]
    }
  },
  'cable-rope-hammer-curl': {
    id: 'cable-rope-hammer-curl',
    name: "Молотковые сгибания на нижнем блоке с канатной рукоятью",
    category: 'Arms',
    equipment: 'cable',
    animationType: 'bicep-curl',
    defaultSets: 3,
    minReps: 10,
    maxReps: 14,
    weightStep: 2.5,
    defaultWeight: 25,
    restSeconds: 60,
    alternatives: ["hammer-curls","cable-bicep-curl","bicep-curls","preacher-curl"],
    technique: {
      primaryMuscles: "Плечелучевая мышца (брахиорадиалис), брахиалис, длинная головка бицепса",
      setup: "Закрепите канатную рукоять на нижнем блоке. Встаньте прямо, возьмитесь за концы каната нейтральным хватом (большие пальцы смотрят вверх). Локти прижаты к бокам корпуса.",
      execution: "Сгибайте руки в локтях, удерживая нейтральный хват. В верхней точке слегка разведите кисти в стороны для максимального пикового сокращения. Плавно опустите в исходное положение.",
      breathing: "Выдох при подъеме каната, вдох при опускании веса.",
      mistakes: [
        "Движение локтей вперед и помощь передними дельтами",
        "Отклонение корпуса назад во время подъема",
        "Ослабление хвата в кистях"
      ]
    }
  },
  'skull-crushers': {
    id: 'skull-crushers',
    name: "Французский жим лёжа со штангой EZ (Skull Crushers)",
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 30,
    restSeconds: 75,
    alternatives: ["french-press","close-grip-bench-press","tricep-pushdown","overhead-rope-extension"],
    technique: {
      primaryMuscles: "Медиальная и латеральная головки трицепса",
      setup: "Лягте на горизонтальную скамью с EZ-штангой. Руки выпрямлены вверх над грудью и слегка наклонены назад (на 10-15° к голове) для непрерывного натяжения трицепса.",
      execution: "Сгибая руки только в локтевых суставах, опустите гриф ко лбу или за макушку головы. Локти зафиксированы на ширине плеч и не разъезжаются! Мощным разгибанием трицепсов верните гриф вверх.",
      breathing: "Вдох при опускании грифа к голове, выдох при мощном разгибании рук.",
      mistakes: [
        "Разведение локтей в стороны шире плеч",
        "Движение плечевой костью вперед-назад (включение широчайших)",
        "Слишком быстрый опуск веса с риском травмы головы"
      ]
    }
  },
  'close-grip-bench-press': {
    id: 'close-grip-bench-press',
    name: "Жим штанги лёжа узким хватом на трицепс",
    category: 'Arms',
    equipment: 'barbell',
    animationType: 'bench-press',
    defaultSets: 3,
    minReps: 6,
    maxReps: 10,
    weightStep: 2.5,
    defaultWeight: 60,
    restSeconds: 90,
    alternatives: ["skull-crushers","tricep-pushdown","tricep-dips","bench-press"],
    technique: {
      primaryMuscles: "Все три головки трицепса (латеральная, медиальная, длинная), передняя дельта",
      setup: "Лягте на скамью так же, как при обычном жиме. Возьмите гриф хватом на ширине плеч (расстояние между кистями 30-40 см, не слишком узко, чтобы сберечь лучезапястные суставы). Сведите лопатки.",
      execution: "Опустите штангу на нижнюю часть груди, удерживая локти прижатыми к корпусу (под углом 30-45°). Мощным трицепсовым усилием выжмите штангу вверх.",
      breathing: "Вдох при подконтрольном опускании, мощный выдох при выжимании штанги.",
      mistakes: [
        "Слишком узкий хват вплотную (ломает запястья и не дает преимуществ)",
        "Разведение локтей в стороны под 90°",
        "Отрыв таза от скамьи"
      ]
    }
  },
  'overhead-rope-extension': {
    id: 'overhead-rope-extension',
    name: "Французский жим из-за головы на блоке с канатной рукоятью",
    category: 'Arms',
    equipment: 'cable',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 22.5,
    restSeconds: 60,
    alternatives: ["overhead-cable-extension","tricep-pushdown","skull-crushers","tricep-dips"],
    technique: {
      primaryMuscles: "Длинная головка трицепса в состоянии максимального предрастяжения",
      setup: "Закрепите канатную рукоять на блоке. Возьмите концы каната, повернитесь спиной к тренажеру, заведите руки за голову. Сделайте шаг вперед в разножку для устойчивости, корпус наклонен вперед под 45°.",
      execution: "Удерживая локти направленными вперед рядом с головой, разогните руки вперед-вверх, разводя концы каната в стороны в пиковой точке. Плавно вернитесь в глубокое растяжение.",
      breathing: "Вдох при опускании каната за голову, выдох при мощном разгибании рук.",
      mistakes: [
        "Раскачивание корпуса и жим телом",
        "Разведение локтей слишком широко в стороны",
        "Неполная амплитуда без растяжения в нижней точке"
      ]
    }
  },
  'tricep-dips': {
    id: 'tricep-dips',
    name: "Отжимания на брусьях с акцентом на трицепс",
    category: 'Arms',
    equipment: 'bodyweight',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 90,
    alternatives: ["close-grip-bench-press","skull-crushers","tricep-pushdown","bench-dips"],
    technique: {
      primaryMuscles: "Трицепс (все три головки), передняя дельта",
      setup: "Примите упор на параллельных брусьях (лучше узких). Держите корпус строго вертикально, ноги опущены вниз или слегка согнуты в коленях назад. Взгляд прямо перед собой.",
      execution: "Опускайтесь строго вниз, прижимая локти как можно ближе к корпусу и не наклоняя корпус вперед. Опуститесь до угла 90° в локтях, затем мощно выжмите себя вверх усилием трицепсов.",
      breathing: "Вдох при опускании вниз, мощный выдох при подъеме.",
      mistakes: [
        "Наклон корпуса вперед (переносит нагрузку на грудь)",
        "Разведение локтей в стороны",
        "Провал слишком глубоко с риском растяжения плеча"
      ]
    }
  },
  'bench-dips': {
    id: 'bench-dips',
    name: "Обратные отжимания от скамьи на трицепс",
    category: 'Arms',
    equipment: 'bodyweight',
    animationType: 'tricep-pushdown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ["tricep-dips","tricep-pushdown","skull-crushers","close-grip-bench-press"],
    technique: {
      primaryMuscles: "Трицепс, передняя дельта",
      setup: "Поставьте руки на край скамьи за спиной на ширине плеч, пальцы направлены вперед. Ноги вытянуты вперед с опорой на пятки (или на вторую скамью). Таз находится вплотную к скамье.",
      execution: "Сгибая руки в локтях строго назад, опустите таз вертикально вниз вдоль скамьи до прямого угла в локтях. Мощным толчком ладоней выпрямите руки в исходное положение.",
      breathing: "Вдох при опускании таза вниз, выдох при выжимании наверх.",
      mistakes: [
        "Отвод таза далеко вперед от скамьи (перегружает плечевой сустав)",
        "Слишком глубокое опускание с вывихом плеча",
        "Скругление плеч вперед"
      ]
    }
  },
  // ==========================================
  // КОР И ПРЕСС (CORE)
  // ==========================================
  'plank': {
    id: 'plank',
    name: "Планка на предплечьях",
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 30,
    maxReps: 60,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ["hanging-leg-raise","cable-crunch","ab-wheel-rollout","decline-crunch","russian-twist","hanging-knee-raise"],
    technique: {
      primaryMuscles: "Прямая и поперечная мышцы живота, глубокие стабилизаторы позвоночника",
      setup: "Упор на предплечья и носки стоп. Локти строго под плечевыми суставами. Тело вытянуто в единую прямую линию.",
      execution: "Напрягите пресс и ягодицы, удерживайте таз в нейтральном положении без провисания в пояснице.",
      breathing: "Ровное глубокое дыхание без задержки воздуха.",
      mistakes: [
        "Провисание таза вниз",
        "Чрезмерный подъем ягодиц вверх",
        "Задержка дыхания"
      ]
    }
  },
  'hanging-leg-raise': {
    id: 'hanging-leg-raise',
    name: "Подъем ног в висе на турнике",
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ["plank","cable-crunch","ab-wheel-rollout","hanging-knee-raise","decline-crunch"],
    technique: {
      primaryMuscles: "Нижняя порция прямой мышцы живота, подвздошно-поясничная мышца",
      setup: "Вис на перекладине хватом на ширине плеч. Плечи опущены, лопатки стабилизированы.",
      execution: "Мощным усилием пресса поднимите прямые или согнутые ноги выше уровня таза, подкручивая таз вперед.",
      breathing: "Выдох при подъеме ног, плавный вдох при опускании.",
      mistakes: [
        "Раскачка телом по инерции",
        "Подъем ног только за счет мышц бедра без подкручивания таза"
      ]
    }
  },
  'cable-crunch': {
    id: 'cable-crunch',
    name: "Скручивания на блоке стоя на коленях (Молитва)",
    category: 'Core',
    equipment: 'cable',
    animationType: 'row',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 2.5,
    defaultWeight: 35,
    restSeconds: 60,
    alternatives: ["hanging-leg-raise","cable-woodchopper","ab-wheel-rollout","decline-crunch","hanging-knee-raise"],
    technique: {
      primaryMuscles: "Прямая мышца живота с акцентом на верхнюю и среднюю часть",
      setup: "Встаньте на колени перед верхним блоком с канатной рукоятью. Руки зафиксированы у лба или висков.",
      execution: "Скручивайте грудную клетку по направлению к тазу исключительно силой пресса. Бедра неподвижны.",
      breathing: "Мощный выдох при скручивании вниз, вдох при подконтрольном разгибании.",
      mistakes: [
        "Движение за счет сгибания в тазобедренных суставах",
        "Тяга руками вместо сокращения пресса"
      ]
    }
  },
  'cable-woodchopper': {
    id: 'cable-woodchopper',
    name: "Дровосек на блоке по диагонали",
    category: 'Core',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 2.5,
    defaultWeight: 20,
    restSeconds: 60,
    alternatives: ["cable-crunch","hanging-leg-raise","plank","russian-twist","cable-side-bend"],
    technique: {
      primaryMuscles: "Косые мышцы живота, поперечная мышца, кор",
      setup: "Боком к блоку на ширине плеч. Рукоять удерживается двумя руками на уровне груди.",
      execution: "По диагонали поверните корпус с контролем бедер, прожимая косые мышцы.",
      breathing: "Выдох на вращении, вдох при возврате в исходную точку.",
      mistakes: [
        "Вращение только в коленях",
        "Резкий неконтролируемый возврат веса"
      ]
    }
  },
  'ab-wheel-rollout': {
    id: 'ab-wheel-rollout',
    name: "Прокатка с гимнастическим роликом",
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 75,
    alternatives: ["plank","hanging-leg-raise","cable-crunch","decline-crunch","hanging-knee-raise"],
    technique: {
      primaryMuscles: "Прямая мышца живота, глубокие стабилизаторы позвоночника",
      setup: "Стоя на коленях, ролик перед собой. Руки прямые, таз подкручен вперед.",
      execution: "Катите ролик вперед, растягивая тело до параллели с полом. Прессом вернитесь назад.",
      breathing: "Вдох при движении вперед, мощный выдох при возврате в исходную позицию.",
      mistakes: [
        "Прогиб в пояснице в нижней точке",
        "Сгибание в локтях"
      ]
    }
  },
  'decline-crunch': {
    id: 'decline-crunch',
    name: "Скручивания на наклонной скамье для пресса",
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'squat',
    defaultSets: 3,
    minReps: 12,
    maxReps: 18,
    weightStep: 2.5,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ["cable-crunch","hanging-leg-raise","hanging-knee-raise","ab-wheel-rollout"],
    technique: {
      primaryMuscles: "Прямая мышца живота (верхняя и средняя части), косые мышцы живота",
      setup: "Отрегулируйте угол наклона скамьи. Закрепите голени под валиками, лягте на спину. Руки сложите на груди или держите у висков (не сцепляйте за затылком в замок!).",
      execution: "На выдохе скругляйте корпус, приближая ребра к тазу исключительно за счет сжатия мышц пресса. Поясница в начале движения остается прижатой! Не поднимайте прямой корпус за счет подвздошно-поясничной мышцы.",
      breathing: "Глубокий выдох при максимальном сжатии пресса, вдох при медленном опускании назад.",
      mistakes: [
        "Тяга головы руками за шею",
        "Подъем прямого корпуса с прогибом в пояснице",
        "Падение назад без контроля пресса"
      ]
    }
  },
  'hanging-knee-raise': {
    id: 'hanging-knee-raise',
    name: "Подъем коленей в висе на турнике",
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'lat-pulldown',
    defaultSets: 3,
    minReps: 10,
    maxReps: 15,
    weightStep: 0,
    defaultWeight: 0,
    restSeconds: 60,
    alternatives: ["hanging-leg-raise","cable-crunch","decline-crunch","plank"],
    technique: {
      primaryMuscles: "Нижняя часть прямой мышцы живота, подвздошно-поясничная мышца",
      setup: "Повисните на турнике прямым хватом на ширине плеч. Тело выпрямлено, плечи стабильны, лопатки слегка опущены.",
      execution: "На выдохе подтяните колени вверх к груди, одновременно подкручивая таз вперед и вверх (это критично для включения пресса, а не только сгибателей бедра!). Задержитесь на 1 секунду и подконтрольно опустите ноги.",
      breathing: "Мощный выдох при подъеме коленей к груди, спокойный вдох при опускании.",
      mistakes: [
        "Раскачивание тела маятником и использование инерции",
        "Подъем бедер без подкручивания таза вверх",
        "Расслабление плечевого пояса и повисание на связках"
      ]
    }
  },
  'russian-twist': {
    id: 'russian-twist',
    name: "Русские скручивания для косых мышц пресса",
    category: 'Core',
    equipment: 'bodyweight',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 20,
    weightStep: 2,
    defaultWeight: 5,
    restSeconds: 60,
    alternatives: ["cable-woodchopper","cable-side-bend","plank","cable-crunch"],
    technique: {
      primaryMuscles: "Наружные и внутренние косые мышцы живота, поперечная мышца, прямая мышца живота",
      setup: "Сядьте на коврик, согните ноги в коленях и оторвите стопы от пола (для облегчения можно держать пятки на полу). Отклоните прямой корпус назад под углом 45°, образуя телом букву V. Возьмите диск или гантель двумя руками перед грудью.",
      execution: "Контролируемо вращайте грудную клетку и плечи из стороны в сторону, опуская снаряд к полу сбоку от бедра. Движение выполняется исключительно за счет ротации грудного отдела и сокращения косых мышц.",
      breathing: "Выдох на каждом повороте в сторону, вдох в центральной точке перехода.",
      mistakes: [
        "Скругляющаяся сутулая поясница",
        "Движение только руками без вращения плечевого пояса и грудной клетки",
        "Чрезмерно быстрое вращение с потерей баланса"
      ]
    }
  },
  'cable-side-bend': {
    id: 'cable-side-bend',
    name: "Боковые наклоны на блоке",
    category: 'Core',
    equipment: 'cable',
    animationType: 'lateral-raise',
    defaultSets: 3,
    minReps: 12,
    maxReps: 16,
    weightStep: 2.5,
    defaultWeight: 20,
    restSeconds: 60,
    alternatives: ["cable-woodchopper","russian-twist","plank","hanging-knee-raise"],
    technique: {
      primaryMuscles: "Косые мышцы живота, квадратная мышца поясницы",
      setup: "Встаньте боком к нижнему блоку. Возьмите D-рукоять в руку со стороны блока. Стопы на ширине плеч, вторая рука за головой или на талии. Корпус прямой.",
      execution: "Медленно наклонитесь в сторону тренажера, растягивая противоположную сторону талии. Усилием противоположных косых мышц мощно выпрямите корпус обратно до строго вертикального положения (не переразгибайтесь в противоположную сторону).",
      breathing: "Вдох при наклоне в сторону блока, акцентированный выдох при возврате в вертикальное положение.",
      mistakes: [
        "Наклоны вперед или назад вместо строго боковой плоскости",
        "Использование двух отягощений одновременно (эффект весов с нейтрализацией нагрузки)",
        "Резкие рывки поясницей"
      ]
    }
  }
};

// Automatically attach verified 3D animated GIF URLs to all catalog exercises
for (const [id, item] of Object.entries(EXERCISE_CATALOG)) {
  if (EXERCISE_GIF_MAP[id]) {
    item.gifUrl = EXERCISE_GIF_MAP[id];
  }
}
