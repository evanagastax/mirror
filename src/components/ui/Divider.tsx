import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  color: string;
};

export function Divider({ color }: Props) {
  return <View style={[S.divider, { backgroundColor: color }]} />;
}

const S = StyleSheet.create({
  divider: { height: 1 },
});
