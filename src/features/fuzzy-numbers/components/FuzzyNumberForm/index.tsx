import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { FuzzyItemForm } from '@/shared/components/FuzzyItemForm';
import { VALIDATION_MESSAGES, type ValidationResult } from '../../utils/validation';

interface Props {
  onAdd: (points: FuzzyPoint[]) => ValidationResult;
  onGenerateRandom: () => ValidationResult;
  isAtCapacity: boolean;
}

export function FuzzyNumberForm({ onAdd, onGenerateRandom, isAtCapacity }: Props) {
  function handleAdd(points: FuzzyPoint[]): string | null {
    const result = onAdd(points);
    return result.valid ? null : VALIDATION_MESSAGES[result.reason];
  }

  return (
    <FuzzyItemForm
      title="Add Fuzzy Number"
      onAdd={handleAdd}
      onGenerateRandom={onGenerateRandom}
      isAtCapacity={isAtCapacity}
      minPoints={2}
      capacityMessage="Maximum of 26 fuzzy numbers reached."
    />
  );
}
