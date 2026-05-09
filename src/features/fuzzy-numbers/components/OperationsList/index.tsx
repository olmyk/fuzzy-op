import { List, ListItem, Paper, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Operation } from '../../types';

const OPERATIONS: Operation[] = [
  { type: 'addition',       symbol: '+', label: 'Addition' },
  { type: 'subtraction',    symbol: '−', label: 'Subtraction' },
  { type: 'multiplication', symbol: '×', label: 'Multiplication' },
  { type: 'division',       symbol: '÷', label: 'Division' },
];

function DraggableOperation({ op }: { op: Operation }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `op-${op.type}`,
    data: { kind: 'operation', type: op.type, symbol: op.symbol },
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
    </ListItem>
  );
}

export function OperationsList() {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Operations
      </Typography>
      <List dense disablePadding>
        {OPERATIONS.map((op) => (
          <DraggableOperation key={op.type} op={op} />
        ))}
      </List>
    </Paper>
  );
}
