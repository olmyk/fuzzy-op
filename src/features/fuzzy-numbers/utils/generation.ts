import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { round2, generateSortedXValues } from '@/shared/utils/generation';

export function generateRandomFuzzyPoints(): FuzzyPoint[] {
  const xs = generateSortedXValues();
  const count = xs.length;
  const peakIdx = 1 + Math.floor(Math.random() * (count - 2));

  const points: FuzzyPoint[] = xs.map((x, i) => {
    let mu: number;
    if (i === peakIdx) {
      mu = 1;
    } else if (i < peakIdx) {
      // t goes from (1/(peakIdx+1)) to (peakIdx/(peakIdx+1)) — never 0
      const t = (i + 1) / (peakIdx + 1);
      mu = round2(t * (0.8 + Math.random() * 0.2));
    } else {
      // mirror: t goes from ((count-1-i)/(count-peakIdx)) — never 0
      const t = (count - i) / (count - peakIdx);
      mu = round2(t * (0.8 + Math.random() * 0.2));
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
