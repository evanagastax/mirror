import { useRef, useState, useCallback } from "react";
import { XPToastData } from "../components/XPToast";
import { PILLAR_META, type PillarKey } from "../theme/pillars";

type PillarScores = Record<PillarKey, number>;

const META = Object.fromEntries(
  PILLAR_META.map((p) => [p.key, { label: p.label, color: p.color, bg: p.bg, icon: p.icon }])
) as Record<PillarKey, { label: string; color: string; bg: string; icon: string }>;

/**
 * Tracks pillar scores between renders.
 * When a score increases, fires an XP toast with the delta.
 *
 * Usage:
 *   const { toasts, removeToast, trackScores } = useXPToast();
 *   // call trackScores(pillars) whenever pillars data changes
 */
export function useXPToast() {
  const [toasts, setToasts] = useState<XPToastData[]>([]);

  // Persists previous scores across renders without triggering re-renders.
  const prevScores = useRef<PillarScores | null>(null);

  // Per-instance, ever-increasing ID counter. Keeping it in a ref means:
  //   - IDs are unique within this hook instance across its entire lifetime
  //   - Multiple concurrent hook instances (e.g. in tests) never share a counter
  //   - No module-level mutable state that leaks across hot reloads or test runs
  const nextId = useRef(0);

  const trackScores = useCallback((current: PillarScores | null | undefined) => {
    if (!current) return;

    const prev = prevScores.current;
    if (prev) {
      const newToasts: XPToastData[] = [];
      (Object.keys(META) as PillarKey[]).forEach((key) => {
        const delta = current[key] - prev[key];
        if (delta > 0) {
          const meta = META[key];
          newToasts.push({
            id:    ++nextId.current,
            label: `+${delta} XP`,
            color: meta.color,
            bg:    meta.bg,
            icon:  meta.icon,
          });
        }
      });
      if (newToasts.length > 0) {
        setToasts((prev) => [...prev, ...newToasts]);
      }
    }

    prevScores.current = { ...current };
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, removeToast, trackScores };
}
