import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Slim amber banner shown when content is being served from the local
 * AsyncStorage cache because the device is offline or the network request
 * failed. Drop it at the top of any screen that supports offline data.
 */
export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📶</Text>
      <Text style={styles.text}>Offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  icon: { fontSize: 13 },
  text: { fontSize: 12, fontWeight: "500", color: "#92400E" },
});
