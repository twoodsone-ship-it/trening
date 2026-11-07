import React, { useMemo } from 'react';
import type { CompletedWorkout } from '../types';

interface WorkoutTrendChartProps {
  history: CompletedWorkout[];
  weeks: 4 | 8 | 12;
}

export const WorkoutTrendChart: React.FC<WorkoutTrendChartProps> = ({ history, weeks }) => {
  const buckets = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekday = (now.getDay() + 6) % 7;
    now.setDate(now.getDate() - weekday - (weeks - 1) * 7);
    const start = now.getTime();
    const values = Array.from({ length: weeks }, (_, index) => ({
      label: `Н${index + 1}`,
      volume: 0,
      workouts: 0,
      cardioMinutes: 0
    }));

    history.forEach(workout => {
      const index = Math.floor((workout.endTime - start) / (7 * 86400000));
      if (index < 0 || index >= weeks) return;
      values[index].volume += workout.totalVolumeKg;
      values[index].workouts += 1;
      values[index].cardioMinutes += (workout.totalCardioSeconds || 0) / 60;
    });
    return values;
  }, [history, weeks]);

  const max = Math.max(1, ...buckets.map(b => b.volume));
  const width = 320;
  const height = 112;
  const gap = 5;
  const barWidth = (width - gap * (weeks + 1)) / weeks;

  return (
    <div className="surface-panel p-4 space-y-3">
      <div>
        <p className="font-bold text-white">Тренд объёма</p>
        <p className="text-xs text-muted mt-0.5">Тоннаж по неделям · кардио показано отдельно ниже</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" role="img" aria-label={`Тренировочный объём за ${weeks} недель`}>
        {buckets.map((bucket, index) => {
          const x = gap + index * (barWidth + gap);
          const barHeight = bucket.volume ? Math.max(4, (bucket.volume / max) * 72) : 2;
          const y = 78 - barHeight;
          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={bucket.volume ? '#c8f542' : 'rgba(255,255,255,0.1)'} />
              <text x={x + barWidth / 2} y="96" fill="#9aa3b2" fontSize="11" textAnchor="middle">{bucket.label}</text>
              <text x={x + barWidth / 2} y="109" fill="#d4d4d8" fontSize="12" textAnchor="middle">{bucket.workouts} тр.</text>
            </g>
          );
        })}
        <line x1="0" y1="79" x2={width} y2="79" stroke="rgba(255,255,255,0.12)" />
      </svg>
      <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2">
        <span className="text-muted">Кардио за период</span>
        <span className="font-mono font-bold text-sky-300">{Math.round(buckets.reduce((sum, b) => sum + b.cardioMinutes, 0))} мин</span>
      </div>
    </div>
  );
};
