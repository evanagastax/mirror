import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useThemeStore } from "../store/themeStore";

type Props = {
  message: string;
  action?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
};

export function Snackbar({ message, action, onAction, onDismiss, duration = 5000 }: Props) {
  const { colors } = useThemeStore();
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[S.bar, { backgroundColor: colors.textPrimary, opacity, transform: [{ translateY }] }]}
    >
      <Text style={[S.msg, { color: colors.bg }]} numberOfLines={2}>{message}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={S.action}>{action}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const S = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
    gap: 12,
    zIndex: 1000,
  },
  msg: { flex: 1, fontSize: 14, fontWeight: "500" },
  action: { fontSize: 14, fontWeight: "800", color: "#4FC3F7" },
});
