import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";

export type NewLog = {
  user_id: string;
  pillar_type: "soul" | "vessel" | "impact";
  value: number;
  evidence_url?: string;
  metadata?: Record<string, unknown>;
};

export type NewTransaction = {
  user_id: string;
  amount: number;
  category: "investment" | "consumption" | "leak";
  note?: string;
};

async function insertLog(payload: NewLog) {
  const { error } = await supabase.from("logs").insert(payload);
  if (error) throw error;
}

async function insertTransaction(payload: NewTransaction) {
  const { error } = await supabase.from("transactions").insert(payload);
  if (error) throw error;
}

// Hook for soul / vessel / impact logs
export function useCreateLog(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<NewLog, "user_id">) =>
      insertLog({ ...payload, user_id: userId }),
    onSuccess: () => {
      // Pillars will update via realtime, but invalidate as a safety net
      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
    },
  });
}

// Hook for stewardship transactions
export function useCreateTransaction(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<NewTransaction, "user_id">) =>
      insertTransaction({ ...payload, user_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
    },
  });
}
