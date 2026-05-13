import { useState } from 'react';
import { Alert, Box, Button, Chip, Paper, TextField, Typography } from '@mui/material';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { MembershipChart } from '@/shared/components/MembershipChart';

interface Props {
  title: string;
  onAdd: (points: FuzzyPoint[]) => string | null; // null = success, string = error message
  onGenerateRandom: () => void;
  isAtCapacity: boolean;
  minPoints?: number;
  capacityMessage?: string;
}

export function FuzzyItemForm({
  title,
  onAdd,
  onGenerateRandom,
  isAtCapacity,
  minPoints = 1,
  capacityMessage = 'Maximum of 26 items reached.',
}: Props) {
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

    if (isNaN(mu) || mu <= 0 || mu > 1) {
      setMuError('µ must be > 0 and ≤ 1.');
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
    setSubmitError(null);
  }

  function handleSubmit() {
    const error = onAdd(draftPoints);
    if (error !== null) {
      setSubmitError(error);
    } else {
      setDraftPoints([]);
      setSubmitError(null);
    }
  }

  const disabled = isAtCapacity;
  const canSubmit = !disabled && draftPoints.length >= minPoints;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {isAtCapacity && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {capacityMessage}
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
              label="µ (0, 1]"
              type="number"
              size="small"
              slotProps={{ htmlInput: { min: 0.01, max: 1, step: 0.01 } }}
              value={muInput}
              onChange={(e) => setMuInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
              error={!!muError}
              helperText={muError ?? ' '}
              disabled={disabled}
              sx={{ width: 140 }}
            />
            <Button variant="outlined" onClick={handleAddPoint} disabled={disabled} sx={{ mt: 0.25 }}>
              Add Point
            </Button>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'nowrap', gap: 1, overflowX: 'auto', pb: 0.5, minHeight: 130 }}>
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

          <Box sx={{ minHeight: 70 }}>
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pt: 2 }}>
            <Button variant="outlined" onClick={onGenerateRandom} disabled={disabled}>
              Generate Random
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
              Submit
            </Button>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <MembershipChart points={draftPoints} showAsHistogram />
        </Box>
      </Box>
    </Paper>
  );
}
