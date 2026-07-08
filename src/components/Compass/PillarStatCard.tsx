import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStore } from "../../store/themeStore";

type PillarStatCardProps = {
  label: string;
  value: number;
  accentColor: string;
};

export function PillarStatCard({ label, value, accentColor }: PillarStatCardProps) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  value: { fontSize: 26, fontWeight: "600" },
});
