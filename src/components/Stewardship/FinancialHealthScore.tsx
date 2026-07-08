import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { calcHealthScore, getHealthTier } from "../../services/stewardshipStats";

type C = {
  textPrimary: string; textMuted: string; textDisabled: string;
  border: string; bgCard: string;
};

export function FinancialHealthScore({
  investment,
  consumption,
  leak,
  colors,
}: {
  investment: number;
  consumption: number;
  leak: number;
  colors: C;
}) {
  const score = calcHealthScore(investment, consumption, leak);
  const tier  = getHealthTier(score);

  // Arc geometry — simple linear progress bar styled as a pill
  const pct = score / 100;

  return (
    <View style={[S.card, { backgroundColor: tier.bg, borderColor: tier.color + "60" }]}>
      <View style={S.topRow}>
        {/* Score + tier */}
        <View style={S.left}>
          <Text style={[S.scoreLabel, { color: tier.color }]}>HEALTH SCORE</Text>
          <Text style={[S.scoreValue, { color: tier.color }]}>{score}</Text>
          <View style={[S.tierBadge, { backgroundColor: tier.color }]}>
            <Text style={S.tierText}>{tier.label}</Text>
          </View>
        </View>

        {/* Circular ring — approximated with a filled arc view */}
        <View style={S.ringWrap}>
          <RingChart pct={pct} color={tier.color} />
          <View style={S.ringCenter}>
            <Text style={[S.ringPct, { color: tier.color }]}>{score}%</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={[S.desc, { color: tier.color }]}>{tier.description}</Text>

      {/* Breakdown mini-row */}
      <View style={[S.breakdownRow, { borderTopColor: tier.color + "30" }]}>
        <MiniStat label="Invested" value={formatRp(investment)} color="#1D9E75" />
        <View style={[S.divider, { backgroundColor: tier.color + "30" }]} />
        <MiniStat label="Spent"    value={formatRp(consumption)} color="#378ADD" />
        <View style={[S.divider, { backgroundColor: tier.color + "30" }]} />
        <MiniStat label="Leaked"   value={formatRp(leak)}        color="#D85A30" />
      </View>

      {/* Progress bar */}
      <View style={[S.barTrack, { backgroundColor: tier.color + "25" }]}>
        <View style={[S.barFill, { width: `${pct * 100}%` as any, backgroundColor: tier.color }]} />
        {/* Tier markers */}
        {[20, 35, 50, 65, 80].map((m) => (
          <View key={m} style={[S.marker, { left: `${m}%` as any, backgroundColor: tier.color + "60" }]} />
        ))}
      </View>
      <View style={S.tierLabelRow}>
        {["Reckless", "Fragile", "Careful", "Stable", "Disciplined", "Frugal"].map((t) => (
          <Text key={t} style={[S.tierStep, { color: tier.color + "80" },
            tier.label === t && { color: tier.color, fontWeight: "800" }]}
            numberOfLines={1}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** Simple segmented ring using border trick */
function RingChart({ pct, color }: { pct: number; color: string }) {
  const SIZE = 72;
  const STROKE = 8;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dash = pct * CIRC;
  const gap  = CIRC - dash;

  // React Native can't do SVG natively without a lib — use concentric views instead
  // Outer ring = background, inner ring = progress using border + rotation trick
  const deg = Math.round(pct * 360);

  return (
    <View style={[S.ring, { width: SIZE, height: SIZE, borderColor: color + "25" }]}>
      {/* Filled arc approximation using a rotated half-circle overlay */}
      <View style={[S.ringBg, { width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderColor: color + "25" }]} />
      {deg >= 0 && (
        <View style={[S.ringProgress, {
          width: SIZE, height: SIZE, borderRadius: SIZE / 2,
          borderTopColor: color,
          borderRightColor: deg > 90 ? color : "transparent",
          borderBottomColor: deg > 180 ? color : "transparent",
          borderLeftColor: deg > 270 ? color : "transparent",
        }]} />
      )}
    </View>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={S.miniStat}>
      <Text style={[S.miniLabel, { color }]}>{label}</Text>
      <Text style={[S.miniValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

function formatRp(n: number) {
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return "Rp " + (n / 1_000).toFixed(0) + "K";
  return "Rp " + n;
}

const S = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 20, padding: 18, gap: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  left: { gap: 6 },
  scoreLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  scoreValue: { fontSize: 52, fontWeight: "900", letterSpacing: -2, lineHeight: 56 },
  tierBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  tierText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  desc: { fontSize: 13, lineHeight: 20 },

  // Ring
  ringWrap: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  ring: { borderWidth: 8, borderRadius: 36, position: "absolute" },
  ringBg: { position: "absolute", borderWidth: 8 },
  ringProgress: { position: "absolute", borderWidth: 8 },
  ringCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  ringPct: { fontSize: 13, fontWeight: "800" },

  // Breakdown
  breakdownRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 10, gap: 0 },
  divider: { width: 1, height: 28, marginHorizontal: 4 },
  miniStat: { flex: 1, alignItems: "center", gap: 2 },
  miniLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  miniValue: { fontSize: 11, fontWeight: "700" },

  // Bar
  barTrack: { height: 6, borderRadius: 99, overflow: "visible", position: "relative" },
  barFill: { height: 6, borderRadius: 99 },
  marker: { position: "absolute", top: -2, width: 1.5, height: 10 },
  tierLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  tierStep: { fontSize: 8, flex: 1, textAlign: "center" },
});
