import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, type TextStyle } from "react-native";

type Props = {
  value: number;
  duration?: number;
  style?: TextStyle | TextStyle[];
};

/**
 * Animated counter that smoothly counts up to the target value.
 * Uses native driver for 60fps animation.
 */
export function AnimatedCounter({ value, duration = 800, style }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const textRef = useRef<any>(null);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: v }) => {
      // Force re-render by setting text directly
      if (textRef.current) {
        textRef.current.setNativeProps({
          text: String(Math.round(v)),
        });
      }
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // Can't use native driver for text
    }).start();

    return () => animatedValue.removeListener(listener);
  }, [value, duration]);

  return (
    <Animated.Text ref={textRef} style={[styles.text, style]}>
      {String(Math.round(value))}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontVariant: ["tabular-nums"], // Monospace numbers for smooth animation
  },
});
