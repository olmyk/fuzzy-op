import { useState, useCallback } from 'react';
import type { SetCanvasToken } from '../types';

function isBinary(kind: string): boolean {
  return kind === 'union' || kind === 'intersection';
}

export function useFuzzySetCanvas() {
  const [tokens, setTokens] = useState<SetCanvasToken[]>([]);

  const canAcceptNext = useCallback(
    (kind: string): boolean => {
      if (tokens.length === 0) return kind === 'set' || kind === 'complement';
      const last = tokens[tokens.length - 1].kind;
      if (last === 'complement') return kind === 'set';
      if (last === 'set') return isBinary(kind);
      if (isBinary(last)) return kind === 'set' || kind === 'complement';
      return false;
    },
    [tokens],
  );

  const addToken = useCallback(
    (token: Omit<SetCanvasToken, 'instanceId'>) => {
      if (!canAcceptNext(token.kind)) return;
      const newToken = { ...token, instanceId: crypto.randomUUID() } as SetCanvasToken;
      setTokens((prev) => [...prev, newToken]);
    },
    [canAcceptNext],
  );

  const removeToken = useCallback((instanceId: string) => {
    setTokens((prev) => {
      const idx = prev.findIndex((t) => t.instanceId === instanceId);
      if (idx === -1) return prev;

      const token = prev[idx];

      // Removing a set: also remove an adjacent complement (before) or binary op (before/after)
      if (token.kind === 'set') {
        let lo = idx;
        let hi = idx;

        // If preceded by complement, include it
        if (idx > 0 && prev[idx - 1].kind === 'complement') {
          lo = idx - 1;
        }

        // If there's a binary op after the set, remove it
        if (hi + 1 < prev.length && isBinary(prev[hi + 1].kind)) {
          hi = hi + 1;
        } else if (lo > 0 && isBinary(prev[lo - 1].kind)) {
          // Or a binary op before the complement/set block
          lo = lo - 1;
        }

        return [...prev.slice(0, lo), ...prev.slice(hi + 1)];
      }

      // Removing a complement: only valid if the next token (set) is also removed
      if (token.kind === 'complement') {
        const next = prev[idx + 1];
        if (next?.kind === 'set') {
          // Remove complement + set, and cascade binary op
          let hi = idx + 1;
          if (hi + 1 < prev.length && isBinary(prev[hi + 1].kind)) {
            hi = hi + 1;
          } else if (idx > 0 && isBinary(prev[idx - 1].kind)) {
            return [...prev.slice(0, idx - 1), ...prev.slice(hi + 1)];
          }
          return [...prev.slice(0, idx), ...prev.slice(hi + 1)];
        }
        // Lone complement at end — just remove it
        return prev.filter((t) => t.instanceId !== instanceId);
      }

      // Removing a binary op — only allow trailing op removal
      if (isBinary(token.kind) && idx === prev.length - 1) {
        return prev.slice(0, -1);
      }

      return prev;
    });
  }, []);

  const clearCanvas = useCallback(() => setTokens([]), []);

  const isComplete = tokens.length > 0 && tokens[tokens.length - 1].kind === 'set';

  return { tokens, canAcceptNext, addToken, removeToken, clearCanvas, isComplete };
}
