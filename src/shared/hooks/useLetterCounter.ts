import { useState } from 'react';
import { getLetterForIndex, MAX_FUZZY_ITEMS } from '../utils/representation';

export function useLetterCounter() {
  const [letterIndex, setLetterIndex] = useState(0);

  return {
    nextLetter: getLetterForIndex(letterIndex),
    isAtCapacity: letterIndex >= MAX_FUZZY_ITEMS,
    increment: () => setLetterIndex((p) => p + 1),
  };
}
