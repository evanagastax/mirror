import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase";

export type Log = {
  id: string;
  pillar_type: "soul" | "vessel" | "impact";
  value: number;
  evidence_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

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
    queryKey: ["logs", userId],
    queryFn: () => fetchLogs(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}
