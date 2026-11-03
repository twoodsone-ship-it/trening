import React from 'react';

interface WorkoutProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
}

export const WorkoutProgressRing: React.FC<WorkoutProgressRingProps> = ({
  percent,
  size = 36,
  stroke = 3
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-white/10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-lime transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
};
