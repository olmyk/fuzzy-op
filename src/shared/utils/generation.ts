export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function generateSortedXValues(): number[] {
  const n = 3 + Math.floor(Math.random() * 5); // 3–7 points
  const xs = Array.from({ length: n }, () => Math.random());
  xs.sort((a, b) => a - b);
  const unique = [...new Set(xs.map(round2))];
  while (unique.length < 3) unique.push(round2(Math.random()));
  unique.sort((a, b) => a - b);
  return unique;
}
