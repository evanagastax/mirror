import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { BadgeWithStatus } from "../services/badges";
import type { Colors } from "../types";

export function BadgeGrid({ badges, colors }: { badges: BadgeWithStatus[]; colors: Colors }) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <View style={S.wrap}>
      {/* Earned count */}
      <Text style={[S.count, { color: colors.textMuted }]}>
        {earned.length}/{badges.length} unlocked
      </Text>

      {/* Earned badges */}
      {earned.length > 0 && (
        <View style={S.grid}>
          {earned.map((b) => (
            <View key={b.id} style={[S.badge, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Text style={S.badgeIcon}>{b.icon}</Text>
              <Text style={[S.badgeLabel, { color: colors.textPrimary }]} numberOfLines={1}>{b.label}</Text>
              <Text style={[S.badgeDesc, { color: colors.textMuted }]} numberOfLines={1}>{b.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <>
          <Text style={[S.sectionLabel, { color: colors.textDisabled }]}>LOCKED</Text>
          <View style={S.grid}>
            {locked.map((b) => (
              <View key={b.id} style={[S.badge, S.badgeLocked, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
                <Text style={[S.badgeIcon, S.badgeIconLocked]}>🔒</Text>
                <Text style={[S.badgeLabel, { color: colors.textDisabled }]} numberOfLines={1}>{b.label}</Text>
                <Text style={[S.badgeDesc, { color: colors.textDisabled }]} numberOfLines={1}>{b.description}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { gap: 12 },
  count: { fontSize: 12, fontWeight: "700" },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    width: "30%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  badgeLocked: { opacity: 0.5 },
  badgeIcon: { fontSize: 24 },
  badgeIconLocked: { fontSize: 18 },
  badgeLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  badgeDesc: { fontSize: 10, textAlign: "center" },
});
