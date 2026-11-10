import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { withDucking, setAudioDuckingEnabled, soundService } from '../src/services/audioService';
import { storageService } from '../src/services/storageService';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

describe('audio ducking helper and AudioSession integration', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
    vi.useFakeTimers();
    setAudioDuckingEnabled(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (navigator as any).audioSession;
  });

  it('sets session type to transient and reverts to auto after duration + 300ms', () => {
    const mockAudioSession = { type: 'auto' };
    Object.defineProperty(navigator, 'audioSession', {
      value: mockAudioSession,
      configurable: true,
      writable: true
    });

    let executed = false;
    withDucking(() => {
      executed = true;
    }, 200);

    expect(executed).toBe(true);
    expect(mockAudioSession.type).toBe('transient');

    // Advance 499ms: still transient (200 + 300 = 500ms)
    vi.advanceTimersByTime(499);
    expect(mockAudioSession.type).toBe('transient');

    // Advance remaining 1ms -> reverts to auto
    vi.advanceTimersByTime(1);
    expect(mockAudioSession.type).toBe('auto');
  });

  it('does nothing when ducking is disabled', () => {
    const mockAudioSession = { type: 'auto' };
    Object.defineProperty(navigator, 'audioSession', {
      value: mockAudioSession,
      configurable: true,
      writable: true
    });

    setAudioDuckingEnabled(false);
    withDucking(() => {}, 200);

    expect(mockAudioSession.type).toBe('auto');
  });

  it('runs safely when navigator.audioSession is undefined', () => {
    delete (navigator as any).audioSession;

    let result = '';
    expect(() => {
      result = withDucking(() => 'hello', 200);
    }).not.toThrow();
    expect(result).toBe('hello');
  });

  it('wraps beeps, chime, and speech countdown without crashing', () => {
    expect(() => {
      soundService.playCountdownBeep();
      soundService.playRestFinishedChime();
      soundService.speakCountdown(3, false);
      soundService.speakCountdown(0, false);
    }).not.toThrow();
  });

  it('defaults audioDuckingEnabled to true in storageService', () => {
    localStorage.clear();
    const settings = storageService.getSettings();
    expect(settings.audioDuckingEnabled).toBe(true);
  });
});
