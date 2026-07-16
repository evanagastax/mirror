import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";
import type { Goal, GoalStatus } from "../types";
import { qk } from "./queryKeys";

export type { Goal, GoalStatus };

async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("id, pillar_type, title, is_done, status, sort_order, created_at")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((g) => ({
    ...g,
    pillar_type: g.pillar_type as Goal["pillar_type"],
    status: ((g as Record<string, unknown>).status ?? (g.is_done ? "done" : "todo")) as GoalStatus,
  }));
}

export function useGoals(userId: string | undefined) {
  return useQuery({
    queryKey: qk.goals(userId as string),
    queryFn: () => fetchGoals(userId as string),
    enabled: !!userId,
  });
}

export function useAddGoal(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pillar_type,
      title,
    }: {
      pillar_type: Goal["pillar_type"];
      title: string;
    }) => {
      const { error } = await supabase
        .from("goals")
        .insert({ user_id: userId, pillar_type, title, status: "todo" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.goals(userId) }),
  });
}

export function useUpdateGoalStatus(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GoalStatus }) => {
      const { error } = await supabase
        .from("goals")
        .update({ status, is_done: status === "done" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.goals(userId) }),
  });
}

export function useDeleteGoal(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.goals(userId) }),
  });
}
