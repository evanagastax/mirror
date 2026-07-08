/**
 * Vessel Fitness Profile — AsyncStorage persistence.
 *
 * Stores: body stats (weight, height, age, sex),
 *         fitness goal, available equipment,
 *         training days per week.
 *
 * Key: vessel_profile_<userId>
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type Sex = "male" | "female";

export type FitnessGoal =
  | "fat_loss"
  | "muscle_gain"
  | "maintenance"
  | "endurance";

export const GOAL_META: Record<FitnessGoal, { label: string; icon: string; desc: string }> = {
  fat_loss:    { label: "Fat Loss",     icon: "🔥", desc: "Burn calories, preserve muscle" },
  muscle_gain: { label: "Muscle Gain",  icon: "💪", desc: "Build strength and size" },
  maintenance: { label: "Maintenance",  icon: "⚖️",  desc: "Stay fit, maintain current physique" },
  endurance:   { label: "Endurance",    icon: "🫀", desc: "Improve cardio and stamina" },
};

// Equipment available to the user — subset used to filter exercises
export type EquipmentKey =
  | "body_weight"
  | "dumbbell"
  | "barbell"
  | "cable"
  | "machine"
  | "resistance_band"
  | "kettlebell"
  | "ez_barbell";

export const EQUIPMENT_META: Record<EquipmentKey, { label: string; icon: string; apiValue: string }> = {
  body_weight:     { label: "Bodyweight",       icon: "🤸", apiValue: "body weight" },
  dumbbell:        { label: "Dumbbell",         icon: "🏋️", apiValue: "dumbbell" },
  barbell:         { label: "Barbell",          icon: "🏋️", apiValue: "barbell" },
  cable:           { label: "Cable Machine",    icon: "🔗", apiValue: "cable" },
  machine:         { label: "Machine",          icon: "⚙️",  apiValue: "machine" },
  resistance_band: { label: "Resistance Band",  icon: "🎗️", apiValue: "band" },
  kettlebell:      { label: "Kettlebell",       icon: "🔔", apiValue: "kettlebell" },
  ez_barbell:      { label: "EZ-Bar",           icon: "〰️", apiValue: "ez barbell" },
};

export type VesselProfile = {
  /** kg */
  weight: number;
  /** cm */
  height: number;
  /** years */
  age: number;
  sex: Sex;
  goal: FitnessGoal;
  /** days per week: 2–6 */
  daysPerWeek: number;
  /** which equipment the user has access to */
  equipment: EquipmentKey[];
  createdAt: string;
  updatedAt: string;
};

function storageKey(userId: string) {
  return `vessel_profile_${userId}`;
}

export async function loadProfile(userId: string): Promise<VesselProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as VesselProfile) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(userId: string, profile: VesselProfile): Promise<void> {
  const updated = { ...profile, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(updated));
}

export async function deleteProfile(userId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}
