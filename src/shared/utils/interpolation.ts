import type { FuzzyPoint } from '../types/fuzzy';

export function interpolateMu(points: FuzzyPoint[], x: number): number {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => a.x - b.x);

  if (x <= sorted[0].x) return sorted[0].x === x ? sorted[0].mu : 0;
  if (x >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].x === x ? sorted[sorted.length - 1].mu : 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const p0 = sorted[i];
    const p1 = sorted[i + 1];
    if (x >= p0.x && x <= p1.x) {
      const t = (x - p0.x) / (p1.x - p0.x);
      return p0.mu + t * (p1.mu - p0.mu);
    }
  }
  return 0;
}

// For a convex (unimodal) fuzzy number, returns [leftX, rightX] where µ >= alpha.
// Returns null if alpha > peak µ or the number has < 2 points.
export function getAlphaCutBounds(points: FuzzyPoint[], alpha: number): [number, number] | null {
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const peak = Math.max(...sorted.map((p) => p.mu));
  if (alpha > peak) return null;
  if (alpha === 0) return [sorted[0].x, sorted[sorted.length - 1].x];

  let leftX = sorted[0].x;
  let rightX = sorted[sorted.length - 1].x;

  // Left boundary: walk right until µ >= alpha, interpolate
  for (let i = 0; i < sorted.length - 1; i++) {
    const p0 = sorted[i];
    const p1 = sorted[i + 1];
    if (p0.mu <= alpha && p1.mu >= alpha) {
      const t = (alpha - p0.mu) / (p1.mu - p0.mu);
      leftX = p0.x + t * (p1.x - p0.x);
      break;
    }
    if (p0.mu >= alpha) {
      leftX = p0.x;
      break;
    }
  }

  // Right boundary: walk left until µ >= alpha, interpolate
  for (let i = sorted.length - 1; i > 0; i--) {
    const p0 = sorted[i - 1];
    const p1 = sorted[i];
    if (p1.mu <= alpha && p0.mu >= alpha) {
      const t = (alpha - p1.mu) / (p0.mu - p1.mu);
      rightX = p1.x + t * (p0.x - p1.x);
      break;
    }
    if (p1.mu >= alpha) {
      rightX = p1.x;
      break;
    }
  }

  return [leftX, rightX];
}

export function mergeXValues(a: FuzzyPoint[], b: FuzzyPoint[]): number[] {
  const xs = new Set([...a.map((p) => p.x), ...b.map((p) => p.x)]);
  return [...xs].sort((x, y) => x - y);
}
