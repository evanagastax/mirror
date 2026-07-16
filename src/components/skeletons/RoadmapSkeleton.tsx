import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function RoadmapSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <Skeleton width={24} height={20} borderRadius={4} />
        <Skeleton width={80} height={20} borderRadius={6} />
        <Skeleton width={65} height={30} borderRadius={12} />
      </View>

      {/* Progress bar + counters */}
      <View style={[S.progressCard, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
        <Skeleton width="100%" height={6} borderRadius={99} />
        <View style={S.counterRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={S.counterItem}>
              <Skeleton width={24} height={20} borderRadius={6} />
              <Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 3 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Filter pills */}
      <View style={S.filterRow}>
        {["All", "Todo", "In Progress", "Done"].map((_, i) => (
          <Skeleton key={i} width={65} height={28} borderRadius={99} />
        ))}
      </View>

      {/* Goal groups */}
      {[0, 1, 2].map((g) => (
        <View key={g} style={S.group}>
          <View style={S.groupHeader}>
            <Skeleton width={12} height={12} borderRadius={6} />
            <Skeleton width={70} height={12} borderRadius={6} />
            <Skeleton width={24} height={18} borderRadius={99} />
          </View>
          <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {[0, 1].map((r) => (
              <View key={r} style={S.goalRow}>
                <Skeleton width={20} height={20} borderRadius={10} />
                <Skeleton width={140} height={14} borderRadius={6} />
                <Skeleton width={60} height={20} borderRadius={99} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24, gap: 14 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    justifyContent: "space-between",
  },
  progressCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  counterRow: { flexDirection: "row", justifyContent: "space-around" },
  counterItem: { alignItems: "center", gap: 2 },
  filterRow: { flexDirection: "row", gap: 8 },
  group: { gap: 8 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  goalRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
});
