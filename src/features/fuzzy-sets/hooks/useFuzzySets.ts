import { useState, useCallback } from 'react';
import type { FuzzySet } from '../types';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { generateRandomFuzzyPoints } from '../utils/generation';
import { nextAvailableLetter } from '@/shared/utils/representation';

export function useFuzzySets() {
  const [sets, setSets] = useState<FuzzySet[]>([]);

  const nextLetter = nextAvailableLetter(sets.map((s) => s.letter));
  const isAtCapacity = nextLetter === null;

  const addSet = useCallback(
    (points: FuzzyPoint[]): string | null => {
      if (points.length < 1) return 'A fuzzy set requires at least 1 point.';
      if (!nextLetter) return 'Maximum of 26 fuzzy sets reached.';

      const sorted = [...points].sort((a, b) => a.x - b.x);
      setSets((prev) => [...prev, { id: crypto.randomUUID(), letter: nextLetter, points: sorted }]);
      return null;
    },
    [nextLetter],
  );

  const removeSet = useCallback((id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSetDirect = useCallback(
    (points: FuzzyPoint[]): void => {
      if (!nextLetter) return;
      const sorted = [...points].sort((a, b) => a.x - b.x);
      setSets((prev) => [...prev, { id: crypto.randomUUID(), letter: nextLetter, points: sorted }]);
    },
    [nextLetter],
  );

  const generateRandom = useCallback(() => {
    if (isAtCapacity) return;
    const points = generateRandomFuzzyPoints();
    addSet(points);
  }, [addSet, isAtCapacity]);

  return { sets, addSet, addSetDirect, removeSet, generateRandom, isAtCapacity };
}
