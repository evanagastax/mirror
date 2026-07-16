export type DateRange = "all" | "today" | "week" | "month" | "year";

export const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: "all",   label: "All" },
  { key: "today", label: "Today" },
  { key: "week",  label: "Week" },
  { key: "month", label: "Month" },
  { key: "year",  label: "Year" },
];

/** Returns ISO date strings for the start of the given range. */
export function dateRangeBounds(range: DateRange): { from?: string; to?: string } {
  if (range === "all") return {};

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === "today") {
    return { from: today.toISOString() };
  }

  if (range === "week") {
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return { from: monday.toISOString() };
  }

  if (range === "month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: first.toISOString() };
  }

  if (range === "year") {
    const jan1 = new Date(now.getFullYear(), 0, 1);
    return { from: jan1.toISOString() };
  }

  return {};
}
