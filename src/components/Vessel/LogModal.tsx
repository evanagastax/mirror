import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  ActivityIndicator, Modal, Alert, StyleSheet, Image,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCreateLog } from "../../hooks/useCreateLog";
import { Exercise } from "../../services/exerciseDb";
import { addExerciseToPlanDay, SavedPlan } from "../../services/vesselPlan";
import { PILLAR_COLORS } from "../../theme/pillars";
import type { Colors } from "../../types";

const VESSEL_COLOR = PILLAR_COLORS.vessel.primary;
const VESSEL_BG    = PILLAR_COLORS.vessel.bg;

type SetEntry = { sets: string; reps: string; weight: string };

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function LogModal({ exercise, visible, userId, plan, onAddedToPlan, onClose, colors, isDark }: {
  exercise: Exercise; visible: boolean; userId: string;
  plan: SavedPlan | null;
  onAddedToPlan: (updated: SavedPlan) => void;
  onClose: () => void; colors: Colors; isDark: boolean;
}) {
  const createLog = useCreateLog(userId);
  const isCardio  = exercise.bodyParts.includes("cardio") ||
    exercise.targetMuscles.some((m) => m.toLowerCase().includes("cardiovascular"));

  const [logType,       setLogType]       = useState<"strength" | "cardio">(isCardio ? "cardio" : "strength");
  const [sets,          setSets]          = useState<SetEntry[]>([{ sets: "", reps: "", weight: "" }]);
  const [minutes,       setMinutes]       = useState("");
  const [distance,      setDistance]      = useState("");
  const [showHow,       setShowHow]       = useState(false);
  const [addingToPlan,  setAddingToPlan]  = useState(false);
  const [planDayIdx,    setPlanDayIdx]    = useState(0);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function addSet() {
    const last = sets[sets.length - 1];
    setSets([...sets, { sets: "", reps: last.reps, weight: last.weight }]);
  }
  function removeSet(i: number) { if (sets.length > 1) setSets(sets.filter((_, idx) => idx !== i)); }
  function updateSet(i: number, f: keyof SetEntry, v: string) {
    setSets(sets.map((s, idx) => idx === i ? { ...s, [f]: v } : s));
  }

  const totalVolume = useMemo(() =>
    sets.reduce((acc, s) => {
      const st = parseInt(s.sets,  10) || 0;
      const r  = parseInt(s.reps,  10) || 0;
      const w  = parseFloat(s.weight) || 0;
      return acc + (w > 0 ? st * r * w : st * r);
    }, 0),
  [sets]);

  function reset() { setSets([{ sets: "", reps: "", weight: "" }]); setMinutes(""); setDistance(""); }

  async function handleLog() {
    let value = 0;
    let meta: Record<string, unknown> = {
      exercise_name: exercise.name, exercise_id: exercise.exerciseId,
      body_parts: exercise.bodyParts, target_muscles: exercise.targetMuscles, source: "exercisedb",
    };
    if (logType === "cardio") {
      if (!minutes) { Alert.alert("Enter duration", "How many minutes?"); return; }
      value = parseInt(minutes, 10);
      meta  = { ...meta, type: "cardio", duration_minutes: value, distance_km: distance || undefined };
    } else {
      if (!sets.some((s) => s.sets && s.reps)) { Alert.alert("Enter sets & reps"); return; }
      value = Math.round(totalVolume);
      meta  = { ...meta, type: "strength", sets, total_volume: value };
    }
    try {
      await createLog.mutateAsync({ pillar_type: "vessel", value, metadata: meta });
      reset(); onClose();
      Alert.alert("Logged! 💪", `${cap(exercise.name)} added to Vessel.`);
    } catch (e: unknown) { Alert.alert("Error", e instanceof Error ? e.message : "Try again."); }
  }

  async function handleAddToPlan() {
    if (!plan) {
      Alert.alert("No plan yet", "Generate a workout plan first from My Plan.");
      return;
    }
    setAddingToPlan(true);
    try {
      const { plan: updated, alreadyPresent } = await addExerciseToPlanDay(userId, planDayIdx, exercise);
      if (alreadyPresent) {
        Alert.alert("Already in plan", `${cap(exercise.name)} is already in ${DAY_NAMES[plan.days[planDayIdx]?.dayIndex ?? planDayIdx]}'s workout.`);
      } else {
        onAddedToPlan(updated);
        Alert.alert("Added to plan ✓", `${cap(exercise.name)} added to ${plan.days[planDayIdx]?.template.label ?? "your plan"}.`);
      }
    } catch (e: unknown) {
      Alert.alert("Couldn't add to plan", e instanceof Error ? e.message : "Try again.");
    } finally {
      setAddingToPlan(false);
    }
  }

  const inp = [S.inp, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput }];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[S.modalRoot, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={S.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={[S.modalHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={[S.modalClose, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
              <Text style={[S.modalTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                {cap(exercise.name)}
              </Text>
              <Pressable onPress={handleLog} disabled={createLog.isPending}
                style={[S.modalSaveBtn, { backgroundColor: VESSEL_COLOR }, createLog.isPending && { opacity: 0.5 }]}>
                {createLog.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={S.modalSaveBtnText}>Log</Text>}
              </Pressable>
            </View>

            {/* GIF */}
            <Image source={{ uri: exercise.gifUrl }}
              style={[S.gif, { backgroundColor: colors.bgSubtle }]} resizeMode="contain" />

            {/* Meta pills */}
            <View style={S.metaRow}>
              <MetaPill label="Target"    value={exercise.targetMuscles.map(cap).join(", ")} color={VESSEL_COLOR} bg={VESSEL_BG} />
              <MetaPill label="Equipment" value={exercise.equipments.map(cap).join(", ")}    color={colors.textSecondary} bg={colors.bgSubtle} />
            </View>

            {/* ── Add to plan ── */}
            <View style={[S.planBox, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
              <View style={S.planBoxLeft}>
                <Text style={[S.planBoxTitle, { color: colors.textPrimary }]}>⚡ Add to My Plan</Text>
                {plan ? (
                  <Text style={[S.planBoxSub, { color: colors.textMuted }]}>
                    {plan.days.length} day plan · adding to{" "}
                    <Text style={{ fontWeight: "700", color: VESSEL_COLOR }}>
                      {plan.days[planDayIdx]?.template.label ?? "Day 1"}
                    </Text>
                  </Text>
                ) : (
                  <Text style={[S.planBoxSub, { color: colors.textMuted }]}>No plan yet — generate one from My Plan</Text>
                )}
              </View>
              <View style={S.planBoxRight}>
                {plan && plan.days.length > 1 && (
                  <Pressable
                    onPress={() => setShowDayPicker(!showDayPicker)}
                    style={[S.planDayBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[S.planDayBtnText, { color: colors.textMuted }]}>
                      {plan.days[planDayIdx]?.template.icon ?? "📅"} Day {planDayIdx + 1}
                    </Text>
                    <Text style={[S.planDayChevron, { color: colors.textMuted }]}>
                      {showDayPicker ? "▲" : "▼"}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={handleAddToPlan}
                  disabled={addingToPlan || !plan}
                  style={[S.planAddBtn,
                    plan ? { backgroundColor: VESSEL_COLOR } : { backgroundColor: colors.border },
                    addingToPlan && { opacity: 0.5 },
                  ]}
                >
                  {addingToPlan
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={S.planAddBtnText}>+ Plan</Text>}
                </Pressable>
              </View>
            </View>

            {/* Day picker row */}
            {plan && showDayPicker && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.dayPickerRow}>
                {plan.days.map((d, i) => (
                  <Pressable
                    key={i}
                    onPress={() => { setPlanDayIdx(i); setShowDayPicker(false); }}
                    style={[S.dayPickerChip,
                      { borderColor: colors.border },
                      planDayIdx === i && { backgroundColor: VESSEL_COLOR, borderColor: VESSEL_COLOR },
                    ]}
                  >
                    <Text style={[S.dayPickerChipIcon]}>{d.template.icon}</Text>
                    <Text style={[S.dayPickerChipText,
                      { color: planDayIdx === i ? "#fff" : colors.textMuted },
                      planDayIdx === i && { fontWeight: "700" },
                    ]}>
                      {d.template.label}
                    </Text>
                    {d.completed && (
                      <Text style={[S.dayPickerDone, { color: planDayIdx === i ? "#fff" : "#1D9E75" }]}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* How-to (collapsible) */}
            {exercise.instructions.length > 0 && (
              <Pressable style={[S.howToggle, { borderColor: colors.border, backgroundColor: colors.bgSubtle }]}
                onPress={() => setShowHow(!showHow)}>
                <Text style={[S.howToggleText, { color: colors.textPrimary }]}>📋 How to perform</Text>
                <Text style={[S.howChevron, { color: colors.textMuted }]}>{showHow ? "▲" : "▼"}</Text>
              </Pressable>
            )}
            {showHow && (
              <View style={[S.howCard, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
                {exercise.instructions.map((step, i) => (
                  <View key={i} style={S.howRow}>
                    <View style={S.howNum}><Text style={S.howNumText}>{i + 1}</Text></View>
                    <Text style={[S.howText, { color: colors.textSecondary }]}>
                      {step.replace(/^Step:\d+\s*/, "")}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Log type selector */}
            <View style={S.logTypeRow}>
              {(["strength", "cardio"] as const).map((type) => (
                <Pressable key={type} onPress={() => setLogType(type)}
                  style={[S.logTypeBtn, { borderColor: colors.border },
                    logType === type && { backgroundColor: VESSEL_COLOR, borderColor: VESSEL_COLOR }]}
                  android_ripple={{ color: VESSEL_BG }}>
                  <Text style={S.logTypeEmoji}>{type === "strength" ? "🏋️" : "🫀"}</Text>
                  <Text style={[S.logTypeTxt, { color: logType === type ? "#fff" : colors.textMuted },
                    logType === type && { fontWeight: "700" }]}>
                    {type === "strength" ? "Strength" : "Cardio"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Strength table */}
            {logType === "strength" && (
              <View style={[S.setsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={S.setsHeader}>
                  <Text style={[S.colLbl, { color: colors.textDisabled, width: 28 }]}>#</Text>
                  <Text style={[S.colLbl, { color: colors.textDisabled, flex: 1 }]}>SETS</Text>
                  <Text style={[S.colLbl, { color: colors.textDisabled, flex: 1 }]}>REPS</Text>
                  <Text style={[S.colLbl, { color: colors.textDisabled, flex: 1.2 }]}>KG</Text>
                  <View style={{ width: 28 }} />
                </View>
                <View style={[S.setsDivider, { backgroundColor: colors.border }]} />
                {sets.map((s, i) => (
                  <View key={i} style={S.setRow}>
                    <View style={[S.setNum, { backgroundColor: VESSEL_BG }]}>
                      <Text style={[S.setNumTxt, { color: VESSEL_COLOR }]}>{i + 1}</Text>
                    </View>
                    <TextInput style={[inp, S.setInp]} value={s.sets}   onChangeText={(v) => updateSet(i, "sets",   v)} placeholder="3"  placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
                    <TextInput style={[inp, S.setInp]} value={s.reps}   onChangeText={(v) => updateSet(i, "reps",   v)} placeholder="10" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
                    <TextInput style={[inp, S.setInp, { flex: 1.2 }]} value={s.weight} onChangeText={(v) => updateSet(i, "weight", v)} placeholder="60" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" />
                    <Pressable onPress={() => removeSet(i)} hitSlop={8} style={S.removeBtn}>
                      <Text style={{ color: sets.length > 1 ? VESSEL_COLOR : colors.textDisabled, fontSize: 14 }}>✕</Text>
                    </Pressable>
                  </View>
                ))}
                <Pressable onPress={addSet} style={[S.addSetBtn, { borderColor: VESSEL_COLOR }]} android_ripple={{ color: VESSEL_BG }}>
                  <Text style={[S.addSetTxt, { color: VESSEL_COLOR }]}>+ Add set</Text>
                </Pressable>
                {totalVolume > 0 && (
                  <View style={[S.volumeRow, { borderTopColor: colors.border }]}>
                    <Text style={[S.volumeLabel, { color: colors.textMuted }]}>Total volume</Text>
                    <Text style={[S.volumeVal, { color: VESSEL_COLOR }]}>
                      {totalVolume.toLocaleString()} {sets.some((s) => parseFloat(s.weight) > 0) ? "kg·reps" : "reps"}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Cardio fields */}
            {logType === "cardio" && (
              <View style={[S.setsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={S.cardioRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.colLbl, { color: colors.textMuted, marginBottom: 8 }]}>DURATION (min)</Text>
                    <TextInput
                      style={[inp, { textAlign: "center", fontSize: 28, fontWeight: "700", paddingVertical: 14 }]}
                      value={minutes} onChangeText={setMinutes}
                      placeholder="30" placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.colLbl, { color: colors.textMuted, marginBottom: 8 }]}>DISTANCE (km)</Text>
                    <TextInput
                      style={[inp, { textAlign: "center", fontSize: 28, fontWeight: "700", paddingVertical: 14 }]}
                      value={distance} onChangeText={setDistance}
                      placeholder="5" placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function MetaPill({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[S.metaPill, { backgroundColor: bg }]}>
      <Text style={[S.metaLabel, { color }]}>{label}</Text>
      <Text style={[S.metaValue, { color }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  modalClose: { fontSize: 18 },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  modalSaveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  modalSaveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  modalContent: { padding: 16, paddingBottom: 40, gap: 14 },

  gif: { width: "100%", height: 220, borderRadius: 14 },

  metaRow: { flexDirection: "row", gap: 10 },
  metaPill: { flex: 1, borderRadius: 12, padding: 12, gap: 3 },
  metaLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  metaValue: { fontSize: 13, fontWeight: "500" },

  howToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  howToggleText: { fontSize: 14, fontWeight: "600" },
  howChevron: { fontSize: 12 },
  howCard: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  howRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  howNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: VESSEL_BG, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  howNumText: { fontSize: 10, fontWeight: "700", color: VESSEL_COLOR },
  howText: { flex: 1, fontSize: 13, lineHeight: 20 },

  logTypeRow: { flexDirection: "row", gap: 10 },
  logTypeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  logTypeEmoji: { fontSize: 16 },
  logTypeTxt: { fontSize: 14 },

  setsCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  setsHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  colLbl: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", textAlign: "center" },
  setsDivider: { height: 1 },
  setRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  setNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  setNumTxt: { fontSize: 12, fontWeight: "700" },
  inp: { borderWidth: 1, borderRadius: 8, paddingVertical: 9, fontSize: 15, textAlign: "center" },
  setInp: { flex: 1 },
  removeBtn: { width: 28, alignItems: "center" },
  addSetBtn: { margin: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  addSetTxt: { fontSize: 13, fontWeight: "600" },
  volumeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, padding: 14 },
  volumeLabel: { fontSize: 13 },
  volumeVal: { fontSize: 16, fontWeight: "700" },

  cardioRow: { flexDirection: "row", gap: 12, padding: 14 },

  // Add to plan
  planBox: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  planBoxLeft: { flex: 1, gap: 3 },
  planBoxTitle: { fontSize: 14, fontWeight: "700" },
  planBoxSub: { fontSize: 11, lineHeight: 16 },
  planBoxRight: { alignItems: "flex-end", gap: 6 },
  planDayBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  planDayBtnText: { fontSize: 12, fontWeight: "600" },
  planDayChevron: { fontSize: 10 },
  planAddBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, minWidth: 70, alignItems: "center" },
  planAddBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Day picker
  dayPickerRow: { gap: 8, paddingVertical: 4 },
  dayPickerChip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  dayPickerChipIcon: { fontSize: 14 },
  dayPickerChipText: { fontSize: 12 },
  dayPickerDone: { fontSize: 11, fontWeight: "700" },
});
