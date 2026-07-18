/**
 * Tests for badges.ts — computeBadges pure function
 */

import { computeBadges, BADGES } from "../../services/badges";
import type { Pillars, Log, Transaction, StreakResult } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePillars(soul: number, vessel: number, impact: number, stewardship: number): Pillars {
  return { soul, vessel, impact, stewardship, id: "test", updated_at: new Date().toISOString() };
}

function makeLog(id: string, pillar: string, value: number): Log {
  return {
    id,
    user_id: "test",
    pillar_type: pillar as any,
    value,
    created_at: new Date().toISOString(),
    evidence_url: null,
    metadata: null,
  };
}

function makeTx(id: string, category: Transaction["category"], amount: number): Transaction {
  return {
    id,
    user_id: "test",
    category,
    amount,
    note: null,
    created_at: new Date().toISOString(),
  };
}

function makeStreak(current: number): StreakResult {
  return { current, longest: current };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeBadges", () => {
  // ── Empty state ────────────────────────────────────────────────────────────
  it("returns all badges as not earned when everything is null/empty", () => {
    const result = computeBadges(null, [], [], null);
    expect(result).toHaveLength(BADGES.length);
    result.forEach((b) => expect(b.earned).toBe(false));
  });

  it("returns all badges as not earned when all inputs are undefined", () => {
    const result = computeBadges(undefined, undefined, undefined, undefined);
    result.forEach((b) => expect(b.earned).toBe(false));
  });

  // ── Synergy badges ─────────────────────────────────────────────────────────
  it("earns synergy_10 when total synergy >= 10", () => {
    const pillars = makePillars(3, 3, 3, 1); // total=10
    const result = computeBadges(pillars, [], [], null);
    const synergy10 = result.find((b) => b.id === "synergy_10")!;
    expect(synergy10.earned).toBe(true);
  });

  it("does not earn synergy_10 when total synergy < 10", () => {
    const pillars = makePillars(2, 2, 2, 2); // total=8
    const result = computeBadges(pillars, [], [], null);
    const synergy10 = result.find((b) => b.id === "synergy_10")!;
    expect(synergy10.earned).toBe(false);
  });

  it("earns synergy_500 when total synergy >= 500", () => {
    const pillars = makePillars(125, 125, 125, 125); // total=500
    const result = computeBadges(pillars, [], [], null);
    const synergy500 = result.find((b) => b.id === "synergy_500")!;
    expect(synergy500.earned).toBe(true);
  });

  // ── Streak badges ──────────────────────────────────────────────────────────
  it("earns streak_3 when current streak >= 3", () => {
    const streak = makeStreak(3);
    const result = computeBadges(null, [], [], streak);
    const spark = result.find((b) => b.id === "streak_3")!;
    expect(spark.earned).toBe(true);
  });

  it("earns streak_100 when current streak >= 100", () => {
    const streak = makeStreak(100);
    const result = computeBadges(null, [], [], streak);
    const eternal = result.find((b) => b.id === "streak_100")!;
    expect(eternal.earned).toBe(true);
  });

  it("does not earn streak_7 when streak is 6", () => {
    const streak = makeStreak(6);
    const result = computeBadges(null, [], [], streak);
    const flame = result.find((b) => b.id === "streak_7")!;
    expect(flame.earned).toBe(false);
  });

  // ── Pillar badges ──────────────────────────────────────────────────────────
  it("earns soul_50 when soul >= 50", () => {
    const pillars = makePillars(50, 0, 0, 0);
    const result = computeBadges(pillars, [], [], null);
    const devoted = result.find((b) => b.id === "soul_50")!;
    expect(devoted.earned).toBe(true);
  });

  it("earns vessel_200 when vessel >= 200", () => {
    const pillars = makePillars(0, 200, 0, 0);
    const result = computeBadges(pillars, [], [], null);
    const warrior = result.find((b) => b.id === "vessel_200")!;
    expect(warrior.earned).toBe(true);
  });

  it("earns impact_50 when impact >= 50", () => {
    const pillars = makePillars(0, 0, 50, 0);
    const result = computeBadges(pillars, [], [], null);
    const producer = result.find((b) => b.id === "impact_50")!;
    expect(producer.earned).toBe(true);
  });

  it("earns steward_200 when stewardship >= 200", () => {
    const pillars = makePillars(0, 0, 0, 200);
    const result = computeBadges(pillars, [], [], null);
    const steward = result.find((b) => b.id === "steward_200")!;
    expect(steward.earned).toBe(true);
  });

  // ── Activity badges ────────────────────────────────────────────────────────
  it("earns logs_10 when total logs + transactions >= 10", () => {
    const logs = Array.from({ length: 7 }, (_, i) => makeLog(`l${i}`, "soul", 10));
    const txs = Array.from({ length: 3 }, (_, i) => makeTx(`t${i}`, "investment", 100));
    const result = computeBadges(null, logs, txs, null);
    const logger = result.find((b) => b.id === "logs_10")!;
    expect(logger.earned).toBe(true);
  });

  it("does not earn logs_10 when total < 10", () => {
    const logs = Array.from({ length: 5 }, (_, i) => makeLog(`l${i}`, "soul", 10));
    const txs = Array.from({ length: 4 }, (_, i) => makeTx(`t${i}`, "investment", 100));
    const result = computeBadges(null, logs, txs, null);
    const logger = result.find((b) => b.id === "logs_10")!;
    expect(logger.earned).toBe(false);
  });

  it("counts both logs and transactions for activity badges", () => {
    const logs = Array.from({ length: 50 }, (_, i) => makeLog(`l${i}`, "soul", 10));
    const result = computeBadges(null, logs, [], null);
    const chronicler = result.find((b) => b.id === "logs_50")!;
    expect(chronicler.earned).toBe(true);
  });

  // ── Multiple badges earned ─────────────────────────────────────────────────
  it("earns multiple badges when conditions are met", () => {
    const pillars = makePillars(100, 100, 100, 100); // synergy=400
    const streak = makeStreak(30);
    const logs = Array.from({ length: 200 }, (_, i) => makeLog(`l${i}`, "soul", 10));
    const result = computeBadges(pillars, logs, [], streak);

    const earned = result.filter((b) => b.earned);
    const earnedIds = earned.map((b) => b.id);

    expect(earnedIds).toContain("synergy_10");
    expect(earnedIds).toContain("synergy_50");
    expect(earnedIds).toContain("synergy_100");
    expect(earnedIds).toContain("synergy_250");
    expect(earnedIds).toContain("streak_3");
    expect(earnedIds).toContain("streak_7");
    expect(earnedIds).toContain("streak_30");
    expect(earnedIds).toContain("soul_50");
    expect(earnedIds).toContain("vessel_50");
    expect(earnedIds).toContain("impact_50");
    expect(earnedIds).toContain("steward_50");
    expect(earnedIds).toContain("logs_10");
    expect(earnedIds).toContain("logs_50");
    expect(earnedIds).toContain("logs_200");
  });

  // ── Badge metadata ─────────────────────────────────────────────────────────
  it("preserves badge metadata (id, icon, label, description, category)", () => {
    const result = computeBadges(null, [], [], null);
    result.forEach((b) => {
      expect(b).toHaveProperty("id");
      expect(b).toHaveProperty("icon");
      expect(b).toHaveProperty("label");
      expect(b).toHaveProperty("description");
      expect(b).toHaveProperty("category");
      expect(b).toHaveProperty("earned");
    });
  });

  it("returns exactly BADGES.length badges", () => {
    expect(computeBadges(null, [], [], null)).toHaveLength(BADGES.length);
    expect(computeBadges(makePillars(100, 100, 100, 100), [], [], null)).toHaveLength(BADGES.length);
  });
});
