import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function VesselSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Skeleton width={24} height={20} borderRadius={4} />
          <View>
            <Skeleton width={60} height={20} borderRadius={6} />
            <Skeleton width={100} height={12} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        </View>
        <Skeleton width={60} height={40} borderRadius={14} />
      </View>

      {/* Action cards */}
      <View style={S.actionRow}>
        {[0, 1].map((i) => (
          <View key={i} style={[S.actionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Skeleton width={28} height={28} borderRadius={8} />
            <Skeleton width={70} height={14} borderRadius={6} style={{ marginTop: 6 }} />
            <Skeleton width={100} height={11} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Stats strip */}
      <View style={[S.statsStrip, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={S.statItem}>
            <Skeleton width={50} height={10} borderRadius={4} />
            <Skeleton width={40} height={13} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Trend chart */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Skeleton width={100} height={14} borderRadius={6} />
        <Skeleton width="100%" height={120} borderRadius={12} style={{ marginTop: 12 }} />
      </View>

      {/* 2x2 grid */}
      <View style={S.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[S.gridCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <Skeleton width={65} height={15} borderRadius={6} style={{ marginTop: 8 }} />
            <Skeleton width={80} height={11} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24, gap: 14 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 14, gap: 2 },
  statsStrip: { flexDirection: "row", borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4 },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: { width: "47.5%", borderWidth: 1, borderRadius: 18, padding: 16, alignItems: "center", gap: 2 },
});
