/**
 * Tests for pillarTrend.ts — buildPillarTrend pure function
 */

import { buildPillarTrend } from "../../services/pillarTrend";
import type { Log } from "../../types";

function makeLog(id: string, pillar: string, value: number, created_at: string): Log {
  return {
    id,
    user_id: "test",
    pillar_type: pillar as any,
    value,
    created_at,
    evidence_url: null,
    metadata: null,
  };
}

describe("buildPillarTrend", () => {
  it("returns correct number of months", () => {
    expect(buildPillarTrend([], "soul", 6)).toHaveLength(6);
    expect(buildPillarTrend([], "soul", 3)).toHaveLength(3);
    expect(buildPillarTrend([], "soul", 12)).toHaveLength(12);
  });

  it("returns all-zero buckets when no logs", () => {
    const result = buildPillarTrend([], "soul", 6);
    result.forEach((b) => {
      expect(b.total).toBe(0);
      expect(b.count).toBe(0);
    });
  });

  it("each bucket has label and month", () => {
    const result = buildPillarTrend([], "soul", 6);
    result.forEach((b) => {
      expect(b.label).toBeDefined();
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  it("months are in ascending order", () => {
    const result = buildPillarTrend([], "soul", 6);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].month > result[i - 1].month).toBe(true);
    }
  });

  it("filters logs by pillar type", () => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dateStr = `${iso}-15T10:00:00Z`;

    const logs = [
      makeLog("1", "soul", 30, dateStr),
      makeLog("2", "vessel", 60, dateStr),
      makeLog("3", "soul", 20, dateStr),
    ];

    const soulTrend = buildPillarTrend(logs, "soul", 6);
    const vesselTrend = buildPillarTrend(logs, "vessel", 6);

    const soulTotal = soulTrend.reduce((s, b) => s + b.total, 0);
    const vesselTotal = vesselTrend.reduce((s, b) => s + b.total, 0);

    expect(soulTotal).toBe(50);
    expect(vesselTotal).toBe(60);
  });

  it("aggregates values in correct month buckets", () => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dateStr = `${iso}-15T10:00:00Z`;

    const logs = [
      makeLog("1", "soul", 30, dateStr),
      makeLog("2", "soul", 20, dateStr),
    ];

    const result = buildPillarTrend(logs, "soul", 6);
    const currentMonth = result.find((b) => b.month === iso);

    expect(currentMonth).toBeDefined();
    expect(currentMonth!.total).toBe(50);
    expect(currentMonth!.count).toBe(2);
  });

  it("ignores logs outside the month range", () => {
    // Create a log from 2 years ago
    const oldLog = makeLog("1", "soul", 100, "2020-01-15T10:00:00Z");
    const result = buildPillarTrend([oldLog], "soul", 6);
    const total = result.reduce((s, b) => s + b.total, 0);
    expect(total).toBe(0);
  });

  it("handles different pillar types independently", () => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dateStr = `${iso}-15T10:00:00Z`;

    const logs = [
      makeLog("1", "soul", 30, dateStr),
      makeLog("2", "impact", 10, dateStr),
    ];

    const soulTrend = buildPillarTrend(logs, "soul", 6);
    const impactTrend = buildPillarTrend(logs, "impact", 6);
    const vesselTrend = buildPillarTrend(logs, "vessel", 6);

    expect(soulTrend.reduce((s, b) => s + b.total, 0)).toBe(30);
    expect(impactTrend.reduce((s, b) => s + b.total, 0)).toBe(10);
    expect(vesselTrend.reduce((s, b) => s + b.total, 0)).toBe(0);
  });
});
