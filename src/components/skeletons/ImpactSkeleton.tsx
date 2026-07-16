import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function ImpactSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Skeleton width={24} height={20} borderRadius={4} />
          <View>
            <Skeleton width={70} height={20} borderRadius={6} />
            <Skeleton width={100} height={12} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        </View>
        <Skeleton width={60} height={40} borderRadius={12} />
      </View>

      {/* Stats row */}
      <View style={S.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[S.chip, { backgroundColor: colors.bgSubtle }]}>
            <Skeleton width={45} height={10} borderRadius={4} />
            <Skeleton width={40} height={13} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Action cards */}
      <View style={S.actionsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[S.actionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Skeleton width={28} height={28} borderRadius={8} />
            <Skeleton width={45} height={12} borderRadius={4} style={{ marginTop: 6 }} />
            <Skeleton width={60} height={10} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Section header */}
      <View style={S.sectionRow}>
        <Skeleton width={70} height={10} borderRadius={4} />
        <Skeleton width={55} height={10} borderRadius={4} />
      </View>

      {/* Grouped list */}
      {[0, 1].map((g) => (
        <View key={g} style={S.group}>
          <Skeleton width={100} height={11} borderRadius={4} style={{ marginBottom: 8 }} />
          <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {[0, 1, 2].map((r) => (
              <View key={r} style={S.row}>
                <Skeleton width={32} height={32} borderRadius={10} />
                <View style={S.rowInfo}>
                  <Skeleton width={130} height={14} borderRadius={6} />
                  <View style={S.rowMeta}>
                    <Skeleton width={55} height={18} borderRadius={99} />
                    <Skeleton width={50} height={4} borderRadius={99} />
                  </View>
                </View>
                <Skeleton width={40} height={11} borderRadius={4} />
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
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: { flex: 1, borderRadius: 12, padding: 12, gap: 2 },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionCard: {
    flex: 1, borderWidth: 1, borderRadius: 16, padding: 14, alignItems: "center",
  },
  sectionRow: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 12,
  },
  group: { marginBottom: 16 },
  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  rowInfo: { flex: 1, gap: 4 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
});
