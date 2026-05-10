import { List, ListItem, Paper, Tooltip, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Operation, OperationType } from '../../types';

interface OpWithDesc extends Operation {
  description: string;
}

const OPERATIONS: OpWithDesc[] = [
  { type: 'addition',       symbol: '+', label: 'Addition',       description: 'A + B: adds x values across all point pairs, keeps min µ (extension principle)' },
  { type: 'subtraction',    symbol: '−', label: 'Subtraction',    description: 'A − B: subtracts x values across all point pairs, keeps min µ' },
  { type: 'multiplication', symbol: '×', label: 'Multiplication', description: 'A × B: multiplies x values across all point pairs, keeps min µ' },
  { type: 'division',       symbol: '÷', label: 'Division',       description: 'A ÷ B: divides x values across all point pairs, keeps min µ (B must not contain x = 0)' },
];

interface DraggableOperationProps {
  op: OpWithDesc;
  onAdd?: (data: { kind: 'operation'; type: OperationType; symbol: string }) => void;
}

function DraggableOperation({ op, onAdd }: DraggableOperationProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `op-${op.type}`,
    data: { kind: 'operation', type: op.type, symbol: op.symbol },
  });

  return (
    <Tooltip title={op.description} placement="right" arrow>
      <ListItem
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        disablePadding
        onDoubleClick={() => onAdd?.({ kind: 'operation', type: op.type, symbol: op.symbol })}
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
    </Tooltip>
  );
}

interface Props {
  onAdd?: (data: { kind: 'operation'; type: OperationType; symbol: string }) => void;
}

export function OperationsList({ onAdd }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Operations
      </Typography>
      <List dense disablePadding>
        {OPERATIONS.map((op) => (
          <DraggableOperation key={op.type} op={op} onAdd={onAdd} />
        ))}
      </List>
    </Paper>
  );
}
