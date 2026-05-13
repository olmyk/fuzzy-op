export const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

export function niceStep(rough: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const n = rough / mag;
  return n <= 1 ? mag : n <= 2 ? 2 * mag : n <= 5 ? 5 * mag : 10 * mag;
}

export function niceXTicks(min: number, max: number): number[] {
  if (min === max) return [min];
  const step = niceStep((max - min) / 4);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max + step * 1e-9; t = Math.round((t + step) * 1e10) / 1e10) {
    ticks.push(t);
  }
  return ticks;
}

export function fmtTick(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}
