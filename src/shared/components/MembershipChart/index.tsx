import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { Y_TICKS, niceXTicks, fmtTick } from '@/shared/utils/chartUtils';

const CW = 300;
const CH = 220;
const PL = 44;
const PR = 14;
const PT = 14;
const PB = 38;
const PW = CW - PL - PR;
const PH = CH - PT - PB;

interface Props {
  points: FuzzyPoint[];
  showDots?: boolean;
  showAsHistogram?: boolean;
}

export function MembershipChart({ points, showDots = true, showAsHistogram = false }: Props) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const hasPoints = sorted.length > 0;

  showAsHistogram = false;

  let xMin: number, xMax: number;
  if (!hasPoints) {
    xMin = 0; xMax = 1;
  } else if (sorted.length === 1) {
    xMin = sorted[0].x - 1; xMax = sorted[0].x + 1;
  } else {
    const span = sorted[sorted.length - 1].x - sorted[0].x;
    const pad = span * 0.12;
    xMin = sorted[0].x - pad;
    xMax = sorted[sorted.length - 1].x + pad;
  }
  const xSpan = xMax - xMin;

  const toX = (x: number) => PL + ((x - xMin) / xSpan) * PW;
  const toY = (mu: number) => PT + (1 - mu) * PH;

  const linePts = sorted.map((p) => `${toX(p.x)},${toY(p.mu)}`).join(' ');
  const fillPts =
    sorted.length >= 2
      ? `${toX(sorted[0].x)},${toY(0)} ${linePts} ${toX(sorted[sorted.length - 1].x)},${toY(0)}`
      : '';

  const xTicks = niceXTicks(xMin, xMax);

  return (
    <svg
      width={CW}
      height={CH}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Membership function preview"
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

      {showAsHistogram ? (
        (() => {
          const barW = sorted.length > 0
            ? Math.max(3, Math.min(20, (PW / (sorted.length + 1)) * 0.6))
            : 6;
          const baseline = toY(0);
          return sorted.map((p, i) => (
            <rect
              key={i}
              x={toX(p.x) - barW / 2}
              y={toY(p.mu)}
              width={barW}
              height={baseline - toY(p.mu)}
              fill="#1976d2"
              opacity={0.8}
            />
          ));
        })()
      ) : (
        <>
          {fillPts && <polygon points={fillPts} fill="rgba(25,118,210,0.1)" />}
          {sorted.length >= 2 && (
            <polyline
              points={linePts}
              fill="none"
              stroke="#1976d2"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {showDots && sorted.map((p, i) => (
            <circle key={i} cx={toX(p.x)} cy={toY(p.mu)} r={4} fill="#1976d2" stroke="#fff" strokeWidth={1.5} />
          ))}
        </>
      )}

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

      <text x={PL + PW / 2} y={CH - 2} textAnchor="middle" fontSize={12} fill="#444" fontStyle="italic">
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

      {!hasPoints && (
        <text
          x={PL + PW / 2}
          y={PT + PH / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#bbb"
        >
          Add points to preview
        </text>
      )}
    </svg>
  );
}
