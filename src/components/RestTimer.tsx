import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Bell, Focus } from 'lucide-react';
import { soundService } from '../services/audioService';
import { cn } from '../utils/cn';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  /** Fired once when countdown reaches 0 — reopen focus set */
  onFinished?: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  voiceEnabled?: boolean;
  /** Lift minimized chip above bottom Navigation when it is visible */
  clearBottomNav?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  onFinished,
  soundEnabled = true,
  vibrationEnabled = true,
  voiceEnabled = true,
  clearBottomNav = false
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const targetEndTimeRef = useRef<number>(Date.now() + initialSeconds * 1000);
  const lastBeepSecondsRef = useRef<number>(-1);
  const finishedFiredRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const fireFinished = () => {
    if (finishedFiredRef.current) return;
    finishedFiredRef.current = true;
    onFinishedRef.current?.();
  };

  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsRunning(true);
    setIsMinimized(false);
    targetEndTimeRef.current = Date.now() + initialSeconds * 1000;
    lastBeepSecondsRef.current = -1;
    finishedFiredRef.current = false;
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && isOpen) {
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (soundEnabled) soundService.playRestFinishedChime();
          if (vibrationEnabled) soundService.haptic('timerDone');
          if (voiceEnabled) soundService.speakCountdown(0, true);
          setIsRunning(false);
          fireFinished();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isOpen, soundEnabled, vibrationEnabled, voiceEnabled]);

  useEffect(() => {
    if (!isRunning || !isOpen) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining > 0 && remaining <= 3 && remaining !== lastBeepSecondsRef.current) {
        lastBeepSecondsRef.current = remaining;
        if (soundEnabled) soundService.playCountdownBeep();
        if (vibrationEnabled) soundService.haptic('timerTick');
        if (voiceEnabled) soundService.speakCountdown(remaining, true);
      }

      if (remaining <= 0) {
        if (soundEnabled) soundService.playRestFinishedChime();
        if (vibrationEnabled) soundService.haptic('timerDone');
        if (voiceEnabled) soundService.speakCountdown(0, true);
        setIsRunning(false);
        fireFinished();
      }
    };

    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [isRunning, isOpen, soundEnabled, vibrationEnabled, voiceEnabled]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const done = timeLeft <= 0;

  const addTime = (secs: number) => {
    if (done) finishedFiredRef.current = false;
    targetEndTimeRef.current += secs * 1000;
    if (done) targetEndTimeRef.current = Date.now() + secs * 1000;
    const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
    setTimeLeft(remaining);
    setTotalSeconds(prev => Math.max(prev, remaining));
    setIsRunning(true);
  };

  const resetTimer = () => {
    finishedFiredRef.current = false;
    targetEndTimeRef.current = Date.now() + totalSeconds * 1000;
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    lastBeepSecondsRef.current = -1;
  };

  const togglePause = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  };

  const goToSet = () => {
    fireFinished();
    onClose();
  };

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => (done ? goToSet() : setIsMinimized(false))}
        className={cn(
          'fixed right-4 z-50 flex items-center gap-2 bg-ink-2 border border-lime/50 shadow-2xl shadow-lime/10 text-white px-3.5 py-2.5 rounded-full transition hover:scale-105 active:scale-95 min-h-[44px]',
          clearBottomNav
            ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]'
            : 'bottom-[calc(5.75rem+env(safe-area-inset-bottom))]'
        )}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime" />
        </span>
        <span className="font-mono font-bold text-base text-lime tabular-nums">
          {done ? 'GO' : formattedTime}
        </span>
        <span className="text-[11px] text-muted font-semibold">{done ? 'К сету' : 'Отдых'}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-ink via-ink/80 to-transparent backdrop-blur-md animate-fade-in">
      <div className="max-w-md mx-auto surface-panel bg-ink-2/95 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className={cn('w-4 h-4 text-lime', !done && 'animate-bounce')} />
            <span className="text-xs font-semibold tracking-wider uppercase text-muted">
              {done ? 'Отдых завершён' : 'Таймер отдыха'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!done && (
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-xs px-2.5 py-1.5 min-h-[36px] bg-white/5 text-muted border border-white/10 rounded-lg transition"
              >
                Свернуть
              </button>
            )}
            <button
              type="button"
              onClick={done ? goToSet : onClose}
              className="p-2 text-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden bg-ink rounded-2xl p-4 mb-3 border border-white/10 text-center">
          <div
            className="absolute left-0 top-0 bottom-0 bg-lime/15 border-r border-lime/30 transition-all duration-1000 ease-linear"
            style={{ width: `${done ? 100 : progressPercent}%` }}
          />
          <div className="relative z-10">
            <div
              className={cn(
                'font-mono font-black tracking-tight text-5xl tabular-nums transition',
                done ? 'text-lime' : timeLeft <= 5 ? 'text-rose-400 scale-105' : 'text-lime'
              )}
            >
              {formattedTime}
            </div>
            <p className="text-xs text-muted mt-1">
              {done
                ? 'Пора к следующему подходу'
                : voiceEnabled
                ? 'Голосовой отсчёт 3…2…1'
                : 'Восстановление'}
            </p>
          </div>
        </div>

        {done ? (
          <button
            type="button"
            onClick={goToSet}
            className="w-full min-h-[52px] btn-lime rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <Focus className="w-4 h-4" /> К подходу
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => addTime(-15)}
              className="flex-1 min-h-[48px] py-2 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Minus className="w-3.5 h-3.5" /> 15с
            </button>
            <button
              type="button"
              onClick={togglePause}
              className={cn(
                'flex-1 min-h-[48px] py-2.5 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition',
                isRunning
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-400/40'
                  : 'btn-lime'
              )}
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
            <button
              type="button"
              onClick={() => addTime(30)}
              className="flex-1 min-h-[48px] py-2 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" /> 30с
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center bg-white/5 border border-white/10 rounded-xl active:scale-95 transition"
              aria-label="Сброс"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
