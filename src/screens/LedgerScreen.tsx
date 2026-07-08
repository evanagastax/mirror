import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLedger, summarizeLedger, Transaction } from "../hooks/useLedger";
import { usePillars } from "../hooks/usePillars";
import { scoreToLevel } from "../utils/pillarLevel";

const GOLD = "#BA7517";
const GOLD_BG = "#FEF9EE";

type Filter = "all" | "investment" | "consumption" | "leak";
type C = ReturnType<typeof useThemeStore.getState>["colors"];

const CAT_META = {
  investment:  { color: "#1D9E75", bg: "#F0FBF7", icon: "↑", label: "Investment" },
  consumption: { color: "#378ADD", bg: "#F0F7FE", icon: "→", label: "Consumption" },
  leak:        { color: "#D85A30", bg: "#FEF3EE", icon: "↓", label: "Leak" },
} as const;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "investment",  label: "Invest" },
  { key: "consumption", label: "Spend" },
  { key: "leak",        label: "Leak" },
];

function formatRp(n: number) {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function groupByDate(txs: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const t of txs) {
    const d = formatDate(t.created_at);
    if (!groups[d]) groups[d] = [];
    groups[d].push(t);
  }
  return Object.entries(groups).map(([date, txs]) => ({ date, txs }));
}

export default function LedgerScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId);
  const { isDark, colors } = useThemeStore();
  const { data: txs, isLoading, isError, refetch, isRefetching } = useLedger(userId);
  const { data: pillars } = usePillars(userId);
  const [filter, setFilter] = useState<Filter>("all");

  const { level, xp, xpMax } = scoreToLevel(pillars?.stewardship ?? 0);
  const barPct = xp / xpMax;

  if (isLoading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={GOLD} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (isError || !txs) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}>
          <Text style={[S.stateText, { color: colors.textMuted }]}>Couldn't load ledger.</Text>
          <Pressable onPress={() => refetch()} style={[S.retryBtn, { borderColor: colors.border }]}>
            <Text style={[S.retryText, { color: colors.textPrimary }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const summary  = summarizeLedger(txs);
  const filtered = filter === "all" ? txs : txs.filter((t) => t.category === filter);
  const grouped  = groupByDate(filtered);

  const netPositive = summary.netScore >= 0;
  const totalIn  = summary.totalInvestment;
  const totalOut = summary.totalConsumption + summary.totalLeak;
  const healthPct = totalIn + totalOut > 0
    ? Math.min(totalIn / (totalIn + totalOut), 1)
    : 0;

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ── */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <View style={S.headerLeft}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
          </Pressable>
          <View>
            <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Stewardship</Text>
            <Text style={[S.headerSub,   { color: colors.textMuted }]}>Wealth & Resources</Text>
          </View>
        </View>
        <View style={[S.levelBadge, { backgroundColor: GOLD_BG }]}>
          <Text style={[S.levelNum, { color: GOLD }]}>Lv {level}</Text>
          <View style={[S.levelTrack, { backgroundColor: "#e8cfa0" }]}>
            <View style={[S.levelFill, { width: `${barPct * 100}%` as any }]} />
          </View>
          <Text style={[S.levelXp, { color: GOLD }]}>{xp}/{xpMax} xp</Text>
        </View>
      </View>

      <ScrollView
        style={S.flex}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={GOLD} />}
      >
        {/* ── Net balance card ── */}
        <View style={[S.netCard, { backgroundColor: netPositive ? "#F0FBF7" : "#FEF3EE", borderColor: netPositive ? "#1D9E75" : "#D85A30" }]}>
          <View style={S.netTop}>
            <View>
              <Text style={[S.netLabel, { color: netPositive ? "#1D9E75" : "#D85A30" }]}>NET BALANCE</Text>
              <Text style={[S.netValue, { color: netPositive ? "#1D9E75" : "#D85A30" }]}>
                {netPositive ? "+" : "-"}{formatRp(summary.netScore)}
              </Text>
            </View>
            <View style={S.netRight}>
              <Text style={[S.netEmoji]}>{netPositive ? "📈" : "📉"}</Text>
              <Text style={[S.netHint, { color: netPositive ? "#1D9E75" : "#D85A30" }]}>
                {netPositive ? "Positive flow" : "Drain exceeds growth"}
              </Text>
            </View>
          </View>
          {/* Health bar */}
          <View style={S.healthRow}>
            <Text style={[S.healthLabel, { color: "#1D9E75" }]}>Invest</Text>
            <View style={[S.healthTrack, { backgroundColor: "#FEF3EE" }]}>
              <View style={[S.healthFill, { width: `${healthPct * 100}%` as any }]} />
            </View>
            <Text style={[S.healthLabel, { color: "#D85A30" }]}>Spend</Text>
          </View>
        </View>

        {/* ── 3-stat row ── */}
        <View style={S.statsRow}>
          <StatChip label="Invested" value={formatRp(summary.totalInvestment)}  color="#1D9E75" bg="#F0FBF7" />
          <StatChip label="Spent"    value={formatRp(summary.totalConsumption)} color="#378ADD" bg="#F0F7FE" />
          <StatChip label="Leaked"   value={formatRp(summary.totalLeak)}        color="#D85A30" bg="#FEF3EE" />
        </View>

        {/* ── Log CTA ── */}
        <Pressable
          onPress={() => router.push("/log/new")}
          style={[S.logCta, { backgroundColor: GOLD_BG, borderColor: "#e8cfa0" }]}
          android_ripple={{ color: "#e8cfa0" }}
        >
          <Text style={[S.logCtaIcon, { color: GOLD }]}>◎</Text>
          <Text style={[S.logCtaText, { color: GOLD }]}>Log a transaction</Text>
          <Text style={[S.logCtaArrow, { color: GOLD }]}>›</Text>
        </Pressable>

        {/* ── Filter pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[S.filterPill, { borderColor: colors.border },
                  active && { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }]}
              >
                <Text style={[S.filterText, { color: colors.textMuted },
                  active && { color: colors.bg, fontWeight: "700" }]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Transaction list ── */}
        {filtered.length === 0 ? (
          <View style={S.emptyWrap}>
            <Text style={S.emptyEmoji}>💰</Text>
            <Text style={[S.emptyTitle, { color: colors.textPrimary }]}>No transactions yet</Text>
            <Text style={[S.emptySub,  { color: colors.textMuted }]}>Start logging investments and expenses.</Text>
          </View>
        ) : (
          grouped.map(({ date, txs: dayTxs }) => (
            <View key={date} style={S.group}>
              <View style={S.groupDateRow}>
                <Text style={[S.groupDate, { color: colors.textMuted }]}>{date}</Text>
                <Text style={[S.groupSum, {
                  color: dayTxs.reduce((s, t) =>
                    s + (t.category === "investment" ? t.amount : -t.amount), 0) >= 0
                    ? "#1D9E75" : "#D85A30"
                }]}>
                  {dayTxs.reduce((s, t) =>
                    s + (t.category === "investment" ? t.amount : -t.amount), 0) >= 0 ? "+" : ""}
                  {formatRp(dayTxs.reduce((s, t) =>
                    s + (t.category === "investment" ? t.amount : -t.amount), 0))}
                </Text>
              </View>
              <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {dayTxs.map((t, idx) => (
                  <TxRow key={t.id} tx={t} colors={colors} last={idx === dayTxs.length - 1} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TxRow({ tx, colors, last }: { tx: Transaction; colors: C; last: boolean }) {
  const meta = CAT_META[tx.category];
  return (
    <View style={[S.row, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <View style={[S.rowIcon, { backgroundColor: meta.bg }]}>
        <Text style={[S.rowIconText, { color: meta.color }]}>{meta.icon}</Text>
      </View>
      <View style={S.rowInfo}>
        <Text style={[S.rowNote, { color: colors.textPrimary }]} numberOfLines={1}>
          {tx.note || meta.label}
        </Text>
        <View style={S.rowMetaRow}>
          <View style={[S.rowCatBadge, { backgroundColor: meta.bg }]}>
            <Text style={[S.rowCatText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={[S.rowTime, { color: colors.textDisabled }]}>{formatTime(tx.created_at)}</Text>
        </View>
      </View>
      <Text style={[S.rowAmount, { color: meta.color }]}>{formatRp(tx.amount)}</Text>
    </View>
  );
}

function StatChip({ label, value, color, bg }: {
  label: string; value: string; color: string; bg: string;
}) {
  return (
    <View style={[S.statChip, { backgroundColor: bg }]}>
      <Text style={[S.statLabel, { color }]}>{label}</Text>
      <Text style={[S.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  root:  { flex: 1 },
  flex:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  stateText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryText: { fontSize: 14 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: { fontSize: 20, fontWeight: "300" },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  levelBadge: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 4, alignItems: "center", minWidth: 90 },
  levelNum: { fontSize: 13, fontWeight: "800" },
  levelTrack: { width: "100%", height: 4, borderRadius: 99, overflow: "hidden" },
  levelFill: { height: 4, borderRadius: 99, backgroundColor: GOLD },
  levelXp: { fontSize: 10, fontWeight: "600" },

  netCard: { borderWidth: 1.5, borderRadius: 20, padding: 18, marginBottom: 14 },
  netTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  netLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  netValue: { fontSize: 28, fontWeight: "800", letterSpacing: -1 },
  netRight: { alignItems: "flex-end", gap: 4 },
  netEmoji: { fontSize: 28 },
  netHint: { fontSize: 11, fontWeight: "600" },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  healthLabel: { fontSize: 10, fontWeight: "700" },
  healthTrack: { flex: 1, height: 6, borderRadius: 99, overflow: "hidden" },
  healthFill: { height: 6, borderRadius: 99, backgroundColor: "#1D9E75" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statChip: { flex: 1, borderRadius: 14, padding: 12, gap: 3 },
  statLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  statValue: { fontSize: 13, fontWeight: "700" },

  logCta: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16, overflow: "hidden" },
  logCtaIcon: { fontSize: 18 },
  logCtaText: { flex: 1, fontSize: 14, fontWeight: "600" },
  logCtaArrow: { fontSize: 20 },

  filterRow: { gap: 8, paddingBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  filterText: { fontSize: 13 },

  emptyWrap: { paddingVertical: 48, alignItems: "center", gap: 6 },
  emptyEmoji: { fontSize: 36, marginBottom: 6 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySub: { fontSize: 13, textAlign: "center" },

  group: { marginBottom: 20 },
  groupDateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  groupDate: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  groupSum: { fontSize: 12, fontWeight: "700" },
  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowIconText: { fontSize: 16, fontWeight: "700" },
  rowInfo: { flex: 1, gap: 4 },
  rowNote: { fontSize: 14, fontWeight: "500" },
  rowMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowCatBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  rowCatText: { fontSize: 10, fontWeight: "600" },
  rowTime: { fontSize: 11 },
  rowAmount: { fontSize: 14, fontWeight: "700", flexShrink: 0 },
});
