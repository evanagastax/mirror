import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { Log } from "../types";
import { qk } from "./queryKeys";
import { invalidateCore } from "./invalidate";

async function fetchLogs(userId: string, filters?: { from?: string; to?: string }): Promise<Log[]> {
  let query = supabase
    .from("logs")
    .select("id, pillar_type, value, evidence_url, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters?.from) query = query.gte("created_at", filters.from);
  if (filters?.to)   query = query.lte("created_at", filters.to);

  const { data, error } = await query;
  if (error) throw error;
  return data as Log[];
}

export function useLogs(userId: string | undefined, filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: qk.logs(userId as string, filters),
    queryFn: () => fetchLogs(userId as string, filters),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useDeleteLog(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("logs").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => invalidateCore(queryClient, userId),
  });
}
