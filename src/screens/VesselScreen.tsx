import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { OfflineBanner } from "../components/OfflineBanner";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useExercises } from "../hooks/useExercises";
import { usePillars } from "../hooks/usePillars";
import { useCreateLog } from "../hooks/useCreateLog";
import { Exercise, BODY_PARTS } from "../services/exerciseDb";

// ─── constants ───────────────────────────────────────────────────────────────

const VESSEL_COLOR = "#D85A30";
const ALL_BODY_PARTS = ["all", ...BODY_PARTS] as const;

const BODY_PART_EMOJI: Record<string, string> = {
  all: "⊕",
  back: "🔙",
  cardio: "🫀",
  chest: "💪",
  "lower arms": "🦾",
  "lower legs": "🦵",
  neck: "🔝",
  shoulders: "🏋️",
  "upper arms": "💪",
  "upper legs": "🦿",
  waist: "⭕",
};

// ─── main screen ─────────────────────────────────────────────────────────────

export default function VesselScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [logModalVisible, setLogModalVisible] = useState(false);

  // Debounce search input
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 400);
  }, []);

  const filters = useMemo(
    () => ({
      ...(debouncedSearch.trim() ? { name: debouncedSearch.trim() } : {}),
      ...(selectedBodyPart !== "all" ? { bodyPart: selectedBodyPart } : {}),
    }),
    [debouncedSearch, selectedBodyPart]
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useExercises(filters);

  const { data: pillars } = usePillars(userId);

  const exercises = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.data) ?? [];
    // Deduplicate by exerciseId — cursor pagination can return overlapping items
    const seen = new Set<string>();
    return all.filter((e) => {
      if (seen.has(e.exerciseId)) return false;
      seen.add(e.exerciseId);
      return true;
    });
  }, [data]);

  // Show offline banner if ANY loaded page was served from stale cache
  const isOffline = useMemo(
    () => data?.pages.some((p) => p.fromCache) ?? false,
    [data]
  );

  function openDetail(exercise: Exercise) {
    setSelectedExercise(exercise);
    setLogModalVisible(true);
  }

  function closeModal() {
    setLogModalVisible(false);
    // slight delay so modal close animates before clearing
    setTimeout(() => setSelectedExercise(null), 300);
  }

  return (
    <View style={styles.container}>
      {isOffline && <OfflineBanner />}
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Vessel</Text>
          <Text style={styles.headerSub}>Exercise library</Text>
        </View>
        {pillars !== undefined && (
          <View style={styles.pillarBadge}>
            <Text style={styles.pillarBadgeLabel}>Score</Text>
            <Text style={styles.pillarBadgeValue}>{pillars.vessel}</Text>
          </View>
        )}
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises…"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Body-part filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {ALL_BODY_PARTS.map((part) => (
          <Pressable
            key={part}
            onPress={() => setSelectedBodyPart(part)}
            style={[
              styles.chip,
              selectedBodyPart === part && styles.chipActive,
            ]}
          >
            <Text style={styles.chipEmoji}>{BODY_PART_EMOJI[part] ?? "•"}</Text>
            <Text
              style={[
                styles.chipText,
                selectedBodyPart === part && styles.chipTextActive,
              ]}
            >
              {part === "all" ? "All" : part.charAt(0).toUpperCase() + part.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Exercise list ── */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={VESSEL_COLOR} />
          <Text style={styles.loadingText}>Loading exercises…</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Couldn't load exercises.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : exercises.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No exercises found.</Text>
          <Text style={styles.errorSub}>Try a different search or filter.</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={VESSEL_COLOR}
            />
          }
          renderItem={({ item }) => (
            <ExerciseCard exercise={item} onPress={() => openDetail(item)} />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={VESSEL_COLOR} size="small" />
              </View>
            ) : null
          }
        />
      )}

      {/* ── Log modal ── */}
      {selectedExercise && (
        <LogWorkoutModal
          exercise={selectedExercise}
          visible={logModalVisible}
          userId={userId!}
          onClose={closeModal}
        />
      )}
    </View>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: exercise.gifUrl }}
        style={styles.cardGif}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>
          {capitalize(exercise.name)}
        </Text>
        <View style={styles.cardTags}>
          {exercise.targetMuscles.slice(0, 2).map((m) => (
            <View key={m} style={[styles.tag, { backgroundColor: "#FEF3EE" }]}>
              <Text style={[styles.tagText, { color: VESSEL_COLOR }]}>
                {capitalize(m)}
              </Text>
            </View>
          ))}
          {exercise.equipments.slice(0, 1).map((e) => (
            <View key={e} style={[styles.tag, { backgroundColor: "#f5f5f5" }]}>
              <Text style={[styles.tagText, { color: "#888" }]}>
                {capitalize(e)}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardBodyPart}>
          {exercise.bodyParts.map(capitalize).join(" · ")}
        </Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </Pressable>
  );
}

// ─── Log workout modal ────────────────────────────────────────────────────────

function LogWorkoutModal({
  exercise,
  visible,
  userId,
  onClose,
}: {
  exercise: Exercise;
  visible: boolean;
  userId: string;
  onClose: () => void;
}) {
  const createLog = useCreateLog(userId);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [minutes, setMinutes] = useState("");
  const [tab, setTab] = useState<"strength" | "cardio">("strength");

  const isCardio =
    exercise.bodyParts.includes("cardio") ||
    exercise.targetMuscles.some((m) =>
      m.toLowerCase().includes("cardiovascular")
    );

  // Pre-select appropriate tab based on exercise type
  React.useEffect(() => {
    setTab(isCardio ? "cardio" : "strength");
  }, [exercise.exerciseId, isCardio]);

  function reset() {
    setSets("");
    setReps("");
    setWeight("");
    setMinutes("");
  }

  async function handleLog() {
    let value = 0;
    let metadata: Record<string, unknown> = {
      exercise_name: exercise.name,
      exercise_id: exercise.exerciseId,
      body_parts: exercise.bodyParts,
      target_muscles: exercise.targetMuscles,
      source: "exercisedb",
    };

    if (tab === "cardio") {
      if (!minutes) {
        Alert.alert("Enter duration", "How many minutes did you do?");
        return;
      }
      value = parseInt(minutes, 10);
      metadata = { ...metadata, type: "cardio", duration_minutes: value };
    } else {
      const s = parseInt(sets, 10) || 0;
      const r = parseInt(reps, 10) || 0;
      const w = parseFloat(weight) || 0;

      if (!sets || !reps) {
        Alert.alert("Enter sets & reps", "At least sets and reps are required.");
        return;
      }

      // Volume = sets × reps × kg (or just sets × reps if no weight)
      value = w > 0 ? Math.round(s * r * w) : s * r;
      metadata = {
        ...metadata,
        type: "strength",
        sets: s,
        reps: r,
        weight_kg: w || undefined,
        volume: value,
      };
    }

    try {
      await createLog.mutateAsync({
        pillar_type: "vessel",
        value,
        metadata,
      });
      reset();
      onClose();
      Alert.alert("Logged!", `${capitalize(exercise.name)} added to your Vessel.`);
    } catch (e: any) {
      Alert.alert("Something went wrong", e.message ?? "Try again.");
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.modalContainer}
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {capitalize(exercise.name)}
            </Text>
          </View>

          {/* GIF + meta */}
          <Image
            source={{ uri: exercise.gifUrl }}
            style={styles.modalGif}
            resizeMode="contain"
          />

          <View style={styles.modalMeta}>
            <MetaPill
              label="Target"
              value={exercise.targetMuscles.map(capitalize).join(", ")}
              color={VESSEL_COLOR}
              bg="#FEF3EE"
            />
            <MetaPill
              label="Equipment"
              value={exercise.equipments.map(capitalize).join(", ")}
              color="#555"
              bg="#f5f5f5"
            />
          </View>

          {/* Instructions */}
          {exercise.instructions.length > 0 && (
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to</Text>
              {exercise.instructions.map((step, i) => (
                <Text key={i} style={styles.instructionStep}>
                  {step.replace(/^Step:\d+\s*/, `${i + 1}. `)}
                </Text>
              ))}
            </View>
          )}

          {/* Log type tabs */}
          <View style={styles.logTabs}>
            <Pressable
              style={[styles.logTab, tab === "strength" && styles.logTabActive]}
              onPress={() => setTab("strength")}
            >
              <Text
                style={[
                  styles.logTabText,
                  tab === "strength" && styles.logTabTextActive,
                ]}
              >
                Strength
              </Text>
            </Pressable>
            <Pressable
              style={[styles.logTab, tab === "cardio" && styles.logTabActive]}
              onPress={() => setTab("cardio")}
            >
              <Text
                style={[
                  styles.logTabText,
                  tab === "cardio" && styles.logTabTextActive,
                ]}
              >
                Cardio / Time
              </Text>
            </Pressable>
          </View>

          {/* Log fields */}
          {tab === "strength" ? (
            <View style={styles.logFields}>
              <View style={styles.logRow}>
                <LogField
                  label="Sets"
                  value={sets}
                  onChange={setSets}
                  placeholder="4"
                />
                <LogField
                  label="Reps"
                  value={reps}
                  onChange={setReps}
                  placeholder="10"
                />
                <LogField
                  label="Weight (kg)"
                  value={weight}
                  onChange={setWeight}
                  placeholder="60"
                  decimal
                />
              </View>
              {sets && reps ? (
                <Text style={styles.volumePreview}>
                  Volume:{" "}
                  <Text style={{ color: VESSEL_COLOR, fontWeight: "600" }}>
                    {weight
                      ? `${Math.round(
                          parseInt(sets) * parseInt(reps) * parseFloat(weight || "0")
                        )} kg·reps`
                      : `${parseInt(sets) * parseInt(reps)} reps`}
                  </Text>
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.logFields}>
              <LogField
                label="Duration (minutes)"
                value={minutes}
                onChange={setMinutes}
                placeholder="30"
              />
            </View>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleLog}
            disabled={createLog.isPending}
            style={[styles.logBtn, createLog.isPending && { opacity: 0.5 }]}
          >
            {createLog.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.logBtnText}>Log to Vessel</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── small components ─────────────────────────────────────────────────────────

function MetaPill({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.metaPill, { backgroundColor: bg }]}>
      <Text style={[styles.metaPillLabel, { color }]}>{label}</Text>
      <Text style={[styles.metaPillValue, { color }]}>{value}</Text>
    </View>
  );
}

function LogField({
  label,
  value,
  onChange,
  placeholder,
  decimal = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  decimal?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
      />
    </View>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  headerSub: { fontSize: 13, color: "#aaa", marginTop: 2 },
  pillarBadge: {
    alignItems: "center",
    backgroundColor: "#FEF3EE",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pillarBadgeLabel: { fontSize: 10, color: VESSEL_COLOR, textTransform: "uppercase", letterSpacing: 0.5 },
  pillarBadgeValue: { fontSize: 20, fontWeight: "700", color: VESSEL_COLOR },

  // Search
  searchRow: { paddingHorizontal: 20, marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fafafa",
  },

  // Chips
  chipsRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: VESSEL_COLOR, borderColor: VESSEL_COLOR },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 12, color: "#888", fontWeight: "500" },
  chipTextActive: { color: "#fff" },

  // States
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { fontSize: 14, color: "#aaa", marginTop: 8 },
  errorText: { fontSize: 15, color: "#aaa", fontWeight: "500" },
  errorSub: { fontSize: 13, color: "#ccc" },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
  },
  retryText: { fontSize: 14, color: "#111" },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#fff",
  },
  cardGif: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#f5f5f5" },
  cardBody: { flex: 1, gap: 5 },
  cardName: { fontSize: 14, fontWeight: "600", color: "#111", lineHeight: 19 },
  cardTags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
  tagText: { fontSize: 11, fontWeight: "500" },
  cardBodyPart: { fontSize: 11, color: "#bbb" },
  cardArrow: { fontSize: 22, color: "#ccc", paddingRight: 4 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  modalClose: { fontSize: 18, color: "#aaa", paddingTop: 2 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#111", lineHeight: 24 },
  modalGif: { width: "100%", height: 220, borderRadius: 14, backgroundColor: "#f5f5f5", marginBottom: 14 },
  modalMeta: { flexDirection: "row", gap: 8, marginBottom: 16 },
  metaPill: { flex: 1, borderRadius: 10, padding: 10, gap: 2 },
  metaPillLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" },
  metaPillValue: { fontSize: 13, fontWeight: "500" },

  // Instructions
  instructions: { marginBottom: 20 },
  instructionsTitle: { fontSize: 13, fontWeight: "700", color: "#111", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  instructionStep: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 6 },

  // Log tabs
  logTabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  logTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
  },
  logTabActive: { backgroundColor: VESSEL_COLOR, borderColor: VESSEL_COLOR },
  logTabText: { fontSize: 13, color: "#888", fontWeight: "500" },
  logTabTextActive: { color: "#fff" },

  // Log fields
  logFields: { marginBottom: 20, gap: 12 },
  logRow: { flexDirection: "row", gap: 10 },
  fieldWrap: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 11, color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fafafa",
    textAlign: "center",
  },
  volumePreview: { fontSize: 13, color: "#aaa", textAlign: "center" },

  // Log button
  logBtn: {
    backgroundColor: VESSEL_COLOR,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  logBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
