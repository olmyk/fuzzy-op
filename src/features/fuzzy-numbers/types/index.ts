export type { FuzzyPoint } from '@/shared/types/fuzzy';
import type { FuzzyPoint } from '@/shared/types/fuzzy';

export interface FuzzyNumber {
  id: string;
  letter: string;
  points: FuzzyPoint[];
}

export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface Operation {
  type: OperationType;
  symbol: string;
  label: string;
}

export type CanvasToken =
  | { kind: 'number'; instanceId: string; fuzzyNumberId: string; letter: string }
  | { kind: 'operation'; instanceId: string; type: OperationType; symbol: string };
