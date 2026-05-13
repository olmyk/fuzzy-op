import type { FuzzyPoint } from '@/shared/types/fuzzy';

const CHART_W = 64;
const CHART_H = 36;
const PAD = 3;

interface Props {
  points: FuzzyPoint[];
  showAsHistogram?: boolean;
}

export function MiniChart({ points, showAsHistogram = false }: Props) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  if (sorted.length === 0) {
    return <svg width={CHART_W} height={CHART_H} style={{ display: 'block', flexShrink: 0 }} aria-hidden="true" />;
  }
  const xMin = sorted[0].x;
  const xMax = sorted[sorted.length - 1].x;
  const xRange = xMax - xMin || 1;

  const plotW = CHART_W - PAD * 2;
  const plotH = CHART_H - PAD * 2;
  const sx = (x: number) => PAD + ((x - xMin) / xRange) * plotW;
  const sy = (mu: number) => PAD + (1 - mu) * plotH;

  const pts = sorted.map((p) => `${sx(p.x)},${sy(p.mu)}`).join(' ');
  const fillPts = `${sx(xMin)},${sy(0)} ${pts} ${sx(xMax)},${sy(0)}`;

  if (showAsHistogram) {
    const barW = Math.max(1.5, Math.min(8, (plotW / (sorted.length + 1)) * 0.6));
    const baseline = sy(0);
    return (
      <svg width={CHART_W} height={CHART_H} style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
        {sorted.map((p, i) => (
          <rect
            key={i}
            x={sx(p.x) - barW / 2}
            y={sy(p.mu)}
            width={barW}
            height={baseline - sy(p.mu)}
            fill="#1976d2"
            opacity={0.8}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <polygon points={fillPts} fill="rgba(25,118,210,0.12)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#1976d2"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
