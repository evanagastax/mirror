import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, StyleSheet, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
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
  const { data: transactions, isLoading, isError, refetch, isRefetching } = useLedger(userId);
  const [filter, setFilter] = useState<Filter>("all");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#111" />
      </View>
    );
  }

  if (isError || !transactions) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn't load ledger.</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
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
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Stewardship</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <SummaryCard
          label="Invested"
          amount={summary.totalInvestment}
          color="#1D9E75"
          bg="#F0FBF7"
        />
        <SummaryCard
          label="Spent"
          amount={summary.totalConsumption}
          color="#378ADD"
          bg="#F0F7FE"
        />
        <SummaryCard
          label="Leaked"
          amount={summary.totalLeak}
          color="#D85A30"
          bg="#FEF3EE"
        />
      </View>

      {/* Net score */}
      <View style={styles.netCard}>
        <Text style={styles.netLabel}>Net score</Text>
        <Text style={[
          styles.netValue,
          { color: summary.netScore >= 0 ? "#1D9E75" : "#D85A30" }
        ]}>
          {summary.netScore >= 0 ? "+" : ""}{formatRupiah(summary.netScore)}
        </Text>
        <Text style={styles.netSub}>investments minus leaks</Text>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No transactions yet.</Text>
          <Text style={styles.emptySub}>Log one to start tracking.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((t) => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </View>
      )}

      {/* Log button */}
      <Pressable
        onPress={() => router.push("/log/new")}
        style={styles.logBtn}
      >
        <Text style={styles.logBtnText}>+ Log a transaction</Text>
      </Pressable>
    </ScrollView>
  );
}

function SummaryCard({
  label, amount, color, bg,
}: { label: string; amount: number; color: string; bg: string }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
      <Text style={[styles.summaryAmount, { color }]}>
        {formatRupiah(amount)}
      </Text>
    </View>
  );
}

function TransactionRow({ transaction: t }: { transaction: Transaction }) {
  const meta = CATEGORY_META[t.category];
  return (
    <View style={styles.row}>
      <View style={[styles.rowDot, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 14 }}>
          {t.category === "investment" ? "↑" : t.category === "leak" ? "↓" : "→"}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowNote} numberOfLines={1}>
          {t.note || meta.label}
        </Text>
        <Text style={styles.rowDate}>{formatDate(t.created_at)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowAmount, { color: meta.color }]}>
          {formatRupiah(t.amount)}
        </Text>
        <View style={[styles.rowBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.rowBadgeText, { color: meta.color }]}>
            {meta.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  errorText: { color: "#aaa", marginBottom: 12, fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8 },
  retryText: { fontSize: 14, color: "#111" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  back: { fontSize: 15, color: "#aaa" },
  title: { fontSize: 18, fontWeight: "600", color: "#111" },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, gap: 4 },
  summaryLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryAmount: { fontSize: 13, fontWeight: "700" },
  netCard: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20 },
  netLabel: { fontSize: 12, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  netValue: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  netSub: { fontSize: 12, color: "#aaa", marginTop: 2 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: "#e5e5e5" },
  filterPillActive: { backgroundColor: "#111", borderColor: "#111" },
  filterText: { fontSize: 13, color: "#888" },
  filterTextActive: { color: "#fff", fontWeight: "500" },
  emptyWrap: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 15, color: "#aaa", fontWeight: "500" },
  emptySub: { fontSize: 13, color: "#ccc", marginTop: 4 },
  list: { gap: 10, marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 12 },
  rowDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowNote: { fontSize: 14, fontWeight: "500", color: "#111" },
  rowDate: { fontSize: 12, color: "#aaa", marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowAmount: { fontSize: 14, fontWeight: "700" },
  rowBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  rowBadgeText: { fontSize: 11, fontWeight: "600" },
  logBtn: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  logBtnText: { fontSize: 15, fontWeight: "500", color: "#111" },
});
