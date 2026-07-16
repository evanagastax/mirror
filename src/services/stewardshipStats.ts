/**
 * Stewardship Stats — monthly grouping, health score, trend data.
 * Pure functions — no side effects, no async.
 */

import type { Transaction } from "../types";

// ─── Monthly trend ─────────────────────────────────────────────────────────────

export type MonthBucket = {
  /** "Jan 25", "Feb 25", etc. */
  label: string;
  /** ISO YYYY-MM */
  month: string;
  investment: number;
  consumption: number;
  leak: number;
  net: number;
};

/** Returns the last N calendar months, newest last. */
export function getLastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(iso);
  }
  return months;
}

function monthLabel(iso: string): string {
  const [year, mon] = iso.split("-");
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function buildMonthlyTrend(
  transactions: Transaction[],
  months = 6
): MonthBucket[] {
  const keys = getLastNMonths(months);
  const map: Record<string, MonthBucket> = {};

  for (const iso of keys) {
    map[iso] = {
      label: monthLabel(iso),
      month: iso,
      investment: 0,
      consumption: 0,
      leak: 0,
      net: 0,
    };
  }

  for (const tx of transactions) {
    const iso = tx.created_at.slice(0, 7); // YYYY-MM
    if (!map[iso]) continue;
    if (tx.category === "investment")  map[iso].investment  += tx.amount;
    if (tx.category === "consumption") map[iso].consumption += tx.amount;
    if (tx.category === "leak")        map[iso].leak        += tx.amount;
  }

  for (const iso of keys) {
    map[iso].net = map[iso].investment - map[iso].leak - map[iso].consumption;
  }

  return keys.map((iso) => map[iso]);
}

// ─── Financial health score ────────────────────────────────────────────────────

export type HealthTier = {
  label: string;
  color: string;
  bg: string;
  description: string;
};

export const HEALTH_TIERS: HealthTier[] = [
  { label: "Reckless",    color: "#D85A30", bg: "#FEF3EE", description: "Spending far exceeds investing." },
  { label: "Fragile",     color: "#E07B39", bg: "#FEF6EE", description: "Leaks outpace growth." },
  { label: "Careful",     color: "#BA7517", bg: "#FEF9EE", description: "Breaking even — room to improve." },
  { label: "Stable",      color: "#6B9E3F", bg: "#F4FBF0", description: "More in than out. Keep going." },
  { label: "Disciplined", color: "#1D9E75", bg: "#F0FBF7", description: "Strong investment discipline." },
  { label: "Frugal",      color: "#0B7A5C", bg: "#E6F7F2", description: "Outstanding stewardship." },
];

/**
 * Score 0–100 based on:
 * - 60% investment ratio: investment / (investment + leak + consumption)
 * - 40% leak penalty: 1 - (leak / max(total,1))
 */
export function calcHealthScore(
  investment: number,
  consumption: number,
  leak: number
): number {
  const total = investment + consumption + leak;
  if (total === 0) return 50; // neutral when no data

  const investRatio = investment / total;
  const leakRatio   = leak / total;

  const score = investRatio * 60 + (1 - leakRatio) * 40;
  return Math.round(Math.min(Math.max(score, 0), 100));
}

export function getHealthTier(score: number): HealthTier {
  if (score < 20) return HEALTH_TIERS[0];
  if (score < 35) return HEALTH_TIERS[1];
  if (score < 50) return HEALTH_TIERS[2];
  if (score < 65) return HEALTH_TIERS[3];
  if (score < 80) return HEALTH_TIERS[4];
  return HEALTH_TIERS[5];
}

// ─── Current-month helpers ────────────────────────────────────────────────────

export function currentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const iso  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return transactions.filter((t) => t.created_at.startsWith(iso));
}

// ─── Zakat ────────────────────────────────────────────────────────────────────

/**
 * Nisab thresholds (approximate, updated periodically).
 * Gold nisab  = 85g × gold price per gram (IDR).
 * Silver nisab = 595g × silver price per gram (IDR).
 * We use gold nisab as the primary threshold (more lenient).
 */
export type ZakatInput = {
  /** Total savings / liquid assets in IDR */
  savings: number;
  /** Stock / investment portfolio value in IDR */
  investments: number;
  /** Receivables / other zakatble assets in IDR */
  other: number;
  /** Liabilities / debts to subtract */
  liabilities: number;
  /** Gold price per gram in IDR — default ~1,500,000 */
  goldPricePerGram: number;
};

export type ZakatResult = {
  netAssets: number;
  nisabGold: number;
  meetsNisab: boolean;
  zakatDue: number;
  /** 2.5% rate */
  rate: number;
};

export function calcZakat(input: ZakatInput): ZakatResult {
  const NISAB_GOLD_GRAMS = 85;
  const ZAKAT_RATE = 0.025;

  const nisabGold  = NISAB_GOLD_GRAMS * input.goldPricePerGram;
  const netAssets  = input.savings + input.investments + input.other - input.liabilities;
  const meetsNisab = netAssets >= nisabGold;
  const zakatDue   = meetsNisab ? Math.round(netAssets * ZAKAT_RATE) : 0;

  return { netAssets, nisabGold, meetsNisab, zakatDue, rate: ZAKAT_RATE };
}
