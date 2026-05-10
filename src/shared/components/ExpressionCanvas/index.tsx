import { type ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { DND_IDS } from '@/config/dndIds';

interface Token {
  instanceId: string;
  kind: string;
}

interface Props {
  tokens: Token[];
  onClear: () => void;
  canAcceptNext: (kind: string) => boolean;
  renderToken: (token: Token) => ReactNode;
  onCalculate?: () => void;
  canCalculate?: boolean;
  droppableId?: string;
  emptyText?: string;
}

export function ExpressionCanvas({
  tokens,
  onClear,
  canAcceptNext,
  renderToken,
  onCalculate,
  canCalculate = false,
  droppableId = DND_IDS.NUMBER_CANVAS,
  emptyText = 'Drag items here to build an expression.',
}: Props) {
  const { isOver, active, setNodeRef } = useDroppable({ id: droppableId });

  const draggedKind = active?.data?.current?.kind as string | undefined;
  const willAccept = draggedKind ? canAcceptNext(draggedKind) : false;

  const borderColor = isOver ? (willAccept ? 'success.main' : 'error.main') : 'divider';

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
            {emptyText}
          </Typography>
        )}
        {tokens.map((token) => (
          <span key={token.instanceId}>{renderToken(token)}</span>
        ))}
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button size="small" variant="text" color="error" onClick={onClear} disabled={tokens.length === 0}>
          Clear Canvas
        </Button>
        {onCalculate && (
          <Button size="small" variant="contained" onClick={onCalculate} disabled={!canCalculate}>
            Calculate
          </Button>
        )}
      </Box>
    </Paper>
  );
}
