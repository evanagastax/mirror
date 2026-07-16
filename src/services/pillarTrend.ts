/**
 * Pillar Trend — monthly aggregation for Soul and Vessel logs.
 * Pure functions — no side effects, no async.
 */

import type { Log } from "../types";

export type MonthBucket = {
  label: string;
  month: string;
  total: number;
  count: number;
};

/** Returns the last N calendar months, newest last. */
function getLastNMonths(n: number): string[] {
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

/**
 * Build monthly trend from logs filtered to a specific pillar.
 * Returns last N months with total value and log count per month.
 */
export function buildPillarTrend(
  logs: Log[],
  pillar: "soul" | "vessel" | "impact",
  months = 6
): MonthBucket[] {
  const keys = getLastNMonths(months);
  const map: Record<string, MonthBucket> = {};

  for (const iso of keys) {
    map[iso] = { label: monthLabel(iso), month: iso, total: 0, count: 0 };
  }

  for (const log of logs) {
    if (log.pillar_type !== pillar) continue;
    const iso = log.created_at.slice(0, 7);
    if (!map[iso]) continue;
    map[iso].total += log.value;
    map[iso].count += 1;
  }

  return keys.map((iso) => map[iso]);
}
