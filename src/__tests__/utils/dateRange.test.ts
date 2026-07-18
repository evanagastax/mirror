/**
 * Tests for dateRange.ts — dateRangeBounds pure function
 */

import { dateRangeBounds, DATE_RANGES, DateRange } from "../../utils/dateRange";

describe("dateRangeBounds", () => {
  it("returns empty object for 'all' range", () => {
    const bounds = dateRangeBounds("all");
    expect(bounds).toEqual({});
  });

  it("returns 'from' for 'today' range", () => {
    const bounds = dateRangeBounds("today");
    expect(bounds.from).toBeDefined();
    expect(bounds.to).toBeUndefined();
  });

  it("today's 'from' is start of current day", () => {
    const bounds = dateRangeBounds("today");
    const from = new Date(bounds.from!);
    const now = new Date();
    expect(from.getFullYear()).toBe(now.getFullYear());
    expect(from.getMonth()).toBe(now.getMonth());
    expect(from.getDate()).toBe(now.getDate());
    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
  });

  it("returns 'from' for 'week' range", () => {
    const bounds = dateRangeBounds("week");
    expect(bounds.from).toBeDefined();
    expect(bounds.to).toBeUndefined();
  });

  it("week's 'from' is a Monday", () => {
    const bounds = dateRangeBounds("week");
    const from = new Date(bounds.from!);
    // getDay() === 1 means Monday
    expect(from.getDay()).toBe(1);
  });

  it("week's 'from' is before or equal to today", () => {
    const bounds = dateRangeBounds("week");
    const from = new Date(bounds.from!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(from.getTime()).toBeLessThanOrEqual(today.getTime());
  });

  it("returns 'from' for 'month' range", () => {
    const bounds = dateRangeBounds("month");
    expect(bounds.from).toBeDefined();
    expect(bounds.to).toBeUndefined();
  });

  it("month's 'from' is 1st of current month", () => {
    const bounds = dateRangeBounds("month");
    const from = new Date(bounds.from!);
    const now = new Date();
    expect(from.getFullYear()).toBe(now.getFullYear());
    expect(from.getMonth()).toBe(now.getMonth());
    expect(from.getDate()).toBe(1);
  });

  it("returns 'from' for 'year' range", () => {
    const bounds = dateRangeBounds("year");
    expect(bounds.from).toBeDefined();
    expect(bounds.to).toBeUndefined();
  });

  it("year's 'from' is Jan 1st of current year", () => {
    const bounds = dateRangeBounds("year");
    const from = new Date(bounds.from!);
    const now = new Date();
    expect(from.getFullYear()).toBe(now.getFullYear());
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
  });
});

describe("DATE_RANGES", () => {
  it("contains all expected range keys", () => {
    const keys = DATE_RANGES.map((r) => r.key);
    expect(keys).toContain("all");
    expect(keys).toContain("today");
    expect(keys).toContain("week");
    expect(keys).toContain("month");
    expect(keys).toContain("year");
  });

  it("each range has a label", () => {
    DATE_RANGES.forEach((r) => {
      expect(r.label).toBeDefined();
      expect(r.label.length).toBeGreaterThan(0);
    });
  });

  it("each range has a valid key", () => {
    const validKeys: DateRange[] = ["all", "today", "week", "month", "year"];
    DATE_RANGES.forEach((r) => {
      expect(validKeys).toContain(r.key);
    });
  });
});
