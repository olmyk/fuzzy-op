import type { FuzzyPoint } from '@/shared/types/fuzzy';

const LOGICAL_W = 500;
const LOGICAL_H = 260;
const PL = 44;
const PR = 14;
const PT = 14;
const PB = 52; // extra bottom padding for legend
const PW = LOGICAL_W - PL - PR;
const PH = LOGICAL_H - PT - PB;

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

export const GRAPH_COLORS = [
  '#43a047', // A — green
  '#1e88e5', // B — blue
  '#e53935', // C — red
  '#fb8c00', // D — orange
  '#8e24aa', // E — purple
  '#0C0A09', // F — black
  '#FB64B6', // G — pink
  '#7B3306', // H — brown
  '#0022ff', // I — indigo
  '#7BF1A8', // J
  '#00acc1', // K — cyan
  '#FFF085', // L — yellow
];

function niceStep(rough: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const n = rough / mag;
  return n <= 1 ? mag : n <= 2 ? 2 * mag : n <= 5 ? 5 * mag : 10 * mag;
}

function niceXTicks(min: number, max: number): number[] {
  if (min === max) return [min];
  const step = niceStep((max - min) / 4);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max + step * 1e-9; t = Math.round((t + step) * 1e10) / 1e10) {
    ticks.push(t);
  }
  return ticks;
}

function fmtTick(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}

function computeDomain(series: SeriesData[]): [number, number] {
  if (series.length === 0) return [0, 1];
  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) return [0, 1];
  const xs = allPoints.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  if (xMin === xMax) return [xMin - 1, xMax + 1];
  const span = xMax - xMin;
  return [xMin - span * 0.12, xMax + span * 0.12];
}

export interface SeriesData {
  id: string;
  letter: string;
  points: FuzzyPoint[];
  color: string;
}

interface Props {
  series: SeriesData[];
  emptyText?: string;
}

export function MultiSeriesChart({ series, emptyText = 'Drop fuzzy items here to visualize' }: Props) {
  const [xMin, xMax] = computeDomain(series);
  const xSpan = xMax - xMin;

  const toX = (x: number) => PL + ((x - xMin) / xSpan) * PW;
  const toY = (mu: number) => PT + (1 - mu) * PH;

  const xTicks = niceXTicks(xMin, xMax);

  const visibleLegend = series.slice(0, 8);
  const overflow = series.length - visibleLegend.length;

  return (
    <svg
      viewBox={`0 0 ${LOGICAL_W} ${LOGICAL_H}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Multi-series membership chart"
    >
      <rect x={PL} y={PT} width={PW} height={PH} fill="#f8fafd" />

      {Y_TICKS.map((tick) => {
        const y = toY(tick);
        return (
          <g key={tick}>
            <line
              x1={PL} y1={y} x2={PL + PW} y2={y}
              stroke={tick === 1 ? '#90caf9' : '#e3e8ef'}
              strokeWidth={tick === 1 ? 1.5 : 1}
              strokeDasharray={tick === 1 ? '4 3' : undefined}
            />
            <line x1={PL - 4} y1={y} x2={PL} y2={y} stroke="#888" strokeWidth={1} />
            <text x={PL - 7} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#555">
              {fmtTick(tick)}
            </text>
          </g>
        );
      })}

      {series.map((s) => {
        const sorted = [...s.points].sort((a, b) => a.x - b.x);
        if (sorted.length === 0) return null;
        const linePts = sorted.map((p) => `${toX(p.x)},${toY(p.mu)}`).join(' ');
        return (
          <g key={s.id}>
            {sorted.length >= 2 && (
              <polyline
                points={linePts}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.85}
              />
            )}
            {sorted.map((p, i) => (
              <circle key={i} cx={toX(p.x)} cy={toY(p.mu)} r={3} fill={s.color} stroke="#fff" strokeWidth={1} />
            ))}
          </g>
        );
      })}

      <line x1={PL} y1={PT} x2={PL} y2={PT + PH} stroke="#666" strokeWidth={1.5} />
      <line x1={PL} y1={PT + PH} x2={PL + PW} y2={PT + PH} stroke="#666" strokeWidth={1.5} />

      {xTicks.map((tick) => {
        const x = toX(tick);
        if (x < PL - 1 || x > PL + PW + 1) return null;
        return (
          <g key={tick}>
            <line x1={x} y1={PT + PH} x2={x} y2={PT + PH + 4} stroke="#888" strokeWidth={1} />
            <text x={x} y={PT + PH + 16} textAnchor="middle" fontSize={11} fill="#555">
              {fmtTick(tick)}
            </text>
          </g>
        );
      })}

      <text x={PL + PW / 2} y={PT + PH + 30} textAnchor="middle" fontSize={12} fill="#444" fontStyle="italic">
        x
      </text>
      <text
        x={10}
        y={PT + PH / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fill="#444"
        fontStyle="italic"
      >
        µ
      </text>

      {series.length === 0 && (
        <text
          x={PL + PW / 2}
          y={PT + PH / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#bbb"
        >
          {emptyText}
        </text>
      )}

      {visibleLegend.map((s, i) => {
        const lx = PL + i * 58;
        const ly = LOGICAL_H - 10;
        return (
          <g key={s.id} transform={`translate(${lx}, ${ly})`}>
            <rect x={0} y={-6} width={14} height={8} fill={s.color} rx={1} />
            <text x={18} y={0} fontSize={11} fill="#444" dominantBaseline="middle">
              {s.letter}
            </text>
          </g>
        );
      })}

      {overflow > 0 && (
        <text
          x={PL + visibleLegend.length * 58}
          y={LOGICAL_H - 6}
          fontSize={10}
          fill="#888"
          dominantBaseline="middle"
        >
          +{overflow} more
        </text>
      )}
    </svg>
  );
}
