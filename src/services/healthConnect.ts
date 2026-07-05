import { Platform } from "react-native";
import { supabase } from "../api/supabase";

/**
 * Health Connect is Android-only and requires a native build.
 * This service will silently no-op on iOS or web.
 */

type ExerciseSession = {
  startTime: string;
  endTime: string;
  exerciseType: number;
  title?: string;
  totalVolume?: number;
};

// Dynamically import to avoid crashing on web/iOS
async function getHealthConnect() {
  if (Platform.OS !== "android") return null;
  try {
    return await import("react-native-health-connect");
  } catch {
    return null;
  }
}

export async function requestHealthPermissions(): Promise<boolean> {
  const hc = await getHealthConnect();
  if (!hc) return false;

  try {
    const isAvailable = await hc.isAvailable();
    if (!isAvailable) return false;

    await hc.initialize();

    const granted = await hc.requestPermission([
      { accessType: "read", recordType: "ExerciseSession" },
      { accessType: "read", recordType: "TotalCaloriesBurned" },
      { accessType: "read", recordType: "ActiveCaloriesBurned" },
    ]);

    return granted.every((g: any) => g.granted);
  } catch (e) {
    console.warn("Health Connect permission error:", e);
    return false;
  }
}

export async function syncWorkoutsToVessel(userId: string): Promise<number> {
  const hc = await getHealthConnect();
  if (!hc) return 0;

  try {
    await hc.initialize();

    // Fetch workouts from the last 7 days
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { records } = await hc.readRecords("ExerciseSession", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    if (!records || records.length === 0) return 0;

    // Check which sessions we've already synced (by evidence_url storing the session id)
    const { data: existing } = await supabase
      .from("logs")
      .select("evidence_url")
      .eq("user_id", userId)
      .eq("pillar_type", "vessel")
      .not("evidence_url", "is", null);

    const syncedIds = new Set((existing ?? []).map((l: any) => l.evidence_url));

    let synced = 0;

    for (const session of records) {
      const sessionId = `hc:${session.metadata?.id ?? session.startTime}`;

      // Skip already-synced sessions
      if (syncedIds.has(sessionId)) continue;

      // Calculate duration in minutes
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      const durationMinutes = Math.round((end - start) / 60000);

      // Use duration as the value (minutes active)
      // You can swap this for volume if you pull weight/rep data separately
      const value = Math.max(1, durationMinutes);

      const { error } = await supabase.from("logs").insert({
        user_id: userId,
        pillar_type: "vessel",
        value,
        evidence_url: sessionId,
        metadata: {
          source: "health_connect",
          exercise_type: session.title ?? "Workout",
          duration: durationMinutes,
          auto_synced: true,
        },
      });

      if (!error) synced++;
    }

    return synced;
  } catch (e) {
    console.warn("Health Connect sync error:", e);
    return 0;
  }
}
