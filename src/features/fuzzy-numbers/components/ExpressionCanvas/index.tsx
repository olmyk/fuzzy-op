import { Chip } from '@mui/material';
import { ExpressionCanvas as SharedExpressionCanvas } from '@/shared/components/ExpressionCanvas';
import type { CanvasToken } from '../../types';

interface Props {
  tokens: CanvasToken[];
  onRemoveToken: (instanceId: string) => void;
  onClear: () => void;
  canAcceptNext: (kind: CanvasToken['kind']) => boolean;
}

export function ExpressionCanvas({ tokens, onRemoveToken, onClear, canAcceptNext }: Props) {
  return (
    <SharedExpressionCanvas
      tokens={tokens}
      onClear={onClear}
      canAcceptNext={(kind) => canAcceptNext(kind as CanvasToken['kind'])}
      droppableId="canvas-droppable"
      emptyText="Drag fuzzy numbers and operations here to build an expression."
      renderToken={(token) => {
        const t = token as CanvasToken;
        return t.kind === 'number' ? (
          <Chip
            label={t.letter}
            onDelete={() => onRemoveToken(t.instanceId)}
            color="primary"
            sx={{ fontWeight: 700, fontSize: '1rem' }}
          />
        ) : (
          <Chip
            label={t.symbol}
            onDelete={() => onRemoveToken(t.instanceId)}
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '1rem' }}
          />
        );
      }}
    />
  );
}
