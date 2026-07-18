import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { MonthBucket } from "../services/pillarTrend";

const BAR_AREA_H = 100;

type C = { textPrimary: string; textMuted: string; textDisabled: string; border: string; bgCard: string };

export function PillarTrendChart({
  data,
  color,
  title,
  unit,
  colors,
}: {
  data: MonthBucket[];
  color: string;
  title: string;
  unit: string;
  colors: C;
}) {
  const maxVal = useMemo(() => {
    let m = 0;
    for (const b of data) m = Math.max(m, b.total);
    return m || 1;
  }, [data]);

  function barH(val: number) {
    return Math.max(4, (val / maxVal) * BAR_AREA_H);
  }

  function formatN(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
    return String(n);
  }

  return (
    <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[S.title, { color: colors.textPrimary }]}>{title}</Text>

      <View style={S.chartArea}>
        <View style={S.yAxis}>
          <Text style={[S.yLabel, { color: colors.textDisabled }]}>{formatN(maxVal)}</Text>
          <Text style={[S.yLabel, { color: colors.textDisabled }]}>0</Text>
        </View>

        <View style={S.barsRow}>
          {data.map((b) => (
            <View key={b.month} style={S.barGroup}>
              <View style={S.barWrap}>
                <View style={[S.bar, { height: barH(b.total), backgroundColor: color }]} />
              </View>
              <Text style={[S.barLabel, { color: colors.textMuted }]} numberOfLines={1}>
                {b.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[S.summaryRow, { borderTopColor: colors.border }]}>
        {data.map((b) => (
          <View key={b.month} style={S.summaryChip}>
            <Text style={[S.summaryText, { color }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatN(b.total)} {unit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, overflow: "hidden", marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", padding: 16, paddingBottom: 10 },

  chartArea: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  yAxis: { width: 28, justifyContent: "space-between", alignItems: "flex-end", height: BAR_AREA_H, paddingBottom: 4 },
  yLabel: { fontSize: 9 },

  barsRow: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: BAR_AREA_H + 20 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barWrap: { height: BAR_AREA_H, justifyContent: "flex-end" },
  bar: { width: 14, borderRadius: 4 },
  barLabel: { fontSize: 9, textAlign: "center" },

  summaryRow: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 16 },
  summaryChip: { flex: 1, alignItems: "center" },
  summaryText: { fontSize: 10, fontWeight: "700" },
});
