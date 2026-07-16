import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useThemeStore } from "../../store/themeStore";

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: Props) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        S.base,
        { width: width as any, height, borderRadius, backgroundColor: colors.bgSubtle },
        { opacity },
        style,
      ]}
    />
  );
}

const S = StyleSheet.create({
  base: {},
});
