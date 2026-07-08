/**
 * Exercise database — backed by the free-exercise-db dataset.
 * Source: https://github.com/yuhonas/free-exercise-db
 *
 * Strategy:
 *  - Fetch the full 873-exercise JSON once (single ~500KB request).
 *  - Cache in AsyncStorage for 7 days.
 *  - All filtering (bodyPart, equipment, name search) is 100% client-side.
 *  - No pagination needed — the whole library fits in memory easily.
 */

import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "../utils/offlineCache";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of raw records from the free-exercise-db JSON */
type RawExercise = {
  id: string;
  name: string;
  category: string;                 // e.g. "strength", "cardio"
  primaryMuscles: string[];         // e.g. ["chest", "triceps"]
  secondaryMuscles: string[];
  equipment: string;                // single string e.g. "barbell"
  instructions: string[];
  images: string[];                 // relative paths e.g. "Bench_Press/0.jpg"
  force: string | null;
  level: string;
  mechanic: string | null;
};

/** Normalised exercise shape used throughout the app */
export type Exercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;                   // first image URL (static JPEG)
  images: string[];                 // all image URLs
  bodyParts: string[];              // mapped from primaryMuscles → our BODY_PARTS keys
  targetMuscles: string[];          // original primaryMuscles values
  secondaryMuscles: string[];
  equipments: string[];             // normalised equipment array
  instructions: string[];
  level: string;
  category: string;
};

export type ExerciseFilters = {
  name?: string;
  bodyPart?: string;
  equipment?: string;
  limit?: number;
  cursor?: string;
};

// ─── Body part constants ──────────────────────────────────────────────────────
// These are the actual filter keys used in the menu.
// Muscle-based keys match primaryMuscles values directly.
// "cardio" is special — filters by category === "cardio".

export const BODY_PARTS = [
  "chest",
  "shoulders",
  "triceps",
  "biceps",
  "forearms",
  "lats",
  "middle back",
  "lower back",
  "traps",
  "abdominals",
  "quadriceps",
  "hamstrings",
  "glutes",
  "adductors",
  "calves",
  "neck",
  "cardio",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

// ─── Normalise raw → Exercise ─────────────────────────────────────────────────

function normalise(raw: RawExercise): Exercise {
  // bodyParts = primaryMuscles as-is, plus "cardio" for cardio category exercises
  const bodyParts = raw.category === "cardio"
    ? [...new Set([...raw.primaryMuscles, "cardio"])]
    : raw.primaryMuscles;

  const imageUrls = raw.images.map((p) => IMG_BASE + p);

  return {
    exerciseId:       raw.id,
    name:             raw.name,
    gifUrl:           imageUrls[0] ?? "",
    images:           imageUrls,
    bodyParts,
    targetMuscles:    raw.primaryMuscles,
    secondaryMuscles: raw.secondaryMuscles,
    equipments:       raw.equipment ? [raw.equipment] : [],
    instructions:     raw.instructions,
    level:            raw.level,
    category:         raw.category,
  };
}

// ─── Full-library fetch & cache ───────────────────────────────────────────────

/**
 * Loads the full exercise library.
 * Returns immediately from cache if available.
 * Falls back to stale cache when offline.
 */
export async function prefetchAllExercises(): Promise<void> {
  const existing = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), TTL.EXERCISE_LIST);
  if (existing) return; // still fresh

  const res = await fetch(DB_URL);
  if (!res.ok) throw new Error(`Exercise DB fetch failed: ${res.status}`);

  const raw: RawExercise[] = await res.json();
  const exercises = raw.map(normalise);
  await cacheSet(CACHE_KEYS.exerciseAll(), exercises);
}

async function getAllExercises(): Promise<{ data: Exercise[]; fromCache: boolean }> {
  // 1. Fresh cache
  const fresh = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), TTL.EXERCISE_LIST);
  if (fresh) return { data: fresh, fromCache: false };

  // 2. Fetch
  try {
    const res = await fetch(DB_URL);
    if (!res.ok) throw new Error(`${res.status}`);
    const raw: RawExercise[] = await res.json();
    const exercises = raw.map(normalise);
    await cacheSet(CACHE_KEYS.exerciseAll(), exercises);
    return { data: exercises, fromCache: false };
  } catch {
    // 3. Stale fallback
    const stale = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
    if (stale) return { data: stale, fromCache: true };
    throw new Error("No internet connection and no cached exercise data.");
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all exercises for a specific body part.
 * Loads the full library first if not yet cached.
 */
export async function fetchAllByBodyPart(
  bodyPart: string
): Promise<{ data: Exercise[]; fromCache: boolean }> {
  const { data: all, fromCache } = await getAllExercises();
  const filtered = all.filter((e) =>
    e.bodyParts.some((p) => p.toLowerCase() === bodyPart.toLowerCase())
  );
  return { data: filtered, fromCache };
}

/**
 * Search exercises by name and/or bodyPart.
 * Returns null if library is not yet loaded.
 */
export async function searchCachedExercises(opts: {
  name?: string;
  bodyPart?: string;
}): Promise<Exercise[] | null> {
  const all = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
  if (!all) return null;

  return all.filter((e) => {
    const nameMatch = opts.name
      ? e.name.toLowerCase().includes(opts.name.toLowerCase())
      : true;
    const partMatch = opts.bodyPart
      ? e.bodyParts.some((p) => p.toLowerCase() === opts.bodyPart!.toLowerCase())
      : true;
    return nameMatch && partMatch;
  });
}

/**
 * Get a single exercise by ID from cache.
 */
export async function fetchExerciseById(id: string): Promise<Exercise> {
  const all = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
  if (all) {
    const found = all.find((e) => e.exerciseId === id);
    if (found) return found;
  }
  throw new Error(`Exercise ${id} not found. Open Vessel to load the library.`);
}

/**
 * Legacy compat — returns first page of exercises from cache or triggers fetch.
 * Only used by the paginated search path in useExercises.
 */
export async function fetchExercises(
  filters: ExerciseFilters = {}
): Promise<{ data: Exercise[]; meta: { total: number; hasNextPage: boolean; hasPreviousPage: boolean; nextCursor: string | null }; fromCache: boolean }> {
  const { data: all, fromCache } = await getAllExercises();

  let filtered = all;
  if (filters.bodyPart) {
    filtered = filtered.filter((e) =>
      e.bodyParts.some((p) => p.toLowerCase() === filters.bodyPart!.toLowerCase())
    );
  }
  if (filters.name) {
    const q = filters.name.toLowerCase();
    filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
  }
  if (filters.equipment) {
    const eq = filters.equipment.toLowerCase();
    filtered = filtered.filter((e) =>
      e.equipments.some((eq2) => eq2.toLowerCase() === eq)
    );
  }

  return {
    data: filtered,
    meta: { total: filtered.length, hasNextPage: false, hasPreviousPage: false, nextCursor: null },
    fromCache,
  };
}
