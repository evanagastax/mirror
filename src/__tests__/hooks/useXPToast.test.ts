/**
 * Tests for useXPToast (src/hooks/useXPToast.ts)
 *
 * The hook is a pure state machine:
 *   - trackScores(current) fires toasts for every pillar whose score increased
 *   - removeToast(id) removes that toast from the list
 *   - toasts accumulate; no toast is fired on the very first call (no prev scores yet)
 */

import { renderHook, act } from "@testing-library/react-hooks";
import { useXPToast } from "../../hooks/useXPToast";

type PillarScores = { soul: number; vessel: number; impact: number; stewardship: number };

const base: PillarScores = { soul: 0, vessel: 0, impact: 0, stewardship: 0 };

describe("useXPToast", () => {
  // ── Initial state ──────────────────────────────────────────────────────────
  it("starts with an empty toasts array", () => {
    const { result } = renderHook(() => useXPToast());
    expect(result.current.toasts).toEqual([]);
  });

  // ── First call — no previous scores ───────────────────────────────────────
  it("does NOT fire a toast on the very first trackScores call", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => {
      result.current.trackScores({ soul: 10, vessel: 10, impact: 10, stewardship: 10 });
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  // ── Second call — delta detection ─────────────────────────────────────────
  it("fires a toast when soul increases on the second call", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });           // seed prev
    act(() => { result.current.trackScores({ ...base, soul: 15 }); }); // +15
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].label).toBe("+15 XP");
  });

  it("fires a toast for each pillar that increased simultaneously", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });
    act(() => {
      result.current.trackScores({ soul: 5, vessel: 10, impact: 20, stewardship: 0 });
    });
    // soul +5, vessel +10, impact +20 → 3 toasts
    expect(result.current.toasts).toHaveLength(3);
    const labels = result.current.toasts.map((t) => t.label);
    expect(labels).toContain("+5 XP");
    expect(labels).toContain("+10 XP");
    expect(labels).toContain("+20 XP");
  });

  it("does NOT fire a toast when a score stays the same", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores({ ...base, soul: 10 }); });
    act(() => { result.current.trackScores({ ...base, soul: 10 }); }); // no change
    expect(result.current.toasts).toHaveLength(0);
  });

  it("does NOT fire a toast when a score decreases", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores({ ...base, soul: 50 }); });
    act(() => { result.current.trackScores({ ...base, soul: 30 }); }); // decrease
    expect(result.current.toasts).toHaveLength(0);
  });

  // ── Toast contents ─────────────────────────────────────────────────────────
  it("toast has correct icon for each pillar", () => {
    const ICONS: Record<keyof PillarScores, string> = {
      soul: "✦", vessel: "⬡", impact: "◈", stewardship: "◎",
    };
    (["soul", "vessel", "impact", "stewardship"] as const).forEach((pillar) => {
      const { result } = renderHook(() => useXPToast());
      act(() => { result.current.trackScores(base); });
      act(() => { result.current.trackScores({ ...base, [pillar]: 10 }); });
      expect(result.current.toasts[0].icon).toBe(ICONS[pillar]);
    });
  });

  it("each toast has a unique numeric id", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });
    act(() => {
      result.current.trackScores({ soul: 5, vessel: 5, impact: 5, stewardship: 5 });
    });
    const ids = result.current.toasts.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("toasts have non-empty color and bg strings", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });
    act(() => { result.current.trackScores({ ...base, soul: 1 }); });
    const toast = result.current.toasts[0];
    expect(toast.color.length).toBeGreaterThan(0);
    expect(toast.bg.length).toBeGreaterThan(0);
  });

  // ── removeToast ────────────────────────────────────────────────────────────
  it("removeToast removes the correct toast by id", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });
    act(() => { result.current.trackScores({ soul: 5, vessel: 5, impact: 0, stewardship: 0 }); });
    const idToRemove = result.current.toasts[0].id;
    act(() => { result.current.removeToast(idToRemove); });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).not.toBe(idToRemove);
  });

  it("removeToast with unknown id leaves toasts unchanged", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });
    act(() => { result.current.trackScores({ ...base, soul: 10 }); });
    act(() => { result.current.removeToast(999999); });
    expect(result.current.toasts).toHaveLength(1);
  });

  it("removeToast on an empty list is a no-op", () => {
    const { result } = renderHook(() => useXPToast());
    expect(() => act(() => { result.current.removeToast(1); })).not.toThrow();
    expect(result.current.toasts).toHaveLength(0);
  });

  // ── null / undefined guard ─────────────────────────────────────────────────
  it("trackScores(null) is a no-op", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(null as any); });
    act(() => { result.current.trackScores(null as any); });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("trackScores(undefined) is a no-op", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(undefined as any); });
    expect(result.current.toasts).toHaveLength(0);
  });

  // ── Accumulation across multiple calls ────────────────────────────────────
  it("toasts accumulate across multiple score increases", () => {
    const { result } = renderHook(() => useXPToast());
    act(() => { result.current.trackScores(base); });
    act(() => { result.current.trackScores({ ...base, soul: 10 }); });
    act(() => { result.current.trackScores({ ...base, soul: 20 }); }); // +10 again
    expect(result.current.toasts).toHaveLength(2);
  });
});
