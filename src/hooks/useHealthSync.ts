import { useState } from "react";
import { Platform, Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { requestHealthPermissions, syncWorkoutsToVessel } from "../services/healthConnect";

export function useHealthSync(userId: string) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const isSupported = Platform.OS === "android";

  async function sync() {
    if (!isSupported) {
      Alert.alert("Not supported", "Health Connect is only available on Android.");
      return;
    }

    setSyncing(true);
    try {
      const permitted = await requestHealthPermissions();
      if (!permitted) {
        Alert.alert(
          "Permission needed",
          "Open Health Connect on your phone and grant The Mirror access to Exercise Sessions."
        );
        setSyncing(false);
        return;
      }

      const count = await syncWorkoutsToVessel(userId);

      // Refresh pillars and logs after sync
      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });

      if (count === 0) {
        Alert.alert("Up to date", "No new workouts found in the last 7 days.");
      } else {
        Alert.alert("Synced!", `${count} workout${count > 1 ? "s" : ""} added to your Vessel pillar.`);
      }
    } catch (e) {
      Alert.alert("Sync failed", "Something went wrong. Try again.");
    } finally {
      setSyncing(false);
    }
  }

  return { sync, syncing, isSupported };
}
