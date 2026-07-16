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
  chip: { borderRadius: 12, padding: 12, gap: 2, minWidth: 90 },
  label: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 13, fontWeight: "700" },
});
