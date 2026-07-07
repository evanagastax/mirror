import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLedger, summarizeLedger, Transaction } from "../hooks/useLedger";

const CATEGORY_META = {
  investment: { color: "#1D9E75", bg: "#F0FBF7", label: "Investment" },
  consumption: { color: "#378ADD", bg: "#F0F7FE", label: "Consumption" },
  leak:        { color: "#D85A30", bg: "#FEF3EE", label: "Leak" },
};

const FILTERS = ["all", "investment", "consumption", "leak"] as const;
type Filter = typeof FILTERS[number];

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function LedgerScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const colors = useThemeStore((s) => s.colors);
  const { data: transactions, isLoading, isError, refetch, isRefetching } = useLedger(userId);
  const [filter, setFilter] = useState<Filter>("all");

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (isError || !transactions) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>Couldn't load ledger.</Text>
        <Pressable onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.border }]}>
          <Text style={[styles.retryText, { color: colors.textPrimary }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const summary = summarizeLedger(transactions);
  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.category === filter);

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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Stewardship</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Invested" amount={summary.totalInvestment} color="#1D9E75" bg="#F0FBF7" />
        <SummaryCard label="Spent"    amount={summary.totalConsumption} color="#378ADD" bg="#F0F7FE" />
        <SummaryCard label="Leaked"   amount={summary.totalLeak}        color="#D85A30" bg="#FEF3EE" />
      </View>

      {/* Net score */}
      <View style={[styles.netCard, { borderColor: colors.border }]}>
        <Text style={[styles.netLabel, { color: colors.textMuted }]}>Net score</Text>
        <Text style={[styles.netValue, { color: summary.netScore >= 0 ? "#1D9E75" : "#D85A30" }]}>
          {summary.netScore >= 0 ? "+" : ""}{formatRupiah(summary.netScore)}
        </Text>
        <Text style={[styles.netSub, { color: colors.textMuted }]}>investments minus leaks</Text>
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

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet.</Text>
          <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Log one to start tracking.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((t) => (
            <TransactionRow key={t.id} transaction={t} colors={colors} />
          ))}
        </View>
      )}

      {/* Log button */}
      <Pressable onPress={() => router.push("/log/new")} style={[styles.logBtn, { borderColor: colors.border }]}>
        <Text style={[styles.logBtnText, { color: colors.textPrimary }]}>+ Log a transaction</Text>
      </Pressable>
    </ScrollView>
  );
}

function SummaryCard({ label, amount, color, bg }: { label: string; amount: number; color: string; bg: string }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
      <Text style={[styles.summaryAmount, { color }]}>{formatRupiah(amount)}</Text>
    </View>
  );
}

function TransactionRow({
  transaction: t,
  colors,
}: {
  transaction: Transaction;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
}) {
  const meta = CATEGORY_META[t.category];
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={[styles.rowDot, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 14 }}>
          {t.category === "investment" ? "↑" : t.category === "leak" ? "↓" : "→"}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowNote, { color: colors.textPrimary }]} numberOfLines={1}>
          {t.note || meta.label}
        </Text>
        <Text style={[styles.rowDate, { color: colors.textMuted }]}>{formatDate(t.created_at)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowAmount, { color: meta.color }]}>{formatRupiah(t.amount)}</Text>
        <View style={[styles.rowBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.rowBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
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
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, gap: 4 },
  summaryLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryAmount: { fontSize: 13, fontWeight: "700" },
  netCard: { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20 },
  netLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  netValue: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  netSub: { fontSize: 12, marginTop: 2 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1 },
  filterText: { fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 15, fontWeight: "500" },
  emptySub: { fontSize: 13, marginTop: 4 },
  list: { gap: 10, marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, borderRadius: 12 },
  rowDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowNote: { fontSize: 14, fontWeight: "500" },
  rowDate: { fontSize: 12, marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowAmount: { fontSize: 14, fontWeight: "700" },
  rowBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  rowBadgeText: { fontSize: 11, fontWeight: "600" },
  logBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  logBtnText: { fontSize: 15, fontWeight: "500" },
});
