export interface FuzzyPoint {
  x: number;
  mu: number; // membership degree ∈ [0, 1]
}

export interface FuzzyItem {
  id: string;
  letter: string;
  points: FuzzyPoint[]; // sorted by x ascending
}
