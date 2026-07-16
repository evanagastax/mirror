import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function LogHistorySkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <Skeleton width={80} height={20} borderRadius={6} />
        <Skeleton width={70} height={12} borderRadius={6} />
      </View>

      {/* Stats chips row */}
      <View style={S.statsRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[S.chip, { backgroundColor: colors.bgSubtle }]}>
            <Skeleton width={40} height={10} borderRadius={4} />
            <Skeleton width={50} height={13} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Filter pills */}
      <View style={S.filterRow}>
        {["All", "Soul", "Vessel", "Impact", "Wealth"].map((_, i) => (
          <Skeleton key={i} width={55} height={30} borderRadius={99} />
        ))}
      </View>

      {/* Grouped list */}
      {[0, 1, 2].map((g) => (
        <View key={g} style={S.group}>
          <Skeleton width={100} height={11} borderRadius={4} style={{ marginBottom: 8 }} />
          <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {[0, 1, 2].map((r) => (
              <View key={r} style={S.row}>
                <Skeleton width={32} height={32} borderRadius={10} />
                <View style={S.rowInfo}>
                  <Skeleton width={140} height={14} borderRadius={6} />
                  <Skeleton width={100} height={11} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
                <Skeleton width={50} height={11} borderRadius={4} />
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
    paddingBottom: 12, marginBottom: 12,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: { borderRadius: 12, padding: 12, gap: 2, minWidth: 90 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  group: { marginBottom: 16 },
  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  rowInfo: { flex: 1, gap: 3 },
});
