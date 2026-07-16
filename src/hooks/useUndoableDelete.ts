import { useState, useRef, useCallback } from "react";

type PendingDelete = {
  id: string;
  message: string;
  timer: ReturnType<typeof setTimeout>;
};

type SnackbarState = {
  message: string;
  onUndo: () => void;
} | null;

type Options = {
  onDelete: (id: string) => void;
  duration?: number;
};

export function useUndoableDelete({ onDelete, duration = 5000 }: Options) {
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);
  const pendingRef = useRef<Map<string, PendingDelete>>(new Map());

  const requestDelete = useCallback((id: string, message: string) => {
    // Cancel any existing pending delete for this id
    const existing = pendingRef.current.get(id);
    if (existing) clearTimeout(existing.timer);

    // If there's a different pending delete, execute it immediately
    for (const [key, pending] of pendingRef.current) {
      if (key !== id) {
        clearTimeout(pending.timer);
        onDelete(pending.id);
        pendingRef.current.delete(key);
      }
    }

    const timer = setTimeout(() => {
      onDelete(id);
      pendingRef.current.delete(id);
      setSnackbar(null);
    }, duration);

    pendingRef.current.set(id, { id, message, timer });
    setSnackbar({
      message,
      onUndo: () => {
        const p = pendingRef.current.get(id);
        if (p) {
          clearTimeout(p.timer);
          pendingRef.current.delete(id);
        }
        setSnackbar(null);
      },
    });
  }, [onDelete, duration]);

  const dismissSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  return { requestDelete, snackbar, dismissSnackbar };
}
