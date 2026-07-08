import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BudgetGoals } from "../../services/stewardshipBudget";
import { Transaction } from "../../hooks/useLedger";
import { currentMonthTransactions } from "../../services/stewardshipStats";

const GOLD = "#BA7517";
const GOLD_BG = "#FEF9EE";

type C = {
  textPrimary: string; textMuted: string; textDisabled: string;
  border: string; bgCard: string; bgSubtle: string;
};

function formatRp(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function nowMonth() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function BudgetGoalsSection({
  budget,
  transactions,
  colors,
  onEdit,
}: {
  budget: BudgetGoals;
  transactions: Transaction[];
  colors: C;
  onEdit: () => void;
}) {
  const monthTxs = currentMonthTransactions(transactions);

  const monthInvest  = monthTxs.filter((t) => t.category === "investment")
    .reduce((s, t) => s + t.amount, 0);
  const monthSpend   = monthTxs.filter((t) => t.category === "consumption")
    .reduce((s, t) => s + t.amount, 0);
  const monthLeak    = monthTxs.filter((t) => t.category === "leak")
    .reduce((s, t) => s + t.amount, 0);

  const hasAnyGoal =
    budget.investmentTarget > 0 ||
    budget.consumptionLimit > 0 ||
    budget.leakLimit > 0;

  return (
    <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      {/* Header */}
      <View style={S.headerRow}>
        <View style={[S.iconWrap, { backgroundColor: GOLD_BG }]}>
          <Text style={S.icon}>🎯</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[S.title, { color: colors.textPrimary }]}>Monthly Budget</Text>
          <Text style={[S.sub, { color: colors.textMuted }]}>{nowMonth()}</Text>
        </View>
        <Pressable
          onPress={onEdit}
          style={[S.editBtn, { borderColor: colors.border }]}
          android_ripple={{ color: GOLD_BG }}
        >
          <Text style={[S.editBtnText, { color: GOLD }]}>
            {hasAnyGoal ? "Edit" : "Set Goals"}
          </Text>
        </Pressable>
      </View>

      {!hasAnyGoal ? (
        /* Empty state */
        <Pressable onPress={onEdit} style={[S.emptyBanner, { backgroundColor: GOLD_BG, borderColor: GOLD + "40" }]}>
          <Text style={[S.emptyText, { color: GOLD }]}>
            Tap "Set Goals" to add monthly targets and limits.
          </Text>
        </Pressable>
      ) : (
        <View style={S.goals}>
          {budget.investmentTarget > 0 && (
            <BudgetBar
              label="Investment"
              icon="↑"
              current={monthInvest}
              target={budget.investmentTarget}
              color="#1D9E75"
              bg="#F0FBF7"
              isTarget   // higher = better
              colors={colors}
            />
          )}
          {budget.consumptionLimit > 0 && (
            <BudgetBar
              label="Consumption"
              icon="→"
              current={monthSpend}
              target={budget.consumptionLimit}
              color="#378ADD"
              bg="#F0F7FE"
              colors={colors}
            />
          )}
          {budget.leakLimit > 0 && (
            <BudgetBar
              label="Leak"
              icon="↓"
              current={monthLeak}
              target={budget.leakLimit}
              color="#D85A30"
              bg="#FEF3EE"
              colors={colors}
            />
          )}
        </View>
      )}
    </View>
  );
}

function BudgetBar({
  label, icon, current, target, color, bg, isTarget = false, colors,
}: {
  label: string; icon: string; current: number; target: number;
  color: string; bg: string; isTarget?: boolean; colors: C;
}) {
  const pct     = Math.min(current / target, 1);
  const over    = current > target;
  // For targets (investment): over is good. For limits (spend/leak): over is bad.
  const barColor = isTarget
    ? (over ? "#0B7A5C" : color)
    : (over ? "#D85A30" : color);
  const statusText = isTarget
    ? (over
        ? `+${formatRp(current - target)} over target 🎉`
        : `${formatRp(target - current)} to go`)
    : (over
        ? `${formatRp(current - target)} over limit ⚠️`
        : `${formatRp(target - current)} remaining`);

  return (
    <View style={S.barWrap}>
      <View style={S.barHeader}>
        <View style={[S.barIconWrap, { backgroundColor: bg }]}>
          <Text style={[S.barIcon, { color }]}>{icon}</Text>
        </View>
        <Text style={[S.barLabel, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[S.barAmt, { color }]}>{formatRp(current)}</Text>
        <Text style={[S.barOf, { color: colors.textMuted }]}>/ {formatRp(target)}</Text>
      </View>
      <View style={[S.track, { backgroundColor: colors.bgSubtle }]}>
        <View style={[S.fill, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
      </View>
      <Text style={[S.status, { color: barColor }]}>{statusText}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, overflow: "hidden", marginBottom: 2 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  title: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 1 },
  editBtn: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText: { fontSize: 12, fontWeight: "700" },

  emptyBanner: { margin: 16, marginTop: 0, borderWidth: 1, borderRadius: 12, padding: 14 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 20 },

  goals: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  barWrap: { gap: 6 },
  barHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  barIconWrap: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  barIcon: { fontSize: 11, fontWeight: "700" },
  barLabel: { flex: 1, fontSize: 13, fontWeight: "600" },
  barAmt: { fontSize: 13, fontWeight: "700" },
  barOf: { fontSize: 11 },
  track: { height: 8, borderRadius: 99, overflow: "hidden" },
  fill: { height: 8, borderRadius: 99 },
  status: { fontSize: 11, fontWeight: "600" },
});
