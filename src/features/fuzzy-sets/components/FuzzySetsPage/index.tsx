import { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup, Chip, Container, Typography } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useFuzzySets } from '../../hooks/useFuzzySets';
import { useFuzzySetCanvas } from '../../hooks/useFuzzySetCanvas';
import { useGraphSection } from '@/shared/hooks/useGraphSection';
import type { SetCanvasToken } from '../../types';
import type { FuzzyPoint, FuzzyItemFn } from '@/shared/types/fuzzy';
import { evaluateSetExpression } from '../../utils/arithmetic';
import { FuzzyItemForm } from '@/shared/components/FuzzyItemForm';
import { FunctionForm } from '@/shared/components/FunctionForm';
import { FuzzyItemList } from '@/shared/components/FuzzyItemList';
import { ExpressionCanvas } from '@/shared/components/ExpressionCanvas';
import { OutputCanvas } from '@/shared/components/OutputCanvas';
import { GraphSection } from '@/shared/components/GraphSection';
import { SetOperationsList } from '../SetOperationsList';
import { DND_IDS } from '@/config/dndIds';
import { FUNCTION_TYPES_FOR_SETS } from '@/shared/utils/membershipFunctions';

export function FuzzySetsPage() {
  const { sets, addSet, addSetDirect, removeSet, generateRandom, isAtCapacity } = useFuzzySets();
  const [inputMode, setInputMode] = useState<'points' | 'function'>('points');

  const pointsCanvas = useFuzzySetCanvas();
  const functionCanvas = useFuzzySetCanvas();
  const pointsGraphs = useGraphSection();
  const functionGraphs = useGraphSection();

  const [pointsResult, setPointsResult] = useState<FuzzyPoint[] | null>(null);
  const [pointsCalcError, setPointsCalcError] = useState<string | null>(null);
  const [functionResult, setFunctionResult] = useState<FuzzyPoint[] | null>(null);
  const [functionCalcError, setFunctionCalcError] = useState<string | null>(null);

  useEffect(() => { setPointsResult(null); setPointsCalcError(null); }, [pointsCanvas.tokens]);
  useEffect(() => { setFunctionResult(null); setFunctionCalcError(null); }, [functionCanvas.tokens]);

  const isPoints = inputMode === 'points';
  const { tokens, canAcceptNext, addToken, removeToken, clearCanvas, isComplete } =
    isPoints ? pointsCanvas : functionCanvas;
  const { graphs, addGraph, removeGraph, addSeriesToGraph } =
    isPoints ? pointsGraphs : functionGraphs;
  const result = isPoints ? pointsResult : functionResult;
  const setResult = isPoints ? setPointsResult : setFunctionResult;
  const calcError = isPoints ? pointsCalcError : functionCalcError;
  const setCalcError = isPoints ? setPointsCalcError : setFunctionCalcError;

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

    if (over.id === DND_IDS.SET_DELETE) {
      if (data.kind === 'set') removeSet(data.fuzzySetId as string);
      return;
    }

    if (over.id === DND_IDS.SET_ADD) {
      if (data.kind === 'result-set') {
        const label = data.expressionLabel as string | undefined;
        const fn: FuzzyItemFn | undefined = !isPoints && label
          ? { type: 'expression', params: {}, label }
          : undefined;
        addSetDirect(data.points as FuzzyPoint[], label, fn);
      }
      return;
    }

    if (typeof over.id === 'string' && over.id.startsWith(DND_IDS.GRAPH_PANEL_PREFIX)) {
      const graphId = over.id.replace(DND_IDS.GRAPH_PANEL_PREFIX, '');
      if (data.kind === 'set') {
        const set = sets.find((s) => s.id === (data.fuzzySetId as string));
        if (set) {
          const isRaw = !set.fn && !set.label;
          addSeriesToGraph(graphId, set.id, set.letter, set.points, isRaw, isRaw);
        }
      }
      return;
    }

    if (over.id === DND_IDS.GRAPH_DELETE) {
      if (data.kind === 'graph') removeGraph(data.graphId as string);
      return;
    }

    if (over.id === DND_IDS.SET_CANVAS) {
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
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={isPoints ? 'contained' : 'outlined'}
                onClick={() => setInputMode('points')}
              >
                By Points
              </Button>
              <Button
                variant={!isPoints ? 'contained' : 'outlined'}
                onClick={() => setInputMode('function')}
              >
                By Function
              </Button>
            </ButtonGroup>
          </Box>

          {isPoints ? (
            <FuzzyItemForm
              title="Add Fuzzy Set"
              onAdd={addSet}
              onGenerateRandom={generateRandom}
              isAtCapacity={isAtCapacity}
              minPoints={1}
              capacityMessage="Maximum of 26 fuzzy sets reached."
            />
          ) : (
            <FunctionForm
              title="Add Fuzzy Set"
              allowedTypes={FUNCTION_TYPES_FOR_SETS}
              onAdd={addSet}
              isAtCapacity={isAtCapacity}
              capacityMessage="Maximum of 26 fuzzy sets reached."
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, minHeight: 280 }}>
          <Box sx={{ flex: 3, minWidth: 0 }}>
            <FuzzyItemList
              title="Fuzzy Sets"
              items={sets.filter((s) => (isPoints ? !s.fn : !!s.fn))}
              buildDragId={(item) => `set-${item.id}`}
              buildDragData={(item) => ({ kind: 'set', fuzzySetId: item.id, letter: item.letter })}
              deleteDropZoneId={DND_IDS.SET_DELETE}
              addDropZoneId={DND_IDS.SET_ADD}
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
              droppableId={DND_IDS.SET_CANVAS}
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
              showDots={false}
              showAsHistogram={false}
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
