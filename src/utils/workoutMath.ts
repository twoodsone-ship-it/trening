export const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] as const;

export interface PlateResult {
  platesPerSide: number[];
  exact: boolean;
  achievableWeight: number;
  lowerWeight: number | null;
  upperWeight: number | null;
  error?: string;
}

/** Inventory counts are pairs, so each count is available on each side. */
export function calculatePlates(
  targetWeight: number,
  barWeight = 20,
  plates: readonly number[] = STANDARD_PLATES,
  inventory: Readonly<Record<number, number>> = {}
): PlateResult {
  if (!Number.isFinite(targetWeight) || !Number.isFinite(barWeight) || barWeight < 0 || targetWeight < barWeight) {
    return { platesPerSide: [], exact: false, achievableWeight: barWeight, lowerWeight: null, upperWeight: null, error: 'Целевой вес меньше веса грифа или некорректен' };
  }
  const maxSide = Math.ceil((targetWeight - barWeight) / 2) + Math.max(0, ...plates);
  const limit = Math.round(maxSide * 100);
  const solutions = new Map<number, number[]>([[0, []]]);
  for (const plate of [...new Set(plates)].sort((a, b) => b - a)) {
    if (!Number.isFinite(plate) || plate <= 0) continue;
    const value = Math.round(plate * 100);
    const available = Object.hasOwn(inventory, plate) ? Math.max(0, Math.floor(inventory[plate])) : Math.floor(limit / value);
    for (let count = 0; count < available; count++) {
      for (let sum = limit - value; sum >= 0; sum--) {
        const previous = solutions.get(sum);
        if (!previous) continue;
        const next = sum + value;
        const existing = solutions.get(next);
        const candidate = [...previous, plate].sort((a, b) => b - a);
        const prefersLarger = existing && candidate.length === existing.length &&
          candidate.some((value, index) => value !== existing[index] &&
            candidate.slice(0, index).every((earlier, earlierIndex) => earlier === existing[earlierIndex]) && value > existing[index]);
        if (!existing || candidate.length < existing.length || prefersLarger) solutions.set(next, candidate);
      }
    }
  }
  const desired = Math.round((targetWeight - barWeight) * 50);
  const sums = [...solutions.keys()].sort((a, b) => a - b);
  const lower = sums.filter(sum => sum <= desired).at(-1) ?? null;
  const upper = sums.find(sum => sum >= desired) ?? null;
  const chosen = solutions.has(desired) ? desired : (lower ?? upper ?? 0);
  const toTotal = (sum: number | null) => sum == null ? null : barWeight + sum / 50;
  return {
    platesPerSide: solutions.get(chosen) ?? [],
    exact: chosen === desired,
    achievableWeight: toTotal(chosen) ?? barWeight,
    lowerWeight: toTotal(lower),
    upperWeight: toTotal(upper)
  };
}

export function remainingRestSeconds(endsAtMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000));
}

export function shiftRestDeadline(endsAtMs: number, deltaSeconds: number, nowMs: number): number {
  return Math.max(nowMs, endsAtMs + deltaSeconds * 1000);
}

export function sanitizeNumber(value: unknown, max: number): number {
  if (value == null) return 0;
  const normalized = String(value).trim().replace(',', '.');
  const match = normalized.match(/^(?:\d+\.?\d*|\.\d+)/);
  const parsed = match ? Number(match[0]) : 0;
  return Number.isFinite(parsed) ? Math.min(max, Math.max(0, parsed)) : 0;
}

export function committedInputValue(value: string, placeholder: string, max: number): number {
  return sanitizeNumber(value === '' ? placeholder : value, max);
}

export function calculateBodyweightVolume(bodyWeight: number, addedWeight: number, reps: number): number {
  if (![bodyWeight, addedWeight, reps].every(Number.isFinite)) return 0;
  return Math.max(0, bodyWeight + addedWeight) * Math.max(0, reps);
}
