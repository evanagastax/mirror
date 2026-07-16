import { useQuery } from "@tanstack/react-query";
import { fetchAllByBodyPart } from "../services/exerciseDb";

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
