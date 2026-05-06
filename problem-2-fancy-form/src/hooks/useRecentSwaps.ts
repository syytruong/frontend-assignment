import { useCallback, useEffect, useState } from 'react';
import type { SwapRecord } from '../domain/types';

const KEY = 'fancy-form:recent-swaps';
const MAX = 5;

function read(): SwapRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SwapRecord[]) : [];
  } catch {
    return [];
  }
}

export function useRecentSwaps() {
  const [swaps, setSwaps] = useState<SwapRecord[]>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSwaps(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((record: SwapRecord) => {
    setSwaps((prev) => {
      const next = [record, ...prev].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* quota or private mode — non-fatal, history just won't persist */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSwaps([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* non-fatal */
    }
  }, []);

  return { swaps, add, clear };
}
