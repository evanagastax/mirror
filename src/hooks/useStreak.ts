import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { StreakResult } from "../types";
import { qk } from "./queryKeys";
import { MS_PER_DAY } from "../utils/format";

async function fetchStreak(userId: string): Promise<StreakResult> {
  const since = new Date(Date.now() - 90 * MS_PER_DAY).toISOString();
  const [logsRes, txRes] = await Promise.all([
    supabase
      .from("logs")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    supabase
      .from("transactions")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
  ]);

  if (logsRes.error) throw logsRes.error;

  const allTimestamps = [
    ...(logsRes.data ?? []),
    ...(txRes.data ?? []),   // errors here are non-fatal — silently fall back
  ].map((r) => r.created_at);

  if (allTimestamps.length === 0) {
    return { current: 0, longest: 0, lastLogDate: null, loggedToday: false };
  }

  const dates = Array.from(
    new Set(allTimestamps.map((ts) => new Date(ts).toLocaleDateString("en-CA")))
  ).sort((a, b) => b.localeCompare(a));

  const today     = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - MS_PER_DAY).toLocaleDateString("en-CA");

  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    let prev = dates[0];
    current  = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(prev);
      const curDate  = new Date(dates[i]);
      const diff     = (prevDate.getTime() - curDate.getTime()) / MS_PER_DAY;
      if (diff === 1) { current++; prev = dates[i]; }
      else break;
    }
  }

  let longest = 1;
  let run     = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const curDate  = new Date(dates[i]);
    const diff     = (prevDate.getTime() - curDate.getTime()) / MS_PER_DAY;
    if (diff === 1) { run++; if (run > longest) longest = run; }
    else run = 1;
  }

  return {
    current,
    longest,
    lastLogDate: dates[0] ?? null,
    loggedToday: dates[0] === today,
  };
}

export function useStreak(userId: string | undefined) {
  return useQuery({
    queryKey: qk.streak(userId as string),
    queryFn:  () => fetchStreak(userId!),
    enabled:  !!userId,
    staleTime: 60_000,
  });
}
