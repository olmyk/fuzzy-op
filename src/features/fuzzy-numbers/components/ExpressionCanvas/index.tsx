import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import type { CanvasToken } from '../../types';

interface Props {
  tokens: CanvasToken[];
  onRemoveToken: (instanceId: string) => void;
  onClear: () => void;
  canAcceptNext: (kind: CanvasToken['kind']) => boolean;
}

export function ExpressionCanvas({ tokens, onRemoveToken, onClear, canAcceptNext }: Props) {
  const { isOver, active, setNodeRef } = useDroppable({ id: 'canvas-droppable' });

  const draggedKind = active?.data?.current?.kind as CanvasToken['kind'] | undefined;
  const willAccept = draggedKind ? canAcceptNext(draggedKind) : false;

  const borderColor = isOver
    ? willAccept
      ? 'success.main'
      : 'error.main'
    : 'divider';

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Expression Canvas
      </Typography>

      <Box
        ref={setNodeRef}
        sx={{
          minHeight: 72,
          border: '2px dashed',
          borderColor,
          borderRadius: 1,
          p: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          transition: 'border-color 0.15s',
          bgcolor: isOver ? (willAccept ? 'success.light' : 'error.light') : 'transparent',
        }}
      >
        {tokens.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Drag fuzzy numbers and operations here to build an expression.
          </Typography>
        )}

        {tokens.map((token) =>
          token.kind === 'number' ? (
            <Chip
              key={token.instanceId}
              label={token.letter}
              onDelete={() => onRemoveToken(token.instanceId)}
              color="primary"
              sx={{ fontWeight: 700, fontSize: '1rem' }}
            />
          ) : (
            <Chip
              key={token.instanceId}
              label={token.symbol}
              onDelete={() => onRemoveToken(token.instanceId)}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '1rem' }}
            />
          ),
        )}
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          variant="text"
          color="error"
          onClick={onClear}
          disabled={tokens.length === 0}
        >
          Clear Canvas
        </Button>
      </Box>
    </Paper>
  );
}
