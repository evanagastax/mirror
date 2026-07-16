import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function LedgerSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Skeleton width={24} height={20} borderRadius={4} />
          <View>
            <Skeleton width={100} height={20} borderRadius={6} />
            <Skeleton width={120} height={12} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        </View>
        <Skeleton width={60} height={40} borderRadius={12} />
      </View>

      {/* Financial health score */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Skeleton width={140} height={12} borderRadius={6} />
        <Skeleton width={60} height={36} borderRadius={8} style={{ marginTop: 8 }} />
        <Skeleton width="100%" height={6} borderRadius={99} style={{ marginTop: 8 }} />
      </View>

      {/* Net balance card */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Skeleton width={80} height={10} borderRadius={4} />
        <Skeleton width={160} height={40} borderRadius={8} style={{ marginTop: 6 }} />
        <Skeleton width="100%" height={8} borderRadius={99} style={{ marginTop: 10 }} />
        <View style={S.balanceRow}>
          <Skeleton width={80} height={11} borderRadius={4} />
          <Skeleton width={80} height={11} borderRadius={4} />
        </View>
      </View>

      {/* 3-stat row */}
      <View style={S.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[S.statChip, { backgroundColor: colors.bgSubtle }]}>
            <Skeleton width={50} height={10} borderRadius={4} />
            <Skeleton width={60} height={13} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Chart placeholder */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Skeleton width={100} height={12} borderRadius={6} />
        <Skeleton width="100%" height={140} borderRadius={12} style={{ marginTop: 12 }} />
      </View>

      {/* Filter pills */}
      <View style={S.filterRow}>
        {["All", "Invest", "Spend", "Leak"].map((_, i) => (
          <Skeleton key={i} width={60} height={30} borderRadius={99} />
        ))}
      </View>

      {/* Grouped list */}
      {[0, 1].map((g) => (
        <View key={g} style={S.group}>
          <Skeleton width={100} height={11} borderRadius={4} style={{ marginBottom: 8 }} />
          <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {[0, 1].map((r) => (
              <View key={r} style={S.row}>
                <Skeleton width={32} height={32} borderRadius={10} />
                <View style={S.rowInfo}>
                  <Skeleton width={120} height={14} borderRadius={6} />
                  <Skeleton width={80} height={11} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
                <Skeleton width={60} height={13} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statChip: { flex: 1, borderRadius: 12, padding: 12, gap: 2 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16, marginTop: 4 },
  group: { marginBottom: 16 },
  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  rowInfo: { flex: 1, gap: 3 },
});
