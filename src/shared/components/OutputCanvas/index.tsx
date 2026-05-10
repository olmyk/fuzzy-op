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

function ListAddIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 10 24" fill="currentColor" aria-hidden="true">
      <path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z" />
    </svg>
  );
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
      icon={<ListAddIcon />}
      label="drag to list"
      variant="outlined"
      color="success"
      size="small"
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
  showDots?: boolean;
}

export function OutputCanvas({
  result,
  expressionLabel,
  draggableId,
  dragKind,
  isAtCapacity,
  error,
  showDots = true,
}: Props) {
  const hasContent = result !== null || !!error;

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, minHeight: 292.6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Output</Typography>
        {result && !error && (
          isAtCapacity ? (
            <Typography variant="caption" color="text.secondary">
              List is at capacity — cannot add result.
            </Typography>
          ) : (
            <DraggableResult draggableId={draggableId} dragKind={dragKind} points={result} />
          )
        )}
      </Box>

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
            <MembershipChart points={result} showDots={showDots} />
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

          </Box>
        </Box>
      )}
    </Paper>
  );
}
