import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl, Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLogs, Log } from "../hooks/useLogs";

type Filter = "all" | "soul" | "vessel" | "impact";

const PILLAR_META = {
  soul:   { color: "#1D9E75", bg: "#F0FBF7", icon: "✦", label: "Soul" },
  vessel: { color: "#D85A30", bg: "#FEF3EE", icon: "⬡", label: "Vessel" },
  impact: { color: "#378ADD", bg: "#F0F7FE", icon: "◈", label: "Impact" },
};

const FILTERS: Filter[] = ["all", "soul", "vessel", "impact"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function getLogTitle(log: Log): string {
  const meta = log.metadata as any;
  if (log.pillar_type === "soul" && meta?.activity) return meta.activity;
  if (log.pillar_type === "vessel" && meta?.exercise_type) return meta.exercise_type;
  if (log.pillar_type === "impact" && meta?.description) return meta.description;
  return PILLAR_META[log.pillar_type].label + " activity";
}

function getLogSubtitle(log: Log): string {
  const meta = log.metadata as any;
  if (log.pillar_type === "soul") return `${log.value} min`;
  if (log.pillar_type === "vessel") return `${log.value.toLocaleString()} kg volume${meta?.duration ? ` · ${meta.duration} min` : ""}`;
  if (log.pillar_type === "impact") return `Effort ${log.value}/10`;
  return `+${log.value}`;
}

function groupByDate(logs: Log[]): { date: string; logs: Log[] }[] {
  const groups: Record<string, Log[]> = {};
  for (const log of logs) {
    const date = formatDate(log.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  }
  return Object.entries(groups).map(([date, logs]) => ({ date, logs }));
}

export default function LogHistoryScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const colors = useThemeStore((s) => s.colors);
  const { data: logs, isLoading, isError, refetch, isRefetching } = useLogs(userId);
  const [filter, setFilter] = useState<Filter>("all");

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (isError || !logs) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>Couldn't load logs.</Text>
        <Pressable onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.border }]}>
          <Text style={[styles.retryText, { color: colors.textPrimary }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const filtered = filter === "all" ? logs : logs.filter((l) => l.pillar_type === filter);
  const grouped = groupByDate(filtered);

  // Stats
  const totalSoul = logs.filter((l) => l.pillar_type === "soul").reduce((s, l) => s + l.value, 0);
  const totalVessel = logs.filter((l) => l.pillar_type === "vessel").reduce((s, l) => s + l.value, 0);
  const totalImpact = logs.filter((l) => l.pillar_type === "impact").reduce((s, l) => s + l.value, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.textMuted }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Activity Log</Text>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <StatChip label="Soul" value={`${totalSoul}m`} color="#1D9E75" bg="#F0FBF7" />
        <StatChip label="Vessel" value={`${totalVessel.toLocaleString()}kg`} color="#D85A30" bg="#FEF3EE" />
        <StatChip label="Impact" value={`${totalImpact}pts`} color="#378ADD" bg="#F0F7FE" />
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterPill,
              { borderColor: colors.border },
              filter === f && { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: colors.textMuted },
              filter === f && { color: colors.bg, fontWeight: "500" },
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Log list grouped by date */}
      {grouped.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No logs yet.</Text>
          <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Tap below to log your first activity.</Text>
        </View>
      ) : (
        grouped.map(({ date, logs: dayLogs }) => (
          <View key={date} style={styles.group}>
            <Text style={[styles.groupDate, { color: colors.textMuted }]}>{date}</Text>
            {dayLogs.map((log) => (
              <LogRow key={log.id} log={log} colors={colors} />
            ))}
          </View>
        ))
      )}

      {/* Log button */}
      <Pressable
        onPress={() => router.push("/log/new")}
        style={[styles.logBtn, { borderColor: colors.border }]}
      >
        <Text style={[styles.logBtnText, { color: colors.textPrimary }]}>+ Log an activity</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatChip({ label, value, color, bg }: {
  label: string; value: string; color: string; bg: string;
}) {
  return (
    <View style={[styles.statChip, { backgroundColor: bg }]}>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function LogRow({ log, colors }: { log: Log; colors: ReturnType<typeof useThemeStore.getState>["colors"] }) {
  const meta = PILLAR_META[log.pillar_type];
  return (
    <View style={[styles.row, { borderBottomColor: colors.borderStrong }]}>
      <View style={[styles.rowIcon, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 16, color: meta.color }}>{meta.icon}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>{getLogTitle(log)}</Text>
        <Text style={[styles.rowSub, { color: colors.textMuted }]}>{getLogSubtitle(log)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowTime, { color: colors.textDisabled }]}>{formatTime(log.created_at)}</Text>
        {log.evidence_url && (
          <Pressable onPress={() => Linking.openURL(log.evidence_url!)}>
            <Text style={[styles.rowEvidence, { color: meta.color }]}>Evidence ↗</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { marginBottom: 12, fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryText: { fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  back: { fontSize: 15 },
  title: { fontSize: 18, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statChip: { flex: 1, borderRadius: 10, padding: 12, gap: 2 },
  statLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 15, fontWeight: "700" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1 },
  filterText: { fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 15, fontWeight: "500" },
  emptySub: { fontSize: 13, marginTop: 4 },
  group: { marginBottom: 20 },
  groupDate: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "500" },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowTime: { fontSize: 12 },
  rowEvidence: { fontSize: 11, fontWeight: "600" },
  logBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  logBtnText: { fontSize: 15, fontWeight: "500" },
});
