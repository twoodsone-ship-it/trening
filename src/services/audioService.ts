/**
 * Web Audio API, speech synthesis, and haptic vibration for gym workouts.
 */

import type { HapticEvent } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Distinct haptic patterns for gym events */
export const HAPTIC_MAP: Record<HapticEvent, number | number[]> = {
  setComplete: [100, 50, 100],
  copyPrevious: [40],
  timerTick: 60,
  timerDone: [200, 100, 200, 100, 400],
  pr: [150, 100, 250],
  rpeConfirm: [50, 30, 50],
  button: 30
};

export const soundService = {
  playCountdownBeep() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      //
    }
  },

  playRestFinishedChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      //
    }
  },

  playPrFanfare() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.25, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch {
      //
    }
  },

  vibrate(pattern: number | number[] = [100, 50, 150]) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        //
      }
    }
  },

  haptic(event: HapticEvent, enabled = true) {
    if (!enabled) return;
    this.vibrate(HAPTIC_MAP[event]);
  },

  /** Spoken countdown / rest cues via SpeechSynthesis (offline-capable on most phones) */
  speak(text: string, enabled = true, lang = 'ru-RU') {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 1.05;
      utter.pitch = 1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    } catch {
      //
    }
  },

  speakCountdown(seconds: number, enabled = true) {
    if (seconds <= 0) {
      this.speak('Отдых окончен. Начинайте подход', enabled);
      return;
    }
    this.speak(String(seconds), enabled);
  }
};

let wakeLockSentinel: any = null;

export const wakeLockService = {
  async requestWakeLock(): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }
    try {
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        return true;
      }
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch {
      return false;
    }
  },

  async releaseWakeLock(): Promise<void> {
    try {
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
      }
    } catch {
      //
    }
  },

  isActive(): boolean {
    return Boolean(wakeLockSentinel && !wakeLockSentinel.released);
  }
};
