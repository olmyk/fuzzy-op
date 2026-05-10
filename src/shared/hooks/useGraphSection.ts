import { useState, useCallback } from 'react';
import { GRAPH_COLORS } from '@/shared/components/MultiSeriesChart';
import type { FuzzyPoint } from '@/shared/types/fuzzy';

export interface GraphSeries {
  id: string;
  itemId: string;
  letter: string;
  points: FuzzyPoint[];
  color: string;
}

export interface GraphPanel {
  id: string;
  series: GraphSeries[];
}

function colorForItem(letter: string): string {
  const idx = letter.toUpperCase().charCodeAt(0) - 65;
  return GRAPH_COLORS[idx % GRAPH_COLORS.length];
}

function newPanel(): GraphPanel {
  return { id: crypto.randomUUID(), series: [] };
}

export function useGraphSection() {
  const [graphs, setGraphs] = useState<GraphPanel[]>([newPanel()]);

  const addGraph = useCallback(() => {
    setGraphs((prev) => [...prev, newPanel()]);
  }, []);

  const removeGraph = useCallback((graphId: string) => {
    setGraphs((prev) => prev.filter((g) => g.id !== graphId));
  }, []);

  const addSeriesToGraph = useCallback(
    (graphId: string, itemId: string, letter: string, points: FuzzyPoint[]) => {
      setGraphs((prev) =>
        prev.map((g) => {
          if (g.id !== graphId) return g;
          if (g.series.some((s) => s.itemId === itemId)) return g;
          const newSeries: GraphSeries = {
            id: crypto.randomUUID(),
            itemId,
            letter,
            points,
            color: colorForItem(letter),
          };
          return { ...g, series: [...g.series, newSeries] };
        })
      );
    },
    []
  );

  return { graphs, addGraph, removeGraph, addSeriesToGraph };
}
