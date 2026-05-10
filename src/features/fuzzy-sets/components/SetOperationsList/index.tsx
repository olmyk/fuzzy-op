import { List, ListItem, Paper, Tooltip, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface SetOp {
  kind: 'union' | 'intersection' | 'complement';
  symbol: string;
  label: string;
  description: string;
}

const SET_OPERATIONS: SetOp[] = [
  { kind: 'union', symbol: '∪', label: 'Union', description: 'A ∪ B: max(µA, µB) for each x' },
  { kind: 'intersection', symbol: '∩', label: 'Intersection', description: 'A ∩ B: min(µA, µB) for each x' },
  { kind: 'complement', symbol: '∁', label: 'Complement', description: 'Unary prefix — ∁A: 1 − µA for each x' },
];

interface DraggableSetOpProps {
  op: SetOp;
  onAdd?: (data: { kind: SetOp['kind']; symbol: string }) => void;
}

function DraggableSetOp({ op, onAdd }: DraggableSetOpProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `setop-${op.kind}`,
    data: { kind: op.kind, symbol: op.symbol },
  });

  return (
    <Tooltip title={op.description} placement="right" arrow>
      <ListItem
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        disablePadding
        onDoubleClick={() => onAdd?.({ kind: op.kind, symbol: op.symbol })}
        sx={{
          px: 1.5,
          py: 0.75,
          cursor: 'grab',
          borderRadius: 1,
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.4 : 1,
          '&:hover': { bgcolor: 'action.hover' },
          userSelect: 'none',
          gap: 1.5,
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 700, fontSize: '1.1rem', width: 24, textAlign: 'center' }}
        >
          {op.symbol}
        </Typography>
        <Typography variant="body2">{op.label}</Typography>
        {op.kind === 'complement' && (
          <Typography
            variant="caption"
            sx={{ ml: 'auto', px: 0.75, py: 0.2, bgcolor: 'secondary.light', borderRadius: 0.5, color: 'secondary.contrastText', fontWeight: 600 }}
          >
            unary
          </Typography>
        )}
      </ListItem>
    </Tooltip>
  );
}

interface Props {
  onAdd?: (data: { kind: SetOp['kind']; symbol: string }) => void;
}

export function SetOperationsList({ onAdd }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Operations
      </Typography>
      <List dense disablePadding>
        {SET_OPERATIONS.map((op) => (
          <DraggableSetOp key={op.kind} op={op} onAdd={onAdd} />
        ))}
      </List>
    </Paper>
  );
}
