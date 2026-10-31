import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Volume2, Bell } from 'lucide-react';
import { soundService } from '../services/audioService';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync when initialSeconds changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  // Main countdown tick
  useEffect(() => {
    if (!isRunning || !isOpen) return;

    if (timeLeft <= 0) {
      if (soundEnabled) soundService.playRestFinishedChime();
      if (vibrationEnabled) soundService.vibrate([200, 100, 200, 100, 400]);
      setIsRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        // Sound warning on 3, 2, 1
        if (soundEnabled && next <= 3 && next > 0) {
          soundService.playCountdownBeep();
        }
        if (vibrationEnabled && next <= 3 && next > 0) {
          soundService.vibrate(60);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isOpen, timeLeft, soundEnabled, vibrationEnabled]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const addTime = (secs: number) => {
    setTimeLeft(prev => Math.max(0, prev + secs));
    setTotalSeconds(prev => Math.max(prev, timeLeft + secs));
  };

  const resetTimer = () => {
    setTimeLeft(totalSeconds);
    setIsRunning(true);
  };

  // Minimized floating pill (convenient for gym scrolling)
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-emerald-500 shadow-2xl text-slate-900 dark:text-white px-3.5 py-2 rounded-full cursor-pointer transition hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">{formattedTime}</span>
        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Отдых</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md animate-fade-in">
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/60 rounded-3xl p-4 shadow-2xl">
        
        {/* Header bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
              Таймер отдыха между подходами
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg transition"
            >
              Свернуть
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Digital Countdown & Progress Bar */}
        <div className="relative overflow-hidden bg-slate-100 dark:bg-black/60 rounded-2xl p-4 mb-3 border border-slate-200 dark:border-zinc-800/80 text-center">
          {/* Progress bar background fill */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-emerald-200/50 dark:bg-emerald-950/40 border-r border-emerald-500/30 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className={`font-mono font-black tracking-tight text-5xl transition ${
              timeLeft <= 5 ? 'text-red-500 scale-105' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {formattedTime}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {timeLeft <= 0 ? 'Время вышло! Начинайте подход 🔥' : 'Восстановление гликогена и ЦНС'}
            </p>
          </div>
        </div>

        {/* Quick Steppers & Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Minus 15s */}
          <button
            onClick={() => addTime(-15)}
            className="flex-1 min-h-[44px] py-2 px-1 text-xs font-semibold bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition"
          >
            <Minus className="w-3.5 h-3.5" /> 15с
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 min-h-[44px] py-2.5 px-3 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm ${
              isRunning 
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40' 
                : 'bg-emerald-500 text-white dark:text-black font-bold hover:bg-emerald-400'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Пауза
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Старт
              </>
            )}
          </button>

          {/* Plus 30s */}
          <button
            onClick={() => addTime(30)}
            className="flex-1 min-h-[44px] py-2 px-1 text-xs font-semibold bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" /> 30с
          </button>

          {/* Reset button */}
          <button
            onClick={resetTimer}
            title="Сбросить таймер"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
