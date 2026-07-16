/**
 * Badge System — achievement milestones based on user progress.
 * Pure functions — no side effects, no async.
 */

import type { Pillars, Log, Transaction, StreakResult } from "../types";

// ─── Badge Definition ────────────────────────────────────────────────────────

export type Badge = {
  id: string;
  icon: string;
  label: string;
  description: string;
  category: "synergy" | "streak" | "soul" | "vessel" | "impact" | "stewardship" | "activity";
};

export type BadgeWithStatus = Badge & { earned: boolean };

// ─── All Badges ──────────────────────────────────────────────────────────────

export const BADGES: Badge[] = [
  // Synergy milestones
  { id: "synergy_10",    icon: "✦", label: "Awakened",      description: "Reach 10 Synergy",          category: "synergy" },
  { id: "synergy_50",    icon: "◈", label: "Initiate",      description: "Reach 50 Synergy",          category: "synergy" },
  { id: "synergy_100",   icon: "⬡", label: "Seeker",        description: "Reach 100 Synergy",         category: "synergy" },
  { id: "synergy_250",   icon: "◎", label: "Adept",         description: "Reach 250 Synergy",         category: "synergy" },
  { id: "synergy_500",   icon: "✦", label: "Master",        description: "Reach 500 Synergy",         category: "synergy" },

  // Streak milestones
  { id: "streak_3",      icon: "🔥", label: "Spark",         description: "3-day streak",              category: "streak" },
  { id: "streak_7",      icon: "🔥", label: "Flame",         description: "7-day streak",              category: "streak" },
  { id: "streak_30",     icon: "🔥", label: "Inferno",       description: "30-day streak",             category: "streak" },
  { id: "streak_100",    icon: "🔥", label: "Eternal Fire",  description: "100-day streak",            category: "streak" },

  // Soul milestones
  { id: "soul_50",       icon: "✦", label: "Devoted",       description: "Earn 50 Soul XP",           category: "soul" },
  { id: "soul_200",      icon: "✦", label: "Enlightened",   description: "Earn 200 Soul XP",          category: "soul" },

  // Vessel milestones
  { id: "vessel_50",     icon: "⬡", label: "Athlete",       description: "Earn 50 Vessel XP",         category: "vessel" },
  { id: "vessel_200",    icon: "⬡", label: "Warrior",       description: "Earn 200 Vessel XP",        category: "vessel" },

  // Impact milestones
  { id: "impact_50",     icon: "◈", label: "Producer",      description: "Earn 50 Impact XP",         category: "impact" },
  { id: "impact_200",    icon: "◈", label: "Architect",     description: "Earn 200 Impact XP",        category: "impact" },

  // Stewardship milestones
  { id: "steward_50",    icon: "◎", label: "Frugal",        description: "Earn 50 Stewardship XP",    category: "stewardship" },
  { id: "steward_200",   icon: "◎", label: "Steward",       description: "Earn 200 Stewardship XP",   category: "stewardship" },

  // Activity milestones
  { id: "logs_10",       icon: "📝", label: "Logger",        description: "Log 10 activities",         category: "activity" },
  { id: "logs_50",       icon: "📝", label: "Chronicler",    description: "Log 50 activities",         category: "activity" },
  { id: "logs_200",      icon: "📝", label: "Historian",     description: "Log 200 activities",        category: "activity" },
];

// ─── Computation ─────────────────────────────────────────────────────────────

export function computeBadges(
  pillars: Pillars | null | undefined,
  logs: Log[] | undefined,
  transactions: Transaction[] | undefined,
  streak: StreakResult | null | undefined
): BadgeWithStatus[] {
  const synergy = pillars
    ? pillars.soul + pillars.vessel + pillars.impact + pillars.stewardship
    : 0;
  const logCount = (logs ?? []).length + (transactions ?? []).length;
  const currentStreak = streak?.current ?? 0;

  return BADGES.map((badge) => {
    let earned = false;

    if (badge.id.startsWith("synergy_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = synergy >= threshold;
    } else if (badge.id.startsWith("streak_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = currentStreak >= threshold;
    } else if (badge.id.startsWith("soul_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = (pillars?.soul ?? 0) >= threshold;
    } else if (badge.id.startsWith("vessel_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = (pillars?.vessel ?? 0) >= threshold;
    } else if (badge.id.startsWith("impact_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = (pillars?.impact ?? 0) >= threshold;
    } else if (badge.id.startsWith("steward_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = (pillars?.stewardship ?? 0) >= threshold;
    } else if (badge.id.startsWith("logs_")) {
      const threshold = parseInt(badge.id.split("_")[1]);
      earned = logCount >= threshold;
    }

    return { ...badge, earned };
  });
}
