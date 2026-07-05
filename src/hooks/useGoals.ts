import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase";

export type Goal = {
  id: string;
  pillar_type: "soul" | "vessel" | "impact" | "stewardship";
  title: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
};

async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("id, pillar_type, title, is_done, sort_order, created_at")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Goal[];
}

export function useGoals(userId: string | undefined) {
  return useQuery({
    queryKey: ["goals", userId],
    queryFn: () => fetchGoals(userId as string),
    enabled: !!userId,
  });
}

export function useAddGoal(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pillar_type, title }: { pillar_type: Goal["pillar_type"]; title: string }) => {
      const { error } = await supabase.from("goals").insert({ user_id: userId, pillar_type, title });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}

export function useToggleGoal(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await supabase.from("goals").update({ is_done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}

export function useDeleteGoal(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}
