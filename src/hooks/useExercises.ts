import { useQuery } from "@tanstack/react-query";
import {
  fetchAllByBodyPart,
  fetchExerciseById,
  searchCachedExercises,
  prefetchAllExercises,
  fetchExercises,
  ExerciseFilters,
} from "../services/exerciseDb";

/**
 * Loads ALL exercises for a specific body part.
 * The full library is fetched once and cached; subsequent calls filter locally.
 */
export function useBodyPartExercises(bodyPart: string) {
  return useQuery({
    queryKey: ["exercises:bodyPart", bodyPart],
    queryFn:  () => fetchAllByBodyPart(bodyPart),
    staleTime: 1000 * 60 * 60 * 24, // 24h
    networkMode: "always",
    enabled: !!bodyPart,
  });
}

/**
 * Single exercise detail — resolves from cache.
 */
export function useExercise(id: string | null) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn:  () => fetchExerciseById(id!),
    enabled: !!id,
    staleTime: Infinity,
    networkMode: "always",
  });
}

/**
 * Offline-only search through the locally cached exercise library.
 */
export function useCachedExerciseSearch(opts: {
  name?: string;
  bodyPart?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["exercises:cached", opts.name, opts.bodyPart],
    queryFn:  () => searchCachedExercises({ name: opts.name, bodyPart: opts.bodyPart }),
    enabled: opts.enabled !== false,
    staleTime: Infinity,
    networkMode: "always",
  });
}

/**
 * Legacy paginated hook — kept for compatibility with any remaining paginated call sites.
 * Now returns the full filtered list in one shot (no real pagination needed).
 */
export function useExercises(filters: Omit<ExerciseFilters, "cursor"> = {}) {
  return useQuery({
    queryKey: ["exercises", filters],
    queryFn:  () => fetchExercises(filters),
    staleTime: 1000 * 60 * 60 * 24,
    networkMode: "always",
  });
}
