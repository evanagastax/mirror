/**
 * Vessel Plan — types and AsyncStorage helpers.
 * Shared between VesselScreen (add exercise) and VesselPlanScreen (generate/view).
 */

import { Exercise } from "./exerciseDb";
import { createUserStore } from "../utils/storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DayTemplate = {
  label: string;
  bodyParts: string[];
  icon: string;
};

export type PlanDay = {
  /** 0 = Mon … 6 = Sun */
  dayIndex: number;
  template: DayTemplate;
  exercises: Exercise[];
  completed: boolean;
};

export type SavedPlan = {
  days: PlanDay[];
  generatedAt: string;
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const store = createUserStore<SavedPlan>("vessel_plan");

export async function loadSavedPlan(userId: string): Promise<SavedPlan | null> {
  return store.load(userId);
}

export async function savePlanToStorage(userId: string, plan: SavedPlan): Promise<void> {
  return store.save(userId, plan);
}

export async function deleteSavedPlan(userId: string): Promise<void> {
  return store.remove(userId);
}

/**
 * Append an exercise to a specific day in the plan.
 * Deduplicates by exerciseId.
 * Returns the updated plan (already persisted).
 */
export async function addExerciseToPlanDay(
  userId: string,
  dayIndex: number,
  exercise: Exercise
): Promise<{ plan: SavedPlan; alreadyPresent: boolean }> {
  const plan = await loadSavedPlan(userId);
  if (!plan) throw new Error("No plan found. Generate a plan first from My Plan.");

  const day = plan.days[dayIndex];
  if (!day) throw new Error("Invalid day index.");

  const alreadyPresent = day.exercises.some((e) => e.exerciseId === exercise.exerciseId);
  if (alreadyPresent) return { plan, alreadyPresent: true };

  const updated: SavedPlan = {
    ...plan,
    days: plan.days.map((d, i) =>
      i === dayIndex
        ? { ...d, exercises: [...d.exercises, exercise] }
        : d
    ),
  };

  await savePlanToStorage(userId, updated);
  return { plan: updated, alreadyPresent: false };
}
