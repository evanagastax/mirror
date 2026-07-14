/**
 * Tests for summarizeLedger (src/hooks/useLedger.ts)
 *
 * summarizeLedger is a pure function — no mocks needed.
 *
 * Rules:
 *   totalInvestment  = sum of amounts where category === "investment"
 *   totalConsumption = sum of amounts where category === "consumption"
 *   totalLeak        = sum of amounts where category === "leak"
 *   netScore         = totalInvestment - totalLeak  (consumption is neutral)
 */

import { summarizeLedger, Transaction } from "../../hooks/useLedger";

// ─── helpers ──────────────────────────────────────────────────────────────────

function tx(
  id: string,
  category: Transaction["category"],
  amount: number
): Transaction {
  return { id, amount, category, note: null, created_at: "2025-01-01T00:00:00Z" };
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("summarizeLedger", () => {
  // ── Empty list ────────────────────────────────────────────────────────────
  it("returns all zeros for an empty transaction list", () => {
    expect(summarizeLedger([])).toEqual({
      totalInvestment: 0,
      totalConsumption: 0,
      totalLeak: 0,
      netScore: 0,
    });
  });

  // ── Single-category sums ──────────────────────────────────────────────────
  it("sums investment-only transactions correctly", () => {
    const result = summarizeLedger([tx("1", "investment", 100), tx("2", "investment", 250)]);
    expect(result.totalInvestment).toBe(350);
    expect(result.totalConsumption).toBe(0);
    expect(result.totalLeak).toBe(0);
    expect(result.netScore).toBe(350);
  });

  it("sums consumption-only transactions correctly", () => {
    const result = summarizeLedger([tx("1", "consumption", 80), tx("2", "consumption", 120)]);
    expect(result.totalConsumption).toBe(200);
    expect(result.totalInvestment).toBe(0);
    expect(result.totalLeak).toBe(0);
  });

  it("sums leak-only transactions correctly", () => {
    const result = summarizeLedger([tx("1", "leak", 50), tx("2", "leak", 30)]);
    expect(result.totalLeak).toBe(80);
    expect(result.totalInvestment).toBe(0);
    expect(result.totalConsumption).toBe(0);
  });

  // ── Mixed categories ──────────────────────────────────────────────────────
  it("segregates mixed categories correctly", () => {
    const transactions = [
      tx("1", "investment",  500),
      tx("2", "consumption", 200),
      tx("3", "leak",        100),
      tx("4", "investment",  300),
      tx("5", "leak",         50),
    ];
    const result = summarizeLedger(transactions);
    expect(result.totalInvestment).toBe(800);
    expect(result.totalConsumption).toBe(200);
    expect(result.totalLeak).toBe(150);
  });

  // ── netScore formula: investment - leak (consumption is neutral) ──────────
  it("netScore = investment - leak, consumption does NOT reduce netScore", () => {
    const transactions = [
      tx("1", "investment",  1000),
      tx("2", "consumption",  999), // should not affect netScore
      tx("3", "leak",          200),
    ];
    const result = summarizeLedger(transactions);
    expect(result.netScore).toBe(800); // 1000 - 200
  });

  it("netScore is negative when leaks exceed investments", () => {
    const transactions = [
      tx("1", "investment", 100),
      tx("2", "leak",       300),
    ];
    expect(summarizeLedger(transactions).netScore).toBe(-200);
  });

  it("netScore is zero when investments equal leaks", () => {
    const transactions = [
      tx("1", "investment", 500),
      tx("2", "leak",       500),
    ];
    expect(summarizeLedger(transactions).netScore).toBe(0);
  });

  // ── Single transaction ────────────────────────────────────────────────────
  it("handles a single investment transaction", () => {
    const result = summarizeLedger([tx("1", "investment", 42)]);
    expect(result).toEqual({
      totalInvestment: 42,
      totalConsumption: 0,
      totalLeak: 0,
      netScore: 42,
    });
  });

  // ── Decimal amounts ───────────────────────────────────────────────────────
  it("handles decimal amounts (from numeric(12,2) DB column)", () => {
    const transactions = [
      tx("1", "investment",  100.50),
      tx("2", "leak",         10.25),
    ];
    const result = summarizeLedger(transactions);
    expect(result.totalInvestment).toBeCloseTo(100.50);
    expect(result.totalLeak).toBeCloseTo(10.25);
    expect(result.netScore).toBeCloseTo(90.25);
  });

  // ── Large dataset performance / correctness ───────────────────────────────
  it("handles a large list of 1000 transactions without error", () => {
    const large: Transaction[] = Array.from({ length: 1000 }, (_, i) =>
      tx(String(i), i % 3 === 0 ? "investment" : i % 3 === 1 ? "consumption" : "leak", 10)
    );
    const result = summarizeLedger(large);
    // ~334 investments, ~333 consumptions, ~333 leaks × 10 each
    expect(result.totalInvestment + result.totalConsumption + result.totalLeak).toBe(10000);
    expect(result.netScore).toBe(result.totalInvestment - result.totalLeak);
  });
});
