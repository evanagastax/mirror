/**
 * Vessel Fitness Calculations
 *
 * BMI, BMR (Mifflin-St Jeor), TDEE, calories burned per exercise (MET),
 * estimated muscle gain potential, and recommended volume per goal.
 */

import { VesselProfile, FitnessGoal, Sex } from "./vesselProfile";

// ─── BMI ──────────────────────────────────────────────────────────────────────

export type BmiCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese";

export function calcBmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25)   return "normal";
  if (bmi < 30)   return "overweight";
  return "obese";
}

export const BMI_META: Record<BmiCategory, { label: string; color: string; bg: string }> = {
  underweight: { label: "Underweight", color: "#378ADD", bg: "#F0F7FE" },
  normal:      { label: "Normal",      color: "#1D9E75", bg: "#F0FBF7" },
  overweight:  { label: "Overweight",  color: "#BA7517", bg: "#FEF9EE" },
  obese:       { label: "Obese",       color: "#D85A30", bg: "#FEF3EE" },
};

// ─── BMR (Mifflin-St Jeor) ────────────────────────────────────────────────────

/** Returns BMR in kcal/day */
export function calcBmr(p: Pick<VesselProfile, "weight" | "height" | "age" | "sex">): number {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return Math.round(p.sex === "male" ? base + 5 : base - 161);
}

// ─── TDEE ─────────────────────────────────────────────────────────────────────

/**
 * Activity multipliers based on days per week.
 * Sedentary baseline assumed (desk job); exercise days push it up.
 */
export function calcTdee(bmr: number, daysPerWeek: number): number {
  const multiplier =
    daysPerWeek <= 1 ? 1.2 :
    daysPerWeek <= 3 ? 1.375 :
    daysPerWeek <= 5 ? 1.55 :
    1.725;
  return Math.round(bmr * multiplier);
}

/** Daily calorie target adjusted for goal */
export function targetCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case "fat_loss":    return Math.round(tdee * 0.8);   // 20% deficit
    case "muscle_gain": return Math.round(tdee * 1.1);   // 10% surplus
    case "endurance":   return Math.round(tdee * 1.05);  // slight surplus
    default:            return tdee;
  }
}

// ─── Calories burned per exercise (MET-based) ─────────────────────────────────

/**
 * MET (Metabolic Equivalent of Task) values by body part / exercise type.
 * Source: Compendium of Physical Activities.
 * Formula: kcal = MET × weight_kg × duration_hours
 */
const MET_BY_BODY_PART: Record<string, number> = {
  // Cardio
  cardio:         8.0,
  // Upper body push
  chest:          5.0,
  shoulders:      4.5,
  triceps:        3.5,
  // Upper body pull
  lats:           5.0,
  "middle back":  4.5,
  "lower back":   4.0,
  traps:          4.0,
  biceps:         3.5,
  forearms:       3.0,
  // Lower body
  quadriceps:     6.0,
  hamstrings:     5.5,
  glutes:         5.5,
  adductors:      4.5,
  calves:         4.0,
  // Core & neck
  abdominals:     3.5,
  neck:           2.5,
};

const DEFAULT_MET = 4.5;

/**
 * Estimate calories burned during a strength session.
 * @param bodyParts  exercise.bodyParts array
 * @param weightKg   user body weight
 * @param durationMin  session duration in minutes
 */
export function estimateCaloriesBurned(
  bodyParts: string[],
  weightKg: number,
  durationMin: number
): number {
  const met =
    bodyParts.length > 0
      ? bodyParts.reduce((sum, bp) => sum + (MET_BY_BODY_PART[bp] ?? DEFAULT_MET), 0) /
        bodyParts.length
      : DEFAULT_MET;
  return Math.round(met * weightKg * (durationMin / 60));
}

/**
 * Per-set calorie estimate for a strength exercise (30-second rest between sets assumed).
 * Each set = ~45s work. Total time = sets × 1.25 min.
 */
export function estimateSetCalories(
  bodyParts: string[],
  weightKg: number,
  totalSets: number
): number {
  const durationMin = totalSets * 1.25;
  return estimateCaloriesBurned(bodyParts, weightKg, durationMin);
}

// ─── Recommended volume per goal ─────────────────────────────────────────────

export type VolumeTarget = {
  sets: number;
  repsMin: number;
  repsMax: number;
  restSec: number;
  label: string;
};

export function recommendedVolume(goal: FitnessGoal): VolumeTarget {
  switch (goal) {
    case "fat_loss":
      return { sets: 3, repsMin: 12, repsMax: 15, restSec: 60,  label: "High rep, short rest" };
    case "muscle_gain":
      return { sets: 4, repsMin: 6,  repsMax: 12, restSec: 120, label: "Moderate rep, heavier load" };
    case "endurance":
      return { sets: 3, repsMin: 15, repsMax: 20, restSec: 45,  label: "Very high rep, minimal rest" };
    case "maintenance":
      return { sets: 3, repsMin: 10, repsMax: 12, restSec: 90,  label: "Balanced volume" };
  }
}

// ─── Lean body mass & muscle gain potential ───────────────────────────────────

/** Lean body mass using Boer formula (kg) */
export function calcLbm(p: Pick<VesselProfile, "weight" | "height" | "sex">): number {
  const h = p.height;
  const w = p.weight;
  if (p.sex === "male")   return Math.round((0.407 * w + 0.267 * h - 19.2) * 10) / 10;
  return Math.round((0.252 * w + 0.473 * h - 48.3) * 10) / 10;
}

/**
 * Martin Berkhan's maximum muscular potential model (natural, trained).
 * Returns estimated max lean body mass in kg at contest condition (~5% bf).
 * Height in cm.
 */
export function maxMuscularPotential(heightCm: number): number {
  // LBM_max ≈ height_cm − 100 (kg) at ~5% body fat
  return Math.round((heightCm - 100) * 10) / 10;
}

/**
 * Estimated monthly muscle gain rate (kg/month) based on training experience proxy (goal).
 */
export function monthlyMuscleGain(goal: FitnessGoal): string {
  if (goal === "muscle_gain") return "0.5 – 1.0 kg/month (beginner) or 0.25 – 0.5 kg/month (intermediate)";
  if (goal === "maintenance") return "0.0 – 0.2 kg/month";
  return "Minimal — focus is not hypertrophy";
}

// ─── Ideal body weight (Devine formula) ──────────────────────────────────────

export function idealBodyWeight(heightCm: number, sex: Sex): number {
  const inchesOver5ft = (heightCm / 2.54) - 60;
  const base = sex === "male" ? 50 : 45.5;
  return Math.round((base + 2.3 * Math.max(0, inchesOver5ft)) * 10) / 10;
}

// ─── Body fat % estimate (US Navy method approximation without measurements) ─

/** Rough BF% from BMI — use only for display, not medical decisions */
export function estimateBodyFat(bmi: number, age: number, sex: Sex): number {
  // Deurenberg formula
  const bf = (1.2 * bmi) + (0.23 * age) - (10.8 * (sex === "male" ? 1 : 0)) - 5.4;
  return Math.round(Math.max(5, bf) * 10) / 10;
}
