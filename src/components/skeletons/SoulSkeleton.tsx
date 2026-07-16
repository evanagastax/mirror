import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function SoulSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Skeleton width={24} height={20} borderRadius={4} />
          <View>
            <Skeleton width={50} height={20} borderRadius={6} />
            <Skeleton width={100} height={12} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        </View>
        <Skeleton width={60} height={30} borderRadius={20} />
      </View>

      {/* Tab bar */}
      <View style={S.tabRow}>
        {["Daily", "Doa", "Dzikir", "Asmaul", "Al-Qur'an", "Hafalan"].map((_, i) => (
          <Skeleton key={i} width={55} height={36} borderRadius={8} />
        ))}
      </View>

      {/* Prayer tracker */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Skeleton width={120} height={14} borderRadius={6} />
        <View style={S.prayerGrid}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[S.prayerItem, { backgroundColor: colors.bgSubtle }]}>
              <Skeleton width={28} height={28} borderRadius={14} />
              <Skeleton width={40} height={10} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Content cards */}
      {[0, 1].map((i) => (
        <View key={i} style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Skeleton width={140} height={14} borderRadius={6} />
          <Skeleton width="100%" height={60} borderRadius={8} style={{ marginTop: 12 }} />
          <Skeleton width="80%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24, gap: 14 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 2,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  tabRow: { flexDirection: "row", gap: 4, marginBottom: 4 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14 },
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  prayerItem: { width: "18%", alignItems: "center", borderRadius: 12, paddingVertical: 10 },
});
