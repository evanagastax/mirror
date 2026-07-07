/**
 * Converts a raw pillar score (0–∞) into an RPG-style level + XP.
 * Each level requires 100 points. Score 0–99 = Level 1, 100–199 = Level 2, etc.
 */
export function scoreToLevel(score: number): {
  level: number;
  xp: number;
  xpMax: number;
} {
  const level = Math.floor(score / 100) + 1;
  const xp = score % 100;
  return { level, xp, xpMax: 100 };
}
