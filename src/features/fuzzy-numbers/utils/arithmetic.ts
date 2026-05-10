import type { FuzzyPoint } from '@/shared/types/fuzzy';
import type { CanvasToken, FuzzyNumber, OperationType } from '../types';

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}

// Zadeh extension principle on discrete point sets.
// For each pair (pa, pb): z = pa.x op pb.x, µ = min(pa.mu, pb.mu).
// When multiple pairs produce the same z, keep the maximum µ (supremum).
export function applyFuzzyNumberOp(
  a: FuzzyPoint[],
  op: OperationType,
  b: FuzzyPoint[],
): FuzzyPoint[] | string {
  const resultMap = new Map<number, number>(); // z → max µ

  for (const pa of a) {
    for (const pb of b) {
      let z: number;
      switch (op) {
        case 'addition':
          z = pa.x + pb.x;
          break;
        case 'subtraction':
          z = pa.x - pb.x;
          break;
        case 'multiplication':
          z = pa.x * pb.x;
          break;
        case 'division':
          if (pb.x === 0) return 'Division by zero: the divisor contains a point with x = 0.';
          z = pa.x / pb.x;
          break;
        default:
          continue;
      }

      const zKey = round6(z);
      const mu = Math.min(pa.mu, pb.mu);
      const existing = resultMap.get(zKey) ?? 0;
      resultMap.set(zKey, Math.max(existing, mu));
    }
  }

  return [...resultMap.entries()]
    .map(([x, mu]) => ({ x, mu }))
    .filter((p) => p.mu > 0)
    .sort((a, b) => a.x - b.x);
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

  let accumulator: FuzzyPoint[] | null = null;
  let pendingOp: OperationType | null = null;

  for (const token of tokens) {
    if (token.kind === 'number') {
      const num = numMap.get(token.fuzzyNumberId);
      if (!num) return { error: `Fuzzy number "${token.letter}" not found.`, label };

      if (accumulator === null) {
        accumulator = num.points;
      } else if (pendingOp !== null) {
        const result = applyFuzzyNumberOp(accumulator, pendingOp, num.points);
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
