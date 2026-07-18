import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, type ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
  style?: ViewStyle;
};

/**
 * Wraps children in a container that fades in and slides up
 * when mounted. Use inside ScrollViews for reveal-on-scroll effect.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  duration = 500,
  offsetY = 20,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offsetY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Staggered reveal for lists. Each item reveals with incremental delay.
 */
export function StaggeredReveal({
  children,
  baseDelay = 0,
  stagger = 80,
  duration = 400,
}: {
  children: React.ReactNode[];
  baseDelay?: number;
  stagger?: number;
  duration?: number;
}) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <RevealOnScroll
          key={index}
          delay={baseDelay + index * stagger}
          duration={duration}
          offsetY={15}
        >
          {child}
        </RevealOnScroll>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
});
