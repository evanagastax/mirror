/**
 * Shared TypeScript types used across hooks, services, and screens.
 *
 * Previously scattered across hook files, causing inverted dependencies
 * (services importing from hooks). Centralised here so any layer can
 * import without circular references.
 */

import type { useThemeStore } from "../store/themeStore";
import type { PillarKey } from "../theme/pillars";

// ─── Theme ────────────────────────────────────────────────────────────────────

/** ThemeColors — re-export the store's inferred color type. */
export type Colors = ReturnType<typeof useThemeStore.getState>["colors"];

// ─── Database entities ────────────────────────────────────────────────────────

export type Log = {
  id: string;
  pillar_type: Exclude<PillarKey, "stewardship">;
  value: number;
  evidence_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  amount: number;
  category: "investment" | "consumption" | "leak";
  note: string | null;
  created_at: string;
};

export type GoalStatus = "todo" | "in_progress" | "done";

export type Goal = {
  id: string;
  pillar_type: PillarKey;
  title: string;
  is_done: boolean;
  status: GoalStatus;
  sort_order: number;
  created_at: string;
};

export type Pillars = {
  soul: number;
  vessel: number;
  impact: number;
  stewardship: number;
  updated_at: string;
};

// ─── Input payloads ───────────────────────────────────────────────────────────

export type NewLog = {
  user_id: string;
  pillar_type: Exclude<PillarKey, "stewardship">;
  value: number;
  evidence_url?: string;
  metadata?: Record<string, unknown>;
};

export type NewTransaction = {
  user_id: string;
  amount: number;
  category: "investment" | "consumption" | "leak";
  note?: string;
};

// ─── Derived / computed ───────────────────────────────────────────────────────

export type LedgerSummary = {
  totalInvestment: number;
  totalConsumption: number;
  totalLeak: number;
  netScore: number;
};

export type StreakResult = {
  current: number;
  longest: number;
  lastLogDate: string | null;
  loggedToday: boolean;
};
