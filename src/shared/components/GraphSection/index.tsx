import { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useDndMonitor, type DragStartEvent } from '@dnd-kit/core';
import type { GraphPanel as GraphPanelType } from '@/shared/hooks/useGraphSection';
import { GraphPanel } from '@/shared/components/GraphPanel';
import { DeleteDropZone } from '@/shared/components/DeleteDropZone';
import { DND_IDS } from '@/config/dndIds';

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

interface Props {
  graphs: GraphPanelType[];
  onAddGraph: () => void;
}

export function GraphSection({ graphs, onAddGraph }: Props) {
  const [isDraggingGraph, setIsDraggingGraph] = useState(false);

  useDndMonitor({
    onDragStart: (event: DragStartEvent) => {
      setIsDraggingGraph(event.active.data.current?.kind === 'graph');
    },
    onDragEnd: () => setIsDraggingGraph(false),
    onDragCancel: () => setIsDraggingGraph(false),
  });

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>Graphs</Typography>
        {isDraggingGraph && <DeleteDropZone droppableId={DND_IDS.GRAPH_DELETE} />}
        <Button variant="outlined" onClick={onAddGraph} startIcon={<PlusIcon />} size="small">
          Add Graph
        </Button>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: isDraggingGraph ? 'hidden' : 'auto', }}>
        {graphs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
            Add a graph panel and drop fuzzy items onto it.
          </Typography>
        ) : (
          graphs.map((graph, index) => (
            <GraphPanel key={graph.id} graph={graph} panelIndex={index + 1} />
          ))
        )}
      </Box>
    </Paper>
  );
}
