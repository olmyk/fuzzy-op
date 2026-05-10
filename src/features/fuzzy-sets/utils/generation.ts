import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { round2, generateSortedXValues } from '@/shared/utils/generation';

export function generateRandomFuzzyPoints(): FuzzyPoint[] {
  const xs = generateSortedXValues();
  return xs.map((x) => ({ x, mu: Math.max(0.01, round2(Math.random())) }));
}
