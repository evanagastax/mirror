import { Share } from "react-native";
import { supabase } from "../api/supabase";

type ExportData = {
  exported_at: string;
  pillars: Record<string, unknown> | null;
  logs: unknown[];
  transactions: unknown[];
  goals: unknown[];
};

export async function exportUserData(userId: string): Promise<void> {
  const [pillarsRes, logsRes, txRes, goalsRes] = await Promise.all([
    supabase.from("pillars").select("*").eq("user_id", userId).single(),
    supabase.from("logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  const data: ExportData = {
    exported_at: new Date().toISOString(),
    pillars: pillarsRes.data ?? null,
    logs: logsRes.data ?? [],
    transactions: txRes.data ?? [],
    goals: goalsRes.data ?? [],
  };

  const json = JSON.stringify(data, null, 2);
  const fileName = `the-mirror-export-${new Date().toISOString().slice(0, 10)}.json`;

  await Share.share({
    message: json,
    title: fileName,
  });
}
