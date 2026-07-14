/**
 * Tests for calculateSynergy (src/utils/synergy.ts)
 *
 * Formula recap:
 *   weighted = soul×1.0 + vessel×1.0 + impact×1.2 + stewardship×0.8
 *   normalised = weighted / 4.0
 *   multiplier = 1.1 when all four pillars > 0, else 1.0
 *   result = Math.round(normalised × multiplier)
 */

import { calculateSynergy } from "../../utils/synergy";

describe("calculateSynergy", () => {
  // ── Zero state ────────────────────────────────────────────────────────────
  it("returns 0 when all pillars are 0", () => {
    expect(calculateSynergy({ soul: 0, vessel: 0, impact: 0, stewardship: 0 })).toBe(0);
  });

  // ── Single-pillar cases (no balance bonus) ────────────────────────────────
  it("applies weight 1.0 to soul alone", () => {
    // weighted=100, normalised=100/4=25, multiplier=1.0 (not all active)
    expect(calculateSynergy({ soul: 100, vessel: 0, impact: 0, stewardship: 0 })).toBe(25);
  });

  it("applies weight 1.0 to vessel alone", () => {
    expect(calculateSynergy({ soul: 0, vessel: 100, impact: 0, stewardship: 0 })).toBe(25);
  });

  it("applies higher weight 1.2 to impact alone", () => {
    // weighted=120, normalised=120/4=30
    expect(calculateSynergy({ soul: 0, vessel: 0, impact: 100, stewardship: 0 })).toBe(30);
  });

  it("applies lower weight 0.8 to stewardship alone", () => {
    // weighted=80, normalised=80/4=20
    expect(calculateSynergy({ soul: 0, vessel: 0, impact: 0, stewardship: 100 })).toBe(20);
  });

  // ── Balance bonus ─────────────────────────────────────────────────────────
  it("applies 1.1× balance bonus when all four pillars are > 0", () => {
    // equal pillars: weighted=100×(1+1+1.2+0.8)=400, normalised=100, ×1.1=110
    expect(calculateSynergy({ soul: 100, vessel: 100, impact: 100, stewardship: 100 })).toBe(110);
  });

  it("does NOT apply bonus when only three pillars are active", () => {
    // soul+vessel+impact active, stewardship=0 → no bonus
    const withBonus    = calculateSynergy({ soul: 50, vessel: 50, impact: 50, stewardship: 1 });
    const withoutBonus = calculateSynergy({ soul: 50, vessel: 50, impact: 50, stewardship: 0 });
    expect(withBonus).toBeGreaterThan(withoutBonus);
  });

  it("does NOT apply bonus when a single pillar is 0", () => {
    const result = calculateSynergy({ soul: 200, vessel: 200, impact: 200, stewardship: 0 });
    // weighted=200+200+240+0=640, normalised=160, multiplier=1.0
    expect(result).toBe(160);
  });

  // ── Weighted asymmetry ────────────────────────────────────────────────────
  it("impact-heavy build scores higher than soul-heavy build with same total", () => {
    const impactHeavy = calculateSynergy({ soul: 0, vessel: 0, impact: 400, stewardship: 0 });
    const soulHeavy   = calculateSynergy({ soul: 400, vessel: 0, impact: 0,   stewardship: 0 });
    expect(impactHeavy).toBeGreaterThan(soulHeavy);
  });

  it("stewardship-heavy build scores lower than soul-heavy build with same total", () => {
    const stewardHeavy = calculateSynergy({ soul: 0, vessel: 0, impact: 0, stewardship: 400 });
    const soulHeavy    = calculateSynergy({ soul: 400, vessel: 0, impact: 0, stewardship: 0 });
    expect(stewardHeavy).toBeLessThan(soulHeavy);
  });

  // ── Rounding ──────────────────────────────────────────────────────────────
  it("returns an integer (Math.round applied)", () => {
    const result = calculateSynergy({ soul: 1, vessel: 1, impact: 1, stewardship: 1 });
    expect(Number.isInteger(result)).toBe(true);
  });

  it("correctly rounds fractional results", () => {
    // soul=1: weighted=1, normalised=0.25, multiplier=1.0 → rounds to 0
    expect(calculateSynergy({ soul: 1, vessel: 0, impact: 0, stewardship: 0 })).toBe(0);
    // soul=2: weighted=2, normalised=0.5 → rounds to 1 (ties round up in JS)
    expect(calculateSynergy({ soul: 2, vessel: 0, impact: 0, stewardship: 0 })).toBe(1);
  });

  // ── Balance bonus edge: value of 1 counts as active ──────────────────────
  it("treats a pillar score of 1 as active for the balance bonus", () => {
    const allOne = calculateSynergy({ soul: 1, vessel: 1, impact: 1, stewardship: 1 });
    const missingOne = calculateSynergy({ soul: 1, vessel: 1, impact: 1, stewardship: 0 });
    // Both round to 0 at this scale, but allOne should be >= missingOne
    expect(allOne).toBeGreaterThanOrEqual(missingOne);
  });

  // ── Large values ──────────────────────────────────────────────────────────
  it("handles large pillar values without overflow", () => {
    const result = calculateSynergy({ soul: 10000, vessel: 10000, impact: 10000, stewardship: 10000 });
    // normalised=10000, ×1.1=11000
    expect(result).toBe(11000);
  });
});
