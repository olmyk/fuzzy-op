import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';

function AddIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

interface Props {
  droppableId: string;
}

export function AddDropZone({ droppableId }: Props) {
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
        borderColor: isOver ? 'success.main' : 'success.light',
        color: isOver ? 'success.main' : 'success.light',
        bgcolor: isOver ? 'rgba(46,125,50,0.08)' : 'transparent',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <AddIcon />
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
        {isOver ? 'Release to add' : 'Drop to add'}
      </Typography>
    </Box>
  );
}
