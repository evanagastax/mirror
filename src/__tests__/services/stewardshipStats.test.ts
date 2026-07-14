/**
 * Tests for stewardshipStats.ts pure functions:
 *   calcZakat, calcHealthScore, getHealthTier, buildMonthlyTrend, getLastNMonths
 */

import {
  calcZakat,
  calcHealthScore,
  getHealthTier,
  buildMonthlyTrend,
  getLastNMonths,
  HEALTH_TIERS,
  ZakatInput,
} from "../../services/stewardshipStats";
import { Transaction } from "../../hooks/useLedger";

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeTx(
  id: string,
  category: Transaction["category"],
  amount: number,
  created_at: string
): Transaction {
  return { id, amount, category, note: null, created_at };
}

// ─── getLastNMonths ────────────────────────────────────────────────────────────

describe("getLastNMonths", () => {
  it("returns exactly n months", () => {
    expect(getLastNMonths(6)).toHaveLength(6);
    expect(getLastNMonths(1)).toHaveLength(1);
    expect(getLastNMonths(12)).toHaveLength(12);
  });

  it("returns ISO YYYY-MM strings", () => {
    getLastNMonths(3).forEach((m) => {
      expect(m).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  it("last entry is the current month", () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const months = getLastNMonths(6);
    expect(months[months.length - 1]).toBe(expected);
  });

  it("months are in ascending chronological order", () => {
    const months = getLastNMonths(6);
    for (let i = 1; i < months.length; i++) {
      expect(months[i] > months[i - 1]).toBe(true);
    }
  });

  it("returns n=0 as empty array", () => {
    expect(getLastNMonths(0)).toHaveLength(0);
  });
});

// ─── buildMonthlyTrend ────────────────────────────────────────────────────────

describe("buildMonthlyTrend", () => {
  it("returns exactly `months` buckets", () => {
    expect(buildMonthlyTrend([], 6)).toHaveLength(6);
    expect(buildMonthlyTrend([], 3)).toHaveLength(3);
  });

  it("returns all-zero buckets when there are no transactions", () => {
    buildMonthlyTrend([], 3).forEach((b) => {
      expect(b.investment).toBe(0);
      expect(b.consumption).toBe(0);
      expect(b.leak).toBe(0);
      expect(b.net).toBe(0);
    });
  });

  it("buckets a transaction into the correct month", () => {
    const now = new Date();
    const isoNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const tx = makeTx("1", "investment", 500, `${isoNow}-15T00:00:00Z`);
    const trend = buildMonthlyTrend([tx], 3);
    const currentBucket = trend.find((b) => b.month === isoNow)!;
    expect(currentBucket.investment).toBe(500);
  });

  it("ignores transactions outside the requested window", () => {
    // Transaction from 10 years ago should be ignored in a 6-month window
    const old = makeTx("1", "investment", 9999, "2010-01-15T00:00:00Z");
    const trend = buildMonthlyTrend([old], 6);
    trend.forEach((b) => expect(b.investment).toBe(0));
  });

  it("accumulates multiple transactions within the same month", () => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const txs = [
      makeTx("1", "investment",  200, `${iso}-01T00:00:00Z`),
      makeTx("2", "investment",  300, `${iso}-15T00:00:00Z`),
      makeTx("3", "consumption", 100, `${iso}-20T00:00:00Z`),
    ];
    const trend = buildMonthlyTrend(txs, 3);
    const bucket = trend.find((b) => b.month === iso)!;
    expect(bucket.investment).toBe(500);
    expect(bucket.consumption).toBe(100);
  });

  it("net = investment - leak - consumption", () => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const txs = [
      makeTx("1", "investment",  1000, `${iso}-01T00:00:00Z`),
      makeTx("2", "consumption",  200, `${iso}-01T00:00:00Z`),
      makeTx("3", "leak",         150, `${iso}-01T00:00:00Z`),
    ];
    const bucket = buildMonthlyTrend(txs, 3).find((b) => b.month === iso)!;
    expect(bucket.net).toBe(650); // 1000 - 200 - 150
  });

  it("buckets have a human-readable label", () => {
    buildMonthlyTrend([], 3).forEach((b) => {
      expect(b.label.length).toBeGreaterThan(0);
    });
  });
});

// ─── calcHealthScore ──────────────────────────────────────────────────────────

describe("calcHealthScore", () => {
  it("returns 50 (neutral) when all inputs are 0", () => {
    expect(calcHealthScore(0, 0, 0)).toBe(50);
  });

  it("returns 100 when everything is investment and no leak", () => {
    // investRatio=1, leakRatio=0 → 1×60 + 1×40 = 100
    expect(calcHealthScore(1000, 0, 0)).toBe(100);
  });

  it("returns 0 when everything is a leak and no investment", () => {
    // investRatio=0, leakRatio=1 → 0×60 + 0×40 = 0
    expect(calcHealthScore(0, 0, 1000)).toBe(0);
  });

  it("returns a value between 0 and 100 for mixed inputs", () => {
    const score = calcHealthScore(500, 300, 200);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("pure consumption (no investment, no leak) gives partial score", () => {
    // investRatio=0, leakRatio=0 → 0 + 1×40 = 40
    expect(calcHealthScore(0, 1000, 0)).toBe(40);
  });

  it("score is an integer", () => {
    expect(Number.isInteger(calcHealthScore(333, 250, 117))).toBe(true);
  });

  it("higher investment proportion gives higher score", () => {
    const goodScore = calcHealthScore(900, 50, 50);
    const badScore  = calcHealthScore(100, 50, 850);
    expect(goodScore).toBeGreaterThan(badScore);
  });

  it("same amounts but more leaks gives lower score than more consumption", () => {
    const moreLeaks = calcHealthScore(500, 0, 500);
    const moreCons  = calcHealthScore(500, 500, 0);
    expect(moreCons).toBeGreaterThan(moreLeaks);
  });
});

// ─── getHealthTier ────────────────────────────────────────────────────────────

describe("getHealthTier", () => {
  it("returns 'Reckless' for score < 20", () => {
    expect(getHealthTier(0).label).toBe("Reckless");
    expect(getHealthTier(19).label).toBe("Reckless");
  });

  it("returns 'Fragile' for score 20–34", () => {
    expect(getHealthTier(20).label).toBe("Fragile");
    expect(getHealthTier(34).label).toBe("Fragile");
  });

  it("returns 'Careful' for score 35–49", () => {
    expect(getHealthTier(35).label).toBe("Careful");
    expect(getHealthTier(49).label).toBe("Careful");
  });

  it("returns 'Stable' for score 50–64", () => {
    expect(getHealthTier(50).label).toBe("Stable");
    expect(getHealthTier(64).label).toBe("Stable");
  });

  it("returns 'Disciplined' for score 65–79", () => {
    expect(getHealthTier(65).label).toBe("Disciplined");
    expect(getHealthTier(79).label).toBe("Disciplined");
  });

  it("returns 'Frugal' for score 80–100", () => {
    expect(getHealthTier(80).label).toBe("Frugal");
    expect(getHealthTier(100).label).toBe("Frugal");
  });

  it("each tier has non-empty color, bg, and description", () => {
    HEALTH_TIERS.forEach((tier) => {
      expect(tier.color.length).toBeGreaterThan(0);
      expect(tier.bg.length).toBeGreaterThan(0);
      expect(tier.description.length).toBeGreaterThan(0);
    });
  });
});

// ─── calcZakat ────────────────────────────────────────────────────────────────

describe("calcZakat", () => {
  const base: ZakatInput = {
    savings: 0,
    investments: 0,
    other: 0,
    liabilities: 0,
    goldPricePerGram: 1_500_000, // IDR 1.5M / gram
  };

  it("rate is always 2.5%", () => {
    expect(calcZakat(base).rate).toBe(0.025);
  });

  it("nisabGold = 85 × goldPricePerGram", () => {
    const result = calcZakat({ ...base, goldPricePerGram: 1_000_000 });
    expect(result.nisabGold).toBe(85_000_000);
  });

  it("netAssets = savings + investments + other - liabilities", () => {
    const result = calcZakat({
      ...base,
      savings: 100_000_000,
      investments: 50_000_000,
      other: 10_000_000,
      liabilities: 20_000_000,
    });
    expect(result.netAssets).toBe(140_000_000);
  });

  it("meetsNisab is false when netAssets < nisabGold", () => {
    // nisab at 1.5M/g = 127.5M; give only 50M
    const result = calcZakat({ ...base, savings: 50_000_000 });
    expect(result.meetsNisab).toBe(false);
    expect(result.zakatDue).toBe(0);
  });

  it("meetsNisab is true when netAssets >= nisabGold", () => {
    // nisab = 127.5M; give 200M
    const result = calcZakat({ ...base, savings: 200_000_000 });
    expect(result.meetsNisab).toBe(true);
  });

  it("zakatDue = Math.round(netAssets × 0.025) when nisab met", () => {
    const result = calcZakat({ ...base, savings: 200_000_000 });
    expect(result.zakatDue).toBe(Math.round(200_000_000 * 0.025));
  });

  it("zakatDue is 0 when below nisab", () => {
    const result = calcZakat({ ...base, savings: 10_000_000 });
    expect(result.zakatDue).toBe(0);
  });

  it("liabilities reduce netAssets and can push below nisab", () => {
    // savings 200M but 150M debt → net 50M < nisab 127.5M
    const result = calcZakat({
      ...base,
      savings: 200_000_000,
      liabilities: 150_000_000,
    });
    expect(result.meetsNisab).toBe(false);
    expect(result.zakatDue).toBe(0);
  });

  it("all-zero input gives meetsNisab=false and zakatDue=0", () => {
    const result = calcZakat(base);
    expect(result.meetsNisab).toBe(false);
    expect(result.zakatDue).toBe(0);
    expect(result.netAssets).toBe(0);
  });
});
