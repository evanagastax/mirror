import { useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { syncGitHubToImpact } from "../services/githubSync";
import { supabase } from "../api/supabase";

const STORAGE_KEY = "github_config";

export function useGitHubSync(userId: string) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  async function getStoredConfig() {
    const { data } = await supabase
      .from("profiles")
      .select("privacy_settings")
      .eq("id", userId)
      .single();

    const settings = data?.privacy_settings ?? {};
    return settings.github_token && settings.github_username
      ? { token: settings.github_token, username: settings.github_username }
      : null;
  }

  async function saveConfig(token: string, username: string) {
    const { data } = await supabase
      .from("profiles")
      .select("privacy_settings")
      .eq("id", userId)
      .single();

    const updated = {
      ...(data?.privacy_settings ?? {}),
      github_token: token,
      github_username: username,
    };

    await supabase
      .from("profiles")
      .update({ privacy_settings: updated })
      .eq("id", userId);
  }

  async function sync() {
    setSyncing(true);
    try {
      let config = await getStoredConfig();

      if (!config) {
        // Prompt for credentials first time
        Alert.prompt(
          "GitHub username",
          "Enter your GitHub username",
          async (username) => {
            if (!username) { setSyncing(false); return; }
            Alert.prompt(
              "GitHub token",
              "Enter a Personal Access Token (read:user, repo scopes)",
              async (token) => {
                if (!token) { setSyncing(false); return; }
                await saveConfig(token, username);
                await runSync(userId, { token, username });
                setSyncing(false);
              },
              "secure-text"
            );
          }
        );
        return;
      }

      await runSync(userId, config);
    } catch (e: any) {
      Alert.alert("Sync failed", e.message ?? "Check your token and try again.");
    } finally {
      setSyncing(false);
    }
  }

  async function runSync(userId: string, config: { token: string; username: string }) {
    const result = await syncGitHubToImpact(userId, config);
    const count  = result.synced;
    queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
    queryClient.invalidateQueries({ queryKey: ["logs", userId] });

    if (count === 0) {
      Alert.alert("Up to date", "No new GitHub activity found.");
    } else {
      Alert.alert("Synced!", `${count} GitHub event${count > 1 ? "s" : ""} added to your Impact pillar.`);
    }
  }

  return { sync, syncing };
}
