import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { NewLog, NewTransaction } from "../types";
import { invalidateCore, invalidateLedger } from "./invalidate";

async function insertLog(payload: NewLog) {
  const { error } = await supabase.from("logs").insert(payload);
  if (error) throw error;
}

async function insertTransaction(payload: NewTransaction) {
  const { error } = await supabase.from("transactions").insert(payload);
  if (error) throw error;
}

export function useCreateLog(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<NewLog, "user_id">) =>
      insertLog({ ...payload, user_id: userId }),
    onSuccess: () => invalidateCore(queryClient, userId),
  });
}

export function useCreateTransaction(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<NewTransaction, "user_id">) =>
      insertTransaction({ ...payload, user_id: userId }),
    onSuccess: () => invalidateLedger(queryClient, userId),
  });
}
