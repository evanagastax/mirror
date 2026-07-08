import { useQuery } from "@tanstack/react-query";
import { supabase } from "../api/supabase";

export type StreakResult = {
  current: number;   // current consecutive day streak
  longest: number;   // all-time longest streak
  lastLogDate: string | null;
  loggedToday: boolean;
};

async function fetchStreak(userId: string): Promise<StreakResult> {
  const { data, error } = await supabase
    .from("logs")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) {
    return { current: 0, longest: 0, lastLogDate: null, loggedToday: false };
  }

  // Collect unique calendar dates (local timezone)
  const dates = Array.from(
    new Set(data.map((l) => new Date(l.created_at).toLocaleDateString("en-CA")))
  ).sort((a, b) => b.localeCompare(a)); // descending

  const today     = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");

  // Current streak — must start from today or yesterday to be active
  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    let prev = dates[0];
    current  = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(prev);
      const curDate  = new Date(dates[i]);
      const diff     = (prevDate.getTime() - curDate.getTime()) / 86400000;
      if (diff === 1) { current++; prev = dates[i]; }
      else break;
    }
  }

  // Longest streak — scan all dates
  let longest = 1;
  let run     = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const curDate  = new Date(dates[i]);
    const diff     = (prevDate.getTime() - curDate.getTime()) / 86400000;
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
    queryKey: ["streak", userId],
    queryFn:  () => fetchStreak(userId!),
    enabled:  !!userId,
    staleTime: 60_000,
  });
}
