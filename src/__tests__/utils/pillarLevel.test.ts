/**
 * Tests for scoreToLevel (src/utils/pillarLevel.ts)
 *
 * Rules:
 *   level  = floor(score / 100) + 1    (minimum level 1)
 *   xp     = score % 100               (progress within current level)
 *   xpMax  = 100 always
 */

import { scoreToLevel } from "../../utils/pillarLevel";

describe("scoreToLevel", () => {
  // ── xpMax is always 100 ───────────────────────────────────────────────────
  it("always returns xpMax of 100", () => {
    [0, 1, 50, 99, 100, 250, 999].forEach((score) => {
      expect(scoreToLevel(score).xpMax).toBe(100);
    });
  });

  // ── Level 1 boundary ──────────────────────────────────────────────────────
  it("returns level 1 for score 0", () => {
    expect(scoreToLevel(0)).toEqual({ level: 1, xp: 0, xpMax: 100 });
  });

  it("returns level 1 for score 99", () => {
    expect(scoreToLevel(99)).toEqual({ level: 1, xp: 99, xpMax: 100 });
  });

  // ── Level transition at 100 ───────────────────────────────────────────────
  it("promotes to level 2 at exactly score 100", () => {
    expect(scoreToLevel(100)).toEqual({ level: 2, xp: 0, xpMax: 100 });
  });

  it("returns level 2 with xp 1 for score 101", () => {
    expect(scoreToLevel(101)).toEqual({ level: 2, xp: 1, xpMax: 100 });
  });

  it("stays level 2 up to score 199", () => {
    expect(scoreToLevel(199)).toEqual({ level: 2, xp: 99, xpMax: 100 });
  });

  // ── Higher levels ─────────────────────────────────────────────────────────
  it("returns level 3 for score 200", () => {
    expect(scoreToLevel(200)).toEqual({ level: 3, xp: 0, xpMax: 100 });
  });

  it("returns level 11 for score 1000", () => {
    expect(scoreToLevel(1000)).toEqual({ level: 11, xp: 0, xpMax: 100 });
  });

  it("correctly computes level and xp for an arbitrary mid-level score", () => {
    // score 355: level = floor(355/100)+1 = 4, xp = 55
    expect(scoreToLevel(355)).toEqual({ level: 4, xp: 55, xpMax: 100 });
  });

  it("correctly computes level and xp for score 999", () => {
    // level = floor(999/100)+1 = 10, xp = 99
    expect(scoreToLevel(999)).toEqual({ level: 10, xp: 99, xpMax: 100 });
  });

  // ── xp is always in range [0, 99] ─────────────────────────────────────────
  it("xp is always between 0 and 99 inclusive", () => {
    [0, 1, 50, 99, 100, 199, 200, 550, 1000].forEach((score) => {
      const { xp } = scoreToLevel(score);
      expect(xp).toBeGreaterThanOrEqual(0);
      expect(xp).toBeLessThanOrEqual(99);
    });
  });

  // ── xp / xpMax gives a meaningful 0–1 progress ratio ─────────────────────
  it("xp/xpMax progress ratio is 0 at level boundary", () => {
    const { xp, xpMax } = scoreToLevel(300);
    expect(xp / xpMax).toBe(0);
  });

  it("xp/xpMax progress ratio approaches 1 just before level boundary", () => {
    const { xp, xpMax } = scoreToLevel(299);
    expect(xp / xpMax).toBeCloseTo(0.99);
  });
});
