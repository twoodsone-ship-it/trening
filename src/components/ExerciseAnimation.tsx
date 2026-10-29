import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, Eye, Sliders, ChevronRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

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
  },
  'core': {
    primary: 'Прямая и поперечная мышцы живота (кор)',
    secondary: 'Косые мышцы, стабилизаторы позвоночника',
    cues: [
      { text: 'Прижимайте поясницу к полу / удерживайте планку без провисания', type: 'good' },
      { text: 'Скручивание за счет пресса, а не мышц шеи', type: 'focus' },
      { text: 'Мощный выдох в точке максимального сокращения', type: 'angle' }
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

  // Animation phase loop with organic cadence
  useEffect(() => {
    if (viewMode !== 'animate' || !isPlaying) return;
    const interval = setInterval(() => {
      setActiveFrame(prev => (prev === 'start' ? 'finish' : 'start'));
    }, 1900);
    return () => clearInterval(interval);
  }, [viewMode, isPlaying]);

  const normalizedType = EXERCISE_CUES[animationType] ? animationType : (category === 'Back' ? 'row' : category === 'Legs' ? 'squat' : category === 'Shoulders' ? 'overhead-press' : category === 'Arms' ? 'bicep-curl' : category === 'Core' ? 'core' : 'bench-press');
  const cuesData = EXERCISE_CUES[normalizedType] || EXERCISE_CUES['bench-press'];

  return (
    <div className="w-full rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-inner text-slate-900 dark:text-zinc-100 space-y-4">
      
      {/* View Mode Switcher Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <button
            onClick={() => setViewMode('animate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'animate'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Живая анимация</span>
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'compare'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2 Фазы (Старт/Финиш)</span>
          </button>
          <button
            onClick={() => setViewMode('scrub')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'scrub'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Слайдер углов</span>
          </button>
        </div>

        {viewMode === 'animate' && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:bg-slate-100 transition"
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        )}
      </div>

      {/* Main Visual Display Canvas */}
      {viewMode === 'compare' ? (
        /* Side-by-Side 2-Phase Anatomical View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border-2 border-blue-400/80 dark:border-blue-700/60 rounded-2xl p-3 flex flex-col items-center shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-0.5 rounded-full mb-2 border border-blue-200 dark:border-blue-800/40">
              1. Исходное положение (Растяг / Вдох)
            </span>
            <div className="w-full h-48 flex items-center justify-center">
              {renderRealisticAnatomySvg(normalizedType, 'start')}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-400 dark:border-emerald-700/60 rounded-2xl p-3 flex flex-col items-center shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-0.5 rounded-full mb-2 border border-emerald-200 dark:border-emerald-800/40">
              2. Пиковое сокращение (Финиш / Выдох)
            </span>
            <div className="w-full h-48 flex items-center justify-center">
              {renderRealisticAnatomySvg(normalizedType, 'finish')}
            </div>
          </div>
        </div>
      ) : viewMode === 'scrub' ? (
        /* Scrubber Interactive Slider Mode */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center animate-fade-in">
          <div className="w-full h-56 flex items-center justify-center">
            {renderRealisticAnatomySvg(normalizedType, scrubProgress > 50 ? 'finish' : 'start', scrubProgress)}
          </div>
          <div className="w-full max-w-sm mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>0% Старт (Растяг)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                {scrubProgress}% амплитуды
              </span>
              <span>100% Финиш (Пик)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scrubProgress}
              onChange={e => setScrubProgress(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      ) : (
        /* Continuous Looped Animated Mode */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center relative overflow-hidden animate-fade-in shadow-xs">
          {/* Phase Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-white/95 dark:bg-zinc-950/90 backdrop-blur rounded-full text-xs font-bold border border-slate-200 dark:border-zinc-800 shadow-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${activeFrame === 'finish' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`} />
            <span className={activeFrame === 'finish' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
              {activeFrame === 'finish' ? '↑ Подъем / Пиковое усилие (Выдох)' : '↓ Опускание / Растяжение (Вдох)'}
            </span>
          </div>

          <div className="w-full h-56 flex items-center justify-center pt-4">
            {renderRealisticAnatomySvg(normalizedType, activeFrame)}
          </div>
        </div>
      )}

      {/* Anatomy Muscle Target Legend */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs gap-3 shadow-2xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Основная работающая мышца:
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5 mt-0.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 inline-block shrink-0" />
            {cuesData.primary}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Мышцы-синергисты и стабилизаторы:
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5 justify-end mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
            {cuesData.secondary}
          </span>
        </div>
      </div>

      {/* Biomechanical Form Cues Checklist */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block px-1">
          Ключевые ориентиры правильной биомеханики:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {cuesData.cues.map((cue, idx) => (
            <div 
              key={idx}
              className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start gap-2 shadow-2xs"
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
 * High-definition, realistic anatomical vector illustrations with muscular body contours,
 * equipment rendering, trajectory guides, and active muscle glow.
 */
function renderRealisticAnatomySvg(type: string, frame: 'start' | 'finish', progress?: number) {
  const isFinish = frame === 'finish';

  // Common SVG Defs (glows, metallic gradients, plate colors)
  const commonDefs = (
    <defs>
      {/* Muscle Active Glow Gradient */}
      <linearGradient id="activeMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>

      {/* Synergy Muscle Warm Gradient */}
      <linearGradient id="synergyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>

      {/* Realistic Athletic Body Metallic Shading */}
      <linearGradient id="bodySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>

      {/* Chrome Olympic Barbell Gradient */}
      <linearGradient id="chromeBar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* 25kg Olympic Red Bumper Plate */}
      <linearGradient id="bumperRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>

      {/* Gym Bench Upholstery Gradient */}
      <linearGradient id="benchLeather" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Muscle Glow Filter */}
      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  switch (type) {
    // ==========================================
    // 1. ЖИМ ШТАНГИ ЛЕЖА (BENCH PRESS)
    // ==========================================
    case 'bench-press':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}

          {/* Gym Floor */}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6,4" />

          {/* Bench Frame & Pad */}
          <rect x="50" y="142" width="225" height="15" rx="5" fill="url(#benchLeather)" stroke="#475569" strokeWidth="1" />
          <rect x="75" y="157" width="16" height="38" rx="2" fill="#334155" />
          <rect x="235" y="157" width="16" height="38" rx="2" fill="#334155" />
          {/* Bench Upright Posts */}
          <rect x="65" y="70" width="12" height="72" fill="#475569" rx="2" />
          <path d="M60 70 L77 70 L77 85" stroke="#64748b" strokeWidth="3" fill="none" />

          {/* Athlete Body Anatomical Contour */}
          {/* Head & Neck */}
          <circle cx="95" cy="133" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M102 133 L112 136" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          
          {/* Arch in lower back & Glutes planted on bench */}
          <path d="M110 136 Q135 128 160 136 L195 138" stroke="url(#bodySkinGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
          
          {/* Legs & Feet Flat on Floor */}
          <path d="M195 138 L225 155 L225 195" stroke="#0284c7" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="216" y="190" width="24" height="6" rx="2" fill="#0f172a" />

          {/* Activated Pectoral Muscles */}
          <ellipse 
            cx="142" 
            cy="133" 
            rx={isFinish ? "16" : "19"} 
            ry={isFinish ? "13" : "9"} 
            fill="url(#activeMuscleGrad)" 
            filter="url(#glowEffect)"
          />

          {isFinish ? (
            /* FINISH: Lockout over mid-chest */
            <g className="transition-all duration-300">
              {/* Extended Arms */}
              <path d="M126 132 L126 78" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              <path d="M158 132 L158 78" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              {/* Gripping Hands */}
              <circle cx="126" cy="78" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <circle cx="158" cy="78" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              {/* Barbell & Plates */}
              <line x1="45" y1="78" x2="245" y2="78" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="42" y="52" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="33" y="58" width="8" height="40" rx="2" fill="#2563eb" />
              <rect x="238" y="52" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="250" y="58" width="8" height="40" rx="2" fill="#2563eb" />
              {/* Peak Badge */}
              <rect x="175" y="88" width="100" height="20" rx="6" fill="#10b981" />
              <text x="225" y="102" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                Пик сокращения (Выдох)
              </text>
            </g>
          ) : (
            /* START: Lowered to Sternum (75° Elbows) */
            <g className="transition-all duration-300">
              {/* Tucked Elbows at 75° */}
              <path d="M125 132 L106 144 L124 114" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M158 132 L178 144 L160 114" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Hands */}
              <circle cx="124" cy="114" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <circle cx="160" cy="114" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              {/* Bar Touching Chest */}
              <line x1="45" y1="114" x2="245" y2="114" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="42" y="88" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="33" y="94" width="8" height="40" rx="2" fill="#2563eb" />
              <rect x="238" y="88" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="250" y="94" width="8" height="40" rx="2" fill="#2563eb" />
              {/* Angle Guide */}
              <path d="M142 78 L142 108" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="175" y="120" width="115" height="20" rx="6" fill="#0f172a" />
              <text x="232" y="134" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Локти 75° (Касание груди)
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 2. ЖИМ НА НАКЛОННОЙ СКАМЬЕ (INCLINE PRESS)
    // ==========================================
    case 'incline-press':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" />

          {/* 30-Degree Incline Bench Frame */}
          <path d="M70 180 L160 100 L185 105 L95 185 Z" fill="url(#benchLeather)" stroke="#475569" />
          <rect x="90" y="175" width="40" height="15" rx="3" fill="url(#benchLeather)" />
          <rect x="135" y="150" width="14" height="45" fill="#334155" />

          {/* Athlete Upper Body on 30° Incline */}
          <circle cx="168" cy="90" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M158 105 L115 170" stroke="url(#bodySkinGrad)" strokeWidth="19" strokeLinecap="round" />
          <path d="M115 170 L140 185 L140 195" stroke="#0284c7" strokeWidth="12" strokeLinecap="round" fill="none" />
          <rect x="132" y="190" width="22" height="6" fill="#0f172a" />

          {/* Clavicular Pec Fiber Activation */}
          <ellipse cx="150" cy="115" rx="14" ry="10" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            /* FINISH: Press Up */
            <g className="transition-all duration-300">
              <line x1="145" y1="112" x2="165" y2="55" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              <line x1="125" y1="130" x2="145" y2="65" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              {/* Dumbbells */}
              <circle cx="165" cy="55" r="5" fill="#f8fafc" />
              <line x1="145" y1="52" x2="185" y2="52" stroke="#334155" strokeWidth="5" />
              <rect x="142" y="42" width="8" height="20" rx="2" fill="#ef4444" />
              <rect x="180" y="42" width="8" height="20" rx="2" fill="#ef4444" />
              <rect x="190" y="65" width="105" height="20" rx="6" fill="#10b981" />
              <text x="242" y="79" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Верх груди (30° угол)
              </text>
            </g>
          ) : (
            /* START: Lowered to Clavicle */
            <g className="transition-all duration-300">
              <path d="M145 115 L125 125 L145 95" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="145" cy="95" r="5" fill="#f8fafc" />
              <line x1="125" y1="95" x2="165" y2="95" stroke="#334155" strokeWidth="5" />
              <rect x="122" y="85" width="8" height="20" rx="2" fill="#ef4444" />
              <rect x="160" y="85" width="8" height="20" rx="2" fill="#ef4444" />
              <rect x="190" y="105" width="100" height="20" rx="6" fill="#0f172a" />
              <text x="240" y="119" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Растяг верха груди
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 3. ПРИСЕДАНИЯ СО ШТАНГОЙ (SQUAT)
    // ==========================================
    case 'squat':
      return (
        <svg viewBox="0 0 340 220" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="205" x2="320" y2="205" stroke="#cbd5e1" strokeWidth="3" />

          {/* Squat Rack Frame */}
          <rect x="55" y="40" width="8" height="165" fill="#64748b" />
          <rect x="275" y="40" width="8" height="165" fill="#64748b" />

          {isFinish ? (
            /* FINISH / DEEP SQUAT (90° Parallel) */
            <g className="transition-all duration-300">
              {/* Head with eyes focused forward */}
              <circle cx="155" cy="95" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              {/* Torso angled 60°, upright chest */}
              <path d="M155 108 L138 152" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
              {/* Thigh Parallel to Floor (90°) */}
              <path d="M138 152 L185 156 L175 204" stroke="#0284c7" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="175" cy="204" rx="14" ry="4" fill="#0f172a" />
              {/* Active Quads & Glute Teardrop Glow */}
              <ellipse cx="160" cy="154" rx="20" ry="11" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              {/* Olympic Barbell on upper traps */}
              <line x1="60" y1="106" x2="250" y2="106" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="52" y="80" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              <rect x="246" y="80" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              {/* Hands on bar */}
              <circle cx="120" cy="106" r="5" fill="#f8fafc" />
              <circle cx="190" cy="106" r="5" fill="#f8fafc" />
              {/* Angle Badge */}
              <rect x="195" y="130" width="115" height="22" rx="6" fill="#10b981" />
              <text x="252" y="145" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Параллель 90° (Выдох)
              </text>
            </g>
          ) : (
            /* START / STANDING TALL LOCKOUT */
            <g className="transition-all duration-300">
              <circle cx="155" cy="42" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              {/* Upright Standing Torso */}
              <path d="M155 55 L155 125" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
              {/* Standing Legs */}
              <path d="M155 125 L144 204" stroke="#0284c7" strokeWidth="15" strokeLinecap="round" />
              <path d="M155 125 L166 204" stroke="#0369a1" strokeWidth="15" strokeLinecap="round" />
              <ellipse cx="144" cy="204" rx="12" ry="4" fill="#0f172a" />
              <ellipse cx="166" cy="204" rx="12" ry="4" fill="#0f172a" />
              {/* Barbell */}
              <line x1="60" y1="54" x2="250" y2="54" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="52" y="28" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              <rect x="246" y="28" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              {/* Hand Grip */}
              <circle cx="120" cy="54" r="5" fill="#f8fafc" />
              <circle cx="190" cy="54" r="5" fill="#f8fafc" />
              {/* Start Badge */}
              <rect x="190" y="52" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="247" y="67" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Стойка на ширине плеч
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 4. ЖИМ НОГАМИ В ТРЕНАЖЕРЕ (LEG PRESS)
    // ==========================================
    case 'leg-press':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" />

          {/* 45° Sled Machine Rails & Platform */}
          <line x1="90" y1="180" x2="270" y2="50" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <rect x="70" y="130" width="50" height="55" rx="4" fill="url(#benchLeather)" transform="rotate(-30 70 130)" />

          {isFinish ? (
            /* FINISH: Platform Extended (Safe Soft Knees) */
            <g className="transition-all duration-300">
              {/* Sled at top of rail */}
              <rect x="235" y="45" width="45" height="20" rx="4" fill="#334155" transform="rotate(-45 235 45)" />
              <rect x="250" y="25" width="12" height="40" fill="url(#bumperRed)" rx="2" />
              {/* Athlete Back & Head */}
              <circle cx="85" cy="115" r="12" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              <path d="M92 125 L125 160" stroke="url(#bodySkinGrad)" strokeWidth="18" strokeLinecap="round" />
              {/* Legs extended (no knee lock!) */}
              <path d="M125 160 L185 110 L235 68" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="185" cy="110" rx="16" ry="10" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              <rect x="180" y="145" width="125" height="22" rx="6" fill="#10b981" />
              <text x="242" y="160" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                ⚠️ Мягкие колени (без замка!)
              </text>
            </g>
          ) : (
            /* START: Sled Lowered (90° Knee Bend) */
            <g className="transition-all duration-300">
              {/* Sled lowered */}
              <rect x="175" y="90" width="45" height="20" rx="4" fill="#334155" transform="rotate(-45 175 90)" />
              <rect x="190" y="70" width="12" height="40" fill="url(#bumperRed)" rx="2" />
              {/* Athlete */}
              <circle cx="85" cy="115" r="12" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              <path d="M92 125 L125 160" stroke="url(#bodySkinGrad)" strokeWidth="18" strokeLinecap="round" />
              {/* Knees bent to 90° towards ribs */}
              <path d="M125 160 L140 115 L180 108" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="138" cy="125" rx="16" ry="10" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              <rect x="180" y="145" width="125" height="22" rx="6" fill="#0f172a" />
              <text x="242" y="160" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Угол в коленях 90° (Вдох)
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 5. РУМЫНСКАЯ И СТАНОВАЯ ТЯГА (DEADLIFT)
    // ==========================================
    case 'deadlift':
      return (
        <svg viewBox="0 0 340 220" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="205" x2="320" y2="205" stroke="#cbd5e1" strokeWidth="3" />

          {isFinish ? (
            /* FINISH: Full Lockout at top */
            <g className="transition-all duration-300">
              <circle cx="170" cy="40" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              {/* Upright Back & Hips Driven Through */}
              <path d="M170 53 L170 120" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
              {/* Glutes & Hamstrings contract */}
              <ellipse cx="170" cy="120" rx="14" ry="12" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              {/* Straight Standing Legs */}
              <path d="M170 120 L162 204" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
              <path d="M170 120 L178 204" stroke="#0369a1" strokeWidth="14" strokeLinecap="round" />
              {/* Arms holding bar at thighs */}
              <path d="M164 68 L160 135" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" />
              <line x1="80" y1="135" x2="260" y2="135" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="70" y="105" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              <rect x="256" y="105" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              {/* Badge */}
              <rect x="195" y="45" width="110" height="22" rx="6" fill="#10b981" />
              <text x="250" y="60" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Фиксация таза (Выдох)
              </text>
            </g>
          ) : (
            /* START / HIP HINGE: Bar below knees */
            <g className="transition-all duration-300">
              <circle cx="195" cy="88" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              {/* Torso Hinged Forward 45° with Flat Spine */}
              <path d="M195 98 L135 135" stroke="url(#bodySkinGrad)" strokeWidth="19" strokeLinecap="round" />
              {/* Deep Hamstring & Glute Stretch */}
              <path d="M135 135 L165 170 L160 204" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="145" cy="150" rx="18" ry="10" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              {/* Arms hanging vertically */}
              <path d="M185 105 L180 170" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" />
              {/* Barbell sliding down shins */}
              <line x1="80" y1="170" x2="260" y2="170" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="70" y="140" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              <rect x="256" y="140" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              {/* Angle Callout */}
              <rect x="195" y="110" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="252" y="125" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Прямая спина (Таз назад)
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 6. АРМЕЙСКИЙ ЖИМ СТОЯ (OVERHEAD PRESS)
    // ==========================================
    case 'overhead-press':
      return (
        <svg viewBox="0 0 340 220" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="205" x2="320" y2="205" stroke="#cbd5e1" strokeWidth="3" />

          {/* Standing Athlete Body */}
          <circle cx="170" cy={isFinish ? "68" : "62"} r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M170 78 L170 145" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
          <path d="M170 145 L158 204" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
          <path d="M170 145 L182 204" stroke="#0369a1" strokeWidth="14" strokeLinecap="round" />

          {/* Deltoids Glow */}
          <ellipse cx="152" cy="85" rx="9" ry="8" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
          <ellipse cx="188" cy="85" rx="9" ry="8" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            /* FINISH: Barbell Locked Overhead */
            <g className="transition-all duration-300">
              <path d="M155 85 L158 28" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <path d="M185 85 L182 28" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="158" cy="28" r="5" fill="#f8fafc" />
              <circle cx="182" cy="28" r="5" fill="#f8fafc" />
              {/* Bar overhead */}
              <line x1="80" y1="28" x2="260" y2="28" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="72" y="8" width="10" height="40" rx="2" fill="url(#bumperRed)" />
              <rect x="258" y="8" width="10" height="40" rx="2" fill="url(#bumperRed)" />
              <rect x="195" y="42" width="115" height="22" rx="6" fill="#10b981" />
              <text x="252" y="57" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Штанга над макушкой (Выдох)
              </text>
            </g>
          ) : (
            /* START: Barbell at Clavicles */
            <g className="transition-all duration-300">
              <path d="M152 85 L144 110 L158 80" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M188 85 L196 110 L182 80" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="158" cy="80" r="5" fill="#f8fafc" />
              <circle cx="182" cy="80" r="5" fill="#f8fafc" />
              <line x1="80" y1="80" x2="260" y2="80" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="72" y="60" width="10" height="40" rx="2" fill="url(#bumperRed)" />
              <rect x="258" y="60" width="10" height="40" rx="2" fill="url(#bumperRed)" />
              <rect x="195" y="95" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="252" y="110" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Предплечья вертикальны
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 7. ТЯГА ВЕРХНЕГО БЛОКА (LAT PULLDOWN)
    // ==========================================
    case 'lat-pulldown':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          {/* Machine Cable Frame */}
          <rect x="165" y="10" width="10" height="40" fill="#64748b" />
          <circle cx="170" cy="50" r="6" fill="#334155" />
          {/* Seat & Thigh Roller Pads */}
          <rect x="135" y="160" width="70" height="12" rx="3" fill="url(#benchLeather)" />
          <rect x="165" y="172" width="10" height="25" fill="#475569" />
          <rect x="145" y="138" width="50" height="10" rx="4" fill="#334155" />

          {/* Seated Athlete */}
          <circle cx="170" cy="100" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M170 113 L170 160" stroke="url(#bodySkinGrad)" strokeWidth="22" strokeLinecap="round" />

          {/* Lats Wing Activation Glow */}
          <path d="M152 118 Q140 135 158 152 Q168 135 152 118" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
          <path d="M188 118 Q200 135 182 152 Q172 135 188 118" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            /* FINISH: Bar at Upper Clavicle */
            <g className="transition-all duration-300">
              <line x1="170" y1="50" x2="170" y2="92" stroke="#94a3b8" strokeWidth="3" />
              {/* Wide Grip Lat Bar */}
              <path d="M85 102 Q170 92 255 102" stroke="url(#chromeBar)" strokeWidth="7" fill="none" strokeLinecap="round" />
              {/* Elbows tucked down and back */}
              <path d="M152 115 L140 142 L115 102" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M188 115 L200 142 L225 102" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <rect x="200" y="70" width="115" height="22" rx="6" fill="#10b981" />
              <text x="257" y="85" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Сведение лопаток (Выдох)
              </text>
            </g>
          ) : (
            /* START: Full Overhead Stretch */
            <g className="transition-all duration-300">
              <line x1="170" y1="50" x2="170" y2="58" stroke="#94a3b8" strokeWidth="3" />
              <path d="M85 68 Q170 58 255 68" stroke="url(#chromeBar)" strokeWidth="7" fill="none" strokeLinecap="round" />
              {/* Arms extended overhead */}
              <path d="M155 115 L115 68" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" />
              <path d="M185 115 L225 68" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" />
              <rect x="200" y="35" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="257" y="50" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Полный растяг широчайших
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 8. ТЯГА В НАКЛОНЕ К ПОЯСУ (BENT-OVER ROW)
    // ==========================================
    case 'row':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" />

          {/* Athlete Torso Bent at 45° */}
          <circle cx="205" cy="85" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M205 95 L145 135" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
          <path d="M145 135 L165 170 L158 194" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Back Thickness / Rhomboids Glow */}
          <ellipse cx="170" cy="115" rx="16" ry="12" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            /* FINISH: Bar pulled to navel, elbows driven back */
            <g className="transition-all duration-300">
              <path d="M190 105 L170 100 L185 135" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="185" cy="135" r="5" fill="#f8fafc" />
              <line x1="90" y1="135" x2="270" y2="135" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="80" y="112" width="12" height="46" rx="2" fill="url(#bumperRed)" />
              <rect x="268" y="112" width="12" height="46" rx="2" fill="url(#bumperRed)" />
              <rect x="200" y="55" width="115" height="22" rx="6" fill="#10b981" />
              <text x="257" y="70" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Тяга к пупку (Выдох)
              </text>
            </g>
          ) : (
            /* START: Arms hanging stretched */
            <g className="transition-all duration-300">
              <path d="M190 105 L180 170" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="180" cy="170" r="5" fill="#f8fafc" />
              <line x1="90" y1="170" x2="270" y2="170" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="80" y="147" width="12" height="46" rx="2" fill="url(#bumperRed)" />
              <rect x="268" y="147" width="12" height="46" rx="2" fill="url(#bumperRed)" />
              <rect x="200" y="130" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="257" y="145" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Угол наклона 45-60°
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 9. СГИБАНИЯ НА БИЦЕПС (BICEP CURL)
    // ==========================================
    case 'bicep-curl':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" />

          {/* Standing Torso */}
          <circle cx="165" cy="55" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M165 68 L165 140" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
          <path d="M165 140 L155 194" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
          <path d="M165 140 L175 194" stroke="#0369a1" strokeWidth="14" strokeLinecap="round" />

          {isFinish ? (
            /* FINISH: Peak Bicep Squeeze with Supination */
            <g className="transition-all duration-300">
              {/* Elbow pinned at waist, forearm folded up at 120° */}
              <path d="M152 78 L152 118 L160 88" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Bulging Bicep Peak */}
              <ellipse cx="152" cy="96" rx="10" ry="14" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              {/* Dumbbell held at shoulder level */}
              <circle cx="160" cy="88" r="5" fill="#f8fafc" />
              <line x1="140" y1="88" x2="180" y2="88" stroke="#334155" strokeWidth="6" />
              <rect x="135" y="78" width="7" height="20" rx="2" fill="#ef4444" />
              <rect x="178" y="78" width="7" height="20" rx="2" fill="#ef4444" />
              <rect x="195" y="75" width="115" height="22" rx="6" fill="#10b981" />
              <text x="252" y="90" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Пик бицепса (Выдох)
              </text>
            </g>
          ) : (
            /* START: Full Extension Down */
            <g className="transition-all duration-300">
              <path d="M152 78 L152 145" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              <ellipse cx="152" cy="110" rx="7" ry="12" fill="url(#activeMuscleGrad)" />
              <circle cx="152" cy="145" r="5" fill="#f8fafc" />
              <line x1="135" y1="145" x2="170" y2="145" stroke="#334155" strokeWidth="6" />
              <rect x="130" y="135" width="7" height="20" rx="2" fill="#ef4444" />
              <rect x="168" y="135" width="7" height="20" rx="2" fill="#ef4444" />
              <rect x="195" y="130" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="252" y="145" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Локти прижаты к бокам
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 10. РАЗГИБАНИЯ НА ТРИЦЕПС НА БЛОКЕ (TRICEP PUSHDOWN)
    // ==========================================
    case 'tricep-pushdown':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" />

          {/* Cable Pulley Header */}
          <rect x="120" y="10" width="15" height="35" fill="#64748b" />
          <circle cx="127" cy="45" r="6" fill="#334155" />

          {/* Athlete Stance */}
          <circle cx="170" cy="55" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M170 68 L165 140" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
          <path d="M165 140 L155 194" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
          <path d="M165 140 L175 194" stroke="#0369a1" strokeWidth="14" strokeLinecap="round" />

          {/* Triceps Horseshoe Glow */}
          <ellipse cx="158" cy="98" rx="8" ry="14" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            /* FINISH: Full Tricep Lockout Down */
            <g className="transition-all duration-300">
              <line x1="127" y1="45" x2="148" y2="145" stroke="#94a3b8" strokeWidth="2.5" />
              <path d="M162 78 L160 115 L148 145" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="148" cy="145" r="5" fill="#f8fafc" />
              <line x1="135" y1="145" x2="160" y2="145" stroke="#334155" strokeWidth="5" />
              <rect x="195" y="85" width="120" height="22" rx="6" fill="#10b981" />
              <text x="255" y="100" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Полный лок-аут 1 сек. (Выдох)
              </text>
            </g>
          ) : (
            /* START: Forearms at 90° */
            <g className="transition-all duration-300">
              <line x1="127" y1="45" x2="145" y2="110" stroke="#94a3b8" strokeWidth="2.5" />
              <path d="M162 78 L162 115 L145 110" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="145" cy="110" r="5" fill="#f8fafc" />
              <line x1="135" y1="108" x2="155" y2="112" stroke="#334155" strokeWidth="5" />
              <rect x="195" y="115" width="120" height="22" rx="6" fill="#0f172a" />
              <text x="255" y="130" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Локти строго зафиксированы
              </text>
            </g>
          )}
        </svg>
      );

    // ==========================================
    // 11. МАХИ ГАНТЕЛЯМИ В СТОРОНЫ (LATERAL RAISES)
    // ==========================================
    case 'lateral-raise':
    default:
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" />

          {/* Standing Torso */}
          <circle cx="170" cy="55" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M170 68 L170 140" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
          <path d="M170 140 L158 194" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
          <path d="M170 140 L182 194" stroke="#0369a1" strokeWidth="14" strokeLinecap="round" />

          {/* Middle Deltoid Bulge Glow */}
          <ellipse cx="150" cy="78" rx="10" ry="9" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
          <ellipse cx="190" cy="78" rx="10" ry="9" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            /* FINISH: Arms Raised to Parallel / Slight poured pitcher tilt */
            <g className="transition-all duration-300">
              <path d="M150 78 L90 85" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <path d="M190 78 L250 85" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="90" cy="85" r="5" fill="#f8fafc" />
              <circle cx="250" cy="85" r="5" fill="#f8fafc" />
              {/* Dumbbells */}
              <line x1="90" y1="72" x2="90" y2="98" stroke="#334155" strokeWidth="5" />
              <rect x="83" y="68" width="14" height="6" rx="1" fill="#ef4444" />
              <rect x="83" y="96" width="14" height="6" rx="1" fill="#ef4444" />
              <line x1="250" y1="72" x2="250" y2="98" stroke="#334155" strokeWidth="5" />
              <rect x="243" y="68" width="14" height="6" rx="1" fill="#ef4444" />
              <rect x="243" y="96" width="14" height="6" rx="1" fill="#ef4444" />
              <rect x="180" y="32" width="130" height="22" rx="6" fill="#10b981" />
              <text x="245" y="47" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Локти выше кистей (Выдох)
              </text>
            </g>
          ) : (
            /* START: Arms Down at Sides */
            <g className="transition-all duration-300">
              <path d="M150 78 L140 145" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <path d="M190 78 L200 145" stroke="url(#synergyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="140" cy="145" r="5" fill="#f8fafc" />
              <circle cx="200" cy="145" r="5" fill="#f8fafc" />
              <line x1="140" y1="135" x2="140" y2="155" stroke="#334155" strokeWidth="5" />
              <rect x="133" y="132" width="14" height="5" rx="1" fill="#ef4444" />
              <rect x="133" y="153" width="14" height="5" rx="1" fill="#ef4444" />
              <line x1="200" y1="135" x2="200" y2="155" stroke="#334155" strokeWidth="5" />
              <rect x="193" y="132" width="14" height="5" rx="1" fill="#ef4444" />
              <rect x="193" y="153" width="14" height="5" rx="1" fill="#ef4444" />
              <rect x="180" y="150" width="125" height="22" rx="6" fill="#0f172a" />
              <text x="242" y="165" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Без раскачки корпусом
              </text>
            </g>
          )}
        </svg>
      );
  }
}
