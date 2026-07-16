/**
 * Single source of truth for pillar and category metadata.
 *
 * Previously duplicated across 7+ screens and hooks.
 * Import from here instead of redefining locally.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PillarKey = "soul" | "vessel" | "impact" | "stewardship";
export type CategoryKey = "investment" | "consumption" | "leak";

// ─── Pillar colors (minimal — for components that only need color + bg) ───────

export const PILLAR_COLORS: Record<PillarKey, { primary: string; bg: string }> = {
  soul:        { primary: "#1D9E75", bg: "#F0FBF7" },
  vessel:      { primary: "#D85A30", bg: "#FEF3EE" },
  impact:      { primary: "#378ADD", bg: "#F0F7FE" },
  stewardship: { primary: "#BA7517", bg: "#FEF9EE" },
};

// ─── Pillar meta (full — icon, label, hint) ───────────────────────────────────

export type PillarMeta = {
  key: PillarKey;
  label: string;
  color: string;
  bg: string;
  icon: string;
  hint: string;
};

export const PILLAR_META: PillarMeta[] = [
  { key: "soul",        label: "Soul",        color: "#1D9E75", bg: "#F0FBF7", icon: "✦", hint: "Prayer, meditation, gratitude" },
  { key: "vessel",      label: "Vessel",      color: "#D85A30", bg: "#FEF3EE", icon: "⬡", hint: "Workouts, runs, recovery" },
  { key: "impact",      label: "Impact",      color: "#378ADD", bg: "#F0F7FE", icon: "◈", hint: "Work shipped, tasks closed" },
  { key: "stewardship", label: "Stewardship", color: "#BA7517", bg: "#FEF9EE", icon: "◎", hint: "Investments, expenses, leaks" },
];

/** Lookup pillar meta by key. Returns undefined for unknown keys. */
export function pillarMeta(key: PillarKey): PillarMeta {
  return PILLAR_META.find((p) => p.key === key)!;
}

/** Object lookup — use when you need `meta[key]` access patterns. */
export const PILLAR_META_MAP: Record<PillarKey, PillarMeta> = Object.fromEntries(
  PILLAR_META.map((p) => [p.key, p])
) as Record<PillarKey, PillarMeta>;

// ─── Category meta ────────────────────────────────────────────────────────────

export type CategoryMeta = {
  color: string;
  bg: string;
  icon: string;
  label: string;
};

export const CAT_META: Record<CategoryKey, CategoryMeta> = {
  investment:  { color: "#1D9E75", bg: "#F0FBF7", icon: "↑", label: "Investment" },
  consumption: { color: "#378ADD", bg: "#F0F7FE", icon: "→", label: "Consumption" },
  leak:        { color: "#D85A30", bg: "#FEF3EE", icon: "↓", label: "Leak" },
};

// ─── Pillar filter pills (for Activity / Ledger screens) ──────────────────────

export type PillarFilter = "all" | PillarKey;

export const PILLAR_FILTERS: { key: PillarFilter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "soul",        label: "Soul" },
  { key: "vessel",      label: "Vessel" },
  { key: "impact",      label: "Impact" },
  { key: "stewardship", label: "Wealth" },
];
