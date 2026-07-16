import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useThemeStore } from "../../store/themeStore";

export function CompassSkeleton() {
  const { colors } = useThemeStore();
  return (
    <View style={S.wrap}>
      {/* Top bar */}
      <View style={S.topBar}>
        <View style={S.topLeft}>
          <Skeleton width={120} height={20} borderRadius={6} />
          <Skeleton width={80} height={12} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Banner card */}
      <View style={[S.banner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={S.bannerLeft}>
          <Skeleton width={52} height={52} borderRadius={26} />
          <View style={S.bannerText}>
            <Skeleton width={100} height={16} borderRadius={6} />
            <Skeleton width={70} height={12} borderRadius={6} style={{ marginTop: 6 }} />
            <Skeleton width={90} height={11} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={S.bannerRight}>
          <Skeleton width={60} height={10} borderRadius={4} />
          <Skeleton width={80} height={44} borderRadius={8} style={{ marginTop: 4 }} />
          <Skeleton width={120} height={5} borderRadius={99} style={{ marginTop: 8 }} />
          <Skeleton width={90} height={9} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Section header */}
      <View style={S.sectionRow}>
        <Skeleton width={80} height={10} borderRadius={4} />
        <Skeleton width={60} height={12} borderRadius={4} />
      </View>

      {/* 2x2 pillar grid */}
      <View style={S.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Skeleton width={40} height={40} borderRadius={12} />
            <Skeleton width={70} height={15} borderRadius={6} style={{ marginTop: 8 }} />
            <Skeleton width={90} height={11} borderRadius={6} style={{ marginTop: 6 }} />
            <View style={S.cardFooter}>
              <Skeleton width="100%" height={4} borderRadius={99} />
              <Skeleton width={30} height={11} borderRadius={4} style={{ marginTop: 5 }} />
            </View>
          </View>
        ))}
      </View>

      {/* Bottom hint */}
      <Skeleton width={180} height={11} borderRadius={4} style={{ alignSelf: "center", marginTop: 4 }} />
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 24 },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  topLeft: { gap: 1 },
  banner: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 24,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  bannerText: {},
  bannerRight: { alignItems: "flex-end" },
  sectionRow: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 2,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  card: {
    width: "47.5%", borderWidth: 1, borderRadius: 18, padding: 14, gap: 0,
  },
  cardFooter: { gap: 5, marginTop: 8 },
});
