import React, { useMemo } from 'react';
import type { ExerciseSession } from '../types';

interface ExerciseHistoryChartProps {
  history: ExerciseSession[];
  weeks?: number;
}

/** Compact SVG sparkline of working weight + volume over recent sessions */
export const ExerciseHistoryChart: React.FC<ExerciseHistoryChartProps> = ({
  history,
  weeks = 8
}) => {
  const points = useMemo(() => {
    const cutoff = Date.now() - weeks * 7 * 86400000;
    return history
      .filter(h => new Date(h.date).getTime() >= cutoff)
      .slice(-weeks)
      .map(h => ({
        weight: h.weight,
        volume: h.totalVolume,
        label: new Date(h.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      }));
  }, [history, weeks]);

  if (points.length < 2) {
    return (
      <p className="text-[11px] text-muted py-2">Мало данных для графика — нужно ≥2 сессии.</p>
    );
  }

  const w = 280;
  const h = 72;
  const pad = 8;
  const maxW = Math.max(...points.map(p => p.weight), 1);
  const minW = Math.min(...points.map(p => p.weight));
  const span = Math.max(maxW - minW, 1);

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.weight - minW) / span) * (h - pad * 2);
    return { x, y, ...p };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x},${h - pad} L${coords[0].x},${h - pad} Z`;
  const last = coords[coords.length - 1];
  const first = coords[0];
  const delta = last.weight - first.weight;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Вес · {weeks} нед.</p>
        <p className={`text-xs font-mono font-bold ${delta >= 0 ? 'text-lime' : 'text-amber-400'}`}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)} кг
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20 overflow-visible" role="img" aria-label="График веса">
        <path d={area} fill="rgba(200,245,66,0.12)" />
        <path d={line} fill="none" stroke="#c8f542" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5} fill="#c8f542" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-muted font-mono">
        <span>{first.label}</span>
        <span>{last.weight} кг · объём {last.volume}</span>
        <span>{last.label}</span>
      </div>
    </div>
  );
};
