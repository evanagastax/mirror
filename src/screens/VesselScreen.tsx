import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, FlatList, Pressable, TextInput,
  ActivityIndicator, Modal, Alert, StyleSheet, Image,
  RefreshControl, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useExercises } from "../hooks/useExercises";
import { usePillars } from "../hooks/usePillars";
import { useCreateLog } from "../hooks/useCreateLog";
import { scoreToLevel } from "../utils/pillarLevel";
import { Exercise, BODY_PARTS } from "../services/exerciseDb";
import { OfflineBanner } from "../components/OfflineBanner";
import { loadProfile, VesselProfile, EQUIPMENT_META, GOAL_META } from "../services/vesselProfile";
import { calcBmi, bmiCategory, BMI_META, calcBmr, calcTdee, targetCalories, estimateSetCalories, recommendedVolume } from "../services/vesselCalc";

const VESSEL_COLOR = "#D85A30";
const VESSEL_BG    = "#FEF3EE";

const PART_META: Record<string, { emoji: string; label: string; desc: string }> = {
  back:         { emoji: "🔙", label: "Back",       desc: "Lats, traps, rhomboids" },
  cardio:       { emoji: "🫀", label: "Cardio",     desc: "Running, cycling, HIIT" },
  chest:        { emoji: "💪", label: "Chest",      desc: "Pecs, push movements" },
  "lower arms": { emoji: "🦾", label: "Forearms",   desc: "Wrist & grip strength" },
  "lower legs": { emoji: "🦵", label: "Calves",     desc: "Calf raises, tibialis" },
  neck:         { emoji: "🔝", label: "Neck",       desc: "Neck flexion & extension" },
  shoulders:    { emoji: "🏋️", label: "Shoulders",  desc: "Delts, rotator cuff" },
  "upper arms": { emoji: "💪", label: "Biceps",     desc: "Curls & tricep work" },
  "upper legs": { emoji: "🦿", label: "Quads",      desc: "Quads, hamstrings, glutes" },
  waist:        { emoji: "⭕", label: "Core",       desc: "Abs, obliques, lower back" },
};

// Ordered for the grid — 2 columns
const GRID_PARTS = BODY_PARTS as readonly string[];

type SetEntry = { sets: string; reps: string; weight: string };
type C = ReturnType<typeof useThemeStore.getState>["colors"];

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function VesselScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId);
  const { isDark, colors } = useThemeStore();
  const { data: pillars }  = usePillars(userId);

  // null = menu, string = drill-down into that body part
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [profile, setProfile] = useState<VesselProfile | null>(null);

  useEffect(() => {
    if (userId) loadProfile(userId).then(setProfile);
  }, [userId]);

  const { level, xp, xpMax } = scoreToLevel(pillars?.vessel ?? 0);
  const barPct = xp / xpMax;

  // Equipment API values from profile for filtering
  const equipmentApiValues = useMemo(() => {
    if (!profile) return undefined;
    const vals = profile.equipment.map((k) => EQUIPMENT_META[k].apiValue);
    vals.push("body weight");
    return vals;
  }, [profile]);

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <View style={S.headerLeft}>
          {activeCategory ? (
            <Pressable onPress={() => setActiveCategory(null)} hitSlop={12}>
              <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
            </Pressable>
          )}
          <View>
            <Text style={[S.headerTitle, { color: colors.textPrimary }]}>
              {activeCategory
                ? (PART_META[activeCategory]?.label ?? cap(activeCategory))
                : "Vessel"}
            </Text>
            <Text style={[S.headerSub, { color: colors.textMuted }]}>
              {activeCategory
                ? (PART_META[activeCategory]?.desc ?? "Exercises")
                : "Body & Strength"}
            </Text>
          </View>
        </View>
        <View style={[S.levelBadge, { backgroundColor: VESSEL_BG }]}>
          <Text style={[S.levelNum, { color: VESSEL_COLOR }]}>Lv {level}</Text>
          <View style={[S.levelTrack, { backgroundColor: "#f5c9b5" }]}>
            <View style={[S.levelFill, { width: `${barPct * 100}%` as any }]} />
          </View>
          <Text style={[S.levelXp, { color: VESSEL_COLOR }]}>{xp}/{xpMax} xp</Text>
        </View>
      </View>

      {activeCategory
        ? <ExerciseList
            bodyPart={activeCategory}
            userId={userId!}
            colors={colors}
            isDark={isDark}
            equipmentFilter={equipmentApiValues}
          />
        : <CategoryMenu
            colors={colors}
            onSelect={setActiveCategory}
            profile={profile}
            router={router}
          />
      }
    </SafeAreaView>
  );
}

// ─── Category menu (default view) ────────────────────────────────────────────

function CategoryMenu({ colors, onSelect, profile, router }: {
  colors: C;
  onSelect: (part: string) => void;
  profile: VesselProfile | null;
  router: ReturnType<typeof useRouter>;
}) {
  const bmi    = profile ? calcBmi(profile.weight, profile.height) : null;
  const bmiCat = bmi ? bmiCategory(bmi) : null;
  const bmiM   = bmiCat ? BMI_META[bmiCat] : null;
  const bmr    = profile ? calcBmr(profile) : null;
  const tdee   = bmr ? calcTdee(bmr, profile!.daysPerWeek) : null;
  const target = tdee ? targetCalories(tdee, profile!.goal) : null;

  return (
    <ScrollView contentContainerStyle={S.menuContent} showsVerticalScrollIndicator={false}>

      {/* ── Profile / Plan cards ── */}
      <View style={S.actionRow}>
        <Pressable
          style={[S.actionCard, { backgroundColor: VESSEL_BG, borderColor: VESSEL_COLOR + "40" }]}
          onPress={() => router.push("/vessel-profile" as any)}
          android_ripple={{ color: VESSEL_BG }}
        >
          <Text style={S.actionCardIcon}>📋</Text>
          <Text style={[S.actionCardLabel, { color: VESSEL_COLOR }]}>My Profile</Text>
          {profile ? (
            <Text style={[S.actionCardSub, { color: VESSEL_COLOR }]}>
              {profile.weight}kg · {profile.height}cm · {GOAL_META[profile.goal].icon} {GOAL_META[profile.goal].label}
            </Text>
          ) : (
            <Text style={[S.actionCardSub, { color: VESSEL_COLOR }]}>Tap to set up →</Text>
          )}
        </Pressable>
        <Pressable
          style={[S.actionCard, { backgroundColor: "#F0FBF7", borderColor: "#1D9E7540" }]}
          onPress={() => router.push("/vessel-plan" as any)}
          android_ripple={{ color: "#F0FBF7" }}
        >
          <Text style={S.actionCardIcon}>⚡</Text>
          <Text style={[S.actionCardLabel, { color: "#1D9E75" }]}>My Plan</Text>
          {profile ? (
            <Text style={[S.actionCardSub, { color: "#1D9E75" }]}>
              {profile.daysPerWeek} days/week →
            </Text>
          ) : (
            <Text style={[S.actionCardSub, { color: "#1D9E75" }]}>Set profile first →</Text>
          )}
        </Pressable>
      </View>

      {/* ── Stats strip (shown if profile exists) ── */}
      {profile && bmiM && target && (
        <View style={[S.statsStrip, { backgroundColor: bmiM.bg, borderColor: bmiM.color + "40" }]}>
          <StripStat label="BMI"         value={String(calcBmi(profile.weight, profile.height))} color={bmiM.color} />
          <View style={[S.stripDiv, { backgroundColor: bmiM.color + "30" }]} />
          <StripStat label="Target kcal" value={target.toLocaleString()} color={bmiM.color} />
          <View style={[S.stripDiv, { backgroundColor: bmiM.color + "30" }]} />
          <StripStat label="Goal"        value={GOAL_META[profile.goal].icon + " " + GOAL_META[profile.goal].label} color={bmiM.color} />
        </View>
      )}

      {/* ── Muscle group grid ── */}
      <Text style={[S.menuSectionLabel, { color: colors.textMuted }]}>MUSCLE GROUPS</Text>
      <View style={S.menuGrid}>
        {GRID_PARTS.map((part) => {
          const meta = PART_META[part] ?? { emoji: "💪", label: cap(part), desc: "" };
          return (
            <Pressable
              key={part}
              style={[S.menuCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() => onSelect(part)}
              android_ripple={{ color: VESSEL_BG }}
            >
              <View style={[S.menuCardIcon, { backgroundColor: VESSEL_BG }]}>
                <Text style={S.menuCardEmoji}>{meta.emoji}</Text>
              </View>
              <Text style={[S.menuCardLabel, { color: colors.textPrimary }]}>{meta.label}</Text>
              <Text style={[S.menuCardDesc, { color: colors.textMuted }]} numberOfLines={2}>
                {meta.desc}
              </Text>
              <Text style={[S.menuCardArrow, { color: colors.textDisabled }]}>›</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Exercise list (drill-down view) ─────────────────────────────────────────

function ExerciseList({ bodyPart, userId, colors, isDark, equipmentFilter }: {
  bodyPart: string; userId: string; colors: C; isDark: boolean;
  equipmentFilter?: string[];
}) {
  const [search,    setSearch]    = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected,  setSelected]  = useState<Exercise | null>(null);
  const [modalVisible, setModal]  = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((t: string) => {
    setSearch(t);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(t), 400);
  }, []);

  const filters = useMemo(() => ({
    bodyPart,
    ...(debounced.trim() ? { name: debounced.trim() } : {}),
  }), [bodyPart, debounced]);

  const {
    data, isLoading, isError,
    fetchNextPage, hasNextPage, isFetchingNextPage,
    refetch, isRefetching,
  } = useExercises(filters);

  const exercises = useMemo(() => {
    const all  = data?.pages.flatMap((p) => p.data) ?? [];
    const seen = new Set<string>();
    const deduped = all.filter((e) => {
      if (seen.has(e.exerciseId)) return false;
      seen.add(e.exerciseId);
      return true;
    });
    // Client-side equipment filter if profile has equipment set
    if (!equipmentFilter || equipmentFilter.length === 0) return deduped;
    const eqSet = new Set(equipmentFilter.map((e) => e.toLowerCase()));
    return deduped.filter((ex) =>
      ex.equipments.length === 0 ||
      ex.equipments.some((eq) => eqSet.has(eq.toLowerCase()))
    );
  }, [data, equipmentFilter]);

  const isOffline = useMemo(() => data?.pages.some((p) => p.fromCache) ?? false, [data]);

  function openModal(ex: Exercise) { setSelected(ex); setModal(true); }
  function closeModal() { setModal(false); setTimeout(() => setSelected(null), 300); }

  return (
    <>
      {isOffline && <OfflineBanner />}

      {/* Search bar */}
      <View style={[S.searchWrap, { borderBottomColor: colors.border }]}>
        <View style={[S.searchBox, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
          <Text style={[S.searchIcon, { color: colors.textMuted }]}>🔍</Text>
          <TextInput
            style={[S.searchInput, { color: colors.textPrimary }]}
            placeholder={`Search ${PART_META[bodyPart]?.label ?? bodyPart} exercises…`}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(""); setDebounced(""); }} hitSlop={8}>
              <Text style={[S.clearBtn, { color: colors.textMuted }]}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Equipment filter badge */}
      {equipmentFilter && equipmentFilter.length > 0 && (
        <View style={[S.equipBadgeBar, { borderBottomColor: colors.border }]}>
          <Text style={[S.equipBadgeBarLabel, { color: colors.textMuted }]}>Filtered by your equipment</Text>
          <View style={[S.equipBadgeDot, { backgroundColor: VESSEL_COLOR }]} />
        </View>
      )}

      {/* Result count */}
      {!isLoading && !isError && exercises.length > 0 && (
        <Text style={[S.resultCount, { color: colors.textDisabled }]}>
          {exercises.length}+ exercises
        </Text>
      )}

      {isLoading ? (
        <View style={S.center}>
          <ActivityIndicator color={VESSEL_COLOR} size="large" />
          <Text style={[S.stateText, { color: colors.textMuted }]}>Loading exercises…</Text>
        </View>
      ) : isError ? (
        <View style={S.center}>
          <Text style={S.stateEmoji}>⚠️</Text>
          <Text style={[S.stateText, { color: colors.textPrimary }]}>Couldn't load exercises.</Text>
          <Pressable onPress={() => refetch()} style={[S.retryBtn, { borderColor: colors.border }]}>
            <Text style={[S.retryText, { color: colors.textPrimary }]}>Retry</Text>
          </Pressable>
        </View>
      ) : exercises.length === 0 ? (
        <View style={S.center}>
          <Text style={S.stateEmoji}>🏋️</Text>
          <Text style={[S.stateText, { color: colors.textPrimary }]}>No exercises found</Text>
          <Text style={[S.stateSub, { color: colors.textMuted }]}>Try a different search</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          contentContainerStyle={S.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={VESSEL_COLOR} />}
          renderItem={({ item }) => (
            <ExerciseCard exercise={item} onPress={() => openModal(item)} colors={colors} />
          )}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage
              ? <View style={S.footerLoader}><ActivityIndicator color={VESSEL_COLOR} size="small" /></View>
              : null
          }
        />
      )}

      {selected && (
        <LogModal exercise={selected} visible={modalVisible} userId={userId}
          onClose={closeModal} colors={colors} isDark={isDark} />
      )}
    </>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, onPress, colors }: {
  exercise: Exercise; onPress: () => void; colors: C;
}) {
  return (
    <Pressable
      style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={onPress}
      android_ripple={{ color: VESSEL_BG }}
    >
      <Image source={{ uri: exercise.gifUrl }}
        style={[S.cardGif, { backgroundColor: colors.bgSubtle }]} resizeMode="cover" />
      <View style={S.cardBody}>
        <Text style={[S.cardName, { color: colors.textPrimary }]} numberOfLines={2}>
          {cap(exercise.name)}
        </Text>
        <View style={S.cardTags}>
          {exercise.targetMuscles.slice(0, 2).map((m) => (
            <View key={m} style={[S.tag, { backgroundColor: VESSEL_BG }]}>
              <Text style={[S.tagText, { color: VESSEL_COLOR }]}>{cap(m)}</Text>
            </View>
          ))}
          {exercise.equipments.slice(0, 1).map((e) => (
            <View key={e} style={[S.tag, { backgroundColor: colors.bgSubtle }]}>
              <Text style={[S.tagText, { color: colors.textSecondary }]}>{cap(e)}</Text>
            </View>
          ))}
        </View>
        <Text style={[S.cardPart, { color: colors.textDisabled }]}>
          {exercise.bodyParts.map(cap).join(" · ")}
        </Text>
      </View>
      <Text style={[S.cardArrow, { color: colors.textDisabled }]}>›</Text>
    </Pressable>
  );
}

// ─── Log modal ────────────────────────────────────────────────────────────────

function LogModal({ exercise, visible, userId, onClose, colors, isDark }: {
  exercise: Exercise; visible: boolean; userId: string;
  onClose: () => void; colors: C; isDark: boolean;
}) {
  const createLog = useCreateLog(userId);
  const isCardio  = exercise.bodyParts.includes("cardio") ||
    exercise.targetMuscles.some((m) => m.toLowerCase().includes("cardiovascular"));

  const [logType,  setLogType]  = useState<"strength" | "cardio">(isCardio ? "cardio" : "strength");
  const [sets,     setSets]     = useState<SetEntry[]>([{ sets: "", reps: "", weight: "" }]);
  const [minutes,  setMinutes]  = useState("");
  const [distance, setDistance] = useState("");
  const [showHow,  setShowHow]  = useState(false);

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
    } catch (e: any) { Alert.alert("Error", e.message ?? "Try again."); }
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

// ─── MetaPill ─────────────────────────────────────────────────────────────────

function MetaPill({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[S.metaPill, { backgroundColor: bg }]}>
      <Text style={[S.metaLabel, { color }]}>{label}</Text>
      <Text style={[S.metaValue, { color }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function StripStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={S.stripStat}>
      <Text style={[S.stripStatLabel, { color }]}>{label}</Text>
      <Text style={[S.stripStatValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: { fontSize: 20, fontWeight: "300" },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  levelBadge: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 4, alignItems: "center", minWidth: 90 },
  levelNum: { fontSize: 13, fontWeight: "800" },
  levelTrack: { width: "100%", height: 4, borderRadius: 99, overflow: "hidden" },
  levelFill: { height: 4, borderRadius: 99, backgroundColor: VESSEL_COLOR },
  levelXp: { fontSize: 10, fontWeight: "600" },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  clearBtn: { fontSize: 14 },

  // Removed: chipsScroll, chips, chip, chipEmoji, chipText — replaced by menu grid

  resultCount: { fontSize: 11, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 2 },

  // Menu grid
  menuContent: { padding: 16, paddingBottom: 32, gap: 14 },
  menuSectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  menuCard: {
    width: "47.5%", borderWidth: 1, borderRadius: 18,
    padding: 16, gap: 8, overflow: "hidden",
  },
  menuCardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  menuCardEmoji: { fontSize: 22 },
  menuCardLabel: { fontSize: 15, fontWeight: "700" },
  menuCardDesc: { fontSize: 12, lineHeight: 17 },
  menuCardArrow: { fontSize: 18, position: "absolute", top: 14, right: 14 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 20 },
  stateEmoji: { fontSize: 40, marginBottom: 8 },
  stateText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  stateSub: { fontSize: 13, textAlign: "center" },
  retryBtn: { marginTop: 4, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryText: { fontSize: 14 },

  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 10 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },

  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, overflow: "hidden" },
  cardGif: { width: 68, height: 68, borderRadius: 12 },
  cardBody: { flex: 1, gap: 5 },
  cardName: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  cardTags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
  tagText: { fontSize: 11, fontWeight: "500" },
  cardPart: { fontSize: 11 },
  cardArrow: { fontSize: 22, paddingRight: 4 },

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

  // ── Profile/Plan action cards in menu ──
  actionRow: { flexDirection: "row", gap: 12 },
  actionCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 14, gap: 4, overflow: "hidden" },
  actionCardIcon: { fontSize: 24, marginBottom: 2 },
  actionCardLabel: { fontSize: 14, fontWeight: "800" },
  actionCardSub: { fontSize: 11, lineHeight: 16 },

  // ── Stats strip ──
  statsStrip: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripStatLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  stripStatValue: { fontSize: 13, fontWeight: "700" },
  stripDiv: { width: 1, height: 28 },

  // ── Equipment filter badge bar ──
  equipBadgeBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  equipBadgeBarLabel: { fontSize: 11, fontWeight: "500" },
  equipBadgeDot: { width: 8, height: 8, borderRadius: 4 },
});
