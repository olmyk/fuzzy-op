import type { FuzzyNumber } from '../../types';
import { FuzzyItemList } from '@/shared/components/FuzzyItemList';

interface Props {
  numbers: FuzzyNumber[];
  addDropZoneId?: string;
}

export function FuzzyNumberList({ numbers, addDropZoneId }: Props) {
  return (
    <FuzzyItemList
      title="Fuzzy Numbers"
      items={numbers}
      buildDragId={(item) => `num-${item.id}`}
      buildDragData={(item) => ({ kind: 'number', fuzzyNumberId: item.id, letter: item.letter })}
      deleteDropZoneId="delete-zone"
      addDropZoneId={addDropZoneId}
      emptyText="No fuzzy numbers yet."
    />
  );
}
