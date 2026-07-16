import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { Log } from "../types";
import { qk } from "./queryKeys";
import { invalidateCore } from "./invalidate";

async function fetchLogs(userId: string): Promise<Log[]> {
  const { data, error } = await supabase
    .from("logs")
    .select("id, pillar_type, value, evidence_url, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Log[];
}

export function useLogs(userId: string | undefined) {
  return useQuery({
    queryKey: qk.logs(userId as string),
    queryFn: () => fetchLogs(userId as string),
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
