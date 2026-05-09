export type { FuzzyPoint } from '@/shared/types/fuzzy';
import type { FuzzyPoint } from '@/shared/types/fuzzy';

export interface FuzzySet {
  id: string;
  letter: string;
  points: FuzzyPoint[];
}

export type SetCanvasToken =
  | { kind: 'set'; instanceId: string; fuzzySetId: string; letter: string }
  | { kind: 'union'; instanceId: string; symbol: '∪' }
  | { kind: 'intersection'; instanceId: string; symbol: '∩' }
  | { kind: 'complement'; instanceId: string; symbol: '∁' };
