import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl, Linking, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLogs, useDeleteLog, Log } from "../hooks/useLogs";
import { useLedger, useDeleteTransaction, Transaction } from "../hooks/useLedger";

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = "all" | "soul" | "vessel" | "impact" | "stewardship";

/** Unified activity item — either a Log or a Transaction */
type ActivityItem =
  | { kind: "log"; data: Log }
  | { kind: "transaction"; data: Transaction };

// ─── Pillar / category meta ───────────────────────────────────────────────────

const PILLAR_META = {
  soul:        { color: "#1D9E75", bg: "#F0FBF7", icon: "✦", label: "Soul" },
  vessel:      { color: "#D85A30", bg: "#FEF3EE", icon: "⬡", label: "Vessel" },
  impact:      { color: "#378ADD", bg: "#F0F7FE", icon: "◈", label: "Impact" },
  stewardship: { color: "#BA7517", bg: "#FEF9EE", icon: "◎", label: "Stewardship" },
} as const;

const CAT_META = {
  investment:  { icon: "↑", color: "#1D9E75" },
  consumption: { icon: "→", color: "#378ADD" },
  leak:        { icon: "↓", color: "#D85A30" },
} as const;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "soul",        label: "Soul" },
  { key: "vessel",      label: "Vessel" },
  { key: "impact",      label: "Impact" },
  { key: "stewardship", label: "Wealth" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function formatRp(n: number) {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

function getLogTitle(log: Log): string {
  const meta = log.metadata as any;
  if (log.pillar_type === "soul"   && meta?.activity)      return meta.activity;
  if (log.pillar_type === "vessel" && meta?.exercise_type) return meta.exercise_type;
  if (log.pillar_type === "vessel" && meta?.exercise_name) return meta.exercise_name;
  if (log.pillar_type === "impact" && meta?.title)         return meta.title;
  if (log.pillar_type === "impact" && meta?.description)   return meta.description;
  return PILLAR_META[log.pillar_type as keyof typeof PILLAR_META]?.label + " activity";
}

function getLogSubtitle(log: Log): string {
  const meta = log.metadata as any;
  if (log.pillar_type === "soul")   return `${log.value} min`;
  if (log.pillar_type === "vessel") {
    if (meta?.type === "cardio") return `${log.value} min cardio${meta?.distance_km ? ` · ${meta.distance_km} km` : ""}`;
    return `${log.value.toLocaleString()} vol`;
  }
  if (log.pillar_type === "impact") return `Effort ${log.value}/10`;
  return `+${log.value}`;
}

function groupByDate(items: ActivityItem[]): { date: string; items: ActivityItem[] }[] {
  const groups: Record<string, ActivityItem[]> = {};
  for (const item of items) {
    const iso = item.kind === "log" ? item.data.created_at : item.data.created_at;
    const date = formatDate(iso);
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  // Sort within each group: newest first
  return Object.entries(groups).map(([date, items]) => ({
    date,
    items: items.sort((a, b) => {
      const ta = a.kind === "log" ? a.data.created_at : a.data.created_at;
      const tb = b.kind === "log" ? b.data.created_at : b.data.created_at;
      return tb.localeCompare(ta);
    }),
  }));
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LogHistoryScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId);
  const { isDark, colors } = useThemeStore();

  const { data: logs,         isLoading: logsLoading,   isError: logsError,   refetch: refetchLogs,   isRefetching: logsRefetching }   = useLogs(userId);
  const { data: transactions, isLoading: txLoading,     isError: txError,     refetch: refetchTx,     isRefetching: txRefetching }     = useLedger(userId);
  const deleteLog         = useDeleteLog(userId ?? "");
  const deleteTransaction = useDeleteTransaction(userId ?? "");

  const [filter, setFilter] = useState<Filter>("all");

  const isLoading   = logsLoading || txLoading;
  const isError     = logsError   || txError;
  const isRefreshing = logsRefetching || txRefetching;

  function refetch() { refetchLogs(); refetchTx(); }

  // Build unified activity list
  const allItems = useMemo<ActivityItem[]>(() => {
    const logItems: ActivityItem[] = (logs ?? []).map((l) => ({ kind: "log", data: l }));
    const txItems:  ActivityItem[] = (transactions ?? []).map((t) => ({ kind: "transaction", data: t }));
    return [...logItems, ...txItems].sort((a, b) => {
      const ta = a.kind === "log" ? a.data.created_at : a.data.created_at;
      const tb = b.kind === "log" ? b.data.created_at : b.data.created_at;
      return tb.localeCompare(ta);
    });
  }, [logs, transactions]);

  const filtered = useMemo<ActivityItem[]>(() => {
    if (filter === "all") return allItems;
    if (filter === "stewardship") return allItems.filter((i) => i.kind === "transaction");
    return allItems.filter((i) => i.kind === "log" && (i.data as Log).pillar_type === filter);
  }, [allItems, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Stat summaries
  const totalSoul   = useMemo(() => (logs ?? []).filter((l) => l.pillar_type === "soul"  ).reduce((s, l) => s + l.value, 0), [logs]);
  const totalVessel = useMemo(() => (logs ?? []).filter((l) => l.pillar_type === "vessel").reduce((s, l) => s + l.value, 0), [logs]);
  const totalImpact = useMemo(() => (logs ?? []).filter((l) => l.pillar_type === "impact").reduce((s, l) => s + l.value, 0), [logs]);
  const netWealth   = useMemo(() => {
    const inv  = (transactions ?? []).filter((t) => t.category === "investment").reduce((s, t) => s + t.amount, 0);
    const leak = (transactions ?? []).filter((t) => t.category === "leak"      ).reduce((s, t) => s + t.amount, 0);
    return inv - leak;
  }, [transactions]);

  const totalEntries = allItems.length;

  if (isLoading) {
    return (
      <SafeAreaView style={[S.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[S.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}>
          <Text style={[S.errorText, { color: colors.textMuted }]}>Couldn't load activity.</Text>
          <Pressable onPress={refetch} style={[S.retryBtn, { borderColor: colors.border }]}>
            <Text style={[S.retryText, { color: colors.textPrimary }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[S.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ── */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <Text style={[S.title, { color: colors.textPrimary }]}>Activity</Text>
        <Text style={[S.totalCount, { color: colors.textMuted }]}>{totalEntries} entries</Text>
      </View>

      <ScrollView
        style={S.flex}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
      >
        {/* ── Stats row ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.statsRow}>
          <StatChip label="Soul"    value={`${totalSoul}m`}                     color="#1D9E75" bg="#F0FBF7" />
          <StatChip label="Vessel"  value={`${totalVessel.toLocaleString()}vol`} color="#D85A30" bg="#FEF3EE" />
          <StatChip label="Impact"  value={`${totalImpact}pts`}                  color="#378ADD" bg="#F0F7FE" />
          <StatChip
            label="Wealth"
            value={(netWealth >= 0 ? "+" : "-") + formatRp(Math.abs(netWealth))}
            color="#BA7517"
            bg="#FEF9EE"
          />
        </ScrollView>

        {/* ── Filter pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  S.filterPill,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
                ]}
              >
                <Text
                  style={[
                    S.filterText,
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

        {/* ── Activity list ── */}
        {grouped.length === 0 ? (
          <View style={S.emptyWrap}>
            <Text style={S.emptyEmoji}>📭</Text>
            <Text style={[S.emptyText, { color: colors.textMuted }]}>No activity yet.</Text>
            <Text style={[S.emptySub, { color: colors.textDisabled }]}>
              Tap the + button to log your first entry.
            </Text>
          </View>
        ) : (
          grouped.map(({ date, items: dayItems }) => (
            <View key={date} style={S.group}>
              <View style={[S.groupDateRow, { borderBottomColor: colors.border }]}>
                <Text style={[S.groupDate, { color: colors.textMuted }]}>{date}</Text>
                <Text style={[S.groupCount, { color: colors.textDisabled }]}>{dayItems.length}</Text>
              </View>
              <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {dayItems.map((item, idx) =>
                  item.kind === "log" ? (
                    <LogRow
                      key={item.data.id}
                      log={item.data}
                      colors={colors}
                      last={idx === dayItems.length - 1}
                      onDelete={() => deleteLog.mutate(item.data.id)}
                    />
                  ) : (
                    <TransactionRow
                      key={item.data.id}
                      tx={item.data}
                      colors={colors}
                      last={idx === dayItems.length - 1}
                      onDelete={() => deleteTransaction.mutate(item.data.id)}
                    />
                  )
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({
  log,
  colors,
  last,
  onDelete,
}: {
  log: Log;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
  last: boolean;
  onDelete: () => void;
}) {
  const meta = PILLAR_META[log.pillar_type as keyof typeof PILLAR_META];
  if (!meta) return null;

  function handleLongPress() {
    Alert.alert(
      "Delete entry?",
      `Remove "${getLogTitle(log)}" from your activity log? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  }

  return (
    <Pressable
      style={[S.row, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
      onLongPress={handleLongPress}
      android_ripple={{ color: colors.bgSubtle }}
    >
      <View style={[S.rowIcon, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 14, color: meta.color }}>{meta.icon}</Text>
      </View>
      <View style={S.rowInfo}>
        <Text style={[S.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {getLogTitle(log)}
        </Text>
        <View style={S.rowMetaRow}>
          <View style={[S.pillarBadge, { backgroundColor: meta.bg }]}>
            <Text style={[S.pillarBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={[S.rowSub, { color: colors.textMuted }]}>{getLogSubtitle(log)}</Text>
        </View>
      </View>
      <View style={S.rowRight}>
        <Text style={[S.rowTime, { color: colors.textDisabled }]}>{formatTime(log.created_at)}</Text>
        {log.evidence_url && !log.evidence_url.startsWith("gh:") ? (
          <Pressable onPress={() => Linking.openURL(log.evidence_url!)}>
            <Text style={[S.rowEvidence, { color: meta.color }]}>↗</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  colors,
  last,
  onDelete,
}: {
  tx: Transaction;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
  last: boolean;
  onDelete: () => void;
}) {
  const meta    = PILLAR_META.stewardship;
  const catMeta = CAT_META[tx.category];

  function handleLongPress() {
    Alert.alert(
      "Delete transaction?",
      `Remove "${tx.note ?? tx.category}" (${formatRp(tx.amount)})? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  }

  return (
    <Pressable
      style={[S.row, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
      onLongPress={handleLongPress}
      android_ripple={{ color: colors.bgSubtle }}
    >
      <View style={[S.rowIcon, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 14, color: catMeta.color }}>{catMeta.icon}</Text>
      </View>
      <View style={S.rowInfo}>
        <Text style={[S.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {tx.note ?? tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
        </Text>
        <View style={S.rowMetaRow}>
          <View style={[S.pillarBadge, { backgroundColor: meta.bg }]}>
            <Text style={[S.pillarBadgeText, { color: meta.color }]}>Wealth</Text>
          </View>
          <Text style={[S.rowSub, { color: catMeta.color }]}>
            {tx.category === "investment" ? "+" : "-"}{formatRp(tx.amount)}
          </Text>
        </View>
      </View>
      <View style={S.rowRight}>
        <Text style={[S.rowTime, { color: colors.textDisabled }]}>{formatTime(tx.created_at)}</Text>
      </View>
    </Pressable>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ label, value, color, bg }: {
  label: string; value: string; color: string; bg: string;
}) {
  return (
    <View style={[S.statChip, { backgroundColor: bg }]}>
      <Text style={[S.statLabel, { color }]}>{label}</Text>
      <Text style={[S.statValue, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
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

  // Stats
  statsRow: { gap: 8, paddingBottom: 16 },
  statChip: { borderRadius: 12, padding: 12, gap: 2, minWidth: 90 },
  statLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 13, fontWeight: "700" },

  // Filters
  filterRow: { gap: 8, paddingBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  filterText: { fontSize: 13 },

  // Empty
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 6 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySub: { fontSize: 13, textAlign: "center" },

  // Group
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

  // Row
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  rowIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rowInfo: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: "500" },
  rowMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillarBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  pillarBadgeText: { fontSize: 10, fontWeight: "700" },
  rowSub: { fontSize: 12 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowTime: { fontSize: 12 },
  rowEvidence: { fontSize: 16, fontWeight: "700" },
});
