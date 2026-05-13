import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

interface Props {
  droppableId?: string;
}

export function DeleteDropZone({ droppableId = 'delete-zone' }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

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
