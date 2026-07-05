/**
 * The "Synergy" score is a simple average of the four pillars for now.
 * Swap this out later for a weighted formula once you decide which
 * pillars matter more (e.g. Impact weighted higher during a job hunt).
 */
export function calculateSynergy(pillars: {
  soul: number;
  vessel: number;
  impact: number;
  stewardship: number;
}): number {
  const { soul, vessel, impact, stewardship } = pillars;
  return Math.round((soul + vessel + impact + stewardship) / 4);
}

/**
 * Returns the SVG stroke-dasharray/offset for a ring segment given a
 * 0-100 value and the ring's radius. Used by CompassRing.
 */
export function ringDashProps(value: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;
  return {
    strokeDasharray: `${dash} ${circumference}`,
    strokeDashoffset: circumference - dash / 2,
  };
}
