import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  ActivityIndicator, Alert, StyleSheet, Modal,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  useGoals, useAddGoal, useUpdateGoalStatus,
  useDeleteGoal,
} from "../hooks/useGoals";
import { PILLAR_META_MAP, type PillarKey } from "../theme/pillars";
import type { Goal, GoalStatus, Colors } from "../types";

type Filter = "all" | PillarKey | "todo" | "in_progress" | "done";

const PILLARS = Object.values(PILLAR_META_MAP);

const STATUS_META: Record<GoalStatus, { label: string; color: string; bg: string; icon: string }> = {
  todo:        { label: "Todo",        color: "#888",    bg: "#f5f5f5", icon: "○" },
  in_progress: { label: "In Progress", color: "#378ADD", bg: "#F0F7FE", icon: "◑" },
  done:        { label: "Done",        color: "#1D9E75", bg: "#F0FBF7", icon: "●" },
};

const STATUS_ORDER: GoalStatus[] = ["todo", "in_progress", "done"];

function nextStatus(s: GoalStatus): GoalStatus {
  const i = STATUS_ORDER.indexOf(s);
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
}

function pillarFor(key: PillarKey) {
  return PILLARS.find((p) => p.key === key)!;
}

export default function RoadmapScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();
  const { data: goals, isLoading } = useGoals(userId);
  const addGoal    = useAddGoal(userId);
  const updateStatus = useUpdateGoalStatus(userId);
  const deleteGoal = useDeleteGoal(userId);

  const [filter,     setFilter]     = useState<Filter>("all");
  const [sheetPillar, setSheet]     = useState<PillarKey | null>(null);
  const [newTitle,   setNewTitle]   = useState("");
  const [statusMenu, setStatusMenu] = useState<string | null>(null); // goal id

  const allGoals   = goals ?? [];
  const totalDone  = allGoals.filter((g) => g.status === "done").length;
  const totalInProg = allGoals.filter((g) => g.status === "in_progress").length;
  const totalTodo  = allGoals.filter((g) => g.status === "todo").length;
  const overallPct = allGoals.length > 0 ? totalDone / allGoals.length : 0;

  const filtered = useMemo(() => {
    if (filter === "all") return allGoals;
    if (filter === "todo" || filter === "in_progress" || filter === "done")
      return allGoals.filter((g) => g.status === filter);
    return allGoals.filter((g) => g.pillar_type === filter);
  }, [allGoals, filter]);

  // Group filtered goals by pillar for the list
  const grouped = useMemo(() => {
    const groups: Record<string, Goal[]> = {};
    for (const g of filtered) {
      if (!groups[g.pillar_type]) groups[g.pillar_type] = [];
      groups[g.pillar_type].push(g);
    }
    return PILLARS.map((p) => ({ pillar: p, goals: groups[p.key] ?? [] }))
      .filter((g) => g.goals.length > 0 || filter === "all" || filter === g.pillar.key);
  }, [filtered, filter]);

  async function handleAdd() {
    if (!sheetPillar || !newTitle.trim()) return;
    await addGoal.mutateAsync({ pillar_type: sheetPillar, title: newTitle.trim() });
    setNewTitle("");
    setSheet(null);
  }

  async function handleStatusCycle(goal: Goal) {
    const next = nextStatus(goal.status);
    await updateStatus.mutateAsync({ id: goal.id, status: next });
  }

  function handleLongPress(goal: Goal) {
    setStatusMenu(goal.id);
  }

  function handleDelete(goal: Goal) {
    Alert.alert("Delete goal?", `"${goal.title}"`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteGoal.mutate(goal.id) },
    ]);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={colors.textPrimary} size="large" /></View>
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
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Roadmap</Text>
          <Text style={[S.headerSub, { color: colors.textMuted }]}>
            {totalDone}/{allGoals.length} done
          </Text>
        </View>
        <Pressable
          onPress={() => setSheet("soul")}
          style={[S.addBtn, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}
        >
          <Text style={[S.addBtnText, { color: colors.textPrimary }]}>+ Goal</Text>
        </Pressable>
      </View>

      {/* Progress bar + counters */}
      <View style={[S.progressBar, { borderBottomColor: colors.border }]}>
        <View style={[S.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[S.progressFill, { width: `${overallPct * 100}%` as any }]} />
        </View>
        <View style={S.counters}>
          <Counter label="Todo"        count={totalTodo}   color={STATUS_META.todo.color} />
          <Counter label="In Progress" count={totalInProg} color={STATUS_META.in_progress.color} />
          <Counter label="Done"        count={totalDone}   color={STATUS_META.done.color} />
          <Counter label="Total"       count={allGoals.length} color={colors.textMuted} />
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[S.filterScroll, { borderBottomColor: colors.border }]}
        contentContainerStyle={S.filterRow}
      >
        {/* Status filters */}
        {(["all", "todo", "in_progress", "done"] as const).map((f) => {
          const active = filter === f;
          const label  = f === "all" ? "All" : STATUS_META[f as GoalStatus]?.label ?? f;
          const color  = f === "all" ? colors.textPrimary : STATUS_META[f as GoalStatus]?.color ?? colors.textMuted;
          const bg     = f === "all" ? colors.bgSubtle    : STATUS_META[f as GoalStatus]?.bg ?? colors.bgSubtle;
          return (
            <Pressable key={f} onPress={() => setFilter(f)}
              style={[S.filterPill, { borderColor: colors.border },
                active && { backgroundColor: color, borderColor: color }]}>
              <Text style={[S.filterText, { color: active ? "#fff" : colors.textMuted },
                active && { fontWeight: "700" }]}>{label}</Text>
            </Pressable>
          );
        })}
        <View style={S.filterDivider} />
        {/* Pillar filters */}
        {PILLARS.map((p) => {
          const active = filter === p.key;
          return (
            <Pressable key={p.key} onPress={() => setFilter(p.key)}
              style={[S.filterPill, { borderColor: colors.border },
                active && { backgroundColor: p.color, borderColor: p.color }]}>
              <Text style={[S.filterPillIcon]}>{p.icon}</Text>
              <Text style={[S.filterText, { color: active ? "#fff" : colors.textMuted },
                active && { fontWeight: "700" }]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Goal list */}
      <ScrollView style={S.flex} contentContainerStyle={S.listContent} showsVerticalScrollIndicator={false}>
        {allGoals.length === 0 ? (
          <View style={S.emptyWrap}>
            <Text style={S.emptyEmoji}>🗺️</Text>
            <Text style={[S.emptyTitle, { color: colors.textPrimary }]}>No goals yet</Text>
            <Text style={[S.emptySub, { color: colors.textMuted }]}>
              Tap "+ Goal" to add your first milestone.
            </Text>
            <Pressable
              onPress={() => setSheet("soul")}
              style={[S.emptyBtn, { backgroundColor: PILLARS[0].color }]}
            >
              <Text style={S.emptyBtnText}>Add first goal</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View style={S.emptyWrap}>
            <Text style={[S.emptySub, { color: colors.textMuted }]}>No goals match this filter.</Text>
          </View>
        ) : (
          grouped.map(({ pillar: p, goals: pg }) => pg.length === 0 ? null : (
            <View key={p.key} style={S.group}>
              {/* Group header */}
              <View style={S.groupHeader}>
                <View style={[S.groupDot, { backgroundColor: p.color }]} />
                <Text style={[S.groupLabel, { color: p.color }]}>{p.icon} {p.label}</Text>
                <View style={[S.groupCount, { backgroundColor: p.bg }]}>
                  <Text style={[S.groupCountText, { color: p.color }]}>
                    {pg.filter((g) => g.status === "done").length}/{pg.length}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSheet(p.key)}
                  style={[S.groupAdd, { borderColor: p.color }]}
                >
                  <Text style={[S.groupAddText, { color: p.color }]}>+</Text>
                </Pressable>
              </View>

              {/* Goal rows */}
              <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {pg.map((goal, gi) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    pillar={p}
                    colors={colors}
                    last={gi === pg.length - 1}
                    onTap={() => handleStatusCycle(goal)}
                    onLongPress={() => handleLongPress(goal)}
                    onDelete={() => handleDelete(goal)}
                    statusMenuOpen={statusMenu === goal.id}
                    onStatusSelect={async (s) => {
                      setStatusMenu(null);
                      await updateStatus.mutateAsync({ id: goal.id, status: s });
                    }}
                    onMenuClose={() => setStatusMenu(null)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add goal bottom sheet */}
      <Modal visible={!!sheetPillar} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={S.backdrop} onPress={() => setSheet(null)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={[S.sheet, { backgroundColor: colors.bgCard }]}>
            <View style={[S.sheetHandle, { backgroundColor: colors.border }]} />

            {/* Pillar selector */}
            <Text style={[S.sheetLabel, { color: colors.textMuted }]}>PILLAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.sheetPillarRow}>
              {PILLARS.map((p) => (
                <Pressable key={p.key} onPress={() => setSheet(p.key)}
                  style={[S.sheetPillarBtn, { borderColor: colors.border },
                    sheetPillar === p.key && { backgroundColor: p.color, borderColor: p.color }]}>
                  <Text style={S.sheetPillarIcon}>{p.icon}</Text>
                  <Text style={[S.sheetPillarLabel, { color: sheetPillar === p.key ? "#fff" : colors.textMuted }]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[S.sheetLabel, { color: colors.textMuted, marginTop: 14 }]}>GOAL</Text>
            <TextInput
              style={[S.sheetInput, {
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.bgInput,
              }]}
              placeholder="What do you want to achieve?"
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              multiline
            />
            <View style={S.sheetActions}>
              <Pressable onPress={() => setSheet(null)}
                style={[S.sheetCancel, { borderColor: colors.border }]}>
                <Text style={[S.sheetCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAdd}
                disabled={addGoal.isPending || !newTitle.trim()}
                style={[S.sheetSave,
                  { backgroundColor: sheetPillar ? pillarFor(sheetPillar).color : colors.textPrimary },
                  (!newTitle.trim() || addGoal.isPending) && { opacity: 0.4 }]}>
                {addGoal.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={S.sheetSaveText}>Add goal</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Goal row component ───────────────────────────────────────────────────────

function GoalRow({ goal, pillar: p, colors, last, onTap, onLongPress, onDelete,
  statusMenuOpen, onStatusSelect, onMenuClose }: {
  goal: Goal; pillar: typeof PILLARS[0]; colors: Colors; last: boolean;
  onTap: () => void; onLongPress: () => void; onDelete: () => void;
  statusMenuOpen: boolean;
  onStatusSelect: (s: GoalStatus) => void;
  onMenuClose: () => void;
}) {
  const sm = STATUS_META[goal.status];
  return (
    <View style={[S.row, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      {/* Status badge — tap to cycle */}
      <Pressable
        onPress={onTap}
        onLongPress={onLongPress}
        style={[S.statusBtn, { backgroundColor: sm.bg }]}
        hitSlop={8}
      >
        <Text style={[S.statusIcon, { color: sm.color }]}>{sm.icon}</Text>
      </Pressable>

      {/* Title */}
      <Text
        style={[S.rowTitle, { color: colors.textPrimary },
          goal.status === "done" && { textDecorationLine: "line-through", color: colors.textMuted }]}
        numberOfLines={2}
        onLongPress={onLongPress}
      >
        {goal.title}
      </Text>

      {/* Status label chip */}
      <View style={[S.statusChip, { backgroundColor: sm.bg }]}>
        <Text style={[S.statusChipText, { color: sm.color }]}>{sm.label}</Text>
      </View>

      {/* Delete */}
      <Pressable onPress={onDelete} hitSlop={10} style={S.deleteBtn}>
        <Text style={[S.deleteBtnText, { color: colors.textDisabled }]}>✕</Text>
      </Pressable>

      {/* Status picker popover */}
      {statusMenuOpen && (
        <View style={[S.statusMenu, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            return (
              <Pressable key={s} onPress={() => onStatusSelect(s)}
                style={[S.statusMenuItem, { borderBottomColor: colors.border },
                  goal.status === s && { backgroundColor: meta.bg }]}
                android_ripple={{ color: meta.bg }}>
                <Text style={[S.statusMenuIcon, { color: meta.color }]}>{meta.icon}</Text>
                <Text style={[S.statusMenuLabel, { color: meta.color },
                  goal.status === s && { fontWeight: "700" }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={onMenuClose} style={S.statusMenuClose}>
            <Text style={[S.statusMenuCloseText, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Counter({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={S.counter}>
      <Text style={[S.counterNum, { color }]}>{count}</Text>
      <Text style={[S.counterLabel, { color }]}>{label}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  addBtn: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { fontSize: 13, fontWeight: "600" },

  progressBar: { paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1 },
  progressTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 99, backgroundColor: "#1D9E75" },
  counters: { flexDirection: "row", gap: 16 },
  counter: { alignItems: "center", gap: 1 },
  counterNum: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  counterLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  filterScroll: { flexGrow: 0, borderBottomWidth: 1 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" },
  filterPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1 },
  filterPillIcon: { fontSize: 12 },
  filterText: { fontSize: 12 },
  filterDivider: { width: 1, height: 20, backgroundColor: "#e5e5e5", marginHorizontal: 4 },

  listContent: { padding: 16 },

  emptyWrap: { paddingVertical: 60, alignItems: "center", gap: 8 },
  emptyEmoji: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center" },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  group: { marginBottom: 20 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupLabel: { flex: 1, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  groupCount: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  groupCountText: { fontSize: 11, fontWeight: "700" },
  groupAdd: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  groupAddText: { fontSize: 16, lineHeight: 20, fontWeight: "600" },

  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, position: "relative" },
  statusBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statusIcon: { fontSize: 16 },
  rowTitle: { flex: 1, fontSize: 14, lineHeight: 20 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusChipText: { fontSize: 10, fontWeight: "700" },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 13 },

  statusMenu: {
    position: "absolute", right: 12, top: 8, zIndex: 100,
    borderWidth: 1, borderRadius: 14, overflow: "hidden",
    minWidth: 160,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 10,
  },
  statusMenuItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1 },
  statusMenuIcon: { fontSize: 16 },
  statusMenuLabel: { fontSize: 14 },
  statusMenuClose: { padding: 12, alignItems: "center" },
  statusMenuCloseText: { fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 24,
    elevation: 24,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 99, alignSelf: "center", marginBottom: 20 },
  sheetLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  sheetPillarRow: { gap: 8 },
  sheetPillarBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, borderWidth: 1.5 },
  sheetPillarIcon: { fontSize: 14 },
  sheetPillarLabel: { fontSize: 13, fontWeight: "600" },
  sheetInput: {
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, lineHeight: 22, marginBottom: 16, minHeight: 60,
  },
  sheetActions: { flexDirection: "row", gap: 10 },
  sheetCancel: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  sheetCancelText: { fontSize: 14, fontWeight: "500" },
  sheetSave: { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  sheetSaveText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
