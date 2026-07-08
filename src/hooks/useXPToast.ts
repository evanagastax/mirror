import { useRef, useState, useCallback } from "react";
import { XPToastData } from "../components/XPToast";

type PillarScores = {
  soul: number;
  vessel: number;
  impact: number;
  stewardship: number;
};

const PILLAR_META: Record<keyof PillarScores, {
  label: string; color: string; bg: string; icon: string;
}> = {
  soul:        { label: "Soul",        color: "#1D9E75", bg: "#F0FBF7", icon: "✦" },
  vessel:      { label: "Vessel",      color: "#D85A30", bg: "#FEF3EE", icon: "⬡" },
  impact:      { label: "Impact",      color: "#378ADD", bg: "#F0F7FE", icon: "◈" },
  stewardship: { label: "Stewardship", color: "#BA7517", bg: "#FEF9EE", icon: "◎" },
};

let _nextId = 1;

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
  // previous scores ref — persists across renders without causing re-renders itself
  const prevScores = useRef<PillarScores | null>(null);

  const trackScores = useCallback((current: PillarScores | null | undefined) => {
    if (!current) return;

    const prev = prevScores.current;
    if (prev) {
      const newToasts: XPToastData[] = [];
      (Object.keys(PILLAR_META) as (keyof PillarScores)[]).forEach((key) => {
        const delta = current[key] - prev[key];
        if (delta > 0) {
          const meta = PILLAR_META[key];
          newToasts.push({
            id:    _nextId++,
            label: `+${delta} XP`,
            color: meta.color,
            bg:    meta.bg,
            icon:  meta.icon,
          });
        }
      });
      if (newToasts.length > 0) {
        // Stagger multiple toasts slightly so they don't stack on top of each other
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
