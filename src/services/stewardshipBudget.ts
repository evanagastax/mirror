/**
 * Stewardship Budget Goals — AsyncStorage persistence.
 *
 * Stores monthly budget limits per category and a savings target.
 * Key: stewardship_budget_<userId>
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type BudgetGoals = {
  /** Max monthly spend on consumption (Rp) — 0 = no limit */
  consumptionLimit: number;
  /** Max monthly leak allowed (Rp) — 0 = no limit */
  leakLimit: number;
  /** Monthly investment target (Rp) — 0 = no target */
  investmentTarget: number;
  /** Savings target — cumulative net score goal (Rp) — 0 = no target */
  savingsTarget: number;
  updatedAt: string;
};

export const DEFAULT_BUDGET: BudgetGoals = {
  consumptionLimit: 0,
  leakLimit: 0,
  investmentTarget: 0,
  savingsTarget: 0,
  updatedAt: new Date().toISOString(),
};

function key(userId: string) {
  return `stewardship_budget_${userId}`;
}

export async function loadBudget(userId: string): Promise<BudgetGoals> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as BudgetGoals) : { ...DEFAULT_BUDGET };
  } catch {
    return { ...DEFAULT_BUDGET };
  }
}

export async function saveBudget(
  userId: string,
  budget: Omit<BudgetGoals, "updatedAt">
): Promise<void> {
  const data: BudgetGoals = { ...budget, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(key(userId), JSON.stringify(data));
}
