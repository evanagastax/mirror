import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase";

export type Transaction = {
  id: string;
  amount: number;
  category: "investment" | "consumption" | "leak";
  note: string | null;
  created_at: string;
};

export type LedgerSummary = {
  totalInvestment: number;
  totalConsumption: number;
  totalLeak: number;
  netScore: number;
};

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
    queryKey: ["ledger", userId],
    queryFn: () => fetchTransactions(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 30,
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
