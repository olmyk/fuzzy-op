import { useState } from 'react';
import { Box, List, ListItem, Paper, Tooltip, Typography } from '@mui/material';
import { useDndMonitor, useDraggable, useDroppable, type DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { FuzzyNumber, FuzzyPoint } from '../../types';
import { toSetNotation } from '../../utils/representation';

// ─── Mini membership-function chart ──────────────────────────────────────────

const CHART_W = 64;
const CHART_H = 36;
const PAD = 3;

function MiniChart({ points }: { points: FuzzyPoint[] }) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const xMin = sorted[0].x;
  const xMax = sorted[sorted.length - 1].x;
  const xRange = xMax - xMin || 1;

  const sx = (x: number) => PAD + ((x - xMin) / xRange) * (CHART_W - PAD * 2);
  const sy = (mu: number) => PAD + (1 - mu) * (CHART_H - PAD * 2);

  const pts = sorted.map((p) => `${sx(p.x)},${sy(p.mu)}`).join(' ');
  const fillPts = `${sx(xMin)},${sy(0)} ${pts} ${sx(xMax)},${sy(0)}`;

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

// ─── Delete drop zone (shown in header while dragging a number) ───────────────

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function DeleteDropZone() {
  const { isOver, setNodeRef } = useDroppable({ id: 'delete-zone' });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: 1,
        border: '1.5px dashed',
        borderColor: isOver ? 'error.main' : 'error.light',
        color: isOver ? 'error.main' : 'error.light',
        bgcolor: isOver ? 'rgba(211,47,47,0.08)' : 'transparent',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <TrashIcon />
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
        {isOver ? 'Release to delete' : 'Drop to delete'}
      </Typography>
    </Box>
  );
}

// ─── Draggable list item ──────────────────────────────────────────────────────

function DraggableNumberItem({ number }: { number: FuzzyNumber }) {
  const representation = toSetNotation(number.points);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `num-${number.id}`,
    data: { kind: 'number', fuzzyNumberId: number.id, letter: number.letter },
  });

  return (
    <ListItem
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disablePadding
      sx={{
        px: 1.5,
        py: 0.75,
        cursor: 'grab',
        borderRadius: 1,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        '&:hover': { bgcolor: 'action.hover' },
        userSelect: 'none',
      }}
    >
      <Tooltip title={representation} placement="right" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, width: '100%' }}>
          <MiniChart points={number.points} />
          <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
            {number.letter}:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              minWidth: 0,
            }}
          >
            {representation}
          </Typography>
        </Box>
      </Tooltip>
    </ListItem>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  numbers: FuzzyNumber[];
}

export function FuzzyNumberList({ numbers }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingNumber, setIsDraggingNumber] = useState(false);

  useDndMonitor({
    onDragStart: (event: DragStartEvent) => {
      setIsDragging(true);
      setIsDraggingNumber(event.active.data.current?.kind === 'number');
    },
    onDragEnd: () => { setIsDragging(false); setIsDraggingNumber(false); },
    onDragCancel: () => { setIsDragging(false); setIsDraggingNumber(false); },
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Fuzzy Numbers</Typography>
        {isDraggingNumber && <DeleteDropZone />}
      </Box>

      {numbers.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No fuzzy numbers yet.
        </Typography>
      ) : (
        <List dense disablePadding sx={{ overflow: isDragging ? 'hidden' : 'auto', flex: 1, maxHeight: 400 }}>
          {numbers.map((n) => (
            <DraggableNumberItem key={n.id} number={n} />
          ))}
        </List>
      )}
    </Paper>
  );
}
