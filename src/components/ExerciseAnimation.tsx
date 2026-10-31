import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, Eye, Sliders, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Maximize2, Minimize2, Gauge } from 'lucide-react';
import { EXERCISE_GIF_MAP } from '../data/exerciseCatalog';

interface ExerciseAnimationProps {
  exerciseId?: string;
  animationType: string;
  gifUrl?: string;
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
  exerciseId,
  animationType,
  gifUrl,
  category = 'Chest',
  exerciseName = ''
}) => {
  // Resolve verified GIF URL from props or catalog map
  const resolvedGifUrl = gifUrl || (exerciseId && EXERCISE_GIF_MAP[exerciseId]) || EXERCISE_GIF_MAP[animationType];

  const [viewMode, setViewMode] = useState<'gif' | 'compare' | 'scrub'>('gif');
  const [activeFrame, setActiveFrame] = useState<'start' | 'finish'>('start');
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubProgress, setScrubProgress] = useState(50); // 0 to 100
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [gifLoadError, setGifLoadError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 0.75 | 0.5>(1);

  // Breathing tempo rhythm ticker (3-second rep cycle)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFrame(prev => (prev === 'start' ? 'finish' : 'start'));
    }, Math.round(1800 / playbackSpeed));
    return () => clearInterval(interval);
  }, [playbackSpeed]);

  const normalizedType = EXERCISE_CUES[animationType] ? animationType : (category === 'Back' ? 'row' : category === 'Legs' ? 'squat' : category === 'Shoulders' ? 'overhead-press' : category === 'Arms' ? 'bicep-curl' : category === 'Core' ? 'core' : 'bench-press');
  const cuesData = EXERCISE_CUES[normalizedType] || EXERCISE_CUES['bench-press'];

  return (
    <div className="w-full rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3.5 sm:p-5 shadow-inner text-slate-900 dark:text-zinc-100 space-y-4">
      
      {/* View Mode Switcher Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs max-w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => setViewMode('gif')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              viewMode === 'gif'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">3D GIF</span>
            <span className="hidden sm:inline">🎬 3D GIF Анимация</span>
          </button>

          <button
            onClick={() => setViewMode('compare')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              viewMode === 'compare'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">2 Фазы</span>
            <span className="hidden sm:inline">2 Фазы (Старт/Пик)</span>
          </button>

          <button
            onClick={() => setViewMode('scrub')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              viewMode === 'scrub'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Слайдер</span>
            <span className="hidden sm:inline">Слайдер углов</span>
          </button>
        </div>

        {/* Speed / Zoom controls */}
        {viewMode === 'gif' && resolvedGifUrl && !gifLoadError && (
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 text-[11px] font-bold shrink-0">
            <span className="text-slate-400 px-1 flex items-center gap-1">
              <Gauge className="w-3 h-3" />
            </span>
            <button
              onClick={() => setPlaybackSpeed(0.5)}
              className={`px-2 py-1 rounded-xl transition active:scale-95 ${
                playbackSpeed === 0.5 ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
              }`}
              title="Замедленный режим для разбора техники"
            >
              0.5x
            </button>
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={`px-2 py-1 rounded-xl transition active:scale-95 ${
                playbackSpeed === 1 ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition ml-0.5 active:scale-95"
              title="Увеличить"
            >
              {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Visual Display Canvas */}
      {viewMode === 'gif' ? (
        /* Real High-Resolution 3D Anatomical GIF */
        <div className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center overflow-hidden shadow-xs min-h-[260px]">
          
          {/* Header Row: Breathing & Phase Guidance + Verified Badge (NEVER overlaps) */}
          <div className="w-full flex items-center justify-between gap-1.5 mb-2 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-zinc-950/90 backdrop-blur rounded-full text-[11px] font-bold border border-slate-200 dark:border-zinc-800 shadow-2xs min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeFrame === 'finish' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`} />
              <span className={`truncate ${activeFrame === 'finish' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                <span className="sm:hidden">{activeFrame === 'finish' ? '↑ Выдох (Пик)' : '↓ Вдох (Опускание)'}</span>
                <span className="hidden sm:inline">{activeFrame === 'finish' ? '↑ Подъем / Сокращение (Выдох)' : '↓ Опускание / Растяжение (Вдох)'}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs shrink-0 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>3D Модель</span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {!isGifLoaded && !gifLoadError && (
            <div className="w-full h-56 flex flex-col items-center justify-center gap-2 text-slate-400 animate-pulse">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Загрузка анатомической 3D-анимации...</span>
            </div>
          )}

          {/* GIF Presentation Container */}
          {resolvedGifUrl && !gifLoadError ? (
            <div className={`w-full flex items-center justify-center transition-all ${isZoomed ? 'scale-110 sm:scale-125 my-4' : ''}`}>
              <img
                src={resolvedGifUrl}
                alt={exerciseName || cuesData.primary}
                loading="eager"
                onLoad={() => setIsGifLoaded(true)}
                onError={() => {
                  setGifLoadError(true);
                  setIsGifLoaded(false);
                }}
                className={`max-h-64 sm:max-h-72 w-auto object-contain rounded-2xl transition-opacity duration-300 ${
                  isGifLoaded ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />
            </div>
          ) : (
            /* Fallback to Anatomical Vector if offline or GIF unavailable */
            <div className="w-full h-56 flex items-center justify-center pt-2">
              {renderRealisticAnatomySvg(normalizedType, activeFrame)}
            </div>
          )}

          {/* Bottom Trajectory & Bar Alignment Cue */}
          <div className="mt-2 w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 px-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Правильное положение снаряда и суставов</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {playbackSpeed}x темп
            </span>
          </div>
        </div>
      ) : viewMode === 'compare' ? (
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
      ) : (
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
      )}

      {/* Anatomy Muscle Target Legend */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs shadow-2xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Основная работающая мышца:
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 inline-block shrink-0" />
            <span>{cuesData.primary}</span>
          </span>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Мышцы-синергисты и стабилизаторы:
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5 sm:justify-end mt-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
            <span>{cuesData.secondary}</span>
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
 * Clean vector schematic illustrations with straight physical bar alignment,
 * joint angles, and active muscle glow.
 */
function renderRealisticAnatomySvg(type: string, frame: 'start' | 'finish', progress?: number) {
  const isFinish = frame === 'finish';

  const commonDefs = (
    <defs>
      <linearGradient id="activeMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="synergyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="bodySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="chromeBar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="bumperRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="benchLeather" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  switch (type) {
    case 'bench-press':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="195" x2="320" y2="195" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6,4" />
          <rect x="50" y="142" width="225" height="15" rx="5" fill="url(#benchLeather)" stroke="#475569" strokeWidth="1" />
          <rect x="75" y="157" width="16" height="38" rx="2" fill="#334155" />
          <rect x="235" y="157" width="16" height="38" rx="2" fill="#334155" />
          <rect x="65" y="70" width="12" height="72" fill="#475569" rx="2" />
          <path d="M60 70 L77 70 L77 85" stroke="#64748b" strokeWidth="3" fill="none" />
          <circle cx="95" cy="133" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <path d="M102 133 L112 136" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <path d="M110 136 Q135 128 160 136 L195 138" stroke="url(#bodySkinGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
          <path d="M195 138 L225 155 L225 195" stroke="#0284c7" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="216" y="190" width="24" height="6" rx="2" fill="#0f172a" />
          <ellipse cx="142" cy="133" rx={isFinish ? "16" : "19"} ry={isFinish ? "13" : "9"} fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />

          {isFinish ? (
            <g className="transition-all duration-300">
              <path d="M126 132 L126 78" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              <path d="M158 132 L158 78" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" />
              <circle cx="126" cy="78" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <circle cx="158" cy="78" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <line x1="45" y1="78" x2="245" y2="78" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="42" y="52" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="33" y="58" width="8" height="40" rx="2" fill="#2563eb" />
              <rect x="238" y="52" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="250" y="58" width="8" height="40" rx="2" fill="#2563eb" />
              <rect x="175" y="88" width="100" height="20" rx="6" fill="#10b981" />
              <text x="225" y="102" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                Пик сокращения (Выдох)
              </text>
            </g>
          ) : (
            <g className="transition-all duration-300">
              <path d="M125 132 L106 144 L124 114" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M158 132 L178 144 L160 114" stroke="url(#synergyGrad)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="124" cy="114" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <circle cx="160" cy="114" r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <line x1="45" y1="114" x2="245" y2="114" stroke="url(#chromeBar)" strokeWidth="7" strokeLinecap="round" />
              <rect x="42" y="88" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="33" y="94" width="8" height="40" rx="2" fill="#2563eb" />
              <rect x="238" y="88" width="11" height="52" rx="3" fill="url(#bumperRed)" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="250" y="94" width="8" height="40" rx="2" fill="#2563eb" />
              <rect x="175" y="120" width="115" height="20" rx="6" fill="#0f172a" />
              <text x="232" y="134" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Локти 75° (Касание груди)
              </text>
            </g>
          )}
        </svg>
      );

    case 'squat':
      return (
        <svg viewBox="0 0 340 220" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="205" x2="320" y2="205" stroke="#cbd5e1" strokeWidth="3" />
          <rect x="55" y="40" width="8" height="165" fill="#64748b" />
          <rect x="275" y="40" width="8" height="165" fill="#64748b" />

          {isFinish ? (
            <g className="transition-all duration-300">
              <circle cx="155" cy="95" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              <path d="M155 108 L138 152" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
              <path d="M138 152 L185 156 L175 204" stroke="#0284c7" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="175" cy="204" rx="14" ry="4" fill="#0f172a" />
              <ellipse cx="160" cy="154" rx="20" ry="11" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              <line x1="60" y1="106" x2="250" y2="106" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="52" y="80" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              <rect x="246" y="80" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              <rect x="195" y="130" width="115" height="22" rx="6" fill="#10b981" />
              <text x="252" y="145" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Параллель 90° (Выдох)
              </text>
            </g>
          ) : (
            <g className="transition-all duration-300">
              <circle cx="155" cy="42" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              <path d="M155 55 L155 125" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
              <path d="M155 125 L144 204" stroke="#0284c7" strokeWidth="15" strokeLinecap="round" />
              <path d="M155 125 L166 204" stroke="#0369a1" strokeWidth="15" strokeLinecap="round" />
              <ellipse cx="144" cy="204" rx="12" ry="4" fill="#0f172a" />
              <ellipse cx="166" cy="204" rx="12" ry="4" fill="#0f172a" />
              <line x1="60" y1="54" x2="250" y2="54" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="52" y="28" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              <rect x="246" y="28" width="12" height="52" rx="3" fill="url(#bumperRed)" />
              <rect x="190" y="52" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="247" y="67" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Стойка на ширине плеч
              </text>
            </g>
          )}
        </svg>
      );

    case 'deadlift':
    default:
      return (
        <svg viewBox="0 0 340 220" className="w-full h-full max-w-[320px]">
          {commonDefs}
          <line x1="20" y1="205" x2="320" y2="205" stroke="#cbd5e1" strokeWidth="3" />
          {isFinish ? (
            <g className="transition-all duration-300">
              <circle cx="170" cy="40" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              <path d="M170 53 L170 120" stroke="url(#bodySkinGrad)" strokeWidth="20" strokeLinecap="round" />
              <ellipse cx="170" cy="120" rx="14" ry="12" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              <path d="M170 120 L162 204" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
              <path d="M170 120 L178 204" stroke="#0369a1" strokeWidth="14" strokeLinecap="round" />
              <path d="M164 68 L160 135" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" />
              <line x1="80" y1="135" x2="260" y2="135" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="70" y="105" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              <rect x="256" y="105" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              <rect x="195" y="45" width="110" height="22" rx="6" fill="#10b981" />
              <text x="250" y="60" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                Фиксация таза (Выдох)
              </text>
            </g>
          ) : (
            <g className="transition-all duration-300">
              <circle cx="195" cy="88" r="13" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              <path d="M195 98 L135 135" stroke="url(#bodySkinGrad)" strokeWidth="19" strokeLinecap="round" />
              <path d="M135 135 L165 170 L160 204" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <ellipse cx="145" cy="150" rx="18" ry="10" fill="url(#activeMuscleGrad)" filter="url(#glowEffect)" />
              <path d="M185 105 L180 170" stroke="url(#synergyGrad)" strokeWidth="9" strokeLinecap="round" />
              <line x1="80" y1="170" x2="260" y2="170" stroke="url(#chromeBar)" strokeWidth="8" strokeLinecap="round" />
              <rect x="70" y="140" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              <rect x="256" y="140" width="14" height="60" rx="3" fill="url(#bumperRed)" />
              <rect x="195" y="110" width="115" height="22" rx="6" fill="#0f172a" />
              <text x="252" y="125" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                📐 Прямая спина (Таз назад)
              </text>
            </g>
          )}
        </svg>
      );
  }
}
