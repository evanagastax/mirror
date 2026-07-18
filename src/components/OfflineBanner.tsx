import React, { useEffect, useState, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import NetInfo from "@react-native-community/netinfo";

/**
 * Subscribes to the device's network state. Shows a slim amber banner
 * whenever the device goes offline, and hides it automatically when
 * connectivity is restored.
 *
 * Drop this at the top of any screen — or once in the root layout
 * so it covers the whole app.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });

    // Check current state immediately on mount
    NetInfo.fetch().then((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOffline]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Text style={styles.icon}>📶</Text>
      <Text style={styles.text}>Offline — showing cached data</Text>
    </Animated.View>
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
