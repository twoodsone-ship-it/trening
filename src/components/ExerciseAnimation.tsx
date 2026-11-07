import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Eye, Gauge, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { EXERCISE_GIF_MAP } from '../data/exerciseCatalog';
import type { ExerciseTechniqueGuide } from '../types';
import { cn } from '../utils/cn';

interface ExerciseAnimationProps {
  exerciseId?: string;
  animationType: string;
  gifUrl?: string;
  category?: string;
  exerciseName?: string;
  technique?: ExerciseTechniqueGuide;
}

interface FormCue {
  text: string;
  type: 'good' | 'angle' | 'focus';
}

const EXERCISE_CUES: Record<string, { cues: FormCue[]; primary: string; secondary: string; startTip: string; finishTip: string }> = {
  'bench-press': {
    primary: 'Грудные',
    secondary: 'Передняя дельта, трицепс',
    startTip: 'Штанга на линии сосков, лопатки сведены, локти ~75°',
    finishTip: 'Выжмите вверх без отрыва таза, локти не выпрямлять в замок резко',
    cues: [
      { text: 'Локти 70–75° к корпусу', type: 'angle' },
      { text: 'Лопатки прижаты к скамье', type: 'good' },
      { text: 'Опускание на линию сосков', type: 'focus' }
    ]
  },
  squat: {
    primary: 'Квадрицепсы, ягодицы',
    secondary: 'Кор, разгибатели спины',
    startTip: 'Стойка на ширине плеч, носки чуть наружу, гриф на трапециях',
    finishTip: 'Бедро до параллели, колени по носкам, грудь вверх',
    cues: [
      { text: 'Глубина до параллели', type: 'angle' },
      { text: 'Колени сонаправлены с носками', type: 'good' },
      { text: 'Таз назад, спина нейтральна', type: 'focus' }
    ]
  },
  row: {
    primary: 'Толщина спины',
    secondary: 'Бицепс, задняя дельта',
    startTip: 'Наклон 45–60°, руки вытянуты, корпус стабилен',
    finishTip: 'Тяга к животу, лопатки сведены, без рывка',
    cues: [
      { text: 'Тяните к низу живота', type: 'focus' },
      { text: 'Локти вдоль корпуса', type: 'good' },
      { text: 'Без раскачки корпусом', type: 'angle' }
    ]
  },
  'overhead-press': {
    primary: 'Дельты',
    secondary: 'Трицепс, кор',
    startTip: 'Гриф на ключицах, предплечья вертикальны, кор напряжён',
    finishTip: 'Жим над макушкой строго вверх, без прогиба поясницы',
    cues: [
      { text: 'Траектория вертикальная', type: 'angle' },
      { text: 'Ягодицы и пресс сжаты', type: 'good' },
      { text: 'Не отклоняйте голову назад резко', type: 'focus' }
    ]
  },
  'lat-pulldown': {
    primary: 'Широчайшие',
    secondary: 'Бицепс, ромбовидные',
    startTip: 'Хват шире плеч, корпус чуть назад ≤15°',
    finishTip: 'Тяга локтями вниз к рёбрам, лопатки вниз и вместе',
    cues: [
      { text: 'Тяните локтями, не кистями', type: 'focus' },
      { text: 'Отклонение ≤15°', type: 'angle' },
      { text: 'Пиковое сведение лопаток', type: 'good' }
    ]
  },
  'bicep-curl': {
    primary: 'Бицепс',
    secondary: 'Предплечья',
    startTip: 'Локти у корпуса, плечи расслаблены',
    finishTip: 'Подъём без читинга, фиксация вверху 0.5 сек',
    cues: [
      { text: 'Локти неподвижны', type: 'good' },
      { text: 'Без раскачки корпусом', type: 'focus' },
      { text: 'Контроль негатива', type: 'angle' }
    ]
  },
  core: {
    primary: 'Пресс / кор',
    secondary: 'Косые, стабилизаторы',
    startTip: 'Нейтральная поясница, рёбра «вниз»',
    finishTip: 'Сокращение пресса на выдохе без рывка шеей',
    cues: [
      { text: 'Поясница без провисания', type: 'good' },
      { text: 'Скручивание прессом, не шеей', type: 'focus' },
      { text: 'Выдох на сокращении', type: 'angle' }
    ]
  },
  cardio: {
    primary: 'Сердечно-сосудистая система',
    secondary: 'Ноги, кор',
    startTip: 'Лёгкий старт 1–2 мин, ровное дыхание',
    finishTip: 'Держите темп разговора / целевую зону пульса',
    cues: [
      { text: 'Не задерживайте дыхание', type: 'good' },
      { text: 'Мягкая постановка стопы', type: 'focus' },
      { text: 'Плечи расслаблены', type: 'angle' }
    ]
  }
};

const GENERIC_CUES = {
  primary: 'По карточке упражнения',
  secondary: 'Стабилизаторы',
  startTip: 'Прими устойчивое положение и настрой оборудование под себя.',
  finishTip: 'Выполняй движение плавно и контролируй возвращение в исходное положение.',
  cues: [
    { text: 'Сохраняй контролируемый темп', type: 'focus' as const },
    { text: 'Не задерживай дыхание', type: 'good' as const },
    { text: 'Остановись при боли или потере техники', type: 'angle' as const }
  ]
};

/**
 * GIF-first technique viewer. Phase/slider modes use clean cue panels
 * instead of broken anatomy SVG.
 */
export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseId,
  animationType,
  gifUrl,
  category = 'Chest',
  exerciseName = '',
  technique
}) => {
  const resolvedGifUrl = gifUrl || (exerciseId && EXERCISE_GIF_MAP[exerciseId]) || undefined;
  const [viewMode, setViewMode] = useState<'gif' | 'compare' | 'scrub'>('gif');
  const [phase, setPhase] = useState<'start' | 'finish'>('start');
  const [scrub, setScrub] = useState(40);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const mappedCues = EXERCISE_CUES[animationType];
  const cues = technique ? {
    primary: technique.primaryMuscles,
    secondary: 'Сопутствующие мышцы работают как стабилизаторы',
    startTip: technique.setup,
    finishTip: technique.execution,
    cues: [
      { text: technique.breathing, type: 'good' as const },
      ...technique.mistakes.slice(0, 2).map((text: string) => ({ text: `Избегай: ${text}`, type: 'angle' as const }))
    ]
  } : mappedCues || GENERIC_CUES;

  useEffect(() => {
    if (viewMode !== 'gif') return;
    const id = setInterval(() => setPhase(p => (p === 'start' ? 'finish' : 'start')), 1800);
    return () => clearInterval(id);
  }, [viewMode]);

  useEffect(() => {
    setPhase(scrub > 50 ? 'finish' : 'start');
  }, [scrub]);

  return (
    <div className="w-full rounded-3xl bg-ink-2 border border-white/10 p-3.5 space-y-4 text-white">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex bg-ink p-1 rounded-2xl border border-white/10 overflow-x-auto">
          {(
            [
              { id: 'gif' as const, label: 'GIF', icon: Activity },
              { id: 'compare' as const, label: '2 фазы', icon: Eye },
              { id: 'scrub' as const, label: 'Слайдер', icon: Gauge }
            ]
          ).map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setViewMode(m.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap',
                viewMode === m.id ? 'bg-lime text-ink' : 'text-muted'
              )}
            >
              <m.icon className="w-3.5 h-3.5" /> {m.label}
            </button>
          ))}
        </div>
        {viewMode === 'gif' && resolvedGifUrl && !gifError && (
          <button type="button" onClick={() => setZoomed(z => !z)} className="p-2 rounded-xl border border-white/10 text-muted">
            {zoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {viewMode === 'gif' && (
        <div className="relative rounded-3xl border border-white/10 bg-ink p-3 min-h-[240px] flex flex-col items-center">
          <div className="w-full flex justify-between mb-2">
            <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', phase === 'finish' ? 'text-lime border-lime/30 bg-lime/10' : 'text-sky-300 border-sky-400/30 bg-sky-500/10')}>
              {phase === 'finish' ? '↑ Выдох · пик' : '↓ Вдох · растяжение'}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-lime/10 text-lime border border-lime/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Техника
            </span>
          </div>

          {resolvedGifUrl && !gifError ? (
            <img
              src={resolvedGifUrl}
              alt={exerciseName}
              onLoad={() => setGifLoaded(true)}
              onError={() => setGifError(true)}
              className={cn(
                'max-h-64 w-auto object-contain rounded-2xl transition',
                zoomed && 'scale-110',
                gifLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          ) : (
            <PhaseCard
              title={phase === 'start' ? 'Старт' : 'Пик'}
              tip={phase === 'start' ? cues.startTip : cues.finishTip}
              accent={phase === 'start' ? 'sky' : 'lime'}
            />
          )}
        </div>
      )}

      {viewMode === 'compare' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PhaseCard title="1. Исходное" tip={cues.startTip} accent="sky" />
          <PhaseCard title="2. Пик" tip={cues.finishTip} accent="lime" />
        </div>
      )}

      {viewMode === 'scrub' && (
        <div className="rounded-3xl border border-white/10 bg-ink p-4 space-y-4">
          <PhaseCard
            title={scrub > 50 ? 'Ближе к пику' : 'Ближе к старту'}
            tip={scrub > 50 ? cues.finishTip : cues.startTip}
            accent={scrub > 50 ? 'lime' : 'sky'}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={scrub}
            onChange={e => setScrub(Number(e.target.value))}
            className="w-full accent-[#c8f542] h-2"
            aria-label="Амплитуда"
          />
          <div className="flex justify-between text-xs font-mono text-muted">
            <span>0% старт</span>
            <span className="text-lime font-bold">{scrub}%</span>
            <span>100% пик</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="surface-panel p-3">
          <p className="text-xs uppercase tracking-wider text-muted font-bold">Основная мышца</p>
          <p className="font-bold text-lime mt-1">{technique?.primaryMuscles || cues.primary || category}</p>
        </div>
        <div className="surface-panel p-3">
          <p className="text-xs uppercase tracking-wider text-muted font-bold">Синергисты</p>
          <p className="font-semibold text-amber-300 mt-1">{cues.secondary}</p>
        </div>
      </div>

      <div className="space-y-2">
        {cues.cues.map((cue, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-white/8 bg-white/[0.03]">
            <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
            <span className="text-sm text-white/85">{cue.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function PhaseCard({
  title,
  tip,
  accent
}: {
  title: string;
  tip: string;
  accent: 'sky' | 'lime';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 min-h-[140px] flex flex-col justify-center',
        accent === 'lime' ? 'border-lime/35 bg-lime/10' : 'border-sky-400/35 bg-sky-500/10'
      )}
    >
      <p className={cn('text-xs font-bold uppercase tracking-wider mb-2', accent === 'lime' ? 'text-lime' : 'text-sky-300')}>
        {title}
      </p>
      <p className="text-sm leading-relaxed text-white/90">{tip}</p>
    </div>
  );
}
