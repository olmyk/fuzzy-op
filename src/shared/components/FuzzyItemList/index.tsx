import { useState } from 'react';
import { Box, List, ListItem, Paper, Tooltip, Typography } from '@mui/material';
import { useDndMonitor, useDraggable, type DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { FuzzyItem } from '@/shared/types/fuzzy';
import { toSetNotation } from '@/shared/utils/representation';
import { MiniChart } from '@/shared/components/MiniChart';
import { DeleteDropZone } from '@/shared/components/DeleteDropZone';
import { AddDropZone } from '@/shared/components/AddDropZone';

interface DraggableItemProps {
  item: FuzzyItem;
  dragId: string;
  dragData: Record<string, unknown>;
}

function DraggableItem({ item, dragId, dragData }: DraggableItemProps) {
  const representation = toSetNotation(item.points);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: dragData,
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
          <MiniChart points={item.points} />
          <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
            {item.letter}:
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

interface Props {
  title: string;
  items: FuzzyItem[];
  buildDragId: (item: FuzzyItem) => string;
  buildDragData: (item: FuzzyItem) => Record<string, unknown>;
  deleteDropZoneId?: string;
  addDropZoneId?: string;
  emptyText?: string;
}

export function FuzzyItemList({
  title,
  items,
  buildDragId,
  buildDragData,
  deleteDropZoneId = 'delete-zone',
  addDropZoneId,
  emptyText = 'No items yet.',
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingToDelete, setIsDraggingToDelete] = useState(false);
  const [isDraggingToAdd, setIsDraggingToAdd] = useState(false);

  useDndMonitor({
    onDragStart: (event: DragStartEvent) => {
      const kind = event.active.data.current?.kind as string | undefined;
      setIsDragging(true);
      setIsDraggingToDelete(kind === 'number' || kind === 'set');
      setIsDraggingToAdd(kind === 'result-number' || kind === 'result-set');
    },
    onDragEnd: () => { setIsDragging(false); setIsDraggingToDelete(false); setIsDraggingToAdd(false); },
    onDragCancel: () => { setIsDragging(false); setIsDraggingToDelete(false); setIsDraggingToAdd(false); },
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        {isDraggingToDelete && <DeleteDropZone droppableId={deleteDropZoneId} />}
        {isDraggingToAdd && addDropZoneId && <AddDropZone droppableId={addDropZoneId} />}
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {emptyText}
        </Typography>
      ) : (
        <List dense disablePadding sx={{ overflow: isDragging ? 'hidden' : 'auto', flex: 1, maxHeight: 400 }}>
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              dragId={buildDragId(item)}
              dragData={buildDragData(item)}
            />
          ))}
        </List>
      )}
    </Paper>
  );
}
