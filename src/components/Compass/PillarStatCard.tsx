import React from "react";
import { View, Text, StyleSheet } from "react-native";

type PillarStatCardProps = {
  label: string;
  value: number;
  accentColor: string;
};

export function PillarStatCard({ label, value, accentColor }: PillarStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  value: {
    fontSize: 26,
    fontWeight: "600",
    color: "#111",
  },
});
