import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { Pillars } from "../types";
import { qk } from "./queryKeys";

async function fetchPillars(userId: string): Promise<Pillars> {
  const { data, error } = await supabase
    .from("pillars")
    .select("soul, vessel, impact, stewardship, updated_at")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as Pillars;
}

export function usePillars(userId: string | undefined) {
  return useQuery({
    queryKey: qk.pillars(userId as string),
    queryFn: () => fetchPillars(userId as string),
    enabled: !!userId,
    staleTime: 60_000,
  });
}
