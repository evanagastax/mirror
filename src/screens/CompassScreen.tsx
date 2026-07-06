import React from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { usePillars } from "../hooks/usePillars";
import { CompassRing } from "../components/Compass/CompassRing";
import { PillarStatCard } from "../components/Compass/PillarStatCard";
import { useAuthStore } from "../store/authStore";
import { useHealthSync } from "../hooks/useHealthSync";

const PILLAR_META = [
  { key: "soul" as const,        label: "Soul",        color: "#1D9E75" },
  { key: "vessel" as const,      label: "Vessel",      color: "#D85A30" },
  { key: "impact" as const,      label: "Impact",      color: "#378ADD" },
  { key: "stewardship" as const, label: "Stewardship", color: "#BA7517" },
];

export default function CompassScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { data: pillars, isLoading, isError, refetch } = usePillars(userId);
  const { sync: syncHealth, syncing: syncingHealth, isSupported } = useHealthSync(userId!);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color="#111" /></View>;
  }

  if (isError || !pillars) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn't load your compass.</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.name}>Made</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
      </View>

      <View style={styles.ringWrap}>
        <CompassRing
          soul={pillars.soul}
          vessel={pillars.vessel}
          impact={pillars.impact}
          stewardship={pillars.stewardship}
        />
      </View>

      {/* Pillar cards — tappable */}
      <View style={styles.grid}>
        {PILLAR_META.map((meta) => (
          <Pressable
            key={meta.key}
            style={styles.gridItem}
            onPress={() => meta.key === "soul" ? router.push("/soul") : null}
          >
            <PillarStatCard
              label={meta.label}
              value={pillars[meta.key]}
              accentColor={meta.color}
            />
            {meta.key === "soul" && (
              <Text style={styles.pillarHint}>Tap to read Qur'an →</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.push("/log/new")} style={styles.logBtn}>
        <Text style={styles.logBtnText}>+ Log an activity</Text>
      </Pressable>

      <View style={styles.syncRow}>
        <Pressable
          onPress={() => router.push("/github-sync")}
          style={[styles.syncBtn, { backgroundColor: "#F0F7FE" }]}
        >
          <Text style={[styles.syncBtnText, { color: "#378ADD" }]}>⟳ Sync GitHub</Text>
        </Pressable>

        {isSupported && (
          <Pressable
            onPress={syncHealth}
            disabled={syncingHealth}
            style={[styles.syncBtn, { backgroundColor: "#FEF3EE" }, syncingHealth && { opacity: 0.5 }]}
          >
            {syncingHealth
              ? <ActivityIndicator color="#D85A30" size="small" />
              : <Text style={[styles.syncBtnText, { color: "#D85A30" }]}>⟳ Sync workouts</Text>
            }
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  errorText: { color: "#aaa", marginBottom: 12, fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8 },
  retryText: { fontSize: 14, color: "#111" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 13, color: "#aaa" },
  name: { fontSize: 18, fontWeight: "600", color: "#111", marginTop: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontWeight: "600", color: "#555" },
  ringWrap: { alignItems: "center", marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  gridItem: { width: "48%" },
  pillarHint: { fontSize: 11, color: "#1D9E75", marginTop: 4, textAlign: "center" },
  logBtn: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 10 },
  logBtnText: { fontSize: 15, fontWeight: "500", color: "#111" },
  syncRow: { flexDirection: "row", gap: 10 },
  syncBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  syncBtnText: { fontSize: 13, fontWeight: "500" },
});
