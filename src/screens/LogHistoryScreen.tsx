import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",    label: "All" },
  { key: "soul",   label: "Soul" },
  { key: "vessel", label: "Vessel" },
  { key: "impact", label: "Impact" },
];

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
  if (log.pillar_type === "soul"   && meta?.activity)      return meta.activity;
  if (log.pillar_type === "vessel" && meta?.exercise_type) return meta.exercise_type;
  if (log.pillar_type === "impact" && meta?.description)   return meta.description;
  return PILLAR_META[log.pillar_type].label + " activity";
}

function getLogSubtitle(log: Log): string {
  const meta = log.metadata as any;
  if (log.pillar_type === "soul")   return `${log.value} min`;
  if (log.pillar_type === "vessel") return `${log.value.toLocaleString()} kg vol${meta?.duration ? ` · ${meta.duration} min` : ""}`;
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
  const { isDark, colors } = useThemeStore();
  const { data: logs, isLoading, isError, refetch, isRefetching } = useLogs(userId);
  const [filter, setFilter] = useState<Filter>("all");

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !logs) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>Couldn't load logs.</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.border }]}>
            <Text style={[styles.retryText, { color: colors.textPrimary }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = filter === "all" ? logs : logs.filter((l) => l.pillar_type === filter);
  const grouped = groupByDate(filtered);

  const totalSoul   = logs.filter((l) => l.pillar_type === "soul"  ).reduce((s, l) => s + l.value, 0);
  const totalVessel = logs.filter((l) => l.pillar_type === "vessel").reduce((s, l) => s + l.value, 0);
  const totalImpact = logs.filter((l) => l.pillar_type === "impact").reduce((s, l) => s + l.value, 0);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Sticky header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Activity</Text>
        <Text style={[styles.totalCount, { color: colors.textMuted }]}>{logs.length} entries</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatChip label="Soul"   value={`${totalSoul}m`}                     color="#1D9E75" bg="#F0FBF7" />
          <StatChip label="Vessel" value={`${totalVessel.toLocaleString()}kg`} color="#D85A30" bg="#FEF3EE" />
          <StatChip label="Impact" value={`${totalImpact}pts`}                 color="#378ADD" bg="#F0F7FE" />
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterPill,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textMuted },
                    active && { color: colors.bg, fontWeight: "700" },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Log list */}
        {grouped.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No logs yet.</Text>
            <Text style={[styles.emptySub, { color: colors.textDisabled }]}>
              Tap the + button to log your first activity.
            </Text>
          </View>
        ) : (
          grouped.map(({ date, logs: dayLogs }) => (
            <View key={date} style={styles.group}>
              <View style={[styles.groupDateRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.groupDate, { color: colors.textMuted }]}>{date}</Text>
                <Text style={[styles.groupCount, { color: colors.textDisabled }]}>{dayLogs.length}</Text>
              </View>
              <View style={[styles.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {dayLogs.map((log, idx) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    colors={colors}
                    last={idx === dayLogs.length - 1}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
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

function LogRow({
  log,
  colors,
  last,
}: {
  log: Log;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
  last: boolean;
}) {
  const meta = PILLAR_META[log.pillar_type];
  return (
    <View style={[styles.row, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <View style={[styles.rowIcon, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 15, color: meta.color }}>{meta.icon}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {getLogTitle(log)}
        </Text>
        <Text style={[styles.rowSub, { color: colors.textMuted }]}>{getLogSubtitle(log)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowTime, { color: colors.textDisabled }]}>{formatTime(log.created_at)}</Text>
        {log.evidence_url ? (
          <Pressable onPress={() => Linking.openURL(log.evidence_url!)}>
            <Text style={[styles.rowEvidence, { color: meta.color }]}>↗</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { marginBottom: 12, fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryText: { fontSize: 14 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  totalCount: { fontSize: 13 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statChip: { flex: 1, borderRadius: 12, padding: 12, gap: 2 },
  statLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 14, fontWeight: "700" },

  filterRow: { gap: 8, paddingBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  filterText: { fontSize: 13 },

  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 6 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySub: { fontSize: 13, textAlign: "center" },

  group: { marginBottom: 20 },
  groupDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  groupDate: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  groupCount: { fontSize: 12 },
  groupCard: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "500" },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowTime: { fontSize: 12 },
  rowEvidence: { fontSize: 16, fontWeight: "700" },
});
