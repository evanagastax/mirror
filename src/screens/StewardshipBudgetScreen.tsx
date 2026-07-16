import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { loadBudget, saveBudget, BudgetGoals } from "../services/stewardshipBudget";
import { PILLAR_COLORS } from "../theme/pillars";
import type { Colors } from "../types";

const GOLD    = PILLAR_COLORS.stewardship.primary;
const GOLD_BG = PILLAR_COLORS.stewardship.bg;

function parseRp(s: string): number {
  return parseFloat(s.replace(/\D/g, "")) || 0;
}
function displayRp(n: number): string {
  return n > 0 ? n.toLocaleString("id-ID") : "";
}

export default function StewardshipBudgetScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const [investTarget,    setInvestTarget]    = useState("");
  const [consumptionLimit, setConsumptionLimit] = useState("");
  const [leakLimit,       setLeakLimit]       = useState("");
  const [savingsTarget,   setSavingsTarget]   = useState("");

  useEffect(() => {
    loadBudget(userId).then((b) => {
      setInvestTarget(displayRp(b.investmentTarget));
      setConsumptionLimit(displayRp(b.consumptionLimit));
      setLeakLimit(displayRp(b.leakLimit));
      setSavingsTarget(displayRp(b.savingsTarget));
      setLoading(false);
    });
  }, [userId]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveBudget(userId, {
        investmentTarget:  parseRp(investTarget),
        consumptionLimit:  parseRp(consumptionLimit),
        leakLimit:         parseRp(leakLimit),
        savingsTarget:     parseRp(savingsTarget),
      });
      Alert.alert("Budget saved ✓", "Your monthly budget goals have been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert("Save failed", e instanceof Error ? e.message : "Couldn't save your budget goals. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={GOLD} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
        </Pressable>
        <View style={S.headerCenter}>
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Budget Goals</Text>
          <Text style={[S.headerSub,   { color: colors.textMuted }]}>Set monthly targets & limits</Text>
        </View>
        <Pressable
          onPress={handleSave} disabled={saving}
          style={[S.saveBtn, { backgroundColor: GOLD }, saving && { opacity: 0.5 }]}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={S.saveBtnText}>Save</Text>}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={S.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Text style={[S.hint, { color: colors.textMuted }]}>
            Leave a field empty to disable that goal. Amounts are in Rupiah (Rp).
          </Text>

          {/* Investment target */}
          <GoalCard
            icon="↑"
            color="#1D9E75"
            bg="#F0FBF7"
            label="Monthly Investment Target"
            description="Minimum you want to invest or save each month."
            value={investTarget}
            onChange={setInvestTarget}
            placeholder="e.g. 2000000"
            colors={colors}
          />

          {/* Consumption limit */}
          <GoalCard
            icon="→"
            color="#378ADD"
            bg="#F0F7FE"
            label="Monthly Consumption Limit"
            description="Maximum you allow yourself to spend on normal expenses."
            value={consumptionLimit}
            onChange={setConsumptionLimit}
            placeholder="e.g. 3000000"
            colors={colors}
          />

          {/* Leak limit */}
          <GoalCard
            icon="↓"
            color="#D85A30"
            bg="#FEF3EE"
            label="Monthly Leak Limit"
            description="Maximum tolerated for leaks — impulse buys, unused subs, waste."
            value={leakLimit}
            onChange={setLeakLimit}
            placeholder="e.g. 500000"
            colors={colors}
          />

          {/* Savings target */}
          <GoalCard
            icon="◎"
            color={GOLD}
            bg={GOLD_BG}
            label="Cumulative Savings Target"
            description="Total net worth goal (investments minus leaks, all-time)."
            value={savingsTarget}
            onChange={setSavingsTarget}
            placeholder="e.g. 50000000"
            colors={colors}
          />

          {/* Clear all */}
          <Pressable
            onPress={() => {
              Alert.alert("Clear all goals?", "This will remove all budget limits.", [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: () => {
                  setInvestTarget(""); setConsumptionLimit(""); setLeakLimit(""); setSavingsTarget("");
                }},
              ]);
            }}
            style={[S.clearBtn, { borderColor: colors.border }]}
          >
            <Text style={[S.clearBtnText, { color: colors.textMuted }]}>Clear all goals</Text>
          </Pressable>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoalCard({
  icon, color, bg, label, description, value, onChange, placeholder, colors,
}: {
  icon: string; color: string; bg: string;
  label: string; description: string;
  value: string; onChange: (v: string) => void;
  placeholder: string; colors: Colors;
}) {
  return (
    <View style={[S.goalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={S.goalTop}>
        <View style={[S.goalIcon, { backgroundColor: bg }]}>
          <Text style={[S.goalIconText, { color }]}>{icon}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[S.goalLabel, { color: colors.textPrimary }]}>{label}</Text>
          <Text style={[S.goalDesc,  { color: colors.textMuted }]}>{description}</Text>
        </View>
      </View>
      <View style={[S.inputRow, { borderTopColor: colors.border }]}>
        <Text style={[S.rpPrefix, { color: colors.textMuted }]}>Rp</Text>
        <TextInput
          style={[S.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChange("")} hitSlop={8}>
            <Text style={[S.clearField, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 14 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  hint: { fontSize: 13, lineHeight: 20 },

  goalCard: { borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  goalTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
  goalIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  goalIconText: { fontSize: 18, fontWeight: "700" },
  goalLabel: { fontSize: 14, fontWeight: "700" },
  goalDesc: { fontSize: 12, lineHeight: 17 },
  inputRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  rpPrefix: { fontSize: 16, fontWeight: "600" },
  input: { flex: 1, fontSize: 20, fontWeight: "700" },
  clearField: { fontSize: 14 },

  clearBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  clearBtnText: { fontSize: 14, fontWeight: "600" },
});
