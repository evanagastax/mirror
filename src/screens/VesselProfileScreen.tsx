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
import {
  loadProfile, saveProfile,
  VesselProfile, Sex, FitnessGoal,
  GOAL_META, EQUIPMENT_META, EquipmentKey,
} from "../services/vesselProfile";
import {
  calcBmi, bmiCategory, BMI_META,
  calcBmr, calcTdee, targetCalories,
  calcLbm, idealBodyWeight, estimateBodyFat,
  recommendedVolume,
} from "../services/vesselCalc";

import { PILLAR_COLORS } from "../theme/pillars";
import type { Colors } from "../types";

const VESSEL_COLOR = PILLAR_COLORS.vessel.primary;
const VESSEL_BG    = PILLAR_COLORS.vessel.bg;

const ALL_EQUIPMENT = Object.keys(EQUIPMENT_META) as EquipmentKey[];

export default function VesselProfileScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [existing, setExisting] = useState<VesselProfile | null>(null);

  // Form fields
  const [weight,      setWeight]      = useState("70");
  const [height,      setHeight]      = useState("170");
  const [age,         setAge]         = useState("25");
  const [sex,         setSex]         = useState<Sex>("male");
  const [goal,        setGoal]        = useState<FitnessGoal>("muscle_gain");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment,   setEquipment]   = useState<EquipmentKey[]>(["body_weight", "dumbbell"]);

  useEffect(() => {
    loadProfile(userId).then((p) => {
      if (p) {
        setExisting(p);
        setWeight(String(p.weight));
        setHeight(String(p.height));
        setAge(String(p.age));
        setSex(p.sex);
        setGoal(p.goal);
        setDaysPerWeek(p.daysPerWeek);
        setEquipment(p.equipment);
      }
      setLoading(false);
    });
  }, [userId]);

  function toggleEquipment(key: EquipmentKey) {
    setEquipment((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  }

  const wKg = parseFloat(weight) || 0;
  const hCm = parseFloat(height) || 0;
  const aYr = parseInt(age, 10) || 0;

  const bmi      = wKg > 0 && hCm > 0 ? calcBmi(wKg, hCm) : null;
  const bmiCat   = bmi ? bmiCategory(bmi) : null;
  const bmiMeta  = bmiCat ? BMI_META[bmiCat] : null;
  const bmr      = wKg > 0 && hCm > 0 && aYr > 0 ? calcBmr({ weight: wKg, height: hCm, age: aYr, sex }) : null;
  const tdee     = bmr ? calcTdee(bmr, daysPerWeek) : null;
  const target   = tdee ? targetCalories(tdee, goal) : null;
  const ibw      = hCm > 0 ? idealBodyWeight(hCm, sex) : null;
  const lbm      = wKg > 0 && hCm > 0 ? calcLbm({ weight: wKg, height: hCm, sex }) : null;
  const bf       = bmi && aYr > 0 ? estimateBodyFat(bmi, aYr, sex) : null;
  const vol      = recommendedVolume(goal);

  async function handleSave() {
    if (!wKg || !hCm || !aYr) {
      Alert.alert("Incomplete", "Please fill in weight, height, and age.");
      return;
    }
    if (equipment.length === 0) {
      Alert.alert("Equipment", "Select at least one equipment option.");
      return;
    }
    setSaving(true);
    try {
      const profile: VesselProfile = {
        weight: wKg, height: hCm, age: aYr,
        sex, goal, daysPerWeek, equipment,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveProfile(userId, profile);
      Alert.alert("Profile saved ✓", "Your fitness profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert("Save failed", e instanceof Error ? e.message : "Couldn't save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={VESSEL_COLOR} size="large" /></View>
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
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Fitness Profile</Text>
          <Text style={[S.headerSub,   { color: colors.textMuted }]}>Body stats & training goal</Text>
        </View>
        <Pressable
          onPress={handleSave} disabled={saving}
          style={[S.saveBtn, { backgroundColor: VESSEL_COLOR }, saving && { opacity: 0.5 }]}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={S.saveBtnText}>Save</Text>}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── BMI preview card ── */}
          {bmi && bmiMeta && (
            <View style={[S.bmiCard, { backgroundColor: bmiMeta.bg, borderColor: bmiMeta.color }]}>
              <View style={S.bmiRow}>
                <View>
                  <Text style={[S.bmiLabel, { color: bmiMeta.color }]}>BMI</Text>
                  <Text style={[S.bmiValue, { color: bmiMeta.color }]}>{bmi}</Text>
                  <Text style={[S.bmiCat, { color: bmiMeta.color }]}>{bmiMeta.label}</Text>
                </View>
                <View style={S.bmiStats}>
                  {lbm  && <StatLine label="Lean Mass"  value={`${lbm} kg`}   color={bmiMeta.color} />}
                  {bf   && <StatLine label="Est. BF%"   value={`${bf}%`}       color={bmiMeta.color} />}
                  {ibw  && <StatLine label="Ideal BW"   value={`${ibw} kg`}    color={bmiMeta.color} />}
                </View>
              </View>

              {/* BMI gauge bar */}
              <View style={[S.gaugeTrack, { backgroundColor: bmiMeta.color + "33" }]}>
                <View style={[S.gaugeFill, {
                  width: `${Math.min(Math.max((bmi - 10) / 30 * 100, 2), 98)}%` as any,
                  backgroundColor: bmiMeta.color,
                }]} />
                <View style={[S.gaugeMarker, { left: `${(18.5 - 10) / 30 * 100}%` as any }]} />
                <View style={[S.gaugeMarker, { left: `${(25 - 10) / 30 * 100}%` as any }]} />
                <View style={[S.gaugeMarker, { left: `${(30 - 10) / 30 * 100}%` as any }]} />
              </View>
              <View style={S.gaugeLabels}>
                <Text style={[S.gaugeLabel, { color: bmiMeta.color }]}>Under</Text>
                <Text style={[S.gaugeLabel, { color: bmiMeta.color }]}>Normal</Text>
                <Text style={[S.gaugeLabel, { color: bmiMeta.color }]}>Over</Text>
                <Text style={[S.gaugeLabel, { color: bmiMeta.color }]}>Obese</Text>
              </View>
            </View>
          )}

          {/* ── Body stats ── */}
          <SectionLabel label="BODY STATS" colors={colors} />
          <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {/* Weight + Height row */}
            <View style={S.fieldRow}>
              <NumberField
                label="Weight (kg)" value={weight} onChangeText={setWeight}
                placeholder="70" decimal colors={colors}
              />
              <NumberField
                label="Height (cm)" value={height} onChangeText={setHeight}
                placeholder="170" decimal colors={colors}
              />
              <NumberField
                label="Age (yrs)" value={age} onChangeText={setAge}
                placeholder="25" colors={colors}
              />
            </View>
            <Divider colors={colors} />
            {/* Sex selector */}
            <View style={S.fieldWrap}>
              <Text style={[S.fieldLabel, { color: colors.textMuted }]}>SEX</Text>
              <View style={S.pillRow}>
                {(["male", "female"] as Sex[]).map((s) => (
                  <Pressable key={s} onPress={() => setSex(s)}
                    style={[S.pill, { borderColor: colors.border },
                      sex === s && { backgroundColor: VESSEL_COLOR, borderColor: VESSEL_COLOR }]}>
                    <Text style={[S.pillText, { color: sex === s ? "#fff" : colors.textMuted },
                      sex === s && { fontWeight: "700" }]}>
                      {s === "male" ? "♂ Male" : "♀ Female"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* ── Calorie info ── */}
          {bmr && tdee && target && (
            <>
              <SectionLabel label="DAILY CALORIES" colors={colors} />
              <View style={S.calorieRow}>
                <CalCard label="BMR"    value={bmr}    sub="Base metabolic rate"        color={colors.textSecondary} bg={colors.bgSubtle} />
                <CalCard label="TDEE"   value={tdee}   sub="Total daily expenditure"    color="#378ADD" bg="#F0F7FE" />
                <CalCard label="Target" value={target} sub={GOAL_META[goal].label}      color={VESSEL_COLOR} bg={VESSEL_BG} />
              </View>
            </>
          )}

          {/* ── Fitness goal ── */}
          <SectionLabel label="FITNESS GOAL" colors={colors} />
          <View style={S.goalGrid}>
            {(Object.keys(GOAL_META) as FitnessGoal[]).map((g) => {
              const meta   = GOAL_META[g];
              const active = goal === g;
              return (
                <Pressable key={g} onPress={() => setGoal(g)}
                  style={[S.goalCard, { backgroundColor: colors.bgCard, borderColor: colors.border },
                    active && { borderColor: VESSEL_COLOR, borderWidth: 2 }]}
                  android_ripple={{ color: VESSEL_BG }}>
                  <Text style={S.goalIcon}>{meta.icon}</Text>
                  <Text style={[S.goalLabel, { color: colors.textPrimary }, active && { color: VESSEL_COLOR }]}>
                    {meta.label}
                  </Text>
                  <Text style={[S.goalDesc, { color: colors.textMuted }]} numberOfLines={2}>
                    {meta.desc}
                  </Text>
                  {active && (
                    <View style={[S.goalCheck, { backgroundColor: VESSEL_COLOR }]}>
                      <Text style={S.goalCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Recommended volume for goal */}
          <View style={[S.volCard, { backgroundColor: VESSEL_BG, borderColor: VESSEL_COLOR + "40" }]}>
            <Text style={[S.volTitle, { color: VESSEL_COLOR }]}>Recommended volume for {GOAL_META[goal].label}</Text>
            <View style={S.volRow}>
              <VolStat label="Sets"    value={String(vol.sets)} />
              <VolStat label="Reps"    value={`${vol.repsMin}–${vol.repsMax}`} />
              <VolStat label="Rest"    value={`${vol.restSec}s`} />
            </View>
            <Text style={[S.volHint, { color: VESSEL_COLOR }]}>{vol.label}</Text>
          </View>

          {/* ── Training days ── */}
          <SectionLabel label="DAYS PER WEEK" colors={colors} />
          <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={S.daysRow}>
              {[2, 3, 4, 5, 6].map((d) => (
                <Pressable key={d} onPress={() => setDaysPerWeek(d)}
                  style={[S.dayBtn, { borderColor: colors.border },
                    daysPerWeek === d && { backgroundColor: VESSEL_COLOR, borderColor: VESSEL_COLOR }]}>
                  <Text style={[S.dayBtnNum, { color: daysPerWeek === d ? "#fff" : colors.textPrimary }]}>{d}</Text>
                  <Text style={[S.dayBtnLabel, { color: daysPerWeek === d ? "#fff" : colors.textMuted }]}>
                    {d === 2 ? "days" : d === 3 ? "days" : d === 4 ? "days" : d === 5 ? "days" : "days"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Equipment ── */}
          <SectionLabel label="AVAILABLE EQUIPMENT" colors={colors} />
          <View style={S.equipGrid}>
            {ALL_EQUIPMENT.map((key) => {
              const meta   = EQUIPMENT_META[key];
              const active = equipment.includes(key);
              return (
                <Pressable key={key} onPress={() => toggleEquipment(key)}
                  style={[S.equipCard, { backgroundColor: colors.bgCard, borderColor: colors.border },
                    active && { borderColor: VESSEL_COLOR, backgroundColor: VESSEL_BG }]}
                  android_ripple={{ color: VESSEL_BG }}>
                  <Text style={S.equipIcon}>{meta.icon}</Text>
                  <Text style={[S.equipLabel, { color: active ? VESSEL_COLOR : colors.textPrimary },
                    active && { fontWeight: "700" }]} numberOfLines={2}>
                    {meta.label}
                  </Text>
                  {active && (
                    <View style={[S.equipCheck, { backgroundColor: VESSEL_COLOR }]}>
                      <Text style={S.equipCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label, colors }: { label: string; colors: Colors }) {
  return (
    <Text style={[S.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
  );
}

function Divider({ colors }: { colors: Colors }) {
  return <View style={[S.divider, { backgroundColor: colors.border }]} />;
}

function NumberField({ label, value, onChangeText, placeholder, decimal, colors }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; decimal?: boolean; colors: Colors;
}) {
  return (
    <View style={S.numField}>
      <Text style={[S.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[S.numInput, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
      />
    </View>
  );
}

function StatLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={S.statLine}>
      <Text style={[S.statLineLabel, { color }]}>{label}</Text>
      <Text style={[S.statLineValue, { color }]}>{value}</Text>
    </View>
  );
}

function CalCard({ label, value, sub, color, bg }: {
  label: string; value: number; sub: string; color: string; bg: string;
}) {
  return (
    <View style={[S.calCard, { backgroundColor: bg }]}>
      <Text style={[S.calLabel, { color }]}>{label}</Text>
      <Text style={[S.calValue, { color }]}>{value.toLocaleString()}</Text>
      <Text style={[S.calSub, { color }]} numberOfLines={2}>{sub}</Text>
    </View>
  );
}

function VolStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={S.volStat}>
      <Text style={[S.volStatValue, { color: VESSEL_COLOR }]}>{value}</Text>
      <Text style={[S.volStatLabel, { color: VESSEL_COLOR }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40, gap: 12 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginTop: 8, marginBottom: 2 },

  // BMI card
  bmiCard: { borderWidth: 1.5, borderRadius: 20, padding: 16, gap: 10 },
  bmiRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  bmiLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  bmiValue: { fontSize: 44, fontWeight: "800", letterSpacing: -2, lineHeight: 50 },
  bmiCat: { fontSize: 13, fontWeight: "600" },
  bmiStats: { gap: 6 },
  statLine: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  statLineLabel: { fontSize: 12 },
  statLineValue: { fontSize: 12, fontWeight: "700" },
  gaugeTrack: { height: 8, borderRadius: 99, overflow: "visible", position: "relative" },
  gaugeFill: { height: 8, borderRadius: 99 },
  gaugeMarker: { position: "absolute", top: -2, width: 2, height: 12, backgroundColor: "rgba(0,0,0,0.2)" },
  gaugeLabels: { flexDirection: "row", justifyContent: "space-between" },
  gaugeLabel: { fontSize: 9, fontWeight: "600" },

  // Cards
  card: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  fieldRow: { flexDirection: "row", gap: 10, padding: 14 },
  numField: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  numInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, fontSize: 18, fontWeight: "700", textAlign: "center" },
  divider: { height: 1 },
  fieldWrap: { padding: 14, gap: 8 },
  pillRow: { flexDirection: "row", gap: 10 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
  pillText: { fontSize: 14 },

  // Calorie row
  calorieRow: { flexDirection: "row", gap: 8 },
  calCard: { flex: 1, borderRadius: 14, padding: 12, gap: 3 },
  calLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  calValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  calSub: { fontSize: 10, lineHeight: 14 },

  // Goal grid
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCard: { width: "47.5%", borderWidth: 1, borderRadius: 18, padding: 14, gap: 4, overflow: "hidden", minHeight: 110 },
  goalIcon: { fontSize: 24, marginBottom: 2 },
  goalLabel: { fontSize: 14, fontWeight: "700" },
  goalDesc: { fontSize: 11, lineHeight: 16 },
  goalCheck: { position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  goalCheckText: { fontSize: 10, color: "#fff", fontWeight: "800" },

  // Volume card
  volCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  volTitle: { fontSize: 13, fontWeight: "700" },
  volRow: { flexDirection: "row", justifyContent: "space-around" },
  volStat: { alignItems: "center", gap: 2 },
  volStatValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  volStatLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  volHint: { fontSize: 11, textAlign: "center" },

  // Days
  daysRow: { flexDirection: "row", gap: 8, padding: 14 },
  dayBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: "center", gap: 2 },
  dayBtnNum: { fontSize: 20, fontWeight: "800" },
  dayBtnLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },

  // Equipment grid
  equipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  equipCard: { width: "47.5%", borderWidth: 1, borderRadius: 16, padding: 14, gap: 6, overflow: "hidden" },
  equipIcon: { fontSize: 22 },
  equipLabel: { fontSize: 13 },
  equipCheck: { position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  equipCheckText: { fontSize: 10, color: "#fff", fontWeight: "800" },
});
