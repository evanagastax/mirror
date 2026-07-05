import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  ActivityIndicator, Alert, StyleSheet, Modal,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { useGoals, useAddGoal, useToggleGoal, useDeleteGoal, Goal } from "../hooks/useGoals";

type Pillar = "soul" | "vessel" | "impact" | "stewardship";

const PILLAR_META: { key: Pillar; label: string; color: string; bg: string }[] = [
  { key: "soul",        label: "Soul",        color: "#1D9E75", bg: "#F0FBF7" },
  { key: "vessel",      label: "Vessel",      color: "#D85A30", bg: "#FEF3EE" },
  { key: "impact",      label: "Impact",      color: "#378ADD", bg: "#F0F7FE" },
  { key: "stewardship", label: "Stewardship", color: "#BA7517", bg: "#FAEEDA" },
];

export default function RoadmapScreen() {
  const userId = useAuthStore((s) => s.userId)!;
  const { data: goals, isLoading } = useGoals(userId);
  const addGoal = useAddGoal(userId);
  const toggleGoal = useToggleGoal(userId);
  const deleteGoal = useDeleteGoal(userId);

  const [modalPillar, setModalPillar] = useState<Pillar | null>(null);
  const [newTitle, setNewTitle] = useState("");

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color="#111" /></View>;
  }

  function goalsFor(pillar: Pillar) {
    return (goals ?? []).filter((g) => g.pillar_type === pillar);
  }

  function progressFor(pillar: Pillar) {
    const pg = goalsFor(pillar);
    if (pg.length === 0) return 0;
    return pg.filter((g) => g.is_done).length / pg.length;
  }

  async function handleAdd() {
    if (!modalPillar || !newTitle.trim()) return;
    await addGoal.mutateAsync({ pillar_type: modalPillar, title: newTitle.trim() });
    setNewTitle("");
    setModalPillar(null);
  }

  async function handleToggle(goal: Goal) {
    await toggleGoal.mutateAsync({ id: goal.id, is_done: !goal.is_done });
  }

  function handleLongPress(goal: Goal) {
    Alert.alert("Delete goal?", `"${goal.title}"`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteGoal.mutate(goal.id) },
    ]);
  }

  const totalGoals = (goals ?? []).length;
  const doneGoals = (goals ?? []).filter((g) => g.is_done).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Roadmap</Text>
        <Text style={styles.subtitle}>{doneGoals}/{totalGoals} goals complete</Text>
      </View>

      {/* Root node */}
      <View style={styles.rootNode}>
        <Text style={styles.rootSub}>You are here</Text>
        <Text style={styles.rootName}>Made — The Mirror</Text>
      </View>

      {/* Connector */}
      <View style={styles.connector} />

      {/* Pillar branches */}
      {PILLAR_META.map((meta) => {
        const pg = goalsFor(meta.key);
        const progress = progressFor(meta.key);
        const done = pg.filter((g) => g.is_done).length;

        return (
          <View key={meta.key} style={styles.branch}>
            {/* Branch header */}
            <View style={styles.branchHeader}>
              <View style={[styles.branchDot, { backgroundColor: meta.color }]} />
              <Text style={[styles.branchLabel, { color: meta.color }]}>{meta.label}</Text>
              <Text style={styles.branchCount}>{done}/{pg.length}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: meta.color }]} />
            </View>

            <View style={{ height: 10 }} />

            {/* Goals */}
            {pg.map((goal) => (
              <Pressable
                key={goal.id}
                style={styles.goalRow}
                onPress={() => handleToggle(goal)}
                onLongPress={() => handleLongPress(goal)}
              >
                <View style={[
                  styles.goalCheck,
                  { borderColor: goal.is_done ? meta.color : "#ddd" },
                  goal.is_done && { backgroundColor: meta.bg },
                ]}>
                  {goal.is_done && <Text style={{ fontSize: 10, color: meta.color }}>✓</Text>}
                </View>
                <Text style={[
                  styles.goalTitle,
                  goal.is_done && { textDecorationLine: "line-through", color: "#aaa" },
                ]}>
                  {goal.title}
                </Text>
              </Pressable>
            ))}

            {/* Add goal button */}
            <Pressable
              style={styles.addBtn}
              onPress={() => { setModalPillar(meta.key); setNewTitle(""); }}
            >
              <Text style={styles.addBtnText}>+ Add {meta.label.toLowerCase()} goal</Text>
            </Pressable>
          </View>
        );
      })}

      {/* Add goal modal */}
      <Modal visible={!!modalPillar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              New {modalPillar} goal
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What do you want to achieve?"
              placeholderTextColor="#aaa"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setModalPillar(null)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAdd}
                disabled={addGoal.isPending || !newTitle.trim()}
                style={[
                  styles.modalSave,
                  { backgroundColor: PILLAR_META.find((p) => p.key === modalPillar)?.color ?? "#111" },
                  (!newTitle.trim() || addGoal.isPending) && { opacity: 0.5 },
                ]}
              >
                {addGoal.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalSaveText}>Add goal</Text>
                }
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "600", color: "#111", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#aaa", marginTop: 2 },
  rootNode: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 14, alignItems: "center", backgroundColor: "#fafafa" },
  rootSub: { fontSize: 12, color: "#aaa", marginBottom: 2 },
  rootName: { fontSize: 15, fontWeight: "600", color: "#111" },
  connector: { width: 2, height: 20, backgroundColor: "#e5e5e5", alignSelf: "center", marginVertical: 4 },
  branch: { marginBottom: 20, borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 12, padding: 14 },
  branchHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  branchDot: { width: 8, height: 8, borderRadius: 4 },
  branchLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, flex: 1 },
  branchCount: { fontSize: 12, color: "#aaa" },
  progressTrack: { height: 3, backgroundColor: "#f0f0f0", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 99 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  goalCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  goalTitle: { fontSize: 14, color: "#111", flex: 1 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginTop: 4 },
  addBtnText: { fontSize: 13, color: "#aaa" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "600", color: "#111", marginBottom: 14, textTransform: "capitalize" },
  modalInput: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, padding: 12, fontSize: 15, color: "#111", backgroundColor: "#fafafa", marginBottom: 16 },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e5e5", alignItems: "center" },
  modalCancelText: { fontSize: 14, color: "#888" },
  modalSave: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalSaveText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
