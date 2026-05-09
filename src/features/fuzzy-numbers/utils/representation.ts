import type { FuzzyPoint } from '../types';

function fmt(n: number): string {
  // Drop trailing zeros: 1.00 → 1, 0.50 → 0.5
  return parseFloat(n.toFixed(2)).toString();
}

export function toSetNotation(points: FuzzyPoint[]): string {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const terms = sorted.map((p) => `${fmt(p.mu)}/${fmt(p.x)}`);
  return `{${terms.join(' + ')}}`;
}

export function getLetterForIndex(i: number): string {
  return String.fromCharCode(65 + i); // 0 → 'A', 25 → 'Z'
}

export const MAX_FUZZY_NUMBERS = 26;
