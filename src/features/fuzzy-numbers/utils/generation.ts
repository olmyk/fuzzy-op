import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { round2, generateSortedXValues } from '@/shared/utils/generation';

export function generateRandomFuzzyPoints(): FuzzyPoint[] {
  const xs = generateSortedXValues();
  const count = xs.length;
  // Peak index not at the very first or last so the shape has wings
  const peakIdx = 1 + Math.floor(Math.random() * (count - 2));

  const points: FuzzyPoint[] = xs.map((x, i) => {
    let mu: number;
    if (i === peakIdx) {
      mu = 1; // normality: exactly one point at µ = 1
    } else if (i < peakIdx) {
      const t = i / peakIdx;
      mu = round2(t * (0.8 + Math.random() * 0.2));
    } else {
      const t = (i - peakIdx) / (count - 1 - peakIdx);
      mu = round2((1 - t) * (0.8 + Math.random() * 0.2));
    }
    return { x, mu };
  });

  // Enforce strict unimodal shape (convexity)
  for (let i = 1; i <= peakIdx; i++) {
    if (points[i].mu < points[i - 1].mu) points[i].mu = points[i - 1].mu;
  }
  for (let i = peakIdx + 1; i < count; i++) {
    if (points[i].mu > points[i - 1].mu) points[i].mu = points[i - 1].mu;
  }

  return points;
}
