import React from "react";
import { Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  color: string;
};

export function SectionLabel({ label, color }: Props) {
  return <Text style={[S.label, { color }]}>{label}</Text>;
}

const S = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
