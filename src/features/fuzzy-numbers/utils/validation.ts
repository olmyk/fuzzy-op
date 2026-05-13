import type { FuzzyPoint } from '@/shared/types/fuzzy';

export function isNormal(points: FuzzyPoint[]): boolean {
  return points.some((p) => p.mu === 1);
}

export function isConvex(points: FuzzyPoint[]): boolean {
  if (points.length < 2) return true;

  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Sequence must be non-decreasing then non-increasing (unimodal)
  let ascending = true;
  for (let i = 1; i < sorted.length; i++) {
    const delta = sorted[i].mu - sorted[i - 1].mu;
    if (ascending) {
      if (delta < 0) ascending = false;
    } else {
      if (delta > 0) return false; // second rise — not convex
    }
  }
  return true;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: 'not-normal' | 'not-convex' | 'too-few-points' };

export function validateFuzzyNumber(points: FuzzyPoint[]): ValidationResult {
  if (points.length < 2) return { valid: false, reason: 'too-few-points' };
  if (!isNormal(points)) return { valid: false, reason: 'not-normal' };
  if (!isConvex(points)) return { valid: false, reason: 'not-convex' };
  return { valid: true };
}

export const VALIDATION_MESSAGES: Record<string, string> = {
  'too-few-points': 'A fuzzy number requires at least 2 points.',
  'not-normal': 'The fuzzy number is not normal: at least one point must have µ = 1.',
  'not-convex': 'The fuzzy number is not convex: the membership function must be unimodal (rise then fall, no second peak).',
};
