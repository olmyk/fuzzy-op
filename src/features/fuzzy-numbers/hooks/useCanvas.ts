import { useState, useCallback } from 'react';
import type { CanvasToken } from '../types';

export function useCanvas() {
  const [tokens, setTokens] = useState<CanvasToken[]>([]);

  const canAcceptNext = useCallback(
    (kind: CanvasToken['kind']): boolean => {
      if (tokens.length === 0) return kind === 'number';
      return tokens[tokens.length - 1].kind !== kind;
    },
    [tokens],
  );

  const addToken = useCallback(
    (token: Omit<CanvasToken, 'instanceId'>) => {
      if (!canAcceptNext(token.kind)) return;
      const newToken = { ...token, instanceId: crypto.randomUUID() } as CanvasToken;
      setTokens((prev) => [...prev, newToken]);
    },
    [canAcceptNext],
  );

  const removeToken = useCallback((instanceId: string) => {
    setTokens((prev) => {
      const idx = prev.findIndex((t) => t.instanceId === instanceId);
      if (idx === -1) return prev;

      const token = prev[idx];

      if (token.kind === 'operation') {
        // Only allow removing a trailing operator (keeps expression valid)
        if (idx === prev.length - 1) {
          return prev.slice(0, -1);
        }
        return prev; // mid-expression operators are removed via number removal
      }

      // Removing a number: also remove its adjacent operator to keep alternating order
      const next = prev[idx + 1];
      const hasOperatorAfter = next?.kind === 'operation';

      if (hasOperatorAfter) {
        // Remove the number and the operator after it
        return [...prev.slice(0, idx), ...prev.slice(idx + 2)];
      }

      const prev_ = prev[idx - 1];
      const hasOperatorBefore = prev_?.kind === 'operation';

      if (hasOperatorBefore) {
        // Remove the operator before and the number
        return [...prev.slice(0, idx - 1), ...prev.slice(idx + 1)];
      }

      // Standalone number (only token in canvas)
      return prev.filter((t) => t.instanceId !== instanceId);
    });
  }, []);

  const clearCanvas = useCallback(() => setTokens([]), []);

  const isComplete = tokens.length > 0 && tokens[tokens.length - 1].kind === 'number';

  return { tokens, canAcceptNext, addToken, removeToken, clearCanvas, isComplete };
}
