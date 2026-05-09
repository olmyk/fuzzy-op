import { useState, useCallback } from 'react';
import type { FuzzyNumber, FuzzyPoint } from '../types';
import { validateFuzzyNumber, type ValidationResult } from '../utils/validation';
import { generateRandomFuzzyPoints } from '../utils/generation';
import { getLetterForIndex, MAX_FUZZY_NUMBERS } from '../utils/representation';

export function useFuzzyNumbers() {
  const [numbers, setNumbers] = useState<FuzzyNumber[]>([]);
  // Monotonically increasing — never decremented when a number is deleted,
  // so letters are never re-assigned after a deletion.
  const [letterIndex, setLetterIndex] = useState(0);

  const isAtCapacity = letterIndex >= MAX_FUZZY_NUMBERS;

  const addNumber = useCallback(
    (points: FuzzyPoint[]): ValidationResult => {
      const result = validateFuzzyNumber(points);
      if (!result.valid) return result;

      const sorted = [...points].sort((a, b) => a.x - b.x);
      const letter = getLetterForIndex(letterIndex);

      setNumbers((prev) => [...prev, { id: crypto.randomUUID(), letter, points: sorted }]);
      setLetterIndex((prev) => prev + 1);
      return { valid: true };
    },
    [letterIndex],
  );

  const removeNumber = useCallback((id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const generateRandom = useCallback((): ValidationResult => {
    if (isAtCapacity) return { valid: false, reason: 'too-few-points' };
    const points = generateRandomFuzzyPoints();
    return addNumber(points);
  }, [addNumber, isAtCapacity]);

  return { numbers, addNumber, removeNumber, generateRandom, isAtCapacity };
}
