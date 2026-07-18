/**
 * Tests for format.ts — formatting helpers
 */

import { formatRp, formatDate, formatTime, MS_PER_DAY } from "../../utils/format";

describe("formatRp", () => {
  it("formats positive numbers as Rupiah", () => {
    const result = formatRp(1500000);
    expect(result).toContain("Rp");
    expect(result).toContain("1");
    expect(result).toContain("500");
    expect(result).toContain("000");
  });

  it("formats zero as Rp 0", () => {
    expect(formatRp(0)).toBe("Rp 0");
  });

  it("handles negative numbers (shows absolute value)", () => {
    const result = formatRp(-50000);
    expect(result).toContain("Rp");
    expect(result).toContain("50");
    expect(result).toContain("000");
  });

  it("formats small numbers", () => {
    const result = formatRp(1000);
    expect(result).toContain("Rp");
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("formats large numbers", () => {
    const result = formatRp(1000000000);
    expect(result).toContain("Rp");
    expect(result).toContain("1");
    expect(result).toContain("000");
    expect(result).toContain("000");
    expect(result).toContain("000");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-07-14T10:30:00Z");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes year", () => {
    const result = formatDate("2026-07-14T10:30:00Z");
    expect(result).toContain("2026");
  });

  it("includes month", () => {
    const result = formatDate("2026-07-14T10:30:00Z");
    // Jul or Juli depending on locale
    expect(result).toMatch(/Jul/i);
  });

  it("includes day", () => {
    const result = formatDate("2026-07-14T10:30:00Z");
    expect(result).toContain("14");
  });
});

describe("formatTime", () => {
  it("formats ISO time string", () => {
    const result = formatTime("2026-07-14T14:30:00Z");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains time separator", () => {
    const result = formatTime("2026-07-14T14:30:00Z");
    // Indonesian locale uses "." as separator, others use ":"
    expect(result).toMatch(/[:.]/);
  });
});

describe("MS_PER_DAY", () => {
  it("equals 86400000", () => {
    expect(MS_PER_DAY).toBe(86_400_000);
  });

  it("equals 24 * 60 * 60 * 1000", () => {
    expect(MS_PER_DAY).toBe(24 * 60 * 60 * 1000);
  });
});
