import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { Transaction, LedgerSummary } from "../types";
import { qk } from "./queryKeys";
import { invalidateLedger } from "./invalidate";

async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount, category, note, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}

export function useLedger(userId: string | undefined) {
  return useQuery({
    queryKey: qk.ledger(userId as string),
    queryFn: () => fetchTransactions(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useDeleteTransaction(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => invalidateLedger(queryClient, userId),
  });
}

export function summarizeLedger(transactions: Transaction[]): LedgerSummary {
  const totalInvestment = transactions
    .filter((t) => t.category === "investment")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalConsumption = transactions
    .filter((t) => t.category === "consumption")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLeak = transactions
    .filter((t) => t.category === "leak")
    .reduce((sum, t) => sum + t.amount, 0);

  const netScore = totalInvestment - totalLeak;

  return { totalInvestment, totalConsumption, totalLeak, netScore };
}
