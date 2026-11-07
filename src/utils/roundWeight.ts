/** Keep prescribed and recorded loads on quarter-kilogram increments. */
export function roundWeight(weight: number): number {
  return Number.isFinite(weight) ? Math.round(weight * 4) / 4 : 0;
}
