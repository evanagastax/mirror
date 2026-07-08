import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { MonthBucket } from "../../services/stewardshipStats";

const SCREEN_W = Dimensions.get("window").width;
const BAR_AREA_H = 100;

const GOLD = "#BA7517";

type C = { textPrimary: string; textMuted: string; textDisabled: string; border: string; bgCard: string; bgSubtle: string };

export function MonthlyTrendChart({
  data,
  colors,
}: {
  data: MonthBucket[];
  colors: C;
}) {
  const maxVal = useMemo(() => {
    let m = 0;
    for (const b of data) {
      m = Math.max(m, b.investment, b.consumption, b.leak);
    }
    return m || 1;
  }, [data]);

  function barH(val: number) {
    return Math.max(4, (val / maxVal) * BAR_AREA_H);
  }

  function formatK(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
    return String(n);
  }

  return (
    <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      {/* Title */}
      <View style={S.titleRow}>
        <Text style={[S.title, { color: colors.textPrimary }]}>Monthly Trend</Text>
        <View style={S.legend}>
          <LegendDot color="#1D9E75" label="Invest" />
          <LegendDot color="#378ADD" label="Spend" />
          <LegendDot color="#D85A30" label="Leak" />
        </View>
      </View>

      {/* Chart */}
      <View style={S.chartArea}>
        {/* Y-axis hint */}
        <View style={S.yAxis}>
          <Text style={[S.yLabel, { color: colors.textDisabled }]}>{formatK(maxVal)}</Text>
          <Text style={[S.yLabel, { color: colors.textDisabled }]}>{formatK(maxVal / 2)}</Text>
          <Text style={[S.yLabel, { color: colors.textDisabled }]}>0</Text>
        </View>

        {/* Bars */}
        <View style={S.barsRow}>
          {data.map((b) => (
            <View key={b.month} style={S.barGroup}>
              <View style={S.barSet}>
                <Bar h={barH(b.investment)}  color="#1D9E75" />
                <Bar h={barH(b.consumption)} color="#378ADD" />
                <Bar h={barH(b.leak)}        color="#D85A30" />
              </View>
              <Text style={[S.barLabel, { color: colors.textMuted }]} numberOfLines={1}>
                {b.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Net row — shows net per month as small chips */}
      <View style={[S.netRow, { borderTopColor: colors.border }]}>
        {data.map((b) => {
          const pos = b.net >= 0;
          return (
            <View key={b.month} style={S.netChip}>
              <Text style={[S.netChipText, { color: pos ? "#1D9E75" : "#D85A30" }]}
                numberOfLines={1} adjustsFontSizeToFit>
                {pos ? "+" : "-"}{formatK(Math.abs(b.net))}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Bar({ h, color }: { h: number; color: string }) {
  return (
    <View style={[S.bar, { height: h, backgroundColor: color }]} />
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={S.legendItem}>
      <View style={[S.dot, { backgroundColor: color }]} />
      <Text style={[S.legendLabel, { color: "#888" }]}>{label}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, overflow: "hidden", marginBottom: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingBottom: 10 },
  title: { fontSize: 14, fontWeight: "700" },
  legend: { flexDirection: "row", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10 },

  chartArea: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  yAxis: { width: 28, justifyContent: "space-between", alignItems: "flex-end", height: BAR_AREA_H, paddingBottom: 4 },
  yLabel: { fontSize: 9 },

  barsRow: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: BAR_AREA_H + 20 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barSet: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: BAR_AREA_H },
  bar: { width: 7, borderRadius: 3 },
  barLabel: { fontSize: 9, textAlign: "center" },

  netRow: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 16 },
  netChip: { flex: 1, alignItems: "center" },
  netChipText: { fontSize: 10, fontWeight: "700" },
});
