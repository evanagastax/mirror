import React, { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useCreateLog, useCreateTransaction } from "../hooks/useCreateLog";

type Pillar = "soul" | "vessel" | "impact" | "stewardship";
type Category = "investment" | "consumption" | "leak";

const PILLARS: { key: Pillar; label: string; color: string; bg: string; icon: string; hint: string }[] = [
  { key: "soul",        label: "Soul",        color: "#1D9E75", bg: "#F0FBF7", icon: "✦", hint: "Prayer, meditation, gratitude" },
  { key: "vessel",      label: "Vessel",      color: "#D85A30", bg: "#FEF3EE", icon: "⬡", hint: "Workouts, runs, recovery" },
  { key: "impact",      label: "Impact",      color: "#378ADD", bg: "#F0F7FE", icon: "◈", hint: "Work shipped, tasks closed" },
  { key: "stewardship", label: "Stewardship", color: "#BA7517", bg: "#FEF9EE", icon: "◎", hint: "Investments, expenses, leaks" },
];

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "investment",  label: "Investment",  icon: "↑" },
  { key: "consumption", label: "Consumption", icon: "→" },
  { key: "leak",        label: "Leak",        icon: "↓" },
];

export default function LogScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();
  const createLog = useCreateLog(userId);
  const createTransaction = useCreateTransaction(userId);

  const [pillar, setPillar] = useState<Pillar>("soul");
  const [soulActivity, setSoulActivity] = useState("");
  const [soulMinutes, setSoulMinutes] = useState("");
  const [soulEvidence, setSoulEvidence] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [vesselVolume, setVesselVolume] = useState("");
  const [vesselMinutes, setVesselMinutes] = useState("");
  const [impactDescription, setImpactDescription] = useState("");
  const [impactEffort, setImpactEffort] = useState("");
  const [impactEvidence, setImpactEvidence] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("investment");
  const [note, setNote] = useState("");

  const isLoading = createLog.isPending || createTransaction.isPending;
  const activePillar = PILLARS.find((p) => p.key === pillar)!;

  async function handleSubmit() {
    try {
      if (pillar === "stewardship") {
        if (!amount) return Alert.alert("Enter an amount.");
        await createTransaction.mutateAsync({ amount: parseFloat(amount), category, note: note || undefined });
      } else {
        let value = 0;
        let evidence_url: string | undefined;
        let metadata: Record<string, unknown> = {};

        if (pillar === "soul") {
          if (!soulMinutes) return Alert.alert("Enter duration.");
          value = parseInt(soulMinutes, 10);
          evidence_url = soulEvidence || undefined;
          metadata = { activity: soulActivity };
        } else if (pillar === "vessel") {
          if (!vesselVolume) return Alert.alert("Enter volume.");
          value = parseInt(vesselVolume, 10);
          metadata = { exercise_type: vesselType, duration: vesselMinutes ? parseInt(vesselMinutes, 10) : undefined };
        } else if (pillar === "impact") {
          if (!impactEffort) return Alert.alert("Enter effort score.");
          value = parseInt(impactEffort, 10);
          evidence_url = impactEvidence || undefined;
          metadata = { description: impactDescription };
        }

        await createLog.mutateAsync({ pillar_type: pillar, value, evidence_url, metadata });
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Something went wrong.", e.message ?? "Try again.");
    }
  }

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
            <Text style={[styles.closeIcon, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Log an activity</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={[styles.saveBtn, { backgroundColor: activePillar.color }, isLoading && { opacity: 0.5 }]}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Pillar selector ── */}
          <View style={styles.pillarGrid}>
            {PILLARS.map((p) => {
              const active = pillar === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPillar(p.key)}
                  style={[
                    styles.pillarTile,
                    { borderColor: active ? p.color : colors.border,
                      backgroundColor: active ? p.bg : colors.bgCard },
                  ]}
                  android_ripple={{ color: p.bg }}
                >
                  <Text style={[styles.pillarTileIcon, { color: p.color }]}>{p.icon}</Text>
                  <Text style={[styles.pillarTileLabel, { color: active ? p.color : colors.textPrimary }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.pillarTileHint, { color: colors.textMuted }]} numberOfLines={2}>
                    {p.hint}
                  </Text>
                  {active && <View style={[styles.pillarTileCheck, { backgroundColor: p.color }]}>
                    <Text style={styles.pillarTileCheckIcon}>✓</Text>
                  </View>}
                </Pressable>
              );
            })}
          </View>

          {/* ── Fields ── */}
          <View style={[styles.fieldsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>

            {pillar === "soul" && <>
              <Field label="Activity" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="Morning prayer, Quran, meditation…"
                  placeholderTextColor={colors.textMuted}
                  value={soulActivity}
                  onChangeText={setSoulActivity}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Duration (minutes)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="30"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={soulMinutes}
                  onChangeText={setSoulMinutes}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Evidence link (optional)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="https://…"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  value={soulEvidence}
                  onChangeText={setSoulEvidence}
                />
              </Field>
            </>}

            {pillar === "vessel" && <>
              <Field label="Exercise type" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="Chest + triceps, Run, Yoga…"
                  placeholderTextColor={colors.textMuted}
                  value={vesselType}
                  onChangeText={setVesselType}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Volume (sets × reps × kg)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="4500"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={vesselVolume}
                  onChangeText={setVesselVolume}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Duration (minutes)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="60"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={vesselMinutes}
                  onChangeText={setVesselMinutes}
                />
              </Field>
            </>}

            {pillar === "impact" && <>
              <Field label="What did you ship?" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="PR merged, task closed, feature deployed…"
                  placeholderTextColor={colors.textMuted}
                  value={impactDescription}
                  onChangeText={setImpactDescription}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Effort score (1–10)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="7"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={impactEffort}
                  onChangeText={setImpactEffort}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Evidence link (optional)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="GitHub PR, Jira ticket, Notion…"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  value={impactEvidence}
                  onChangeText={setImpactEvidence}
                />
              </Field>
            </>}

            {pillar === "stewardship" && <>
              <Field label="Amount (Rp)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="500000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </Field>
              <Divider colors={colors} />
              <Field label="Category" colors={colors}>
                <View style={styles.catRow}>
                  {CATEGORIES.map((c) => {
                    const active = category === c.key;
                    return (
                      <Pressable
                        key={c.key}
                        onPress={() => setCategory(c.key)}
                        style={[
                          styles.catBtn,
                          { borderColor: active ? "#BA7517" : colors.border,
                            backgroundColor: active ? "#FEF9EE" : colors.bgInput },
                        ]}
                      >
                        <Text style={{ fontSize: 16, color: active ? "#BA7517" : colors.textMuted }}>
                          {c.icon}
                        </Text>
                        <Text style={[styles.catText, { color: active ? "#BA7517" : colors.textMuted }, active && { fontWeight: "700" }]}>
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
              <Divider colors={colors} />
              <Field label="Note" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="BBCA shares, groceries, subscription…"
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                />
              </Field>
            </>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children, colors }: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useThemeStore.getState>["colors"] }) {
  return <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4 },
  closeIcon: { fontSize: 18 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  content: { padding: 16, paddingBottom: 32, gap: 16 },

  // Pillar grid
  pillarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillarTile: {
    width: "47.5%",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    gap: 4,
    overflow: "hidden",
  },
  pillarTileIcon: { fontSize: 20, marginBottom: 2 },
  pillarTileLabel: { fontSize: 14, fontWeight: "700" },
  pillarTileHint: { fontSize: 11, lineHeight: 16 },
  pillarTileCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTileCheckIcon: { fontSize: 10, color: "#fff", fontWeight: "700" },

  // Fields card
  fieldsCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  fieldWrap: { padding: 14, gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  fieldDivider: { height: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  catRow: { flexDirection: "row", gap: 8 },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 4,
  },
  catText: { fontSize: 12 },
});
