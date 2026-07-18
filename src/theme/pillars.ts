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

type T = {
  soul: string; vessel: string; impact: string; stewardship: string;
  soulHint: string; vesselHint: string; impactHint: string; stewardshipHint: string;
  all: string; wealth: string;
};

export function pillarMetaTranslated(t: T): PillarMeta[] {
  return [
    { key: "soul",        label: t.soul,        color: "#1D9E75", bg: "#F0FBF7", icon: "✦", hint: t.soulHint },
    { key: "vessel",      label: t.vessel,      color: "#D85A30", bg: "#FEF3EE", icon: "⬡", hint: t.vesselHint },
    { key: "impact",      label: t.impact,      color: "#378ADD", bg: "#F0F7FE", icon: "◈", hint: t.impactHint },
    { key: "stewardship", label: t.stewardship, color: "#BA7517", bg: "#FEF9EE", icon: "◎", hint: t.stewardshipHint },
  ];
}

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

export function catMetaTranslated(t: { investment: string; consumption: string; leak: string }): Record<CategoryKey, CategoryMeta> {
  return {
    investment:  { color: "#1D9E75", bg: "#F0FBF7", icon: "↑", label: t.investment },
    consumption: { color: "#378ADD", bg: "#F0F7FE", icon: "→", label: t.consumption },
    leak:        { color: "#D85A30", bg: "#FEF3EE", icon: "↓", label: t.leak },
  };
}

export function catMetaArrayTranslated(t: { investment: string; consumption: string; leak: string }): { key: CategoryKey; label: string; icon: string; color: string; bg: string }[] {
  return [
    { key: "investment",  label: t.investment,  icon: "↑", color: "#1D9E75", bg: "#F0FBF7" },
    { key: "consumption", label: t.consumption, icon: "→", color: "#378ADD", bg: "#F0F7FE" },
    { key: "leak",        label: t.leak,        icon: "↓", color: "#D85A30", bg: "#FEF3EE" },
  ];
}

// ─── Pillar filter pills (for Activity / Ledger screens) ──────────────────────

export type PillarFilter = "all" | PillarKey;

export const PILLAR_FILTERS: { key: PillarFilter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "soul",        label: "Soul" },
  { key: "vessel",      label: "Vessel" },
  { key: "impact",      label: "Impact" },
  { key: "stewardship", label: "Wealth" },
];

export function pillarFiltersTranslated(t: { all: string; soul: string; vessel: string; impact: string; stewardship: string }): { key: PillarFilter; label: string }[] {
  return [
    { key: "all",         label: t.all },
    { key: "soul",        label: t.soul },
    { key: "vessel",      label: t.vessel },
    { key: "impact",      label: t.impact },
    { key: "stewardship", label: t.stewardship },
  ];
}
