import { useState, useCallback } from 'react';
import type { FuzzyNumber } from '../types';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { validateFuzzyNumber, VALIDATION_MESSAGES } from '../utils/validation';
import { generateRandomFuzzyPoints } from '../utils/generation';
import { nextAvailableLetter } from '@/shared/utils/representation';

export function useFuzzyNumbers() {
  const [numbers, setNumbers] = useState<FuzzyNumber[]>([]);

  const nextLetter = nextAvailableLetter(numbers.map((n) => n.letter));
  const isAtCapacity = nextLetter === null;

  const addNumber = useCallback(
    (points: FuzzyPoint[]): string | null => {
      const result = validateFuzzyNumber(points);
      if (!result.valid) return VALIDATION_MESSAGES[result.reason];
      if (!nextLetter) return 'Maximum of 26 fuzzy numbers reached.';

      const sorted = [...points].sort((a, b) => a.x - b.x);
      setNumbers((prev) => [...prev, { id: crypto.randomUUID(), letter: nextLetter, points: sorted }]);
      return null;
    },
    [nextLetter],
  );

  const removeNumber = useCallback((id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNumberDirect = useCallback(
    (points: FuzzyPoint[]): void => {
      if (!nextLetter) return;
      const sorted = [...points].sort((a, b) => a.x - b.x);
      setNumbers((prev) => [...prev, { id: crypto.randomUUID(), letter: nextLetter, points: sorted }]);
    },
    [nextLetter],
  );

  const generateRandom = useCallback((): void => {
    if (isAtCapacity) return;
    const points = generateRandomFuzzyPoints();
    addNumber(points);
  }, [addNumber, isAtCapacity]);

  return { numbers, addNumber, addNumberDirect, removeNumber, generateRandom, isAtCapacity };
}
