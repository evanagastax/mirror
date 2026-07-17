import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLogs, useDeleteLog } from "../hooks/useLogs";
import { useLedger, useDeleteTransaction } from "../hooks/useLedger";
import { useStreak } from "../hooks/useStreak";
import { openSafeUrl } from "../utils/url";
import { PILLAR_META_MAP, CAT_META, PILLAR_FILTERS, type PillarKey, type PillarFilter } from "../theme/pillars";
import { formatDate, formatTime, formatRp } from "../utils/format";
import type { Log, Transaction, Colors } from "../types";
import { StatChip } from "../components/ui/StatChip";
import { LogHistorySkeleton } from "../components/skeletons";
import { Snackbar } from "../components/Snackbar";
import { useUndoableDelete } from "../hooks/useUndoableDelete";
import { DATE_RANGES, dateRangeBounds, type DateRange } from "../utils/dateRange";
import { useLangStore } from "../store/langStore";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Unified activity item — either a Log or a Transaction */
type ActivityItem =
  | { kind: "log"; data: Log }
  | { kind: "transaction"; data: Transaction };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLogTitle(log: Log): string {
  const meta = log.metadata as Record<string, unknown> | null;
  if (log.pillar_type === "soul"   && meta?.activity)      return String(meta.activity);
  if (log.pillar_type === "vessel" && meta?.exercise_type) return String(meta.exercise_type);
  if (log.pillar_type === "vessel" && meta?.exercise_name) return String(meta.exercise_name);
  if (log.pillar_type === "impact" && meta?.title)         return String(meta.title);
  if (log.pillar_type === "impact" && meta?.description)   return String(meta.description);
  return PILLAR_META_MAP[log.pillar_type as PillarKey]?.label + " activity";
}

function getLogSubtitle(log: Log): string {
  const meta = log.metadata as Record<string, unknown> | null;
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
  const { t, lang }        = useLangStore();

  const [filter, setFilter] = useState<PillarFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const dateBounds = useMemo(() => dateRangeBounds(dateRange), [dateRange]);

  const { data: logs,         isLoading: logsLoading,   isError: logsError,   refetch: refetchLogs,   isRefetching: logsRefetching }   = useLogs(userId, dateBounds);
  const { data: transactions, isLoading: txLoading,     isError: txError,     refetch: refetchTx,     isRefetching: txRefetching }     = useLedger(userId, dateBounds);
  const deleteLog         = useDeleteLog(userId ?? "");
  const deleteTransaction = useDeleteTransaction(userId ?? "");
  const { data: streak }  = useStreak(userId);

  const { requestDelete: requestLogDelete, snackbar: logSnackbar, dismissSnackbar: dismissLogSnackbar } =
    useUndoableDelete({ onDelete: (id) => deleteLog.mutate(id) });
  const { requestDelete: requestTxDelete, snackbar: txSnackbar, dismissSnackbar: dismissTxSnackbar } =
    useUndoableDelete({ onDelete: (id) => deleteTransaction.mutate(id) });
  const snackbar = logSnackbar ?? txSnackbar;
  const dismissSnackbar = logSnackbar ? dismissLogSnackbar : dismissTxSnackbar;

  // Persist filter selection so it survives tab switches and app restarts
  const FILTER_KEY = `activity_filter_${userId}`;
  const DATE_KEY = `activity_date_${userId}`;

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(FILTER_KEY).then((saved) => {
      if (saved && ["all","soul","vessel","impact","stewardship"].includes(saved)) {
        setFilter(saved as PillarFilter);
      }
    });
    AsyncStorage.getItem(DATE_KEY).then((saved) => {
      if (saved && DATE_RANGES.some((r) => r.key === saved)) {
        setDateRange(saved as DateRange);
      }
    });
  }, [FILTER_KEY, DATE_KEY]));

  function handleSetFilter(f: PillarFilter) {
    setFilter(f);
    AsyncStorage.setItem(FILTER_KEY, f);
  }

  function handleSetDateRange(r: DateRange) {
    setDateRange(r);
    AsyncStorage.setItem(DATE_KEY, r);
  }

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
        <ScrollView style={S.flex} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
          <LogHistorySkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[S.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}>
          <Text style={[S.errorText, { color: colors.textMuted }]}>{lang === "id" ? "Tidak bisa memuat aktivitas." : "Couldn't load activity."}</Text>
          <Pressable onPress={refetch} style={[S.retryBtn, { borderColor: colors.border }]}>
            <Text style={[S.retryText, { color: colors.textPrimary }]}>{t.retry}</Text>
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
        <Text style={[S.title, { color: colors.textPrimary }]}>{t.activity}</Text>
        <Text style={[S.totalCount, { color: colors.textMuted }]}>{totalEntries} {t.entries}</Text>
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
          {streak && streak.current > 0 && (
            <StatChip label="Streak" value={`🔥 ${streak.current}d`} color="#D85A30" bg="#FEF3EE" />
          )}
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
          {PILLAR_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => handleSetFilter(f.key)}
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

        {/* ── Date range pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.dateRow}
        >
          {DATE_RANGES.map((r) => {
            const active = dateRange === r.key;
            const labelMap: Record<DateRange, string> = {
              all: t.all, today: t.today, week: t.week, month: t.month, year: t.year,
            };
            return (
              <Pressable
                key={r.key}
                onPress={() => handleSetDateRange(r.key)}
                style={[
                  S.datePill,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
                ]}
              >
                <Text
                  style={[
                    S.dateText,
                    { color: colors.textMuted },
                    active && { color: colors.bg, fontWeight: "700" },
                  ]}
                >
                  {labelMap[r.key]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Activity list ── */}
        {grouped.length === 0 ? (
          <View style={S.emptyWrap}>
            <Text style={S.emptyEmoji}>📭</Text>
            <Text style={[S.emptyText, { color: colors.textMuted }]}>{t.noActivity}</Text>
            <Text style={[S.emptySub, { color: colors.textDisabled }]}>
              {t.tapToLogFirst}
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
                      onDelete={() => requestLogDelete(item.data.id, `Deleted "${getLogTitle(item.data)}"`)}
                    />
                  ) : (
                    <TransactionRow
                      key={item.data.id}
                      tx={item.data}
                      colors={colors}
                      last={idx === dayItems.length - 1}
                      onDelete={() => requestTxDelete(item.data.id, `Deleted "${item.data.note ?? item.data.category}"`)}
                    />
                  )
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          action="Undo"
          onAction={snackbar.onUndo}
          onDismiss={dismissSnackbar}
        />
      )}
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
  colors: Colors;
  last: boolean;
  onDelete: () => void;
}) {
  const meta = PILLAR_META_MAP[log.pillar_type as PillarKey];
  if (!meta) return null;

  function handleLongPress() {
    onDelete();
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
        {log.evidence_url && (
          <Pressable onPress={() => openSafeUrl(log.evidence_url, "evidence link")}>
            <Text style={[S.rowEvidence, { color: meta.color }]}>↗</Text>
          </Pressable>
        )}</View>
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
  colors: Colors;
  last: boolean;
  onDelete: () => void;
}) {
  const meta    = PILLAR_META_MAP.stewardship;
  const catMeta = CAT_META[tx.category];

  function handleLongPress() {
    onDelete();
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
  filterRow: { gap: 8, paddingBottom: 12 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  filterText: { fontSize: 13 },

  // Date range
  dateRow: { gap: 8, paddingBottom: 16 },
  datePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  dateText: { fontSize: 12 },

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
