import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: string;
  color: string;
  bg: string;
};

export function StatChip({ label, value, color, bg }: Props) {
  return (
    <View style={[S.chip, { backgroundColor: bg }]}>
      <Text style={[S.label, { color }]}>{label}</Text>
      <Text style={[S.value, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const S = StyleSheet.create({
  chip: { borderRadius: 14, padding: 12, gap: 3, minWidth: 90 },
  label: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  value: { fontSize: 14, fontWeight: "800" },
});
