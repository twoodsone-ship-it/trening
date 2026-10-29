import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, Eye, Sliders, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExerciseAnimationProps {
  animationType: string;
  category?: string;
  exerciseName?: string;
}

interface FormCue {
  text: string;
  type: 'good' | 'angle' | 'focus';
}

const EXERCISE_CUES: Record<string, { cues: FormCue[]; primary: string; secondary: string }> = {
  'bench-press': {
    primary: 'Грудные мышцы (середина и низ)',
    secondary: 'Передняя дельта, трицепс',
    cues: [
      { text: 'Локти под углом 70-75° к корпусу (не 90°!)', type: 'angle' },
      { text: 'Лопатки жестко сведены и прижаты к скамье', type: 'good' },
      { text: 'Опускание штанги строго на линию сосков', type: 'focus' }
    ]
  },
  'incline-press': {
    primary: 'Верхняя (ключичная) часть груди',
    secondary: 'Передняя дельта, трицепс',
    cues: [
      { text: 'Угол скамьи 30° для точечной изоляции верха', type: 'angle' },
      { text: 'Жим по естественной траектории вверх', type: 'good' },
      { text: 'Пятки плотно упираются в пол', type: 'focus' }
    ]
  },
  'squat': {
    primary: 'Квадрицепсы, большая ягодичная',
    secondary: 'Приводящие, разгибатели спины, кор',
    cues: [
      { text: 'Глубина до параллели бедра с полом (90°)', type: 'angle' },
      { text: 'Колени сонаправлены с носками (не сводить внутрь)', type: 'good' },
      { text: 'Спина прямая, таз отводится назад', type: 'focus' }
    ]
  },
  'leg-press': {
    primary: 'Квадрицепсы, ягодичные',
    secondary: 'Бицепс бедра',
    cues: [
      { text: 'Никогда не выпрямляйте колени до щелчка в замок!', type: 'good' },
      { text: 'Поясница и крестец намертво прижаты к спинке', type: 'focus' },
      { text: 'Угол в коленях в нижней точке 90°', type: 'angle' }
    ]
  },
  'deadlift': {
    primary: 'Бицепс бедра, ягодицы',
    secondary: 'Поясница, трапеции, хват',
    cues: [
      { text: 'Отводите таз назад, колени лишь слегка согнуты', type: 'focus' },
      { text: 'Спина строго ровная с естественным прогибом', type: 'good' },
      { text: 'Гриф движется вплотную по бедрам и голеням', type: 'angle' }
    ]
  },
  'overhead-press': {
    primary: 'Передняя и средняя дельты',
    secondary: 'Трицепс, трапеция, кор',
    cues: [
      { text: 'Гриф движется строго вертикально над макушкой', type: 'angle' },
      { text: 'Ягодицы и пресс жестко сжаты (без прогиба в пояснице)', type: 'good' },
      { text: 'Предплечья вертикальны в стартовой точке', type: 'focus' }
    ]
  },
  'lat-pulldown': {
    primary: 'Широчайшие мышцы (ширина спины)',
    secondary: 'Бицепс, ромбовидные, задняя дельта',
    cues: [
      { text: 'Тяните локтями строго вниз к ребрам', type: 'focus' },
      { text: 'Отклонение корпуса назад не более 15°', type: 'angle' },
      { text: 'Пиковое сведение лопаток в нижней точке', type: 'good' }
    ]
  },
  'row': {
    primary: 'Толщина спины, ромбовидные',
    secondary: 'Широчайшие, бицепс, трапеция',
    cues: [
      { text: 'Тяните гриф/рукоять к низу живота (к пупку)', type: 'focus' },
      { text: 'Локти прижаты к корпусу, лопатки соединяются', type: 'good' },
      { text: 'Наклон корпуса 45-60° без раскачки', type: 'angle' }
    ]
  },
  'bicep-curl': {
    primary: 'Двуглавая мышца плеча (бицепс)',
    secondary: 'Брахиалис, предплечья',
    cues: [
      { text: 'Локти неподвижны и зафиксированы по бокам', type: 'good' },
      { text: 'Без раскачки корпусом и заброса спиной', type: 'focus' },
      { text: 'Супинация кисти (мизинец наружу) вверху', type: 'angle' }
    ]
  },
  'tricep-pushdown': {
    primary: 'Трехглавая мышца плеча (трицепс)',
    secondary: 'Локтевая мышца',
    cues: [
      { text: 'Плечевой сустав зафиксирован, двигаются только предплечья', type: 'good' },
      { text: 'Полное выпрямление в локтях с фиксацией 1 сек.', type: 'focus' },
      { text: 'Локти прижаты к бокам туловища', type: 'angle' }
    ]
  },
  'lateral-raise': {
    primary: 'Средняя дельтовидная (ширина плеч)',
    secondary: 'Надостная мышца, трапеция',
    cues: [
      { text: 'Локти чуть выше кистей (эффект выливания воды)', type: 'angle' },
      { text: 'Подъем до уровня параллели с полом', type: 'good' },
      { text: 'Без толчка ногами и рывков туловищем', type: 'focus' }
    ]
  }
};

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  animationType,
  category = 'Chest',
  exerciseName = ''
}) => {
  const [viewMode, setViewMode] = useState<'compare' | 'animate' | 'scrub'>('animate');
  const [activeFrame, setActiveFrame] = useState<'start' | 'finish'>('start');
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubProgress, setScrubProgress] = useState(50); // 0 to 100

  // Animation phase loop
  useEffect(() => {
    if (viewMode !== 'animate' || !isPlaying) return;
    const interval = setInterval(() => {
      setActiveFrame(prev => (prev === 'start' ? 'finish' : 'start'));
    }, 1800);
    return () => clearInterval(interval);
  }, [viewMode, isPlaying]);

  const cuesData = EXERCISE_CUES[animationType] || EXERCISE_CUES['bench-press'];

  return (
    <div className="w-full rounded-3xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-inner text-slate-900 dark:text-zinc-100 space-y-4">
      
      {/* View Mode Switcher Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <button
            onClick={() => setViewMode('animate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'animate'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            ▶ Анимация
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'compare'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            📸 2 Фазы
          </button>
          <button
            onClick={() => setViewMode('scrub')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'scrub'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            🎚 Слайдер
          </button>
        </div>

        {viewMode === 'animate' && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-slate-50 transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" /> Пауза
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-500 fill-current" /> Старт
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Visual Display Area */}
      {viewMode === 'compare' ? (
        /* Dual Frame Comparison Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full mb-2">
              1. Исходное положение (Растяг / Вдох)
            </span>
            <div className="w-full h-44 flex items-center justify-center">
              {renderDetailedAnatomySvg(animationType, 'start')}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-400 dark:border-emerald-700/60 rounded-2xl p-3 flex flex-col items-center shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full mb-2">
              2. Пиковое сокращение (Финиш / Выдох)
            </span>
            <div className="w-full h-44 flex items-center justify-center">
              {renderDetailedAnatomySvg(animationType, 'finish')}
            </div>
          </div>
        </div>
      ) : viewMode === 'scrub' ? (
        /* Scrubber Interactive Slider Mode */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center">
          <div className="w-full h-52 flex items-center justify-center">
            {renderDetailedAnatomySvg(animationType, scrubProgress > 50 ? 'finish' : 'start', scrubProgress)}
          </div>
          <div className="w-full max-w-sm mt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Старт (0%)</span>
              <span className="font-mono text-emerald-600 font-bold">{scrubProgress}% движения</span>
              <span>Финиш (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scrubProgress}
              onChange={e => setScrubProgress(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      ) : (
        /* Continuous Looped Animated Mode */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center relative overflow-hidden">
          {/* Phase Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-white/95 dark:bg-zinc-950/90 backdrop-blur rounded-full text-xs font-bold border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${activeFrame === 'finish' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`} />
            <span className={activeFrame === 'finish' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
              {activeFrame === 'finish' ? '↑ Подъем / Пиковое усилие (Выдох)' : '↓ Опускание / Растяжение (Вдох)'}
            </span>
          </div>

          <div className="w-full h-52 flex items-center justify-center pt-5">
            {renderDetailedAnatomySvg(animationType, activeFrame)}
          </div>
        </div>
      )}

      {/* Anatomy Muscle Target Legend */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Целевая мышечная группа:
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            {cuesData.primary}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Мышцы-синергисты:
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5 justify-end mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            {cuesData.secondary}
          </span>
        </div>
      </div>

      {/* Biomechanical Form Cues Checklist */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block px-1">
          Ключевые ориентиры правильной техники:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {cuesData.cues.map((cue, idx) => (
            <div 
              key={idx}
              className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start gap-2 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-zinc-300 font-medium leading-snug">
                {cue.text}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/**
 * High-definition anatomical 2D vector illustrations for each exercise movement pattern.
 */
function renderDetailedAnatomySvg(type: string, frame: 'start' | 'finish', progress?: number) {
  const isFinish = frame === 'finish';

  switch (type) {
    case 'bench-press':
    case 'incline-press':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-w-[300px]">
          <defs>
            <filter id="primeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Bench Setup */}
          <rect x="50" y="145" width="220" height="14" rx="4" fill="#64748b" />
          <rect x="75" y="159" width="14" height="32" rx="2" fill="#475569" />
          <rect x="230" y="159" width="14" height="32" rx="2" fill="#475569" />
          {/* Floor line */}
          <line x1="30" y1="191" x2="290" y2="191" stroke="#cbd5e1" strokeWidth="4" />

          {/* Athlete Spine & Head */}
          <circle cx="95" cy="138" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" /> {/* Head */}
          <rect x="110" y="130" width="95" height="22" rx="8" fill="#3b82f6" /> {/* Torso */}
          <path d="M205 136 L235 158 L235 190" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" /> {/* Legs */}
          <rect x="228" y="186" width="22" height="6" rx="2" fill="#1e293b" /> {/* Foot flat on floor */}

          {/* Chest Muscle Highlight */}
          <ellipse 
            cx="145" 
            cy="136" 
            rx={isFinish ? "18" : "15"} 
            ry={isFinish ? "12" : "9"} 
            fill="#10b981" 
            filter="url(#primeGlow)"
            className="transition-all duration-300"
          />

          {/* Arms & Barbell positions */}
          {isFinish ? (
            /* Bar Pressed Up Over Chest */
            <g className="transition-all duration-300">
              {/* Vertical Arms */}
              <line x1="128" y1="135" x2="128" y2="78" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
              <line x1="162" y1="135" x2="162" y2="78" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
              {/* Hands */}
              <circle cx="128" cy="78" r="6" fill="#fbbf24" />
              <circle cx="162" cy="78" r="6" fill="#fbbf24" />
              {/* Barbell Bar */}
              <line x1="60" y1="78" x2="230" y2="78" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
              {/* Plates */}
              <rect x="52" y="55" width="10" height="46" rx="3" fill="#ef4444" />
              <rect x="44" y="60" width="7" height="36" rx="2" fill="#3b82f6" />
              <rect x="230" y="55" width="10" height="46" rx="3" fill="#ef4444" />
              <rect x="241" y="60" width="7" height="36" rx="2" fill="#3b82f6" />
              {/* Angle Callout Badge */}
              <rect x="180" y="90" width="85" height="18" rx="6" fill="#10b981" />
              <text x="222" y="103" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Верхний жим
              </text>
            </g>
          ) : (
            /* Bar Lowered to Chest */
            <g className="transition-all duration-300">
              {/* Elbows flared at 70° */}
              <path d="M125 135 L105 145 L125 115" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M165 135 L185 145 L165 115" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Hands */}
              <circle cx="125" cy="115" r="6" fill="#fbbf24" />
              <circle cx="165" cy="115" r="6" fill="#fbbf24" />
              {/* Barbell Bar right at chest */}
              <line x1="60" y1="115" x2="230" y2="115" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
              {/* Plates */}
              <rect x="52" y="92" width="10" height="46" rx="3" fill="#ef4444" />
              <rect x="44" y="97" width="7" height="36" rx="2" fill="#3b82f6" />
              <rect x="230" y="92" width="10" height="46" rx="3" fill="#ef4444" />
              <rect x="241" y="97" width="7" height="36" rx="2" fill="#3b82f6" />
              {/* Trajectory Guide */}
              <path d="M145 78 L145 110" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="180" y="125" width="95" height="18" rx="6" fill="#0f172a" />
              <text x="227" y="137" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Локти 70° (Касание груди)
              </text>
            </g>
          )}
        </svg>
      );

    case 'squat':
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[300px]">
          <line x1="30" y1="200" x2="290" y2="200" stroke="#cbd5e1" strokeWidth="4" />

          {isFinish ? (
            /* Parallel Deep Squat Position */
            <g className="transition-all duration-300">
              {/* Head */}
              <circle cx="145" cy="95" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              {/* Barbell on upper traps */}
              <line x1="60" y1="110" x2="230" y2="110" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <rect x="50" y="85" width="12" height="50" rx="3" fill="#ef4444" />
              <rect x="230" y="85" width="12" height="50" rx="3" fill="#ef4444" />
              {/* Torso angled 60° */}
              <path d="M145 110 L130 155" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
              {/* Deep Parallel Thighs */}
              <path d="M130 155 L175 160 L165 200" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="165" cy="198" rx="14" ry="4" fill="#1e293b" />
              {/* Quads & Glute Glow */}
              <ellipse cx="150" cy="155" rx="18" ry="12" fill="#10b981" opacity="0.85" />
              {/* Angle Callout */}
              <rect x="190" y="135" width="110" height="20" rx="6" fill="#10b981" />
              <text x="245" y="149" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Параллель 90° (Вдох)
              </text>
            </g>
          ) : (
            /* Standing Tall Start Position */
            <g className="transition-all duration-300">
              <circle cx="145" cy="40" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              {/* Barbell */}
              <line x1="60" y1="55" x2="230" y2="55" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <rect x="50" y="30" width="12" height="50" rx="3" fill="#ef4444" />
              <rect x="230" y="30" width="12" height="50" rx="3" fill="#ef4444" />
              {/* Standing Torso */}
              <path d="M145 55 L145 120" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
              {/* Straight Standing Legs */}
              <path d="M145 120 L135 198" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" />
              <path d="M145 120 L155 198" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />
              <ellipse cx="135" cy="198" rx="12" ry="4" fill="#1e293b" />
              <ellipse cx="155" cy="198" rx="12" ry="4" fill="#1e293b" />
              {/* Form Badge */}
              <rect x="180" y="55" width="120" height="20" rx="6" fill="#0f172a" />
              <text x="240" y="69" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Стойка на ширине плеч
              </text>
            </g>
          )}
        </svg>
      );

    case 'lat-pulldown':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-w-[300px]">
          {/* Lat Pulldown Machine Frame */}
          <rect x="155" y="10" width="10" height="40" fill="#64748b" />
          <line x1="50" y1="18" x2="270" y2="18" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
          <rect x="120" y="150" width="80" height="14" rx="4" fill="#475569" />
          <rect x="154" y="164" width="12" height="30" fill="#334155" />

          {isFinish ? (
            /* Bar Pulled to Upper Chest */
            <g className="transition-all duration-300">
              <circle cx="160" cy="88" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <path d="M160 102 L160 152" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
              {/* Lat activation glow */}
              <ellipse cx="160" cy="120" rx="24" ry="16" fill="#10b981" opacity="0.9" />
              {/* Lat Bar pulled down */}
              <path d="M80 98 Q 160 85 240 98" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Arms driven down */}
              <path d="M152 105 L110 100" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
              <path d="M168 105 L210 100" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
              {/* Badge */}
              <rect x="195" y="125" width="105" height="20" rx="6" fill="#10b981" />
              <text x="247" y="139" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Лопатки сведены!
              </text>
            </g>
          ) : (
            /* Arms Reaching Overhead (Full Stretch) */
            <g className="transition-all duration-300">
              <circle cx="160" cy="95" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <path d="M160 110 L160 152" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
              {/* Lat Bar at Top */}
              <path d="M70 42 Q 160 28 250 42" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
              <line x1="152" y1="110" x2="95" y2="44" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
              <line x1="168" y1="110" x2="225" y2="44" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
              {/* Badge */}
              <rect x="195" y="55" width="115" height="20" rx="6" fill="#0f172a" />
              <text x="252" y="69" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Растяжение широчайших
              </text>
            </g>
          )}
        </svg>
      );

    case 'deadlift':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-w-[300px]">
          <line x1="30" y1="190" x2="290" y2="190" stroke="#cbd5e1" strokeWidth="4" />

          {isFinish ? (
            /* Standing Tall Lockout */
            <g className="transition-all duration-300">
              <circle cx="150" cy="45" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <path d="M150 60 L150 125" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
              <path d="M150 125 L145 188" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" />
              <path d="M150 125 L155 188" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />
              {/* Barbell at Hips */}
              <line x1="80" y1="125" x2="220" y2="125" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <circle cx="80" cy="125" r="18" fill="#ef4444" />
              <circle cx="220" cy="125" r="18" fill="#ef4444" />
              {/* Glutes Glow */}
              <circle cx="150" cy="125" r="14" fill="#10b981" opacity="0.85" />
              <rect x="180" y="55" width="115" height="20" rx="6" fill="#10b981" />
              <text x="237" y="69" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Локаут (Ягодицы сжаты)
              </text>
            </g>
          ) : (
            /* Hip Hinge Stretch Position */
            <g className="transition-all duration-300">
              {/* Torso angled forward */}
              <path d="M140 125 L180 75" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
              <circle cx="190" cy="62" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              {/* Hamstring and Glute Glow */}
              <ellipse cx="140" cy="125" rx="20" ry="14" fill="#10b981" opacity="0.85" />
              {/* Soft Knee Angle */}
              <path d="M140 125 L135 155 L140 188" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Barbell at Mid-Shin */}
              <line x1="75" y1="165" x2="215" y2="165" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <circle cx="75" cy="165" r="18" fill="#ef4444" />
              <circle cx="215" cy="165" r="18" fill="#ef4444" />
              <rect x="185" y="115" width="120" height="20" rx="6" fill="#0f172a" />
              <text x="245" y="129" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Таз назад (Растяжение)
              </text>
            </g>
          )}
        </svg>
      );

    case 'bicep-curl':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-w-[300px]">
          <line x1="30" y1="190" x2="290" y2="190" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="130" cy="45" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <path d="M130 60 L130 130" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
          <path d="M130 130 L125 188" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" />
          <path d="M130 130 L135 188" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />

          {isFinish ? (
            /* Curled to Chest Peak Contraction */
            <g className="transition-all duration-300">
              {/* Upper arm fixed */}
              <line x1="135" y1="75" x2="140" y2="110" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
              {/* Forearm curled up */}
              <path d="M140 110 L150 75" stroke="#d97706" strokeWidth="9" strokeLinecap="round" />
              {/* Big Peak Bicep Glow */}
              <circle cx="145" cy="85" r="14" fill="#10b981" filter="url(#primeGlow)" />
              {/* Dumbbell */}
              <circle cx="150" cy="72" r="12" fill="#ef4444" />
              <rect x="180" y="65" width="115" height="20" rx="6" fill="#10b981" />
              <text x="237" y="79" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Пик сокращения (Выдох)
              </text>
            </g>
          ) : (
            /* Arm Hanging Down (Full Stretch) */
            <g className="transition-all duration-300">
              <line x1="135" y1="75" x2="140" y2="110" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
              <line x1="140" y1="110" x2="145" y2="150" stroke="#d97706" strokeWidth="9" strokeLinecap="round" />
              <circle cx="145" cy="155" r="12" fill="#ef4444" />
              <rect x="180" y="135" width="115" height="20" rx="6" fill="#0f172a" />
              <text x="237" y="149" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Локти зафиксированы
              </text>
            </g>
          )}
        </svg>
      );

    case 'lateral-raise':
    default:
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-w-[300px]">
          <line x1="30" y1="190" x2="290" y2="190" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="160" cy="42" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <path d="M160 56 L160 130" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
          <path d="M155 130 L150 188" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" />
          <path d="M165 130 L170 188" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />

          {/* Shoulders Deltoids */}
          <circle cx="140" cy="68" r="11" fill="#10b981" />
          <circle cx="180" cy="68" r="11" fill="#10b981" />

          {isFinish ? (
            /* Arms Raised Parallel to Floor */
            <g className="transition-all duration-300">
              <path d="M140 68 L85 68" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
              <path d="M180 68 L235 68" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
              <circle cx="85" cy="68" r="11" fill="#3b82f6" />
              <circle cx="235" cy="68" r="11" fill="#3b82f6" />
              <rect x="110" y="90" width="100" height="20" rx="6" fill="#10b981" />
              <text x="160" y="104" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Локти чуть выше кистей
              </text>
            </g>
          ) : (
            /* Arms at Sides */
            <g className="transition-all duration-300">
              <path d="M140 68 L125 125" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
              <path d="M180 68 L195 125" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
              <circle cx="125" cy="125" r="11" fill="#3b82f6" />
              <circle cx="195" cy="125" r="11" fill="#3b82f6" />
              <rect x="110" y="135" width="100" height="20" rx="6" fill="#0f172a" />
              <text x="160" y="149" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Старт без раскачки
              </text>
            </g>
          )}
        </svg>
      );
  }
}
