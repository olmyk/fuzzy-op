import { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useFuzzyNumbers } from '../../hooks/useFuzzyNumbers';
import { useCanvas } from '../../hooks/useCanvas';
import type { CanvasToken } from '../../types';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { evaluateFuzzyExpression } from '../../utils/arithmetic';
import { FuzzyNumberForm } from '../FuzzyNumberForm';
import { FuzzyNumberList } from '../FuzzyNumberList';
import { OperationsList } from '../OperationsList';
import { ExpressionCanvas } from '../ExpressionCanvas';
import { OutputCanvas } from '@/shared/components/OutputCanvas';

export function FuzzyNumbersPage() {
  const { numbers, addNumber, addNumberDirect, removeNumber, generateRandom, isAtCapacity } = useFuzzyNumbers();
  const { tokens, canAcceptNext, addToken, removeToken, clearCanvas, isComplete } = useCanvas();

  const [result, setResult] = useState<FuzzyPoint[] | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Clear result whenever the expression changes
  useEffect(() => {
    setResult(null);
    setCalcError(null);
  }, [tokens]);

  const expressionLabel = tokens
    .map((t) => {
      if (t.kind === 'number') {
        const num = numbers.find((n) => n.id === t.fuzzyNumberId);
        return num?.letter ?? '?';
      }
      return t.symbol;
    })
    .join(' ');

  function handleCalculate() {
    const outcome = evaluateFuzzyExpression(tokens, numbers);
    if ('error' in outcome) {
      setCalcError(outcome.error);
      setResult(null);
    } else {
      setResult(outcome.result);
      setCalcError(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;
    if (!over) return;
    const data = active.data.current;
    if (!data) return;

    if (over.id === 'delete-zone') {
      if (data.kind === 'number') removeNumber(data.fuzzyNumberId as string);
      return;
    }

    if (over.id === 'num-add-zone') {
      if (data.kind === 'result-number') addNumberDirect(data.points as FuzzyPoint[]);
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

        <Box sx={{ mb: 3 }}>
          <FuzzyNumberForm
            onAdd={addNumber}
            onGenerateRandom={generateRandom}
            isAtCapacity={isAtCapacity}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, minHeight: 280 }}>
          <Box sx={{ flex: 3, minWidth: 0 }}>
            <FuzzyNumberList numbers={numbers} addDropZoneId="num-add-zone" />
          </Box>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <OperationsList />
          </Box>
        </Box>

        <ExpressionCanvas
          tokens={tokens}
          onRemoveToken={removeToken}
          onClear={clearCanvas}
          canAcceptNext={canAcceptNext}
          onCalculate={handleCalculate}
          canCalculate={isComplete}
        />

        <OutputCanvas
          result={result}
          expressionLabel={expressionLabel}
          draggableId="num-result-drag"
          dragKind="result-number"
          isAtCapacity={isAtCapacity}
          error={calcError}
        />
      </Container>
    </DndContext>
  );
}
