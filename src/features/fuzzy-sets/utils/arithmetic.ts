import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { interpolateMu, mergeXValues } from '@/shared/utils/interpolation';
import type { FuzzySet, SetCanvasToken } from '../types';

export function complementSet(a: FuzzyPoint[]): FuzzyPoint[] {
  return a
    .map((p) => ({ x: p.x, mu: Math.round((1 - p.mu) * 10000) / 10000 }))
    .filter((p) => p.mu > 0);
}

export function unionSets(a: FuzzyPoint[], b: FuzzyPoint[]): FuzzyPoint[] {
  return mergeXValues(a, b)
    .map((x) => ({ x, mu: Math.max(interpolateMu(a, x), interpolateMu(b, x)) }))
    .filter((p) => p.mu > 0);
}

export function intersectSets(a: FuzzyPoint[], b: FuzzyPoint[]): FuzzyPoint[] {
  return mergeXValues(a, b)
    .map((x) => ({ x, mu: Math.min(interpolateMu(a, x), interpolateMu(b, x)) }))
    .filter((p) => p.mu > 0);
}

function buildSetLabel(tokens: SetCanvasToken[], sets: FuzzySet[]): string {
  const setMap = new Map(sets.map((s) => [s.id, s.letter]));
  return tokens
    .map((t) => {
      if (t.kind === 'set') return setMap.get(t.fuzzySetId) ?? '?';
      return t.symbol;
    })
    .join(' ');
}

export function evaluateSetExpression(
  tokens: SetCanvasToken[],
  sets: FuzzySet[],
): { result: FuzzyPoint[]; label: string } | { error: string; label: string } {
  const setMap = new Map(sets.map((s) => [s.id, s]));
  const label = buildSetLabel(tokens, sets);

  if (tokens.length === 0) return { error: 'Expression is empty.', label };

  // Parse into operands (possibly complement-prefixed) and binary ops
  // Grammar: operand ([binary] operand)* where operand = [∁] set
  let accumulator: FuzzyPoint[] | null = null;
  let pendingBinary: 'union' | 'intersection' | null = null;
  let applyComplement = false;

  for (const token of tokens) {
    if (token.kind === 'complement') {
      applyComplement = true;
      continue;
    }

    if (token.kind === 'set') {
      const s = setMap.get(token.fuzzySetId);
      if (!s) return { error: `Fuzzy set "${token.letter}" not found.`, label };

      let operand = s.points;
      if (applyComplement) {
        operand = complementSet(operand);
        applyComplement = false;
      }

      if (accumulator === null) {
        accumulator = operand;
      } else if (pendingBinary === 'union') {
        accumulator = unionSets(accumulator, operand);
        pendingBinary = null;
      } else if (pendingBinary === 'intersection') {
        accumulator = intersectSets(accumulator, operand);
        pendingBinary = null;
      }
      continue;
    }

    if (token.kind === 'union') { pendingBinary = 'union'; continue; }
    if (token.kind === 'intersection') { pendingBinary = 'intersection'; continue; }
  }

  if (!accumulator) return { error: 'No operands found.', label };
  return { result: accumulator, label };
}
