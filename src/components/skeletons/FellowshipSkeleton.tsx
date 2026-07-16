import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function FellowshipSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Header */}
      <View style={S.header}>
        <Skeleton width={80} height={20} borderRadius={6} />
      </View>

      {/* Identity card */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={S.identityRow}>
          <Skeleton width={52} height={52} borderRadius={26} />
          <View style={S.identityInfo}>
            <Skeleton width={120} height={16} borderRadius={6} />
            <Skeleton width={160} height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>

      {/* Goals row */}
      <View style={[S.goalsRow, { backgroundColor: colors.bgSubtle }]}>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            {i > 0 ? <View style={[S.goalsDivider, { backgroundColor: colors.border }]} /> : null}
            <View style={S.goalsStat}>
              <Skeleton width={30} height={24} borderRadius={6} />
              <Skeleton width={40} height={11} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Pillar cards */}
      <View style={S.pillarRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[S.pillarCard, { backgroundColor: colors.bgSubtle }]}>
            <Skeleton width={24} height={18} borderRadius={4} />
            <Skeleton width={40} height={10} borderRadius={4} style={{ marginTop: 4 }} />
            <Skeleton width={30} height={22} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Badges */}
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Skeleton width={100} height={12} borderRadius={4} />
        <View style={S.badgeGrid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[S.badgeCard, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
              <Skeleton width={28} height={28} borderRadius={8} />
              <Skeleton width={50} height={11} borderRadius={4} style={{ marginTop: 4 }} />
              <Skeleton width={60} height={10} borderRadius={4} style={{ marginTop: 2 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Setting rows */}
      {[0, 1, 2].map((i) => (
        <View key={i} style={[S.settingCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Skeleton width={180} height={15} borderRadius={6} />
          <Skeleton width={140} height={11} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24, gap: 14 },
  header: { marginBottom: 2 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  identityInfo: { gap: 2 },
  goalsRow: { flexDirection: "row", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  goalsStat: { flex: 1, alignItems: "center", gap: 3 },
  goalsDivider: { width: 1, height: 30 },
  pillarRow: { flexDirection: "row", gap: 10 },
  pillarCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 2 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  badgeCard: { width: "30%", borderWidth: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 2 },
  settingCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
});
