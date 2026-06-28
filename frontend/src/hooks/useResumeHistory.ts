import { useState, useCallback, useRef } from 'react';
import type { ResumeWorkspace } from '../components/resume-builder/types';

interface HistoryEntry {
  state: ResumeWorkspace;
  timestamp: number;
}

const MAX_HISTORY = 50;

export function useResumeHistory(_initialState: ResumeWorkspace) {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  const lastPushRef = useRef<number>(0);
  const isUndoingRef = useRef(false);

  const pushState = useCallback((newState: ResumeWorkspace) => {
    if (isUndoingRef.current) return;

    const now = Date.now();
    // Debounce rapid pushes (within 300ms)
    if (now - lastPushRef.current < 300) {
      // Update the last entry instead of adding a new one
      setPast((prev) => {
        if (prev.length === 0) return [{ state: newState, timestamp: now }];
        const updated = [...prev];
        updated[updated.length - 1] = { state: newState, timestamp: now };
        return updated;
      });
      lastPushRef.current = now;
      return;
    }

    setPast((prev) => {
      const next = [...prev, { state: JSON.parse(JSON.stringify(newState)), timestamp: now }];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setFuture([]);
    lastPushRef.current = now;
  }, []);

  const undo = useCallback((currentState: ResumeWorkspace): ResumeWorkspace | null => {
    if (past.length === 0) return null;

    isUndoingRef.current = true;

    const entry = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);
    setFuture((prev) => [...prev, { state: JSON.parse(JSON.stringify(currentState)), timestamp: Date.now() }]);

    setTimeout(() => {
      isUndoingRef.current = false;
    }, 0);

    return entry.state;
  }, [past]);

  const redo = useCallback((currentState: ResumeWorkspace): ResumeWorkspace | null => {
    if (future.length === 0) return null;

    isUndoingRef.current = true;

    const entry = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    setFuture(newFuture);
    setPast((prev) => [...prev, { state: JSON.parse(JSON.stringify(currentState)), timestamp: Date.now() }]);

    setTimeout(() => {
      isUndoingRef.current = false;
    }, 0);

    return entry.state;
  }, [future]);

  const resetHistory = useCallback((newState: ResumeWorkspace) => {
    setPast([{ state: JSON.parse(JSON.stringify(newState)), timestamp: Date.now() }]);
    setFuture([]);
    lastPushRef.current = Date.now();
  }, []);

  return {
    canUndo: past.length > 1,
    canRedo: future.length > 0,
    undo,
    redo,
    pushState,
    resetHistory,
  };
}