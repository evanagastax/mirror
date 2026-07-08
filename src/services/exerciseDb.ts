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
 * Walks every cursor page of the unfiltered exercise list and stores
 * each page individually (so paginated browsing works offline) plus
 * writes a single flat array to CACHE_KEYS.exerciseAll() for quick
 * detail lookups.
 *
 * Called in the background after the first unfiltered page loads.
 * Safe to call multiple times — exits early if the full-library cache
 * is already fresh.
 */
export async function prefetchAllExercises(): Promise<void> {
  // Skip if the full-library snapshot is still fresh
  const existing = await cacheGet<Exercise[]>(
    CACHE_KEYS.exerciseAll(),
    TTL.EXERCISE_LIST
  );
  if (existing) return;

  const allExercises: Exercise[] = [];
  let cursor: string | undefined = undefined;
  let page = 0;
  const MAX_PAGES = 100; // safety cap — 1500 exercises / 20 per page = 75 pages

  while (page < MAX_PAGES) {
    const pageKey = CACHE_KEYS.exercisePage(cursor ?? "first", "all", "");

    // Re-use an already-cached page if available
    let pageData = await cacheGet<ExerciseListResponse>(pageKey, TTL.EXERCISE_LIST);
    if (!pageData) {
      pageData = await networkFetchExercises({ limit: 20, cursor });
      await cacheSet(pageKey, pageData);
    }

    allExercises.push(...pageData.data);

    if (!pageData.meta.hasNextPage || !pageData.meta.nextCursor) break;
    cursor = pageData.meta.nextCursor;
    page++;
  }

  // Deduplicate (cursor overlap) and store the flat list
  const seen = new Set<string>();
  const unique = allExercises.filter((e) => {
    if (seen.has(e.exerciseId)) return false;
    seen.add(e.exerciseId);
    return true;
  });

  await cacheSet(CACHE_KEYS.exerciseAll(), unique);
}

// ─── body-part bulk fetch ──────────────────────────────────────────────────────

/**
 * Fetch ALL exercises for a specific body part in a single request.
 * Uses a large limit so we get everything in one shot.
 * Result is cached per bodyPart for 7 days.
 *
 * Falls back to filtering the full-library cache if it exists.
 */
export async function fetchAllByBodyPart(
  bodyPart: string
): Promise<{ data: Exercise[]; fromCache: boolean }> {
  const cacheKey = `${CACHE_KEYS.exercisePage("all", bodyPart, "")}:bulk`;

  // 1. Check bodyPart-specific bulk cache
  const cached = await cacheGet<Exercise[]>(cacheKey, TTL.EXERCISE_LIST);
  if (cached) return { data: cached, fromCache: false };

  // 2. Check full-library cache (built by prefetchAllExercises)
  const allCached = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
  if (allCached) {
    const filtered = allCached.filter((e) =>
      e.bodyParts.some((p) => p.toLowerCase() === bodyPart.toLowerCase())
    );
    // Save as bodyPart cache too
    await cacheSet(cacheKey, filtered);
    return { data: filtered, fromCache: false };
  }

  // 3. Fetch from network with a large limit to get everything in one go
  try {
    const result = await networkFetchExercises({ bodyPart, limit: 400 });
    const filtered = result.data.filter((e) =>
      e.bodyParts.some((p) => p.toLowerCase() === bodyPart.toLowerCase())
    );
    await cacheSet(cacheKey, filtered);

    // Also trigger full-library prefetch in the background if not done yet
    prefetchAllExercises().catch(() => {});

    return { data: filtered, fromCache: false };
  } catch {
    // Network failed — check stale bodyPart cache
    const stale = await cacheGet<Exercise[]>(cacheKey, Infinity);
    if (stale) return { data: stale, fromCache: true };

    // Last resort: stale full library
    const staleAll = await cacheGet<Exercise[]>(CACHE_KEYS.exerciseAll(), Infinity);
    if (staleAll) {
      const filtered = staleAll.filter((e) =>
        e.bodyParts.some((p) => p.toLowerCase() === bodyPart.toLowerCase())
      );
      return { data: filtered, fromCache: true };
    }

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
