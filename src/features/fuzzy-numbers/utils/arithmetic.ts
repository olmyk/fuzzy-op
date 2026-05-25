import type { FuzzyPoint } from '@/shared/types/fuzzy';
import type { CanvasToken, FuzzyNumber, OperationType } from '../types';
import { getAlphaCutBounds } from '@/shared/utils/interpolation';

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}

// Zadeh extension principle on discrete point sets.
// For each pair (pa, pb): z = pa.x op pb.x, µ = min(pa.mu, pb.mu).
// When multiple pairs produce the same z, keep the maximum µ (supremum).
// Used for by-points numbers where inputs are sparse and user-defined.
function applyZadeh(
  a: FuzzyPoint[],
  op: OperationType,
  b: FuzzyPoint[],
): FuzzyPoint[] | string {
  const resultMap = new Map<number, number>();

  for (const pa of a) {
    for (const pb of b) {
      let z: number;
      switch (op) {
        case 'addition':      z = pa.x + pb.x; break;
        case 'subtraction':   z = pa.x - pb.x; break;
        case 'multiplication': z = pa.x * pb.x; break;
        case 'division':
          if (pb.x === 0) return 'Division by zero: the divisor contains a point with x = 0.';
          z = pa.x / pb.x;
          break;
      }
      const zKey = round6(z);
      const mu = Math.min(pa.mu, pb.mu);
      resultMap.set(zKey, Math.max(resultMap.get(zKey) ?? 0, mu));
    }
  }

  return [...resultMap.entries()]
    .map(([x, mu]) => ({ x, mu }))
    .filter((p) => p.mu > 0)
    .sort((a, b) => a.x - b.x);
}

// Alpha-cut interval arithmetic.
// For each of STEPS+1 alpha levels, computes [cL, cR] from [aL, aR] and [bL, bR].
// Emits boundary points (cL, α) and (cR, α); deduplicates keeping max µ per x.
// Used for function-defined numbers (dense, smooth inputs) to produce exact results.
function applyAlphaCut(
  a: FuzzyPoint[],
  op: OperationType,
  b: FuzzyPoint[],
): FuzzyPoint[] | string {
  const STEPS = 200;
  const resultMap = new Map<number, number>(); // x → max µ

  for (let i = 0; i <= STEPS; i++) {
    const alpha = i / STEPS;
    const aCut = getAlphaCutBounds(a, alpha);
    if (!aCut) continue;
    const bCut = getAlphaCutBounds(b, alpha);
    if (!bCut) continue;

    const [aL, aR] = aCut;
    const [bL, bR] = bCut;

    let cL: number;
    let cR: number;

    switch (op) {
      case 'addition':
        cL = aL + bL;  cR = aR + bR;
        break;
      case 'subtraction':
        cL = aL - bR;  cR = aR - bL;
        break;
      case 'multiplication': {
        const ps = [aL * bL, aL * bR, aR * bL, aR * bR];
        cL = Math.min(...ps);  cR = Math.max(...ps);
        break;
      }
      case 'division': {
        if (bL <= 0 && 0 <= bR)
          return "Division by zero: the divisor's α-cut contains 0.";
        const qs = [aL / bL, aL / bR, aR / bL, aR / bR];
        cL = Math.min(...qs);  cR = Math.max(...qs);
        break;
      }
    }

    const xL = round6(cL);
    const xR = round6(cR);
    resultMap.set(xL, Math.max(resultMap.get(xL) ?? 0, alpha));
    if (xL !== xR) resultMap.set(xR, Math.max(resultMap.get(xR) ?? 0, alpha));
  }

  return [...resultMap.entries()]
    .map(([x, mu]) => ({ x, mu }))
    .filter((p) => p.mu > 0)
    .sort((a, b) => a.x - b.x);
}

export function applyFuzzyNumberOp(
  a: FuzzyPoint[],
  op: OperationType,
  b: FuzzyPoint[],
  useAlphaCut: boolean,
): FuzzyPoint[] | string {
  return useAlphaCut ? applyAlphaCut(a, op, b) : applyZadeh(a, op, b);
}

function buildExpressionLabel(tokens: CanvasToken[], numbers: FuzzyNumber[]): string {
  const numMap = new Map(numbers.map((n) => [n.id, n.letter]));
  return tokens
    .map((t) => (t.kind === 'number' ? (numMap.get(t.fuzzyNumberId) ?? '?') : t.symbol))
    .join(' ');
}

export function evaluateFuzzyExpression(
  tokens: CanvasToken[],
  numbers: FuzzyNumber[],
): { result: FuzzyPoint[]; label: string } | { error: string; label: string } {
  const numMap = new Map(numbers.map((n) => [n.id, n]));
  const label = buildExpressionLabel(tokens, numbers);

  if (tokens.length === 0) return { error: 'Expression is empty.', label };

  // Use alpha-cut arithmetic only when all operands are function-defined (smooth, dense).
  // By-points numbers use Zadeh extension to keep output proportional to input density.
  const useAlphaCut = tokens
    .filter((t) => t.kind === 'number')
    .every((t) => !!numMap.get(t.fuzzyNumberId)?.fn);

  let accumulator: FuzzyPoint[] | null = null;
  let pendingOp: OperationType | null = null;

  for (const token of tokens) {
    if (token.kind === 'number') {
      const num = numMap.get(token.fuzzyNumberId);
      if (!num) return { error: `Fuzzy number "${token.letter}" not found.`, label };

      if (accumulator === null) {
        accumulator = num.points;
      } else if (pendingOp !== null) {
        const result = applyFuzzyNumberOp(accumulator, pendingOp, num.points, useAlphaCut);
        if (typeof result === 'string') return { error: result, label };
        accumulator = result;
        pendingOp = null;
      }
    } else {
      pendingOp = token.type;
    }
  }

  if (!accumulator) return { error: 'No operands found.', label };
  return { result: accumulator, label };
}
