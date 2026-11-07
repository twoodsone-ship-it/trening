export type PluralForms = readonly [string, string, string] | [string, string, string];

/**
 * Returns the appropriate Russian word form based on quantity `n`.
 * Forms: [one, few, many]
 * e.g. ['подход', 'подхода', 'подходов']
 * 1 подход, 2-4 подхода, 5-20 подходов, 21 подход, 22 подхода, 25 подходов
 */
export function pluralize(n: number, forms: PluralForms): string {
  const abs = Math.abs(Math.round(n));
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return forms[2];
  }
  if (mod10 === 1) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }
  return forms[2];
}
