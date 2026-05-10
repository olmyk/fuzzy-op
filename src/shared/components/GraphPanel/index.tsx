import { Box, Chip, Paper, Typography } from '@mui/material';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { GraphPanel as GraphPanelType } from '@/shared/hooks/useGraphSection';
import { MultiSeriesChart } from '@/shared/components/MultiSeriesChart';

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

interface Props {
  graph: GraphPanelType;
  panelIndex: number;
}

export function GraphPanel({ graph, panelIndex }: Props) {
  const droppableId = `graph-panel-${graph.id}`;
  const draggableId = `graph-handle-${graph.id}`;

  const { isOver, setNodeRef: setDropRef, active } = useDroppable({ id: droppableId });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: { kind: 'graph', graphId: graph.id },
  });

  const dragKind = active?.data?.current?.kind as string | undefined;
  const willAccept = dragKind === 'number' || dragKind === 'set';

  const borderColor = isOver
    ? willAccept
      ? 'success.main'
      : 'error.main'
    : 'divider';

  const bgColor = isOver
    ? willAccept
      ? 'rgba(56,142,60,0.06)'
      : 'rgba(211,47,47,0.06)'
    : 'transparent';

  return (
    <Paper
      variant="outlined"
      sx={{
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.15s',
        transform: CSS.Translate.toString(transform),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, pt: 1, pb: 0.5 }}>
        <Box
          ref={setDragRef}
          {...listeners}
          {...attributes}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'grab',
            color: 'text.disabled',
            flexShrink: 0,
            '&:hover': { color: 'text.secondary' },
          }}
        >
          <GripIcon />
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, flexShrink: 0 }}>
          Graph {panelIndex}
        </Typography>

        {graph.series.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', ml: 0.5 }}>
            {graph.series.map((s) => (
              <Chip
                key={s.id}
                label={s.letter}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: s.color,
                  color: '#fff',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box
        ref={setDropRef}
        sx={{
          mx: 1.5,
          mb: 1.5,
          border: '2px dashed',
          borderColor,
          borderRadius: 1,
          bgcolor: bgColor,
          transition: 'border-color 0.15s, background-color 0.15s',
          overflow: 'hidden',
        }}
      >
        <MultiSeriesChart series={graph.series} />
      </Box>
    </Paper>
  );
}
