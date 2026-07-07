import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchExercises,
  fetchExerciseById,
  searchCachedExercises,
  ExerciseFilters,
} from "../services/exerciseDb";

/**
 * Infinite-scroll hook for browsing exercises.
 * Supports optional name search and body-part filter.
 *
 * The underlying fetchExercises() is cache-first:
 *  - Each page is cached for 7 days in AsyncStorage.
 *  - On first unfiltered load the full library is prefetched in the background.
 *  - When offline, stale cached pages are served and fromCache=true is set on
 *    the page data so the screen can show an offline badge.
 */
export function useExercises(filters: Omit<ExerciseFilters, "cursor"> = {}) {
  return useInfiniteQuery({
    queryKey: ["exercises", filters],
    queryFn: ({ pageParam }) =>
      fetchExercises({
        ...filters,
        limit: 20,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? (lastPage.meta.nextCursor ?? undefined) : undefined,
    // TanStack Query will retry from its own in-memory cache while AsyncStorage
    // handles the persistent offline layer — keep staleTime short so refetches
    // happen when online, but the AsyncStorage cache prevents network round-trips.
    staleTime: 1000 * 60 * 5,
    // Keep fetching even when there is no network connection — our service layer
    // handles the offline fallback itself.
    networkMode: "always",
  });
}

/**
 * Single exercise detail (for the log modal).
 * Resolves from the full-library AsyncStorage cache before hitting the network.
 */
export function useExercise(id: string | null) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => fetchExerciseById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    networkMode: "always",
  });
}

/**
 * Offline-only search through the locally cached exercise library.
 * Returns null while the full library hasn't been prefetched yet.
 * Useful for a "cached search" fallback when the device is offline.
 */
export function useCachedExerciseSearch(opts: {
  name?: string;
  bodyPart?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["exercises:cached", opts.name, opts.bodyPart],
    queryFn: () => searchCachedExercises({ name: opts.name, bodyPart: opts.bodyPart }),
    enabled: opts.enabled !== false,
    staleTime: Infinity, // cached data never goes stale inside TanStack Query
    networkMode: "always",
  });
}
