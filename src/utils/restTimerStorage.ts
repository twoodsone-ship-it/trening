const ENDS_AT_KEY = 'ironforge_rest_ends_at';
const PENDING_FOCUS_KEY = 'ironforge_pending_focus_resume';

export const restTimerStorage = {
  setEndsAt(endsAtMs: number) {
    try {
      sessionStorage.setItem(ENDS_AT_KEY, String(endsAtMs));
    } catch {
      //
    }
  },

  clearEndsAt() {
    try {
      sessionStorage.removeItem(ENDS_AT_KEY);
    } catch {
      //
    }
  },

  getEndsAt(): number | null {
    try {
      const raw = sessionStorage.getItem(ENDS_AT_KEY);
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  },

  remainingSeconds(): number | null {
    const ends = this.getEndsAt();
    if (ends == null) return null;
    return Math.max(0, Math.ceil((ends - Date.now()) / 1000));
  },

  markPendingFocusResume() {
    try {
      sessionStorage.setItem(PENDING_FOCUS_KEY, '1');
    } catch {
      //
    }
  },

  hasPendingFocusResume(): boolean {
    try {
      return sessionStorage.getItem(PENDING_FOCUS_KEY) === '1';
    } catch {
      return false;
    }
  },

  consumePendingFocusResume(): boolean {
    try {
      const v = sessionStorage.getItem(PENDING_FOCUS_KEY);
      if (v) sessionStorage.removeItem(PENDING_FOCUS_KEY);
      return v === '1';
    } catch {
      return false;
    }
  }
};
