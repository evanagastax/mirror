import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  StyleSheet, Image, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLangStore } from "../store/langStore";
import { loadProfile, VesselProfile, GOAL_META, EQUIPMENT_META } from "../services/vesselProfile";
import {
  calcBmi, bmiCategory, BMI_META,
  calcBmr, calcTdee, targetCalories,
  recommendedVolume, estimateSetCalories,
} from "../services/vesselCalc";
import { searchCachedExercises, Exercise } from "../services/exerciseDb";
import {
  DayTemplate, PlanDay, SavedPlan,
  loadSavedPlan, savePlanToStorage, deleteSavedPlan,
} from "../services/vesselPlan";

import { PILLAR_COLORS } from "../theme/pillars";
import type { Colors } from "../types";

const VESSEL_COLOR = PILLAR_COLORS.vessel.primary;
const VESSEL_BG    = PILLAR_COLORS.vessel.bg;

// ─── Day split templates ──────────────────────────────────────────────────────

function getSplits(t: { fullBodyA: string; fullBodyB: string; push: string; pull: string; legs: string; chest: string; backMuscle: string; shoulders: string; arms: string; core: string; coreCardio: string }): Record<number, DayTemplate[]> {
  return {
    2: [
      { label: t.fullBodyA, bodyParts: ["chest", "lats", "quadriceps"], icon: "💪" },
      { label: t.fullBodyB, bodyParts: ["shoulders", "hamstrings", "abdominals"], icon: "🏋️" },
    ],
    3: [
      { label: t.push,  bodyParts: ["chest", "shoulders", "triceps"], icon: "⬆️" },
      { label: t.pull,  bodyParts: ["lats", "middle back", "biceps"], icon: "⬇️" },
      { label: t.legs,  bodyParts: ["quadriceps", "hamstrings", "calves"], icon: "🦵" },
    ],
    4: [
      { label: `${t.chest} & ${t.arms}`,  bodyParts: ["chest", "triceps"],                         icon: "💪" },
      { label: `${t.backMuscle} & Biceps`,    bodyParts: ["lats", "middle back", "biceps"],             icon: "🔙" },
      { label: `${t.legs} & ${t.core}`,      bodyParts: ["quadriceps", "hamstrings", "abdominals"],    icon: "🦵" },
      { label: `${t.shoulders} & ${t.arms}`, bodyParts: ["shoulders", "triceps", "biceps"],            icon: "🏋️" },
    ],
    5: [
      { label: t.chest,         bodyParts: ["chest", "triceps"],                          icon: "💪" },
      { label: t.backMuscle,          bodyParts: ["lats", "middle back", "lower back"],         icon: "🔙" },
      { label: t.legs,          bodyParts: ["quadriceps", "hamstrings", "glutes"],        icon: "🦵" },
      { label: t.shoulders,     bodyParts: ["shoulders", "traps"],                        icon: "🏋️" },
      { label: `${t.arms} & ${t.core}`,   bodyParts: ["biceps", "triceps", "abdominals"],           icon: "🦾" },
    ],
    6: [
      { label: t.chest,         bodyParts: ["chest", "triceps"],                          icon: "💪" },
      { label: t.backMuscle,          bodyParts: ["lats", "middle back", "lower back"],         icon: "🔙" },
      { label: t.legs,          bodyParts: ["quadriceps", "hamstrings", "glutes"],        icon: "🦵" },
      { label: t.shoulders,     bodyParts: ["shoulders", "traps"],                        icon: "🏋️" },
      { label: t.arms,          bodyParts: ["biceps", "triceps", "forearms"],             icon: "🦾" },
      { label: t.coreCardio, bodyParts: ["abdominals", "cardio"],                      icon: "🫀" },
    ],
  };
}

function getDayNames(t: { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string }): string[] {
  return [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VesselPlanScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();

  const [profile,    setProfile]    = useState<VesselProfile | null>(null);
  const [plan,       setPlan]       = useState<SavedPlan | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay,  setActiveDay]  = useState<number>(0);

  const { t } = useLangStore();
  const SPLITS = getSplits(t);
  const DAY_NAMES = getDayNames(t);

  useEffect(() => {
    Promise.all([loadProfile(userId), loadSavedPlan(userId)]).then(([p, saved]) => {
      setProfile(p);
      setPlan(saved);
      setLoading(false);
    });
  }, [userId]);

  const bmi     = profile ? calcBmi(profile.weight, profile.height) : null;
  const bmiCat  = bmi ? bmiCategory(bmi) : null;
  const bmiMeta = bmiCat ? BMI_META[bmiCat] : null;
  const bmr     = profile ? calcBmr(profile) : null;
  const tdee    = bmr ? calcTdee(bmr, profile!.daysPerWeek) : null;
  const target  = tdee ? targetCalories(tdee, profile!.goal) : null;
  const vol     = profile ? recommendedVolume(profile.goal) : null;

  // Equipment API values the user has
  const userEquipApiValues = useMemo(() => {
    if (!profile) return new Set<string>();
    const vals = profile.equipment.flatMap((k) => [EQUIPMENT_META[k].apiValue]);
    // Always include bodyweight exercises
    vals.push("body only");
    return new Set(vals);
  }, [profile]);

  async function generatePlan() {
    if (!profile) return;
    setGenerating(true);
    try {
      const days = profile.daysPerWeek;
      const templates = SPLITS[Math.min(Math.max(days, 2), 6)] ?? SPLITS[3];

      // Assign day indices Mon–Sat/Sun depending on days count
      const dayIndices = [0, 1, 2, 3, 4, 5, 6].slice(0, days);

      const planDays: PlanDay[] = [];

      for (let i = 0; i < templates.length; i++) {
        const tpl = templates[i];
        let exercises: Exercise[] = [];

        // Try each body part, pick 2–3 exercises per day
        for (const bp of tpl.bodyParts) {
          const found = await searchCachedExercises({ bodyPart: bp });
          if (found && found.length > 0) {
            // Filter by user equipment
            const compatible = found.filter((ex) =>
              ex.equipments.length === 0 ||
              ex.equipments.some((eq) => userEquipApiValues.has(eq.toLowerCase()))
            );
            // Pick up to 2 exercises per body part
            const picked = compatible.slice(0, 2);
            exercises.push(...picked);
          }
        }

        // Deduplicate
        const seen = new Set<string>();
        exercises = exercises.filter((e) => {
          if (seen.has(e.exerciseId)) return false;
          seen.add(e.exerciseId);
          return true;
        });

        // Limit to 5–6 exercises per day
        exercises = exercises.slice(0, 6);

        planDays.push({
          dayIndex: dayIndices[i],
          template: tpl,
          exercises,
          completed: false,
        });
      }

      const saved: SavedPlan = { days: planDays, generatedAt: new Date().toISOString() };
      await savePlanToStorage(userId, saved);
      setPlan(saved);
      setActiveDay(0);
      Alert.alert(
        "Plan generated ✓",
        `Your ${days}-day workout plan is ready. ${planDays.filter(d => d.exercises.length > 0).length} of ${days} days have exercises loaded.`
      );
    } catch (e: unknown) {
      Alert.alert("Couldn't generate plan", "Make sure you've browsed exercises at least once so they're cached. " + (e instanceof Error ? e.message : ""));
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    Alert.alert("Regenerate plan?", "Your current plan will be replaced.", [
      { text: "Cancel", style: "cancel" },
      { text: "Regenerate", onPress: async () => { await deleteSavedPlan(userId); setPlan(null); } },
    ]);
  }

  async function markDayComplete(dayIdx: number) {
    if (!plan) return;
    const day = plan.days[dayIdx];
    const nowComplete = !day.completed;
    const updated: SavedPlan = {
      ...plan,
      days: plan.days.map((d, i) => i === dayIdx ? { ...d, completed: nowComplete } : d),
    };
    await savePlanToStorage(userId, updated);
    setPlan(updated);
    if (nowComplete) {
      Alert.alert("Day complete 💪", `Great work on ${day.template.label}!`);
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
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Workout Plan</Text>
          <Text style={[S.headerSub,   { color: colors.textMuted }]}>
            {profile ? `${profile.daysPerWeek} days · ${GOAL_META[profile.goal].label}` : "Set up your profile first"}
          </Text>
        </View>
        {plan && (
          <Pressable onPress={handleRegenerate}
            style={[S.regenBtn, { borderColor: colors.border }]}>
            <Text style={[S.regenBtnText, { color: colors.textMuted }]}>⟳ Reset</Text>
          </Pressable>
        )}
      </View>

      {/* No profile */}
      {!profile ? (
        <View style={S.center}>
          <Text style={S.emptyEmoji}>📋</Text>
          <Text style={[S.emptyTitle, { color: colors.textPrimary }]}>No profile yet</Text>
          <Text style={[S.emptySub, { color: colors.textMuted }]}>
            Set up your fitness profile first to generate a personalised plan.
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/vessel" as any)}
            style={[S.emptyBtn, { backgroundColor: VESSEL_COLOR }]}
          >
            <Text style={S.emptyBtnText}>Go to Profile</Text>
          </Pressable>
        </View>
      ) : !plan ? (
        /* ── Generate plan ── */
        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
          {/* Stats summary */}
          <View style={[S.summaryCard, { backgroundColor: VESSEL_BG, borderColor: VESSEL_COLOR + "40" }]}>
            <View style={S.summaryRow}>
              {bmi && bmiMeta && (
                <SumStat label="BMI" value={String(bmi)} sub={bmiMeta.label} color={bmiMeta.color} />
              )}
              {target && (
                <SumStat label="Target kcal" value={target.toLocaleString()} sub="per day" color={VESSEL_COLOR} />
              )}
              <SumStat label="Goal" value={GOAL_META[profile.goal].icon} sub={GOAL_META[profile.goal].label} color={VESSEL_COLOR} />
              <SumStat label="Days/wk" value={String(profile.daysPerWeek)} sub="training" color={VESSEL_COLOR} />
            </View>
          </View>

          {/* Split preview */}
          <Text style={[S.sectionLabel, { color: colors.textMuted }]}>YOUR SPLIT</Text>
          {(SPLITS[Math.min(Math.max(profile.daysPerWeek, 2), 6)] ?? SPLITS[3]).map((tpl, i) => (
            <View key={i} style={[S.splitPreviewCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Text style={S.splitDayLabel}>
                {DAY_NAMES[i]} {tpl.icon}
              </Text>
              <Text style={[S.splitDayTitle, { color: colors.textPrimary }]}>{tpl.label}</Text>
              <Text style={[S.splitDayParts, { color: colors.textMuted }]}>
                {tpl.bodyParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" · ")}
              </Text>
            </View>
          ))}

          {/* Equipment badge */}
          <Text style={[S.sectionLabel, { color: colors.textMuted }]}>EQUIPMENT FILTER</Text>
          <View style={S.equipBadgeRow}>
            {profile.equipment.map((k) => (
              <View key={k} style={[S.equipBadge, { backgroundColor: VESSEL_BG }]}>
                <Text style={S.equipBadgeIcon}>{EQUIPMENT_META[k].icon}</Text>
                <Text style={[S.equipBadgeLabel, { color: VESSEL_COLOR }]}>{EQUIPMENT_META[k].label}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={generatePlan}
            disabled={generating}
            style={[S.generateBtn, { backgroundColor: VESSEL_COLOR }, generating && { opacity: 0.6 }]}
            android_ripple={{ color: "#c04a22" }}
          >
            {generating
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={S.generateBtnText}>⚡ Generate My Plan</Text>}
          </Pressable>
          {generating && (
            <Text style={[S.generatingHint, { color: colors.textMuted }]}>
              Filtering exercises for your equipment… this takes a moment.
            </Text>
          )}
        </ScrollView>
      ) : (
        /* ── Active plan ── */
        <View style={{ flex: 1 }}>
          {/* Day tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={[S.dayTabScroll, { borderBottomColor: colors.border }]}
            contentContainerStyle={S.dayTabRow}>
            {plan.days.map((d, i) => {
              const active = activeDay === i;
              return (
                <Pressable key={i} onPress={() => setActiveDay(i)}
                  style={[S.dayTab, active && { borderBottomColor: VESSEL_COLOR }]}>
                  <Text style={[S.dayTabName, { color: active ? VESSEL_COLOR : colors.textMuted },
                    active && { fontWeight: "700" }]}>
                    {DAY_NAMES[d.dayIndex]}
                  </Text>
                  <Text style={[S.dayTabTitle, { color: active ? VESSEL_COLOR : colors.textDisabled }]}
                    numberOfLines={1}>
                    {d.template.icon} {d.template.label}
                  </Text>
                  {d.completed && (
                    <View style={[S.dayTabDone, { backgroundColor: "#1D9E75" }]}>
                      <Text style={S.dayTabDoneText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Day detail */}
          {plan.days[activeDay] && (
            <DayDetail
              day={plan.days[activeDay]}
              dayIndex={activeDay}
              profile={profile}
              colors={colors}
              onMarkComplete={() => markDayComplete(activeDay)}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Day detail ───────────────────────────────────────────────────────────────

function DayDetail({ day, dayIndex, profile, colors, onMarkComplete }: {
  day: PlanDay; dayIndex: number; profile: VesselProfile; colors: Colors;
  onMarkComplete: () => void;
}) {
  const vol = recommendedVolume(profile.goal);
  const totalCalEstimate = day.exercises.reduce((sum, ex) => {
    return sum + estimateSetCalories(ex.bodyParts, profile.weight, vol.sets);
  }, 0);

  return (
    <ScrollView contentContainerStyle={S.dayContent} showsVerticalScrollIndicator={false}>
      {/* Day header */}
      <View style={[S.dayBanner, { backgroundColor: VESSEL_BG }]}>
        <View style={S.dayBannerLeft}>
          <Text style={[S.dayBannerTitle, { color: "#1a1a1a" }]}>{day.template.icon} {day.template.label}</Text>
          <Text style={[S.dayBannerMeta, { color: "#666" }]}>
            {day.exercises.length} exercises · ~{totalCalEstimate} kcal
          </Text>
        </View>
        <Pressable
          onPress={onMarkComplete}
          style={[S.doneBtn,
            day.completed
              ? { backgroundColor: "#1D9E75" }
              : { borderWidth: 1.5, borderColor: "#1D9E75" }]}
        >
          <Text style={[S.doneBtnText, { color: day.completed ? "#fff" : "#1D9E75" }]}>
            {day.completed ? "✓ Done" : "Mark done"}
          </Text>
        </Pressable>
      </View>

      {/* Volume target */}
      <View style={[S.volBanner, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
        <Text style={[S.volBannerTitle, { color: colors.textPrimary }]}>Target volume</Text>
        <View style={S.volBannerRow}>
          <VBStat label="Sets"  value={String(vol.sets)} colors={colors} />
          <VBStat label="Reps"  value={`${vol.repsMin}–${vol.repsMax}`} colors={colors} />
          <VBStat label="Rest"  value={`${vol.restSec}s`} colors={colors} />
        </View>
      </View>

      {/* Exercise list */}
      {day.exercises.length === 0 ? (
        <View style={S.noExWrap}>
          <Text style={S.noExEmoji}>🔍</Text>
          <Text style={[S.noExText, { color: colors.textMuted }]}>
            No cached exercises found for this day's muscle groups.
            Browse exercises in the Library first to cache them.
          </Text>
        </View>
      ) : (
        day.exercises.map((ex, i) => (
          <PlanExerciseCard key={ex.exerciseId} exercise={ex} index={i} profile={profile} colors={colors} />
        ))
      )}
    </ScrollView>
  );
}

function PlanExerciseCard({ exercise: ex, index, profile, colors }: {
  exercise: Exercise; index: number; profile: VesselProfile; colors: Colors;
}) {
  const vol  = recommendedVolume(profile.goal);
  const kcal = estimateSetCalories(ex.bodyParts, profile.weight, vol.sets);
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[S.exCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={() => setExpanded(!expanded)}
      android_ripple={{ color: VESSEL_BG }}
    >
      <View style={S.exTop}>
        <View style={[S.exNum, { backgroundColor: VESSEL_BG }]}>
          <Text style={[S.exNumText, { color: VESSEL_COLOR }]}>{index + 1}</Text>
        </View>
        <Image source={{ uri: ex.gifUrl }}
          style={[S.exGif, { backgroundColor: colors.bgSubtle }]} resizeMode="cover" />
        <View style={S.exInfo}>
          <Text style={[S.exName, { color: colors.textPrimary }]} numberOfLines={2}>
            {ex.name.charAt(0).toUpperCase() + ex.name.slice(1)}
          </Text>
          <View style={S.exTags}>
            {ex.targetMuscles.slice(0, 1).map((m) => (
              <View key={m} style={[S.exTag, { backgroundColor: VESSEL_BG }]}>
                <Text style={[S.exTagText, { color: VESSEL_COLOR }]}>{m}</Text>
              </View>
            ))}
            {ex.equipments.slice(0, 1).map((e) => (
              <View key={e} style={[S.exTag, { backgroundColor: colors.bgSubtle }]}>
                <Text style={[S.exTagText, { color: colors.textSecondary }]}>{e}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={[S.exChevron, { color: colors.textDisabled }]}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {/* Target sets/reps + calorie estimate */}
      <View style={[S.exTarget, { borderTopColor: colors.border }]}>
        <Text style={[S.exTargetText, { color: VESSEL_COLOR }]}>
          {vol.sets} × {vol.repsMin}–{vol.repsMax} reps
        </Text>
        <Text style={[S.exKcal, { color: colors.textMuted }]}>~{kcal} kcal</Text>
      </View>

      {/* Instructions (expanded) */}
      {expanded && ex.instructions.length > 0 && (
        <View style={[S.exInstructions, { borderTopColor: colors.border }]}>
          {ex.instructions.map((step, i) => (
            <View key={i} style={S.exInstructionRow}>
              <View style={S.exInstructionNum}>
                <Text style={S.exInstructionNumText}>{i + 1}</Text>
              </View>
              <Text style={[S.exInstructionText, { color: colors.textSecondary }]}>
                {step.replace(/^Step:\d+\s*/, "")}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function SumStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <View style={S.sumStat}>
      <Text style={[S.sumStatLabel, { color }]}>{label}</Text>
      <Text style={[S.sumStatValue, { color }]}>{value}</Text>
      <Text style={[S.sumStatSub, { color }]}>{sub}</Text>
    </View>
  );
}

function VBStat({ label, value, colors }: { label: string; value: string; colors: Colors }) {
  return (
    <View style={S.vbStat}>
      <Text style={[S.vbStatValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[S.vbStatLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  regenBtn: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  regenBtnText: { fontSize: 12, fontWeight: "600" },

  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 },

  summaryCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-around" },
  sumStat: { alignItems: "center", gap: 2 },
  sumStatLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  sumStatValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  sumStatSub: { fontSize: 10 },

  splitPreviewCard: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  splitDayLabel: { fontSize: 13, fontWeight: "700", color: VESSEL_COLOR, minWidth: 36 },
  splitDayTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  splitDayParts: { fontSize: 11 },

  equipBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  equipBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99 },
  equipBadgeIcon: { fontSize: 14 },
  equipBadgeLabel: { fontSize: 12, fontWeight: "600" },

  generateBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 8, overflow: "hidden" },
  generateBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  generatingHint: { textAlign: "center", fontSize: 12, marginTop: 4 },

  dayTabScroll: { flexGrow: 0, borderBottomWidth: 1 },
  dayTabRow: { paddingHorizontal: 12, paddingVertical: 4, gap: 4 },
  dayTab: { paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2.5, borderBottomColor: "transparent", minWidth: 72, gap: 2 },
  dayTabName: { fontSize: 12, fontWeight: "600" },
  dayTabTitle: { fontSize: 10 },
  dayTabDone: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 2 },
  dayTabDoneText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  dayContent: { padding: 16, paddingBottom: 40, gap: 12 },

  dayBanner: { borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center" },
  dayBannerLeft: { flex: 1 },
  dayBannerTitle: { fontSize: 18, fontWeight: "800" },
  dayBannerMeta: { fontSize: 12, marginTop: 2 },
  doneBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  doneBtnText: { fontSize: 13, fontWeight: "700" },

  volBanner: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  volBannerTitle: { fontSize: 12, fontWeight: "700" },
  volBannerRow: { flexDirection: "row", justifyContent: "space-around" },
  vbStat: { alignItems: "center", gap: 2 },
  vbStatValue: { fontSize: 18, fontWeight: "800" },
  vbStatLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },

  noExWrap: { alignItems: "center", padding: 24, gap: 8 },
  noExEmoji: { fontSize: 32 },
  noExText: { fontSize: 13, textAlign: "center", lineHeight: 20 },

  exCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  exTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  exNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  exNumText: { fontSize: 12, fontWeight: "700" },
  exGif: { width: 60, height: 60, borderRadius: 10, flexShrink: 0 },
  exInfo: { flex: 1, gap: 5 },
  exName: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  exTags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  exTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
  exTagText: { fontSize: 10, fontWeight: "500" },
  exChevron: { fontSize: 11, paddingRight: 4 },
  exTarget: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1 },
  exTargetText: { fontSize: 13, fontWeight: "700" },
  exKcal: { fontSize: 12 },
  exInstructions: { borderTopWidth: 1, padding: 12, gap: 10 },
  exInstructionRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  exInstructionNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: VESSEL_BG, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  exInstructionNumText: { fontSize: 9, fontWeight: "700", color: VESSEL_COLOR },
  exInstructionText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
