import { Alert, Box, Chip, Paper, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { MembershipChart } from '@/shared/components/MembershipChart';
import { toSetNotation } from '@/shared/utils/representation';

interface DraggableResultProps {
  draggableId: string;
  dragKind: string;
  points: FuzzyPoint[];
}

function DraggableResult({ draggableId, dragKind, points }: DraggableResultProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: { kind: dragKind, points },
  });

  return (
    <Chip
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      label="Result — drag to list"
      variant="outlined"
      color="success"
      sx={{
        cursor: 'grab',
        fontWeight: 600,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none',
      }}
    />
  );
}

interface Props {
  result: FuzzyPoint[] | null;
  expressionLabel: string;
  draggableId: string;
  dragKind: string;
  isAtCapacity: boolean;
  error?: string | null;
}

export function OutputCanvas({
  result,
  expressionLabel,
  draggableId,
  dragKind,
  isAtCapacity,
  error,
}: Props) {
  const hasContent = result !== null || !!error;

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, minHeight: 292.6 }}>
      <Typography variant="h6" gutterBottom>
        Output
      </Typography>

      {!hasContent && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Build an expression above and press Calculate.
        </Typography>
      )}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {result && !error && (
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box sx={{ flexShrink: 0 }}>
            <MembershipChart points={result} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Expression
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
              {expressionLabel}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Result (set notation)
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mb: 2 }}
            >
              {toSetNotation(result)}
            </Typography>

            {isAtCapacity ? (
              <Typography variant="caption" color="text.secondary">
                List is at capacity — cannot add result.
              </Typography>
            ) : (
              <DraggableResult
                draggableId={draggableId}
                dragKind={dragKind}
                points={result}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
