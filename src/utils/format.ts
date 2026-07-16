/**
 * Shared formatting helpers.
 *
 * Previously duplicated across LogHistoryScreen, LedgerScreen,
 * ImpactScreen, and StewardshipBudgetScreen.
 */

/** Format a number as Indonesian Rupiah: 1500000 → "Rp 1.500.000" */
export function formatRp(n: number): string {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

/** Format an ISO timestamp as a short date: "14 Jul 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format an ISO timestamp as HH:MM: "14:30" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Milliseconds in one day — use instead of magic number 86400000 */
export const MS_PER_DAY = 86_400_000;
