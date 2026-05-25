import { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup, Container, Typography } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useFuzzyNumbers } from '../../hooks/useFuzzyNumbers';
import { useCanvas } from '../../hooks/useCanvas';
import { useGraphSection } from '@/shared/hooks/useGraphSection';
import type { CanvasToken } from '../../types';
import type { FuzzyPoint, FuzzyItemFn } from '@/shared/types/fuzzy';
import { evaluateFuzzyExpression } from '../../utils/arithmetic';
import { FuzzyItemForm } from '@/shared/components/FuzzyItemForm';
import { FunctionForm } from '@/shared/components/FunctionForm';
import { DND_IDS } from '@/config/dndIds';
import { FUNCTION_TYPES_FOR_NUMBERS } from '@/shared/utils/membershipFunctions';
import { FuzzyNumberList } from '../FuzzyNumberList';
import { OperationsList } from '../OperationsList';
import { ExpressionCanvas } from '../ExpressionCanvas';
import { OutputCanvas } from '@/shared/components/OutputCanvas';
import { GraphSection } from '@/shared/components/GraphSection';

export function FuzzyNumbersPage() {
  const { numbers, addNumber, addNumberDirect, removeNumber, generateRandom, isAtCapacity } = useFuzzyNumbers();
  const [inputMode, setInputMode] = useState<'points' | 'function'>('points');

  const pointsCanvas = useCanvas();
  const functionCanvas = useCanvas();
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

    if (over.id === DND_IDS.NUMBER_DELETE) {
      if (data.kind === 'number') removeNumber(data.fuzzyNumberId as string);
      return;
    }

    if (over.id === DND_IDS.NUMBER_ADD) {
      if (data.kind === 'result-number') {
        const label = data.expressionLabel as string | undefined;
        const fn: FuzzyItemFn | undefined = !isPoints && label
          ? { type: 'expression', params: {}, label }
          : undefined;
        addNumberDirect(data.points as FuzzyPoint[], label, fn);
      }
      return;
    }

    if (typeof over.id === 'string' && over.id.startsWith(DND_IDS.GRAPH_PANEL_PREFIX)) {
      const graphId = over.id.replace(DND_IDS.GRAPH_PANEL_PREFIX, '');
      if (data.kind === 'number') {
        const num = numbers.find((n) => n.id === (data.fuzzyNumberId as string));
        if (num) {
          const isRaw = !num.fn && !num.label;
          addSeriesToGraph(graphId, num.id, num.letter, num.points, isRaw, isRaw);
        }
      }
      return;
    }

    if (over.id === DND_IDS.GRAPH_DELETE) {
      if (data.kind === 'graph') removeGraph(data.graphId as string);
      return;
    }

    if (over.id === DND_IDS.NUMBER_CANVAS) {
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
              title="Add Fuzzy Number"
              onAdd={addNumber}
              onGenerateRandom={generateRandom}
              isAtCapacity={isAtCapacity}
              minPoints={2}
              capacityMessage="Maximum of 26 fuzzy numbers reached."
            />
          ) : (
            <FunctionForm
              title="Add Fuzzy Number"
              allowedTypes={FUNCTION_TYPES_FOR_NUMBERS}
              onAdd={addNumber}
              isAtCapacity={isAtCapacity}
              capacityMessage="Maximum of 26 fuzzy numbers reached."
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, minHeight: 280 }}>
          <Box sx={{ flex: 3, minWidth: 0 }}>
            <FuzzyNumberList
              numbers={numbers.filter((n) => (isPoints ? !n.fn : !!n.fn))}
              addDropZoneId={DND_IDS.NUMBER_ADD}
            />
          </Box>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <OperationsList onAdd={addToken} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
