import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { calculateSynergy } from "../../utils/synergy";

type CompassRingProps = {
  soul: number;
  vessel: number;
  impact: number;
  stewardship: number;
  size?: number;
};

const RINGS = [
  { key: "soul" as const, color: "#1D9E75", radiusOffset: 17 },
  { key: "vessel" as const, color: "#D85A30", radiusOffset: 35 },
  { key: "impact" as const, color: "#378ADD", radiusOffset: 53 },
  { key: "stewardship" as const, color: "#BA7517", radiusOffset: 71 },
];

function ringDash(value: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;
  return { dash, circumference };
}

export function CompassRing({
  soul, vessel, impact, stewardship, size = 220,
}: CompassRingProps) {
  const center = size / 2;
  const values = { soul, vessel, impact, stewardship };
  const synergy = calculateSynergy(values);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {/* Background track rings */}
        {RINGS.map((ring) => {
          const radius = center - ring.radiusOffset;
          return (
            <Circle
              key={`track-${ring.key}`}
              cx={center}
              cy={center}
              r={radius}
              stroke="#f0f0f0"
              strokeWidth={12}
              fill="none"
            />
          );
        })}
        {/* Progress rings */}
        {RINGS.map((ring) => {
          const radius = center - ring.radiusOffset;
          const { dash, circumference } = ringDash(values[ring.key], radius);
          return (
            <Circle
              key={ring.key}
              cx={center}
              cy={center}
              r={radius}
              stroke={ring.color}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(-90, ${center}, ${center})`}
              opacity={0.9}
            />
          );
        })}
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.synergyScore}>{synergy}</Text>
        <Text style={styles.synergyLabel}>synergy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  synergyScore: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -1,
  },
  synergyLabel: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
