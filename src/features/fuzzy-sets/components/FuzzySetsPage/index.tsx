import { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import { Box, Container, Typography } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useFuzzySets } from '../../hooks/useFuzzySets';
import { useFuzzySetCanvas } from '../../hooks/useFuzzySetCanvas';
import { useGraphSection } from '@/shared/hooks/useGraphSection';
import type { SetCanvasToken } from '../../types';
import type { FuzzyPoint } from '@/shared/types/fuzzy';
import { evaluateSetExpression } from '../../utils/arithmetic';
import { FuzzyItemForm } from '@/shared/components/FuzzyItemForm';
import { FuzzyItemList } from '@/shared/components/FuzzyItemList';
import { ExpressionCanvas } from '@/shared/components/ExpressionCanvas';
import { OutputCanvas } from '@/shared/components/OutputCanvas';
import { GraphSection } from '@/shared/components/GraphSection';
import { SetOperationsList } from '../SetOperationsList';

export function FuzzySetsPage() {
  const { sets, addSet, addSetDirect, removeSet, generateRandom, isAtCapacity } = useFuzzySets();
  const { tokens, canAcceptNext, addToken, removeToken, clearCanvas, isComplete } = useFuzzySetCanvas();
  const { graphs, addGraph, removeGraph, addSeriesToGraph } = useGraphSection();

  const [result, setResult] = useState<FuzzyPoint[] | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setCalcError(null);
  }, [tokens]);

  const expressionLabel = tokens
    .map((t) => {
      if (t.kind === 'set') {
        const s = sets.find((s) => s.id === t.fuzzySetId);
        return s?.letter ?? '?';
      }
      return t.symbol;
    })
    .join(' ');

  function handleCalculate() {
    const outcome = evaluateSetExpression(tokens, sets);
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

    if (over.id === 'set-delete-zone') {
      if (data.kind === 'set') removeSet(data.fuzzySetId as string);
      return;
    }

    if (over.id === 'set-add-zone') {
      if (data.kind === 'result-set') addSetDirect(data.points as FuzzyPoint[]);
      return;
    }

    if (typeof over.id === 'string' && over.id.startsWith('graph-panel-')) {
      const graphId = over.id.replace('graph-panel-', '');
      if (data.kind === 'set') {
        const set = sets.find((s) => s.id === (data.fuzzySetId as string));
        if (set) addSeriesToGraph(graphId, set.id, set.letter, set.points);
      }
      return;
    }

    if (over.id === 'graph-delete-zone') {
      if (data.kind === 'graph') removeGraph(data.graphId as string);
      return;
    }

    if (over.id === 'set-canvas-droppable') {
      addToken(data as Omit<SetCanvasToken, 'instanceId'>);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          Fuzzy Set Operations
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FuzzyItemForm
            title="Add Fuzzy Set"
            onAdd={addSet}
            onGenerateRandom={generateRandom}
            isAtCapacity={isAtCapacity}
            minPoints={1}
            capacityMessage="Maximum of 26 fuzzy sets reached."
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, minHeight: 280 }}>
          <Box sx={{ flex: 3, minWidth: 0 }}>
            <FuzzyItemList
              title="Fuzzy Sets"
              items={sets}
              buildDragId={(item) => `set-${item.id}`}
              buildDragData={(item) => ({ kind: 'set', fuzzySetId: item.id, letter: item.letter })}
              deleteDropZoneId="set-delete-zone"
              addDropZoneId="set-add-zone"
              emptyText="No fuzzy sets yet."
            />
          </Box>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <SetOperationsList onAdd={addToken} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ExpressionCanvas
              tokens={tokens}
              onClear={clearCanvas}
              canAcceptNext={canAcceptNext}
              onCalculate={handleCalculate}
              canCalculate={isComplete}
              droppableId="set-canvas-droppable"
              emptyText="Drag fuzzy sets and operations here to build an expression."
              renderToken={(token) => {
                const t = token as SetCanvasToken;
                if (t.kind === 'set') {
                  return (
                    <Chip
                      label={t.letter}
                      onDelete={() => removeToken(t.instanceId)}
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '1rem' }}
                    />
                  );
                }
                if (t.kind === 'complement') {
                  return (
                    <Chip
                      label={t.symbol}
                      onDelete={() => removeToken(t.instanceId)}
                      color="secondary"
                      sx={{ fontWeight: 700, fontSize: '1rem' }}
                    />
                  );
                }
                return (
                  <Chip
                    label={t.symbol}
                    onDelete={() => removeToken(t.instanceId)}
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '1rem' }}
                  />
                );
              }}
            />
            <OutputCanvas
              result={result}
              expressionLabel={expressionLabel}
              draggableId="set-result-drag"
              dragKind="result-set"
              isAtCapacity={isAtCapacity}
              error={calcError}
            />
          </Box>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <GraphSection
              graphs={graphs}
              onAddGraph={addGraph}
            />
          </Box>
        </Box>
      </Container>
    </DndContext>
  );
}
