import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase";

export type Pillars = {
  soul: number;
  vessel: number;
  impact: number;
  stewardship: number;
  updated_at: string;
};

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
    queryKey: ["pillars", userId],
    queryFn: () => fetchPillars(userId as string),
    enabled: !!userId,
    // Refetch every 10 seconds so rings update after logging
    refetchInterval: 10000,
    staleTime: 0,
  });
}
