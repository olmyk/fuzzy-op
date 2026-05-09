export interface FuzzyPoint {
  x: number;
  mu: number; // membership degree ∈ [0, 1]
}

export interface FuzzyNumber {
  id: string;
  letter: string;
  points: FuzzyPoint[]; // sorted by x ascending
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
