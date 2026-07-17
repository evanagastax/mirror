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
import { isSafeUrl } from "../utils/url";
import { PILLAR_META, CAT_META } from "../theme/pillars";
import type { PillarKey } from "../theme/pillars";
import type { Colors } from "../types";
import { Divider } from "../components/ui/Divider";
import { useLangStore } from "../store/langStore";

type Pillar = PillarKey;
type Category = "investment" | "consumption" | "leak";
type ImpactCategory = "code" | "design" | "write" | "manage" | "learn" | "other";

const IMPACT_CATEGORIES: { key: ImpactCategory; label: string; icon: string; hint: string }[] = [
  { key: "code",   label: "Code",    icon: "💻", hint: "PR, commit, bug fix" },
  { key: "design", label: "Design",  icon: "🎨", hint: "UI, mockup, prototype" },
  { key: "write",  label: "Write",   icon: "✍️",  hint: "Docs, article, report" },
  { key: "manage", label: "Manage",  icon: "📋", hint: "Meeting, planning, review" },
  { key: "learn",  label: "Learn",   icon: "📚", hint: "Course, book, research" },
  { key: "other",  label: "Other",   icon: "⚡", hint: "Anything else" },
];

const PILLARS = PILLAR_META.map((p) => ({ ...p }));

const CATEGORIES = Object.entries(CAT_META).map(([key, meta]) => ({
  key: key as Category,
  label: meta.label,
  icon: meta.icon,
}));

export default function LogScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();
  const { t, lang } = useLangStore();
  const createLog = useCreateLog(userId);
  const createTransaction = useCreateTransaction(userId);

  const [pillar, setPillar] = useState<Pillar>("soul");
  const [soulActivity, setSoulActivity] = useState("");
  const [soulMinutes, setSoulMinutes] = useState("");
  const [soulEvidence, setSoulEvidence] = useState("");
  const [vesselType,    setVesselType]    = useState("");
  const [vesselSets,    setVesselSets]    = useState("");
  const [vesselReps,    setVesselReps]    = useState("");
  const [vesselWeight,  setVesselWeight]  = useState("");
  const [vesselMinutes, setVesselMinutes] = useState("");
  const [vesselMode,    setVesselMode]    = useState<"strength" | "cardio">("strength");
  const [impactDescription, setImpactDescription] = useState("");
  const [impactCategory, setImpactCategory] = useState<ImpactCategory>("code");
  const [impactEffort, setImpactEffort] = useState("");
  const [impactEvidence, setImpactEvidence] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("investment");
  const [note, setNote] = useState("");

  // Format raw digits into Indonesian Rp format: 1500000 → "1.500.000"
  function formatRp(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    return parseInt(digits, 10).toLocaleString("id-ID");
  }

  // Strip formatting back to plain digits before submit
  function parseAmount(formatted: string): number {
    return parseFloat(formatted.replace(/\./g, "").replace(/,/g, ".")) || 0;
  }

  function handleAmountChange(text: string) {
    // Only keep digits, reformat
    const digits = text.replace(/\D/g, "");
    setAmount(digits);
  }

  const isLoading = createLog.isPending || createTransaction.isPending;
  const activePillar = PILLARS.find((p) => p.key === pillar)!;

  async function handleSubmit() {
    try {
      if (pillar === "stewardship") {
        if (!amount) return Alert.alert("Enter an amount.");
        await createTransaction.mutateAsync({ amount: parseAmount(amount), category, note: note || undefined });
      } else {
        let value = 0;
        let evidence_url: string | undefined;
        let metadata: Record<string, unknown> = {};

        if (pillar === "soul") {
          if (!soulMinutes) return Alert.alert("Enter duration.");
          value = parseInt(soulMinutes, 10);
          if (soulEvidence && !isSafeUrl(soulEvidence)) {
            return Alert.alert("Invalid URL", "Evidence link must start with https://");
          }
          evidence_url = soulEvidence || undefined;
          metadata = { activity: soulActivity };
        } else if (pillar === "vessel") {
          if (vesselMode === "strength") {
            const s = parseInt(vesselSets, 10) || 0;
            const r = parseInt(vesselReps, 10) || 0;
            const w = parseFloat(vesselWeight) || 0;
            if (s === 0 || r === 0) return Alert.alert("Enter sets and reps.");
            value = w > 0 ? Math.round(s * r * w) : s * r;
            metadata = { exercise_type: vesselType, type: "strength", sets: s, reps: r, weight_kg: w, total_volume: value };
          } else {
            if (!vesselMinutes) return Alert.alert("Enter duration.");
            value = parseInt(vesselMinutes, 10);
            metadata = { exercise_type: vesselType, type: "cardio", duration_minutes: value };
          }
        } else if (pillar === "impact") {
          if (!impactDescription.trim()) return Alert.alert("Enter a title for what you did.");
          if (!impactEffort) return Alert.alert("Enter effort score.");
          value = Math.min(10, Math.max(1, parseInt(impactEffort, 10)));
          if (impactEvidence && !isSafeUrl(impactEvidence)) {
            return Alert.alert("Invalid URL", "Evidence link must start with https://");
          }
          evidence_url = impactEvidence || undefined;
          metadata = {
            title:       impactDescription.trim(),
            description: impactDescription.trim(),
            category:    impactCategory,
            category_icon: IMPACT_CATEGORIES.find((c) => c.key === impactCategory)?.icon ?? "⚡",
          };
        }

        await createLog.mutateAsync({ pillar_type: pillar, value, evidence_url, metadata });
      }
      router.back();
    } catch (e: unknown) {
      // Supabase wraps Postgres trigger errors in e.message.
      // Surface them directly so rate-limit and constraint messages
      // are readable (e.g. "Rate limit: maximum 100 logs per day reached.")
      const raw = e instanceof Error ? e.message : "";
      const isRateLimit = raw.toLowerCase().includes("rate limit");
      const isConstraint =
        raw.toLowerCase().includes("check constraint") ||
        raw.toLowerCase().includes("violates");

      if (isRateLimit) {
        Alert.alert("Daily limit reached", raw.replace(/^Rate limit:\s*/i, ""));
      } else if (isConstraint) {
        Alert.alert("Invalid value", "One of your inputs is out of the allowed range. Check your values and try again.");
      } else {
        Alert.alert("Something went wrong", raw || "Please try again.");
      }
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{lang === "id" ? "Catat aktivitas" : "Log an activity"}</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={[styles.saveBtn, { backgroundColor: activePillar.color }, isLoading && { opacity: 0.5 }]}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>{t.save}</Text>
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
              <Divider color={colors.border} />
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
              <Divider color={colors.border} />
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
              <Field label="Exercise / session name" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="Bench press, Morning run, Yoga…"
                  placeholderTextColor={colors.textMuted}
                  value={vesselType}
                  onChangeText={setVesselType}
                />
              </Field>
              <Divider color={colors.border} />
              <Field label="Type" colors={colors}>
                <View style={styles.catRow}>
                  {(["strength", "cardio"] as const).map((m) => {
                    const active = vesselMode === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setVesselMode(m)}
                        style={[styles.catBtn,
                          { borderColor: active ? "#D85A30" : colors.border,
                            backgroundColor: active ? "#FEF3EE" : colors.bgInput }]}
                      >
                        <Text style={{ fontSize: 16 }}>{m === "strength" ? "🏋️" : "🫀"}</Text>
                        <Text style={[styles.catText, { color: active ? "#D85A30" : colors.textMuted },
                          active && { fontWeight: "700" }]}>
                          {m === "strength" ? "Strength" : "Cardio"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
              <Divider color={colors.border} />
              {vesselMode === "strength" ? <>
                <Field label="Sets · Reps · Weight (kg)" colors={colors}>
                  <View style={styles.triRow}>
                    <TextInput
                      style={[inputStyle, styles.triInput]}
                      placeholder="Sets"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      value={vesselSets}
                      onChangeText={setVesselSets}
                    />
                    <Text style={[styles.triSep, { color: colors.textMuted }]}>×</Text>
                    <TextInput
                      style={[inputStyle, styles.triInput]}
                      placeholder="Reps"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      value={vesselReps}
                      onChangeText={setVesselReps}
                    />
                    <Text style={[styles.triSep, { color: colors.textMuted }]}>×</Text>
                    <TextInput
                      style={[inputStyle, styles.triInput]}
                      placeholder="kg"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={vesselWeight}
                      onChangeText={setVesselWeight}
                    />
                  </View>
                  {vesselSets && vesselReps && (
                    <Text style={[styles.volumePreview, { color: "#D85A30" }]}>
                      Volume: {
                        parseFloat(vesselWeight) > 0
                          ? `${((parseInt(vesselSets)||0) * (parseInt(vesselReps)||0) * (parseFloat(vesselWeight)||0)).toLocaleString()} kg·reps`
                          : `${((parseInt(vesselSets)||0) * (parseInt(vesselReps)||0))} reps`
                      }
                    </Text>
                  )}
                </Field>
              </> : <>
                <Field label="Duration (minutes)" colors={colors}>
                  <TextInput
                    style={inputStyle}
                    placeholder="30"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={vesselMinutes}
                    onChangeText={setVesselMinutes}
                  />
                </Field>
              </>}
            </>}

            {pillar === "impact" && <>
              <Field label="What did you ship?" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="Fixed auth bug, wrote API docs, shipped v2…"
                  placeholderTextColor={colors.textMuted}
                  value={impactDescription}
                  onChangeText={setImpactDescription}
                />
              </Field>
              <Divider color={colors.border} />
              <Field label="Activity type" colors={colors}>
                <View style={styles.catGrid}>
                  {IMPACT_CATEGORIES.map((c) => {
                    const active = impactCategory === c.key;
                    return (
                      <Pressable
                        key={c.key}
                        onPress={() => setImpactCategory(c.key)}
                        style={[
                          styles.impactCatBtn,
                          { borderColor: active ? "#378ADD" : colors.border,
                            backgroundColor: active ? "#F0F7FE" : colors.bgInput },
                        ]}
                        android_ripple={{ color: "#F0F7FE" }}
                      >
                        <Text style={styles.impactCatIcon}>{c.icon}</Text>
                        <Text style={[styles.impactCatLabel,
                          { color: active ? "#378ADD" : colors.textMuted },
                          active && { fontWeight: "700" }]}>
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
              <Divider color={colors.border} />
              <Field label="Effort score (1–10)" colors={colors}>
                <View style={styles.effortRow}>
                  {["1","2","3","4","5","6","7","8","9","10"].map((n) => {
                    const active = impactEffort === n;
                    const high   = parseInt(n) >= 8;
                    const mid    = parseInt(n) >= 5;
                    const activeColor = high ? "#1D9E75" : mid ? "#378ADD" : "#BA7517";
                    return (
                      <Pressable
                        key={n}
                        onPress={() => setImpactEffort(n)}
                        style={[styles.effortBtn,
                          { borderColor: active ? activeColor : colors.border,
                            backgroundColor: active ? activeColor : colors.bgInput }]}
                      >
                        <Text style={[styles.effortBtnText,
                          { color: active ? "#fff" : colors.textMuted },
                          active && { fontWeight: "800" }]}>
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
              <Divider color={colors.border} />
              <Field label="Evidence link (optional)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="GitHub PR, Jira, Notion, Figma…"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={impactEvidence}
                  onChangeText={setImpactEvidence}
                />
              </Field>
            </>}

            {pillar === "stewardship" && <>
              <Field label="Amount (Rp)" colors={colors}>
                <View style={[inputStyle, styles.amountWrap]}>
                  <Text style={[styles.amountPrefix, { color: colors.textMuted }]}>Rp</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.textPrimary }]}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={formatRp(amount)}
                    onChangeText={handleAmountChange}
                  />
                </View>
                {amount ? (
                  <Text style={[styles.amountPreview, { color: "#BA7517" }]}>
                    Rp {formatRp(amount)}
                  </Text>
                ) : null}
              </Field>
              <Divider color={colors.border} />
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
              <Divider color={colors.border} />
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
  colors: Colors;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

// Divider is imported from ../components/ui/Divider

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

  // Vessel sets/reps/weight row
  triRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  triInput: { flex: 1, textAlign: "center" },
  triSep: { fontSize: 18, fontWeight: "300" },
  volumePreview: { fontSize: 12, fontWeight: "700", marginTop: 4 },

  // Impact category grid
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  impactCatBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1.5, width: "30.5%",
  },
  impactCatIcon: { fontSize: 14 },
  impactCatLabel: { fontSize: 12 },

  // Effort score row
  effortRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  effortBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1.5, alignItems: "center", justifyContent: "center",
  },
  effortBtnText: { fontSize: 13 },

  // Stewardship amount
  amountWrap: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 0,
  },
  amountPrefix: { fontSize: 15, fontWeight: "700", paddingVertical: 12 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: "700", paddingVertical: 12 },
  amountPreview: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});
