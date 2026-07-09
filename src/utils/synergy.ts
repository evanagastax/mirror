/**
 * Weighted synergy formula.
 *
 * Weights:
 *   Soul        × 1.0  — spiritual foundation
 *   Vessel      × 1.0  — physical foundation
 *   Impact      × 1.2  — output / work, slightly emphasised
 *   Stewardship × 0.8  — financial health, important but a lagging indicator
 *
 * Balance bonus: if all four pillars are active (score > 0), apply a 1.1×
 * multiplier to reward holistic growth over single-pillar grinding.
 *
 * The weighted sum is then normalised back to roughly the same scale as
 * the old simple average so existing ranks / milestones stay meaningful.
 */
export function calculateSynergy(pillars: {
  soul: number;
  vessel: number;
  impact: number;
  stewardship: number;
}): number {
  const { soul, vessel, impact, stewardship } = pillars;

  const WEIGHTS = { soul: 1.0, vessel: 1.0, impact: 1.2, stewardship: 0.8 };
  const TOTAL_WEIGHT = WEIGHTS.soul + WEIGHTS.vessel + WEIGHTS.impact + WEIGHTS.stewardship; // 4.0

  const weighted =
    soul        * WEIGHTS.soul +
    vessel      * WEIGHTS.vessel +
    impact      * WEIGHTS.impact +
    stewardship * WEIGHTS.stewardship;

  // Normalise to the same average-per-pillar scale as before
  const normalised = weighted / TOTAL_WEIGHT;

  // 10 % balance bonus when all pillars have been used at least once
  const allActive = soul > 0 && vessel > 0 && impact > 0 && stewardship > 0;
  const multiplier = allActive ? 1.1 : 1.0;

  return Math.round(normalised * multiplier);
}
