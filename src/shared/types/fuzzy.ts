export interface FuzzyPoint {
  x: number;
  mu: number; // membership degree ∈ [0, 1]
}

export interface FuzzyItemFn {
  type: string;
  params: Record<string, number>;
  label: string;
}

export interface FuzzyItem {
  id: string;
  letter: string;
  points: FuzzyPoint[]; // sorted by x ascending
  fn?: FuzzyItemFn;
  label?: string; // display label override (e.g. expression "A + B")
}
