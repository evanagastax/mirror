import React from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useLogs } from "../hooks/useLogs";
import { usePillars } from "../hooks/usePillars";
import { scoreToLevel } from "../utils/pillarLevel";

const COLOR = "#378ADD";
const BG = "#F0F7FE";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ImpactScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { data: logs, isLoading, isError, refetch, isRefetching } = useLogs(userId);
  const { data: pillars } = usePillars(userId);

  const impactLogs = (logs ?? []).filter((l) => l.pillar_type === "impact");
  const { level, xp, xpMax } = scoreToLevel(pillars?.impact ?? 0);
  const barPct = xp / xpMax;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLOR} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Impact</Text>
        <Pressable onPress={() => router.push("/log/new")} style={styles.logBtn}>
          <Text style={styles.logBtnText}>+ Log</Text>
        </Pressable>
      </View>

      {/* Stat block */}
      <View style={styles.statCard}>
        <View style={styles.statTop}>
          <View>
            <Text style={styles.statLabel}>IMPACT SCORE</Text>
            <Text style={styles.statValue}>{pillars?.impact ?? "—"}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LVL</Text>
            <Text style={[styles.levelNum, { color: COLOR }]}>{level}</Text>
          </View>
        </View>
        {/* XP bar */}
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${barPct * 100}%` as any, backgroundColor: COLOR }]} />
        </View>
        <Text style={styles.xpText}>{xp} / {xpMax} XP to next level</Text>
      </View>

      {/* Quick actions */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={() => router.push("/(app)/roadmap")}>
          <Text style={styles.actionIcon}>◈</Text>
          <Text style={styles.actionLabel}>Roadmap</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push("/github-sync")}>
          <Text style={styles.actionIcon}>⟳</Text>
          <Text style={styles.actionLabel}>Sync GitHub</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>

      {/* Recent logs */}
      <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={COLOR} /></View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Couldn't load logs.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : impactLogs.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No impact logs yet.</Text>
          <Text style={styles.emptySub}>Log a PR, shipped feature, or completed task.</Text>
        </View>
      ) : (
        <View style={styles.logList}>
          {impactLogs.slice(0, 20).map((log) => {
            const meta = log.metadata as any;
            const title = meta?.description || "Impact activity";
            const effort = log.value;
            return (
              <View key={log.id} style={styles.logRow}>
                <View style={[styles.logDot, { backgroundColor: BG }]}>
                  <Text style={{ fontSize: 14, color: COLOR }}>◈</Text>
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.logSub}>{formatDate(log.created_at)}</Text>
                </View>
                <View style={[styles.effortBadge, { backgroundColor: BG }]}>
                  <Text style={[styles.effortText, { color: COLOR }]}>{effort}/10</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  center: { paddingVertical: 32, alignItems: "center" },
  errorText: { color: "#666", marginBottom: 8 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: "#333", borderRadius: 8 },
  retryText: { fontSize: 13, color: "#aaa" },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  back: { fontSize: 15, color: "#555" },
  title: { flex: 1, fontSize: 20, fontWeight: "700", color: "#fff" },
  logBtn: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  logBtnText: { fontSize: 13, color: "#aaa", fontWeight: "500" },

  statCard: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 16, padding: 18, marginBottom: 16, gap: 10 },
  statTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  statLabel: { fontSize: 10, color: "#555", fontWeight: "700", letterSpacing: 1.5 },
  statValue: { fontSize: 44, fontWeight: "800", color: "#fff", letterSpacing: -1, marginTop: 2 },
  levelBadge: { alignItems: "center" },
  levelLabel: { fontSize: 9, color: "#555", fontWeight: "700", letterSpacing: 1 },
  levelNum: { fontSize: 28, fontWeight: "800" },
  xpTrack: { height: 5, backgroundColor: "#2a2a2a", borderRadius: 99, overflow: "hidden" },
  xpFill: { height: 5, borderRadius: 99 },
  xpText: { fontSize: 11, color: "#555" },

  actionRow: { gap: 8, marginBottom: 24 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 12, padding: 14 },
  actionIcon: { fontSize: 18, color: COLOR },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: "#ccc" },
  actionArrow: { fontSize: 18, color: "#444" },

  sectionLabel: { fontSize: 10, color: "#444", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },

  emptyWrap: { paddingVertical: 32, alignItems: "center", gap: 6 },
  emptyText: { fontSize: 15, color: "#555", fontWeight: "500" },
  emptySub: { fontSize: 12, color: "#444", textAlign: "center" },

  logList: { gap: 8 },
  logRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 12, padding: 12 },
  logDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  logInfo: { flex: 1 },
  logTitle: { fontSize: 14, fontWeight: "500", color: "#ddd" },
  logSub: { fontSize: 11, color: "#555", marginTop: 2 },
  effortBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  effortText: { fontSize: 12, fontWeight: "700" },
});
