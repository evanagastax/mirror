import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export type XPToastData = {
  id: number;
  label: string;   // e.g. "+15 XP"
  color: string;
  bg: string;
  icon: string;
};

/**
 * Single floating toast.
 * Mounts → flies upward + fades in → holds → fades out.
 * Calls onDone when animation completes so the parent can remove it.
 */
export function XPToast({
  toast,
  onDone,
}: {
  toast: XPToastData;
  onDone: () => void;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      // Pop in + rise
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 180,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -12,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Hold
      Animated.delay(900),
      // Float up + fade out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -52,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View
      style={[
        S.toast,
        {
          backgroundColor: toast.bg,
          borderColor: toast.color + "60",
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={S.icon}>{toast.icon}</Text>
      <Text style={[S.label, { color: toast.color }]}>{toast.label}</Text>
    </Animated.View>
  );
}

/**
 * Container that renders all active toasts stacked above a reference point.
 * Place this inside a `position: relative` parent.
 */
export function XPToastContainer({
  toasts,
  onDone,
}: {
  toasts: XPToastData[];
  onDone: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <View style={S.container} pointerEvents="none">
      {toasts.map((t) => (
        <XPToast key={t.id} toast={t} onDone={() => onDone(t.id)} />
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: "800", letterSpacing: -0.3 },
});
