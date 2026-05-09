import type { FuzzyNumber } from '../../types';
import { FuzzyItemList } from '@/shared/components/FuzzyItemList';

interface Props {
  numbers: FuzzyNumber[];
}

export function FuzzyNumberList({ numbers }: Props) {
  return (
    <FuzzyItemList
      title="Fuzzy Numbers"
      items={numbers}
      buildDragId={(item) => `num-${item.id}`}
      buildDragData={(item) => ({ kind: 'number', fuzzyNumberId: item.id, letter: item.letter })}
      deleteDropZoneId="delete-zone"
      emptyText="No fuzzy numbers yet."
    />
  );
}
