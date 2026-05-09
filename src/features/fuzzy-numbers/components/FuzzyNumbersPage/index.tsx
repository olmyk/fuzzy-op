import { Box, Container, Typography } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useFuzzyNumbers } from '../../hooks/useFuzzyNumbers';
import { useCanvas } from '../../hooks/useCanvas';
import type { CanvasToken } from '../../types';
import { FuzzyNumberForm } from '../FuzzyNumberForm';
import { FuzzyNumberList } from '../FuzzyNumberList';
import { OperationsList } from '../OperationsList';
import { ExpressionCanvas } from '../ExpressionCanvas';

export function FuzzyNumbersPage() {
  const { numbers, addNumber, removeNumber, generateRandom, isAtCapacity } = useFuzzyNumbers();
  const { tokens, canAcceptNext, addToken, removeToken, clearCanvas } = useCanvas();

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;
    if (!over) return;
    const data = active.data.current;
    if (!data) return;

    if (over.id === 'delete-zone') {
      if (data.kind === 'number') removeNumber(data.fuzzyNumberId as string);
      return;
    }

    if (over.id === 'canvas-droppable') {
      addToken(data as Omit<CanvasToken, 'instanceId'>);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          Fuzzy Number Operations
        </Typography>

        {/* Input form */}
        <Box sx={{ mb: 3 }}>
          <FuzzyNumberForm
            onAdd={addNumber}
            onGenerateRandom={generateRandom}
            isAtCapacity={isAtCapacity}
          />
        </Box>

        {/* Numbers list + Operations list side by side */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, minHeight: 280 }}>
          <Box sx={{ flex: 3, minWidth: 0 }}>
            <FuzzyNumberList numbers={numbers} />
          </Box>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <OperationsList />
          </Box>
        </Box>

        {/* Expression canvas */}
        <ExpressionCanvas
          tokens={tokens}
          onRemoveToken={removeToken}
          onClear={clearCanvas}
          canAcceptNext={canAcceptNext}
        />
      </Container>
    </DndContext>
  );
}
