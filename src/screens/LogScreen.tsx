import React, { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Log an activity</Text>
        </View>

        {/* Pillar pills */}
        <View style={styles.pills}>
          {PILLARS.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => setPillar(p.key)}
              style={[
                styles.pill,
                pillar === p.key && { backgroundColor: p.color, borderColor: p.color },
              ]}
            >
              <Text style={[styles.pillText, pillar === p.key && styles.pillTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Soul */}
        {pillar === "soul" && (
          <View style={styles.fields}>
            <Field label="What did you do?">
              <TextInput style={styles.input} placeholder="Morning prayer, meditation…" placeholderTextColor="#aaa" value={soulActivity} onChangeText={setSoulActivity} />
            </Field>
            <Field label="Duration (minutes)">
              <TextInput style={styles.input} placeholder="30" placeholderTextColor="#aaa" keyboardType="numeric" value={soulMinutes} onChangeText={setSoulMinutes} />
            </Field>
            <Field label="Evidence link (optional)">
              <TextInput style={styles.input} placeholder="https://…" placeholderTextColor="#aaa" autoCapitalize="none" value={soulEvidence} onChangeText={setSoulEvidence} />
            </Field>
          </View>
        )}

        {/* Vessel */}
        {pillar === "vessel" && (
          <View style={styles.fields}>
            <Field label="Exercise type">
              <TextInput style={styles.input} placeholder="Chest + triceps, Run, Yoga…" placeholderTextColor="#aaa" value={vesselType} onChangeText={setVesselType} />
            </Field>
            <Field label="Volume (sets × reps × kg)">
              <TextInput style={styles.input} placeholder="4500" placeholderTextColor="#aaa" keyboardType="numeric" value={vesselVolume} onChangeText={setVesselVolume} />
            </Field>
            <Field label="Duration (minutes)">
              <TextInput style={styles.input} placeholder="60" placeholderTextColor="#aaa" keyboardType="numeric" value={vesselMinutes} onChangeText={setVesselMinutes} />
            </Field>
          </View>
        )}

        {/* Impact */}
        {pillar === "impact" && (
          <View style={styles.fields}>
            <Field label="What did you ship?">
              <TextInput style={styles.input} placeholder="PR merged, task closed…" placeholderTextColor="#aaa" value={impactDescription} onChangeText={setImpactDescription} />
            </Field>
            <Field label="Effort score (1–10)">
              <TextInput style={styles.input} placeholder="7" placeholderTextColor="#aaa" keyboardType="numeric" value={impactEffort} onChangeText={setImpactEffort} />
            </Field>
            <Field label="Evidence link (optional)">
              <TextInput style={styles.input} placeholder="GitHub PR, Jira ticket…" placeholderTextColor="#aaa" autoCapitalize="none" value={impactEvidence} onChangeText={setImpactEvidence} />
            </Field>
          </View>
        )}

        {/* Stewardship */}
        {pillar === "stewardship" && (
          <View style={styles.fields}>
            <Field label="Amount (Rp)">
              <TextInput style={styles.input} placeholder="500000" placeholderTextColor="#aaa" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </Field>
            <Field label="Category">
              <View style={styles.catRow}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.catBtn, category === c && { borderColor: "#BA7517", backgroundColor: "#FEF3E2" }]}
                  >
                    <Text style={[styles.catText, category === c && { color: "#92400E", fontWeight: "600" }]}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>
            <Field label="Note">
              <TextInput style={styles.input} placeholder="BBCA shares, groceries…" placeholderTextColor="#aaa" value={note} onChangeText={setNote} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  back: { fontSize: 15, color: "#aaa" },
  title: { fontSize: 18, fontWeight: "600", color: "#111" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: "#e5e5e5" },
  pillText: { fontSize: 13, color: "#888" },
  pillTextActive: { color: "#fff", fontWeight: "500" },
  fields: { gap: 16, marginBottom: 8 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, color: "#888", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111", backgroundColor: "#fafafa" },
  catRow: { flexDirection: "row", gap: 8 },
  catBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#e5e5e5", alignItems: "center" },
  catText: { fontSize: 13, color: "#888" },
  submitBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
  submitText: { fontSize: 15, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
