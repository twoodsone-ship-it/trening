import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Plus, Minus } from 'lucide-react';
import { soundService } from '../services/audioService';
import { restTimerStorage } from '../utils/restTimerStorage';
import { cn } from '../utils/cn';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  /** Fired once when countdown reaches 0 */
  onFinished?: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  voiceEnabled?: boolean;
  clearBottomNav?: boolean;
}

function notifyRestDone() {
  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const options = {
      body: 'Начинайте следующий подход',
      tag: 'ironforge-rest-done',
      silent: false
    };
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then(registration => registration.showNotification('IronForge — отдых окончен', options)).catch(() => {
        try {
          const notification = new Notification('IronForge — отдых окончен', options);
          window.setTimeout(() => notification.close(), 8000);
        } catch {
          // Notification APIs can be unavailable in restricted browser contexts.
        }
      });
    } else {
      const notification = new Notification('IronForge — отдых окончен', options);
      window.setTimeout(() => notification.close(), 8000);
    }
  } catch {
    //
  }
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  onFinished,
  soundEnabled = true,
  vibrationEnabled = true,
  voiceEnabled = true
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [done, setDone] = useState(false);

  const targetEndTimeRef = useRef<number>(Date.now() + initialSeconds * 1000);
  const lastBeepSecondsRef = useRef<number>(-1);
  const finishedFiredRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const fireFinished = (fromBackground = false) => {
    if (finishedFiredRef.current) return;
    finishedFiredRef.current = true;
    setDone(true);
    setIsRunning(false);
    restTimerStorage.clearEndsAt();
    restTimerStorage.markPendingFocusResume();
    if (fromBackground || document.hidden) notifyRestDone();
    if (soundEnabled) soundService.playRestFinishedChime();
    if (vibrationEnabled) soundService.haptic('timerDone');
    if (voiceEnabled) soundService.speakCountdown(0, true);
    onFinishedRef.current?.();
  };

  // Start / restart when opened
  useEffect(() => {
    if (!isOpen) return;
    const endsAt = Date.now() + initialSeconds * 1000;
    targetEndTimeRef.current = endsAt;
    restTimerStorage.setEndsAt(endsAt);
    setTotalSeconds(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsRunning(true);
    setDone(false);
    lastBeepSecondsRef.current = -1;
    finishedFiredRef.current = false;
  }, [initialSeconds, isOpen]);

  // Absolute-time ticker — works after unlock because deadline is wall-clock
  useEffect(() => {
    if (!isOpen || !isRunning || done) return;

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
        fireFinished(document.hidden);
      }
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [isOpen, isRunning, done, soundEnabled, vibrationEnabled, voiceEnabled]);

  // Unlock / tab focus: always reconcile, even if interval was frozen
  useEffect(() => {
    if (!isOpen) return;

    const reconcile = () => {
      if (document.visibilityState !== 'visible') return;
      const stored = restTimerStorage.getEndsAt();
      if (stored != null) targetEndTimeRef.current = stored;
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        fireFinished(false);
      } else if (!done) {
        setIsRunning(true);
      }
    };

    document.addEventListener('visibilitychange', reconcile);
    window.addEventListener('pageshow', reconcile);
    window.addEventListener('focus', reconcile);
    return () => {
      document.removeEventListener('visibilitychange', reconcile);
      window.removeEventListener('pageshow', reconcile);
      window.removeEventListener('focus', reconcile);
    };
  }, [isOpen, done]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const isDone = done || timeLeft <= 0;

  const addTime = (secs: number) => {
    finishedFiredRef.current = false;
    setDone(false);
    if (isDone) {
      targetEndTimeRef.current = Date.now() + Math.max(secs, 1) * 1000;
    } else {
      targetEndTimeRef.current += secs * 1000;
    }
    restTimerStorage.setEndsAt(targetEndTimeRef.current);
    const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
    setTimeLeft(remaining);
    setTotalSeconds(prev => Math.max(prev, remaining));
    setIsRunning(true);
  };

  const togglePause = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      restTimerStorage.setEndsAt(targetEndTimeRef.current);
      setIsRunning(true);
    }
  };

  const goToSet = () => {
    fireFinished(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-app-atmosphere text-white flex items-center justify-center px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{isDone ? 'Отдых завершён' : 'Отдых'}</p>
        <p className={cn('font-mono font-black text-[clamp(4.5rem,20vw,6.5rem)] leading-none tabular-nums mt-5', timeLeft <= 5 && !isDone ? 'text-rose-400' : 'text-lime')}>{formattedTime}</p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-6 mb-8"><div className="h-full bg-lime transition-all duration-1000" style={{ width: `${isDone ? 100 : progressPercent}%` }} /></div>

        {isDone ? (
          <button
            type="button"
            onClick={goToSet}
            className="w-full min-h-[56px] btn-lime rounded-2xl font-bold text-base flex items-center justify-center"
          >
            К подходу
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
          </div>
        )}
        {!isDone && <button type="button" onClick={goToSet} className="mt-5 min-h-[48px] px-4 text-sm text-muted">Пропустить отдых</button>}
      </div>
    </div>
  );
};
