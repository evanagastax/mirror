import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "../utils/offlineCache";

const BASE_URL = "https://oss.exercisedb.dev/api/v1";

// ─── types ────────────────────────────────────────────────────────────────────

export type Exercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
};

export type ExerciseListResponse = {
  success: boolean;
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
  };
  data: Exercise[];
};

export type ExerciseFilters = {
  name?: string;
  bodyPart?: string;
  limit?: number;
  cursor?: string;
};

// ─── body part constants ──────────────────────────────────────────────────────

export const BODY_PARTS = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

// ─── network fetch (no cache) ─────────────────────────────────────────────────

async function networkFetchExercises(
  filters: ExerciseFilters
): Promise<ExerciseListResponse> {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.bodyPart) params.set("bodyPart", filters.bodyPart);
  params.set("limit", String(filters.limit ?? 20));
  if (filters.cursor) params.set("cursor", filters.cursor);

  const res = await fetch(`${BASE_URL}/exercises?${params.toString()}`);
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json() as Promise<ExerciseListResponse>;
}

// ─── cached page fetch ────────────────────────────────────────────────────────

/**
 * Fetch a single page of exercises.
 *
 * Strategy:
 *  1. Return cached page immediately if within TTL.
 *  2. On cache miss, fetch from network, cache the result, return it.
 *  3. On network failure with a stale cached page, return stale + fromCache=true.
 *
 * Returns { data: ExerciseListResponse, fromCache: boolean }
 */
export async function fetchExercises(
  filters: ExerciseFilters = {}
): Promise<ExerciseListResponse & { fromCache: boolean }> {
  const key = CACHE_KEYS.exercisePage(
    filters.cursor ?? "first",
    filters.bodyPart ?? "all",
    filters.name ?? ""
  );

  // 1. Fresh cache hit
  const cached = await cacheGet<ExerciseListResponse>(key, TTL.EXERCISE_LIST);
  if (cached) return { ...cached, fromCache: false };

  // 2. Try network
  try {
    const fresh = await networkFetchExercises(filters);
    await cacheSet(key, fresh);

    // Kick off a background prefetch of the full library (unfiltered, all pages)
    // so the user has everything available offline after their first browse.
    if (!filters.name && !filters.bodyPart && !filters.cursor) {
      prefetchAllExercises().catch(() => {/* background — ignore errors */});
    }

    return { ...fresh, fromCache: false };
  } catch {
    // 3. Network failed — try stale cache (any age)
    const stale = await cacheGet<ExerciseListResponse>(key, Infinity);
    if (stale) return { ...stale, fromCache: true };
    throw new Error("No internet connection and no cached data available.");
  }
}

// ─── single exercise detail ───────────────────────────────────────────────────

export async function fetchExerciseById(
  id: string
): Promise<Exercise> {
  // Individual exercises are embedded in the list pages so we scan the
  // full-library cache first before making a network request.
  const allCached = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
  if (allCached) {
    const found = allCached.find((e) => e.exerciseId === id);
    if (found) return found;
  }

  const res = await fetch(`${BASE_URL}/exercises/${id}`);
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  const json = (await res.json()) as { success: boolean; data: Exercise };
  return json.data;
}

// ─── background full-library prefetch ────────────────────────────────────────

/**
 * Fetches the ENTIRE exercise library in a single request (limit=2000).
 * Stores a flat deduplicated array to CACHE_KEYS.exerciseAll() for instant
 * client-side filtering by bodyPart, name, or equipment.
 *
 * Called in the background after any exercise-related screen loads.
 * Safe to call multiple times — exits early if the cache is still fresh.
 */
export async function prefetchAllExercises(): Promise<void> {
  // Skip if the full-library snapshot is still fresh
  const existing = await cacheGet<Exercise[]>(
    CACHE_KEYS.exerciseAll(),
    TTL.EXERCISE_LIST
  );
  if (existing) return;

  // Single large request — get everything at once
  const response = await networkFetchExercises({ limit: 2000 });

  // Deduplicate and store
  const seen = new Set<string>();
  const unique = response.data.filter((e) => {
    if (seen.has(e.exerciseId)) return false;
    seen.add(e.exerciseId);
    return true;
  });

  await cacheSet(CACHE_KEYS.exerciseAll(), unique);
}

// ─── body-part bulk fetch ──────────────────────────────────────────────────────

/**
 * Returns all exercises for a specific body part.
 * Priority:
 *  1. Filter from full-library cache (instant, no network)
 *  2. Trigger full-library fetch (limit=2000), then filter
 *  3. Stale cache fallback when offline
 */
export async function fetchAllByBodyPart(
  bodyPart: string
): Promise<{ data: Exercise[]; fromCache: boolean }> {
  function filterByPart(all: Exercise[]) {
    return all.filter((e) =>
      e.bodyParts.some((p) => p.toLowerCase() === bodyPart.toLowerCase())
    );
  }

  // 1. Full library already cached — filter and return immediately
  const allCached = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), TTL.EXERCISE_LIST);
  if (allCached) {
    return { data: filterByPart(allCached), fromCache: false };
  }

  // 2. Cache miss — fetch the full library in one shot, then filter
  try {
    await prefetchAllExercises();
    const fresh = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), TTL.EXERCISE_LIST);
    if (fresh) return { data: filterByPart(fresh), fromCache: false };
    throw new Error("Library fetch succeeded but cache write failed.");
  } catch {
    // 3. Offline fallback — stale full library
    const stale = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
    if (stale) return { data: filterByPart(stale), fromCache: true };
    throw new Error("No internet connection and no cached data available.");
  }
}



/**
 * Search the locally cached exercise list by name and/or body part.
 * Returns null if the full-library cache hasn't been built yet.
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
