import { useState } from 'react';
import { Alert, Box, Button, Chip, Paper, TextField, Typography } from '@mui/material';
import type { FuzzyPoint } from '../../types';
import { VALIDATION_MESSAGES, type ValidationResult } from '../../utils/validation';

// ─── Membership function chart ────────────────────────────────────────────────

const CW = 300;   // total SVG width
const CH = 220;   // total SVG height
const PL = 44;    // left padding  (room for µ tick labels)
const PR = 14;    // right padding
const PT = 14;    // top padding
const PB = 38;    // bottom padding (room for x tick labels + axis label)
const PW = CW - PL - PR;  // plot area width
const PH = CH - PT - PB;  // plot area height

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

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

function MembershipChart({ points }: { points: FuzzyPoint[] }) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const hasPoints = sorted.length > 0;

  // X domain — pad by 10 % of span on each side so dots don't clip
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
      {/* Plot area background */}
      <rect x={PL} y={PT} width={PW} height={PH} fill="#f8fafd" />

      {/* Horizontal grid lines + y-axis ticks + labels */}
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
            <text
              x={PL - 7}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="#555"
            >
              {fmtTick(tick)}
            </text>
          </g>
        );
      })}

      {/* Fill under curve */}
      {fillPts && <polygon points={fillPts} fill="rgba(25,118,210,0.1)" />}

      {/* Curve line */}
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

      {/* Data point dots */}
      {sorted.map((p, i) => (
        <circle
          key={i}
          cx={toX(p.x)}
          cy={toY(p.mu)}
          r={4}
          fill="#1976d2"
          stroke="#fff"
          strokeWidth={1.5}
        />
      ))}

      {/* Axes */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + PH} stroke="#666" strokeWidth={1.5} />
      <line x1={PL} y1={PT + PH} x2={PL + PW} y2={PT + PH} stroke="#666" strokeWidth={1.5} />

      {/* X-axis ticks + labels */}
      {xTicks.map((tick) => {
        const x = toX(tick);
        if (x < PL - 1 || x > PL + PW + 1) return null;
        return (
          <g key={tick}>
            <line x1={x} y1={PT + PH} x2={x} y2={PT + PH + 4} stroke="#888" strokeWidth={1} />
            <text
              x={x}
              y={PT + PH + 16}
              textAnchor="middle"
              fontSize={11}
              fill="#555"
            >
              {fmtTick(tick)}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text
        x={PL + PW / 2}
        y={CH - 2}
        textAnchor="middle"
        fontSize={12}
        fill="#444"
        fontStyle="italic"
      >
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

      {/* "No points yet" hint */}
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

// ─── Form ─────────────────────────────────────────────────────────────────────

interface Props {
  onAdd: (points: FuzzyPoint[]) => ValidationResult;
  onGenerateRandom: () => ValidationResult;
  isAtCapacity: boolean;
}

export function FuzzyNumberForm({ onAdd, onGenerateRandom, isAtCapacity }: Props) {
  const [xInput, setXInput] = useState('');
  const [muInput, setMuInput] = useState('');
  const [draftPoints, setDraftPoints] = useState<FuzzyPoint[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [xError, setXError] = useState<string | null>(null);
  const [muError, setMuError] = useState<string | null>(null);

  function handleAddPoint() {
    const x = parseFloat(xInput);
    const mu = parseFloat(muInput);
    let hasError = false;

    if (isNaN(x)) {
      setXError('Enter a valid number.');
      hasError = true;
    } else if (draftPoints.some((p) => p.x === x)) {
      setXError(`x = ${x} is already added.`);
      hasError = true;
    } else {
      setXError(null);
    }

    if (isNaN(mu) || mu < 0 || mu > 1) {
      setMuError('µ must be between 0 and 1.');
      hasError = true;
    } else {
      setMuError(null);
    }

    if (hasError) return;

    setDraftPoints((prev) => [...prev, { x, mu }].sort((a, b) => a.x - b.x));
    setXInput('');
    setMuInput('');
    setSubmitError(null);
  }

  function handleRemovePoint(index: number) {
    setDraftPoints((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const result = onAdd(draftPoints);
    if (!result.valid) {
      setSubmitError(VALIDATION_MESSAGES[result.reason]);
    } else {
      setDraftPoints([]);
      setSubmitError(null);
    }
  }

  const disabled = isAtCapacity;
  const canSubmit = !disabled && draftPoints.length >= 2;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Fuzzy Number
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* ── Left: controls ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isAtCapacity && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Maximum of 26 fuzzy numbers reached.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField
              label="x"
              type="number"
              size="small"
              value={xInput}
              onChange={(e) => setXInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
              error={!!xError}
              helperText={xError ?? ' '}
              disabled={disabled}
              sx={{ width: 140 }}
            />
            <TextField
              label="µ (0 – 1)"
              type="number"
              size="small"
              slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }}
              value={muInput}
              onChange={(e) => setMuInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
              error={!!muError}
              helperText={muError ?? ' '}
              disabled={disabled}
              sx={{ width: 140 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddPoint}
              disabled={disabled}
              sx={{ mt: 0.25 }}
            >
              Add Point
            </Button>
          </Box>

          {draftPoints.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'nowrap', gap: 1, overflowX: 'auto', pb: 0.5 }}>
              {draftPoints.map((p, i) => (
                <Chip
                  key={i}
                  label={`(${p.x}, ${p.mu})`}
                  onDelete={() => handleRemovePoint(i)}
                  variant="outlined"
                  size="small"
                  sx={{ fontFamily: 'monospace', flexShrink: 0 }}
                />
              ))}
            </Box>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={onGenerateRandom} disabled={disabled}>
              Generate Random
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
              Submit
            </Button>
          </Box>
        </Box>

        {/* ── Right: chart ── */}
        <Box sx={{ flexShrink: 0 }}>
          <MembershipChart points={draftPoints} />
        </Box>
      </Box>
    </Paper>
  );
}
