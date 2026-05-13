import { useState } from 'react';
import {
  Alert, Box, Button, FormControl, InputLabel,
  MenuItem, Paper, Select, TextField, Typography,
} from '@mui/material';
import type { FuzzyPoint, FuzzyItemFn } from '@/shared/types/fuzzy';
import { MembershipChart } from '@/shared/components/MembershipChart';
import {
  type FunctionType,
  type ParamsByType,
  FUNCTION_LABELS,
  DEFAULT_PARAMS,
  sampleFunction,
  randomParams,
  getFunctionLabel,
} from '@/shared/utils/membershipFunctions';

// --- parameter field metadata ---

interface FieldMeta {
  key: string;
  label: string;
}

const FIELDS: Record<FunctionType, FieldMeta[]> = {
  triangle:    [{ key: 'a', label: 'a (left foot)' }, { key: 'b', label: 'b (peak)' }, { key: 'c', label: 'c (right foot)' }],
  trapezoid:   [{ key: 'a', label: 'a (left foot)' }, { key: 'b', label: 'b (left shoulder)' }, { key: 'c', label: 'c (right shoulder)' }, { key: 'd', label: 'd (right foot)' }],
  gaussian:    [{ key: 'c', label: 'c (center)' }, { key: 'sigma', label: 'σ (width)' }],
  bell:        [{ key: 'a', label: 'a (width)' }, { key: 'b', label: 'b (slope)' }, { key: 'c', label: 'c (center)' }],
  exponential: [{ key: 'lambda', label: 'λ (decay)' }, { key: 'c', label: 'c (center)' }],
  sigmoid:     [{ key: 'a', label: 'a (slope)' }, { key: 'c', label: 'c (inflection)' }],
  sshape:      [{ key: 'a', label: 'a (left foot)' }, { key: 'b', label: 'b (right shoulder)' }],
  zshape:      [{ key: 'a', label: 'a (left shoulder)' }, { key: 'b', label: 'b (right foot)' }],
  pishape:     [{ key: 'a', label: 'a (left foot)' }, { key: 'b', label: 'b (left shoulder)' }, { key: 'c', label: 'c (right shoulder)' }, { key: 'd', label: 'd (right foot)' }],
};

function validate(type: FunctionType, raw: Record<string, string>): string | null {
  const n = (k: string) => parseFloat(raw[k]);
  switch (type) {
    case 'triangle':
      if (isNaN(n('a')) || isNaN(n('b')) || isNaN(n('c'))) return 'All fields are required.';
      if (!(n('a') < n('b') && n('b') < n('c'))) return 'Required: a < b < c.';
      return null;
    case 'trapezoid':
      if (['a','b','c','d'].some(k => isNaN(n(k)))) return 'All fields are required.';
      if (!(n('a') < n('b') && n('b') <= n('c') && n('c') < n('d'))) return 'Required: a < b ≤ c < d.';
      return null;
    case 'gaussian':
      if (isNaN(n('c')) || isNaN(n('sigma'))) return 'All fields are required.';
      if (n('sigma') <= 0) return 'σ must be > 0.';
      return null;
    case 'bell':
      if (isNaN(n('a')) || isNaN(n('b')) || isNaN(n('c'))) return 'All fields are required.';
      if (n('a') <= 0) return 'a must be > 0.';
      if (n('b') <= 0) return 'b must be > 0.';
      return null;
    case 'exponential':
      if (isNaN(n('lambda')) || isNaN(n('c'))) return 'All fields are required.';
      if (n('lambda') <= 0) return 'λ must be > 0.';
      return null;
    case 'sigmoid':
      if (isNaN(n('a')) || isNaN(n('c'))) return 'All fields are required.';
      if (n('a') === 0) return 'a must not be 0.';
      return null;
    case 'sshape':
    case 'zshape':
      if (isNaN(n('a')) || isNaN(n('b'))) return 'All fields are required.';
      if (!(n('a') < n('b'))) return 'Required: a < b.';
      return null;
    case 'pishape':
      if (['a','b','c','d'].some(k => isNaN(n(k)))) return 'All fields are required.';
      if (!(n('a') < n('b') && n('b') <= n('c') && n('c') < n('d'))) return 'Required: a < b ≤ c < d.';
      return null;
  }
}

function paramsFromRaw(type: FunctionType, raw: Record<string, string>): ParamsByType[FunctionType] {
  const n = (k: string) => parseFloat(raw[k]);
  switch (type) {
    case 'triangle':    return { a: n('a'), b: n('b'), c: n('c') };
    case 'trapezoid':   return { a: n('a'), b: n('b'), c: n('c'), d: n('d') };
    case 'gaussian':    return { c: n('c'), sigma: n('sigma') };
    case 'bell':        return { a: n('a'), b: n('b'), c: n('c') };
    case 'exponential': return { lambda: n('lambda'), c: n('c') };
    case 'sigmoid':     return { a: n('a'), c: n('c') };
    case 'sshape':      return { a: n('a'), b: n('b') };
    case 'zshape':      return { a: n('a'), b: n('b') };
    case 'pishape':     return { a: n('a'), b: n('b'), c: n('c'), d: n('d') };
  }
}

function rawFromParams(params: ParamsByType[FunctionType]): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  );
}

interface Props {
  title: string;
  allowedTypes: FunctionType[];
  onAdd: (points: FuzzyPoint[], fn: FuzzyItemFn) => string | null;
  isAtCapacity: boolean;
  capacityMessage?: string;
}

export function FunctionForm({
  title,
  allowedTypes,
  onAdd,
  isAtCapacity,
  capacityMessage = 'Maximum of 26 items reached.',
}: Props) {
  const [type, setType] = useState<FunctionType>(allowedTypes[0]);
  const [raw, setRaw] = useState<Record<string, string>>(rawFromParams(DEFAULT_PARAMS[allowedTypes[0]]));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validationError = validate(type, raw);
  const previewPoints: FuzzyPoint[] = validationError === null
    ? sampleFunction(type, paramsFromRaw(type, raw))
    : [];

  function handleTypeChange(newType: FunctionType) {
    setType(newType);
    setRaw(rawFromParams(DEFAULT_PARAMS[newType]));
    setSubmitError(null);
  }

  function handleFieldChange(key: string, value: string) {
    setRaw((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  }

  function handleSubmit() {
    const err = validate(type, raw);
    if (err) { setSubmitError(err); return; }
    const params = paramsFromRaw(type, raw);
    const points = sampleFunction(type, params);
    const fn: FuzzyItemFn = {
      type,
      params: params as unknown as Record<string, number>,
      label: getFunctionLabel(type, params),
    };
    const result = onAdd(points, fn);
    if (result !== null) setSubmitError(result);
    else setSubmitError(null);
  }

  function handleRandom() {
    const params = randomParams(type);
    setRaw(rawFromParams(params));
    setSubmitError(null);
  }

  const disabled = isAtCapacity;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isAtCapacity && (
            <Alert severity="info">{capacityMessage}</Alert>
          )}

          <FormControl size="small" disabled={disabled} sx={{ width: 220 }}>
            <InputLabel>Function type</InputLabel>
            <Select
              label="Function type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as FunctionType)}
            >
              {allowedTypes.map((t) => (
                <MenuItem key={t} value={t}>{FUNCTION_LABELS[t]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {FIELDS[type].map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                type="number"
                size="small"
                value={raw[field.key] ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                disabled={disabled}
                sx={{ width: 160 }}
              />
            ))}
          </Box>

          <Box sx={{ minHeight: 40 }}>
            {(submitError ?? validationError) && (
              <Alert severity={submitError ? 'error' : 'warning'} sx={{ mt: 1 }}>
                {submitError ?? validationError}
              </Alert>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
            <Button variant="outlined" onClick={handleRandom} disabled={disabled}>
              Generate Random
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={disabled || validationError !== null}>
              Submit
            </Button>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <MembershipChart points={previewPoints} showDots={false} />
        </Box>
      </Box>
    </Paper>
  );
}
