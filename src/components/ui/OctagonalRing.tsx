import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
};

/**
 * Octagonal progress ring — signature element inspired by Islamic geometry.
 * 8-sided polygon with animated fill.
 */
export function OctagonalRing({
  progress,
  size = 48,
  strokeWidth = 3,
  color,
  bgColor = "transparent",
}: Props) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const innerSize = size - strokeWidth * 2;
  const cornerRadius = size * 0.15; // Controls octagon shape

  // Create 8 segments for the ring
  const segments = 8;
  const filledSegments = Math.round(clampedProgress * segments);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background octagon */}
      <View
        style={[
          styles.octagon,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: cornerRadius,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Progress segments */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i * 360) / segments - 90; // Start from top
        const isFilled = i < filledSegments;
        const segmentAngle = 360 / segments;

        return (
          <View
            key={i}
            style={[
              styles.segmentContainer,
              {
                width: size,
                height: size,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          >
            <View
              style={[
                styles.segment,
                {
                  width: strokeWidth,
                  height: size / 2 - strokeWidth,
                  backgroundColor: isFilled ? color : "transparent",
                  borderTopLeftRadius: strokeWidth / 2,
                  borderTopRightRadius: strokeWidth / 2,
                },
              ]}
            />
          </View>
        );
      })}

      {/* Center dot for partial progress */}
      {clampedProgress > 0 && clampedProgress < 1 && (
        <View
          style={[
            styles.centerDot,
            {
              width: strokeWidth * 2,
              height: strokeWidth * 2,
              borderRadius: strokeWidth,
              backgroundColor: color,
            },
          ]}
        />
      )}
    </View>
  );
}

/**
 * Simplified octagonal ring using border segments.
 * More performant, better for lists.
 */
export function OctagonalRingSimple({
  progress,
  size = 48,
  strokeWidth = 3,
  color,
  bgColor,
}: Props) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  // Use an octagonal clip via borderRadius trick
  const cornerRadius = size * 0.2;

  return (
    <View
      style={[
        styles.simpleContainer,
        {
          width: size,
          height: size,
          borderRadius: cornerRadius,
          borderWidth: strokeWidth,
          borderColor: bgColor ?? color + "25",
        },
      ]}
    >
      {/* Fill indicator - bottom portion */}
      <View
        style={[
          styles.simpleFill,
          {
            height: `${clampedProgress * 100}%`,
            backgroundColor: color + "20",
            borderBottomLeftRadius: cornerRadius - strokeWidth,
            borderBottomRightRadius: cornerRadius - strokeWidth,
          },
        ]}
      />

      {/* Progress text would go here via children */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  octagon: {
    position: "absolute",
  },
  segmentContainer: {
    position: "absolute",
    alignItems: "center",
  },
  segment: {
    position: "absolute",
    top: 0,
  },
  centerDot: {
    position: "absolute",
  },
  simpleContainer: {
    overflow: "hidden",
    position: "relative",
  },
  simpleFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
