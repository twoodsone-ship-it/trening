import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity } from 'lucide-react';

interface ExerciseAnimationProps {
  animationType: string;
  category?: string;
  exerciseName?: string;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  animationType,
  category = 'Chest',
  exerciseName = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<'eccentric' | 'concentric'>('concentric');

  // Phase tracker for technique education
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPhase(prev => (prev === 'concentric' ? 'eccentric' : 'concentric'));
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-950 dark:to-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 overflow-hidden flex flex-col items-center shadow-inner">
      
      {/* Top Phase Indicator */}
      <div className="w-full flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-full text-xs font-semibold shadow-sm border border-slate-200 dark:border-zinc-700">
          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span className="text-slate-700 dark:text-zinc-200">
            {phase === 'concentric' ? '↑ Подъем / Усилие (Выдох)' : '↓ Опускание / Растяг (Вдох)'}
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700 hover:scale-105 active:scale-95 transition"
          title={isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
      </div>

      {/* SVG Biomechanics Animation Canvas */}
      <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
        {renderAnimationSvg(animationType, isPlaying)}
      </div>

      {/* Muscle Focus Cue */}
      <div className="mt-2 text-center text-xs font-medium text-slate-500 dark:text-zinc-400">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
        Подсвечены активные рабочие мышечные группы
      </div>

    </div>
  );
};

function renderAnimationSvg(type: string, isPlaying: boolean) {
  const playClass = isPlaying ? '' : 'style-paused';

  switch (type) {
    case 'bench-press':
    case 'incline-press':
      return (
        <svg viewBox="0 0 300 200" className={`w-full h-full max-w-[280px] ${playClass}`}>
          <defs>
            <linearGradient id="benchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Bench Frame */}
          <rect x="40" y="140" width="220" height="12" rx="4" fill="#94a3b8" />
          <rect x="70" y="152" width="12" height="35" rx="2" fill="#64748b" />
          <rect x="218" y="152" width="12" height="35" rx="2" fill="#64748b" />
          <path d="M50 187 L250 187" stroke="#cbd5e1" strokeWidth="4" />

          {/* Athlete Body on Bench */}
          <ellipse cx="85" cy="133" rx="14" ry="12" fill="#f87171" opacity="0.9" /> {/* Head */}
          <rect x="100" y="125" width="95" height="18" rx="6" fill="#38bdf8" /> {/* Torso */}
          <path d="M195 130 L220 155 L220 185" stroke="#0284c7" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" /> {/* Legs */}

          {/* Chest Activation Highlight */}
          <ellipse cx="130" cy="130" rx="16" ry="10" fill="#10b981" filter="url(#glow)" opacity="0.8">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
          </ellipse>

          {/* Animated Barbell and Arms */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,35; 0,0"
              keyTimes="0; 0.5; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            
            {/* Barbell Bar */}
            <line x1="50" y1="85" x2="210" y2="85" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            {/* Left Plates */}
            <rect x="40" y="60" width="10" height="50" rx="3" fill="#ef4444" />
            <rect x="32" y="66" width="7" height="38" rx="2" fill="#3b82f6" />
            {/* Right Plates */}
            <rect x="210" y="60" width="10" height="50" rx="3" fill="#ef4444" />
            <rect x="221" y="66" width="7" height="38" rx="2" fill="#3b82f6" />

            {/* Forearms & Hands */}
            <circle cx="110" cy="85" r="7" fill="#fbbf24" />
            <circle cx="150" cy="85" r="7" fill="#fbbf24" />
          </g>

          {/* Upper Arms dynamically flexing */}
          <path d="M110 130 Q 95 105 110 85" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M110 130 Q 95 105 110 85; M110 130 Q 80 125 110 120; M110 130 Q 95 105 110 85" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M150 130 Q 165 105 150 85" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M150 130 Q 165 105 150 85; M150 130 Q 180 125 150 120; M150 130 Q 165 105 150 85" dur="3s" repeatCount="indefinite" />
          </path>
        </svg>
      );

    case 'squat':
      return (
        <svg viewBox="0 0 300 220" className={`w-full h-full max-w-[280px] ${playClass}`}>
          {/* Gym Floor */}
          <line x1="30" y1="195" x2="270" y2="195" stroke="#94a3b8" strokeWidth="4" />

          {/* Squatting Character */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,45; 0,0"
              keyTimes="0; 0.5; 1"
              dur="3s"
              repeatCount="indefinite"
            />

            {/* Head */}
            <circle cx="150" cy="45" r="14" fill="#fbbf24" />

            {/* Torso */}
            <path d="M150 60 L146 115" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round" />

            {/* Barbell on upper back */}
            <line x1="75" y1="62" x2="225" y2="62" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <rect x="65" y="38" width="10" height="48" rx="2" fill="#ef4444" />
            <rect x="56" y="44" width="8" height="36" rx="2" fill="#3b82f6" />
            <rect x="225" y="38" width="10" height="48" rx="2" fill="#ef4444" />
            <rect x="236" y="44" width="8" height="36" rx="2" fill="#3b82f6" />

            {/* Quadriceps / Glute activation */}
            <circle cx="146" cy="118" r="14" fill="#10b981" opacity="0.8">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Dynamic Knees and Legs */}
          <path d="M146 115 L125 155 L130 195" stroke="#2563eb" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <animate attributeName="d" values="M146 115 L140 155 L135 195; M146 160 L105 165 L135 195; M146 115 L140 155 L135 195" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M146 115 L165 155 L160 195" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <animate attributeName="d" values="M146 115 L155 155 L160 195; M146 160 L185 165 L160 195; M146 115 L155 155 L160 195" dur="3s" repeatCount="indefinite" />
          </path>

          {/* Feet Planted */}
          <ellipse cx="130" cy="195" rx="12" ry="4" fill="#1e293b" />
          <ellipse cx="165" cy="195" rx="12" ry="4" fill="#1e293b" />
        </svg>
      );

    case 'lat-pulldown':
      return (
        <svg viewBox="0 0 300 200" className={`w-full h-full max-w-[280px] ${playClass}`}>
          {/* Machine Frame & Cable */}
          <rect x="145" y="10" width="10" height="40" fill="#64748b" />
          <line x1="50" y1="20" x2="250" y2="20" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

          {/* Lat Activation Glow */}
          <ellipse cx="150" cy="120" rx="22" ry="14" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.8s" repeatCount="indefinite" />
          </ellipse>

          {/* Seated Athlete */}
          <circle cx="150" cy="85" r="13" fill="#fbbf24" /> {/* Head */}
          <path d="M150 100 L150 150" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" /> {/* Torso */}
          <rect x="120" y="150" width="60" height="14" rx="4" fill="#475569" /> {/* Seat */}
          <rect x="144" y="164" width="12" height="30" fill="#334155" /> {/* Seat Leg */}

          {/* Animated Lat Bar & Arms */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,50; 0,0"
              keyTimes="0; 0.5; 1"
              dur="2.8s"
              repeatCount="indefinite"
            />
            {/* Cable */}
            <line x1="150" y1="20" x2="150" y2="40" stroke="#0f172a" strokeWidth="3" />
            {/* Ergonomic Lat Bar */}
            <path d="M70 50 Q 150 35 230 50" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" fill="none" />
          </g>

          {/* Animated Arms */}
          <path d="M142 105 L95 48" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round">
            <animate attributeName="d" values="M142 105 L95 48; M142 105 L105 98; M142 105 L95 48" dur="2.8s" repeatCount="indefinite" />
          </path>
          <path d="M158 105 L205 48" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round">
            <animate attributeName="d" values="M158 105 L205 48; M158 105 L195 98; M158 105 L205 48" dur="2.8s" repeatCount="indefinite" />
          </path>
        </svg>
      );

    case 'deadlift':
      return (
        <svg viewBox="0 0 300 200" className={`w-full h-full max-w-[280px] ${playClass}`}>
          <line x1="30" y1="185" x2="270" y2="185" stroke="#94a3b8" strokeWidth="4" />
          
          {/* Athlete Hinge Motion */}
          <g>
            {/* Hamstrings & Glutes glow */}
            <ellipse cx="145" cy="125" rx="16" ry="12" fill="#10b981" opacity="0.8">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.2s" repeatCount="indefinite" />
            </ellipse>

            {/* Head & Spine animated hinge */}
            <path d="M150 120 L160 70" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round">
              <animate attributeName="d" values="M145 120 L165 65; M145 120 L185 110; M145 120 L165 65" dur="3.2s" repeatCount="indefinite" />
            </path>
            <circle cx="165" cy="50" r="13" fill="#fbbf24">
              <animate attributeName="cx" values="165; 195; 165" dur="3.2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="50; 95; 50" dur="3.2s" repeatCount="indefinite" />
            </circle>

            {/* Legs */}
            <path d="M145 120 L140 155 L145 185" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>

          {/* Barbell moving up and down along shins */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,55; 0,0"
              keyTimes="0; 0.5; 1"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <line x1="80" y1="110" x2="220" y2="110" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <circle cx="80" cy="110" r="18" fill="#ef4444" />
            <circle cx="220" cy="110" r="18" fill="#ef4444" />
          </g>
        </svg>
      );

    case 'bicep-curl':
      return (
        <svg viewBox="0 0 300 200" className={`w-full h-full max-w-[280px] ${playClass}`}>
          {/* Standing Athlete */}
          <circle cx="120" cy="45" r="14" fill="#fbbf24" />
          <line x1="120" y1="60" x2="120" y2="135" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round" />
          <line x1="120" y1="135" x2="115" y2="190" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" />
          <line x1="120" y1="135" x2="130" y2="190" stroke="#2563eb" strokeWidth="12" strokeLinecap="round" />

          {/* Bicep Muscle Flex Glow */}
          <circle cx="138" cy="95" r="11" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.3;0.95;0.3" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="r" values="9; 14; 9" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Upper Arm Fixed */}
          <line x1="125" y1="75" x2="135" y2="110" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />

          {/* Forearm Curling Up and Down */}
          <path d="M135 110 L155 145" stroke="#d97706" strokeWidth="8" strokeLinecap="round">
            <animate attributeName="d" values="M135 110 L155 145; M135 110 L145 75; M135 110 L155 145" dur="2.4s" repeatCount="indefinite" />
          </path>

          {/* Dumbbell / Barbell Plate */}
          <circle cx="155" cy="145" r="12" fill="#ef4444">
            <animate attributeName="cx" values="155; 145; 155" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="cy" values="145; 75; 145" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </svg>
      );

    case 'lateral-raise':
    default:
      return (
        <svg viewBox="0 0 300 200" className={`w-full h-full max-w-[280px] ${playClass}`}>
          <circle cx="150" cy="40" r="13" fill="#fbbf24" />
          <line x1="150" y1="54" x2="150" y2="130" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" />
          <line x1="145" y1="130" x2="140" y2="190" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" />
          <line x1="155" y1="130" x2="160" y2="190" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" />

          {/* Shoulder Deltoid Glow */}
          <circle cx="132" cy="65" r="9" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="168" cy="65" r="9" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Left Arm Raising */}
          <path d="M135 65 L105 115" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round">
            <animate attributeName="d" values="M135 65 L120 120; M135 65 L70 65; M135 65 L120 120" dur="2.5s" repeatCount="indefinite" />
          </path>
          <circle cx="120" cy="120" r="9" fill="#3b82f6">
            <animate attributeName="cx" values="120; 65; 120" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="120; 65; 120" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Right Arm Raising */}
          <path d="M165 65 L180 120" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round">
            <animate attributeName="d" values="M165 65 L180 120; M165 65 L230 65; M165 65 L180 120" dur="2.5s" repeatCount="indefinite" />
          </path>
          <circle cx="180" cy="120" r="9" fill="#3b82f6">
            <animate attributeName="cx" values="180; 235; 180" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="120; 65; 120" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
  }
}
