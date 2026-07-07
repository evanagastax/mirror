import React, { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useCreateLog, useCreateTransaction } from "../hooks/useCreateLog";

type Pillar = "soul" | "vessel" | "impact" | "stewardship";
type Category = "investment" | "consumption" | "leak";

const PILLARS: { key: Pillar; label: string; color: string }[] = [
  { key: "soul", label: "Soul", color: "#1D9E75" },
  { key: "vessel", label: "Vessel", color: "#D85A30" },
  { key: "impact", label: "Impact", color: "#378ADD" },
  { key: "stewardship", label: "Stewardship", color: "#BA7517" },
];

const CATEGORIES: Category[] = ["investment", "consumption", "leak"];

export default function LogScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId)!;
  const colors = useThemeStore((s) => s.colors);
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

  const inputStyle = [styles.input, {
    borderColor: colors.border,
    color: colors.textPrimary,
    backgroundColor: colors.bgInput,
  }];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.back, { color: colors.textMuted }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Log an activity</Text>
        </View>

        {/* Pillar pills */}
        <View style={styles.pills}>
          {PILLARS.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => setPillar(p.key)}
              style={[
                styles.pill,
                { borderColor: colors.border },
                pillar === p.key && { backgroundColor: p.color, borderColor: p.color },
              ]}
            >
              <Text style={[
                styles.pillText,
                { color: colors.textMuted },
                pillar === p.key && styles.pillTextActive,
              ]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Soul */}
        {pillar === "soul" && (
          <View style={styles.fields}>
            <Field label="What did you do?" colors={colors}>
              <TextInput style={inputStyle} placeholder="Morning prayer, meditation…" placeholderTextColor={colors.textMuted} value={soulActivity} onChangeText={setSoulActivity} />
            </Field>
            <Field label="Duration (minutes)" colors={colors}>
              <TextInput style={inputStyle} placeholder="30" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={soulMinutes} onChangeText={setSoulMinutes} />
            </Field>
            <Field label="Evidence link (optional)" colors={colors}>
              <TextInput style={inputStyle} placeholder="https://…" placeholderTextColor={colors.textMuted} autoCapitalize="none" value={soulEvidence} onChangeText={setSoulEvidence} />
            </Field>
          </View>
        )}

        {/* Vessel */}
        {pillar === "vessel" && (
          <View style={styles.fields}>
            <Field label="Exercise type" colors={colors}>
              <TextInput style={inputStyle} placeholder="Chest + triceps, Run, Yoga…" placeholderTextColor={colors.textMuted} value={vesselType} onChangeText={setVesselType} />
            </Field>
            <Field label="Volume (sets × reps × kg)" colors={colors}>
              <TextInput style={inputStyle} placeholder="4500" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={vesselVolume} onChangeText={setVesselVolume} />
            </Field>
            <Field label="Duration (minutes)" colors={colors}>
              <TextInput style={inputStyle} placeholder="60" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={vesselMinutes} onChangeText={setVesselMinutes} />
            </Field>
          </View>
        )}

        {/* Impact */}
        {pillar === "impact" && (
          <View style={styles.fields}>
            <Field label="What did you ship?" colors={colors}>
              <TextInput style={inputStyle} placeholder="PR merged, task closed…" placeholderTextColor={colors.textMuted} value={impactDescription} onChangeText={setImpactDescription} />
            </Field>
            <Field label="Effort score (1–10)" colors={colors}>
              <TextInput style={inputStyle} placeholder="7" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={impactEffort} onChangeText={setImpactEffort} />
            </Field>
            <Field label="Evidence link (optional)" colors={colors}>
              <TextInput style={inputStyle} placeholder="GitHub PR, Jira ticket…" placeholderTextColor={colors.textMuted} autoCapitalize="none" value={impactEvidence} onChangeText={setImpactEvidence} />
            </Field>
          </View>
        )}

        {/* Stewardship */}
        {pillar === "stewardship" && (
          <View style={styles.fields}>
            <Field label="Amount (Rp)" colors={colors}>
              <TextInput style={inputStyle} placeholder="500000" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </Field>
            <Field label="Category" colors={colors}>
              <View style={styles.catRow}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[
                      styles.catBtn,
                      { borderColor: colors.border },
                      category === c && { borderColor: "#BA7517", backgroundColor: "#FEF3E2" },
                    ]}
                  >
                    <Text style={[
                      styles.catText,
                      { color: colors.textMuted },
                      category === c && { color: "#92400E", fontWeight: "600" },
                    ]}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>
            <Field label="Note" colors={colors}>
              <TextInput style={inputStyle} placeholder="BBCA shares, groceries…" placeholderTextColor={colors.textMuted} value={note} onChangeText={setNote} />
            </Field>
          </View>
        )}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          style={[styles.submitBtn, { borderColor: activePillar.color }, isLoading && styles.disabled]}
        >
          {isLoading
            ? <ActivityIndicator color={activePillar.color} />
            : <Text style={[styles.submitText, { color: activePillar.color }]}>Save log</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, children, colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  back: { fontSize: 15 },
  title: { fontSize: 18, fontWeight: "600" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  pillText: { fontSize: 13 },
  pillTextActive: { color: "#fff", fontWeight: "500" },
  fields: { gap: 16, marginBottom: 8 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  catRow: { flexDirection: "row", gap: 8 },
  catBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  catText: { fontSize: 13 },
  submitBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
  submitText: { fontSize: 15, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
