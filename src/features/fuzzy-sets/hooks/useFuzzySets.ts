import { useState, useCallback } from 'react';
import type { FuzzySet } from '../types';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { generateRandomFuzzyPoints } from '../utils/generation';
import { useLetterCounter } from '@/shared/hooks/useLetterCounter';

export function useFuzzySets() {
  const [sets, setSets] = useState<FuzzySet[]>([]);
  const { nextLetter, isAtCapacity, increment } = useLetterCounter();

  const addSet = useCallback(
    (points: FuzzyPoint[]): string | null => {
      if (points.length < 1) return 'A fuzzy set requires at least 1 point.';

      const sorted = [...points].sort((a, b) => a.x - b.x);
      setSets((prev) => [...prev, { id: crypto.randomUUID(), letter: nextLetter, points: sorted }]);
      increment();
      return null;
    },
    [nextLetter, increment],
  );

  const removeSet = useCallback((id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSetDirect = useCallback(
    (points: FuzzyPoint[]): void => {
      if (isAtCapacity) return;
      const sorted = [...points].sort((a, b) => a.x - b.x);
      setSets((prev) => [...prev, { id: crypto.randomUUID(), letter: nextLetter, points: sorted }]);
      increment();
    },
    [nextLetter, increment, isAtCapacity],
  );

  const generateRandom = useCallback(() => {
    if (isAtCapacity) return;
    const points = generateRandomFuzzyPoints();
    addSet(points);
  }, [addSet, isAtCapacity]);

  return { sets, addSet, addSetDirect, removeSet, generateRandom, isAtCapacity };
}
