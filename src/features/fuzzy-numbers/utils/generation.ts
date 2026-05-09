import type { FuzzyPoint } from '../types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function generateRandomFuzzyPoints(): FuzzyPoint[] {
  const n = 3 + Math.floor(Math.random() * 5); // 3–7 points

  // Generate n sorted x values spread across [0, 1]
  const xs = Array.from({ length: n }, () => Math.random());
  xs.sort((a, b) => a - b);
  // Ensure first and last are distinct enough from neighbours
  const unique = [...new Set(xs.map(round2))];
  // Re-pad if deduplication collapsed values
  while (unique.length < 3) unique.push(round2(Math.random()));
  unique.sort((a, b) => a - b);

  const count = unique.length;
  // Pick a peak index (not the very first or very last so the shape has wings)
  const peakIdx = 1 + Math.floor(Math.random() * (count - 2));

  const points: FuzzyPoint[] = unique.map((x, i) => {
    let mu: number;
    if (i === peakIdx) {
      mu = 1;
    } else if (i < peakIdx) {
      // Rising side: interpolate from ~0 to 1
      const t = i / peakIdx;
      mu = round2(t * (0.8 + Math.random() * 0.2)); // slight jitter but stays ≤ 0.99 < 1
    } else {
      // Falling side: interpolate from 1 to ~0
      const t = (i - peakIdx) / (count - 1 - peakIdx);
      mu = round2((1 - t) * (0.8 + Math.random() * 0.2));
    }
    return { x, mu };
  });

  // Enforce strict non-decreasing on rising side and non-increasing on falling side
  for (let i = 1; i <= peakIdx; i++) {
    if (points[i].mu < points[i - 1].mu) points[i].mu = points[i - 1].mu;
  }
  for (let i = peakIdx + 1; i < count; i++) {
    if (points[i].mu > points[i - 1].mu) points[i].mu = points[i - 1].mu;
  }

  return points;
}
