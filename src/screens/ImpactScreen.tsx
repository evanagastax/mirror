import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useLogs } from "../hooks/useLogs";
import { usePillars } from "../hooks/usePillars";
import { scoreToLevel } from "../utils/pillarLevel";
import { PILLAR_COLORS } from "../theme/pillars";
import { openSafeUrl } from "../utils/url";
import { formatDate, formatTime } from "../utils/format";
import type { Log, Colors } from "../types";
import { StatChip } from "../components/ui/StatChip";
import { Skeleton } from "../components/ui/Skeleton";
import { useLangStore } from "../store/langStore";
import { hapticLight } from "../utils/haptics";

const COLOR = PILLAR_COLORS.impact.primary;
const BG    = PILLAR_COLORS.impact.bg;

function groupByDate(logs: Log[]) {
  const groups: Record<string, Log[]> = {};
  for (const l of logs) {
    const d = formatDate(l.created_at);
    if (!groups[d]) groups[d] = [];
    groups[d].push(l);
  }
  return Object.entries(groups).map(([date, logs]) => ({ date, logs }));
}

export default function ImpactScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId);
  const { isDark, colors } = useThemeStore();
  const { t, lang }        = useLangStore();
  const { data: logs, isLoading, isError, refetch, isRefetching } = useLogs(userId);
  const { data: pillars } = usePillars(userId);

  const impactLogs = (logs ?? []).filter((l) => l.pillar_type === "impact");
  const { level, xp, xpMax } = scoreToLevel(pillars?.impact ?? 0);
  const barPct  = xp / xpMax;
  const grouped = groupByDate(impactLogs);

  const totalEffort   = impactLogs.reduce((s, l) => s + l.value, 0);
  const avgEffort     = impactLogs.length > 0 ? (totalEffort / impactLogs.length).toFixed(1) : "—";
  const thisWeekCount = impactLogs.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <View style={S.headerLeft}>
          <Pressable onPress={() => { hapticLight(); router.back(); }} hitSlop={12}>
            <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
          </Pressable>
          <View>
            <Text style={[S.headerTitle, { color: colors.textPrimary }]}>{t.impact}</Text>
            <Text style={[S.headerSub, { color: colors.gold }]}>{t.workOutput}</Text>
          </View>
        </View>
        <View style={[S.levelBadge, { backgroundColor: colors.gold + "15" }]}>
          <Text style={[S.levelNum, { color: colors.gold }]}>Lv {level}</Text>
          <View style={[S.levelTrack, { backgroundColor: colors.gold + "30" }]}>
            <View style={[S.levelFill, { width: `${barPct * 100}%` as any, backgroundColor: colors.gold }]} />
          </View>
          <Text style={[S.levelXp, { color: colors.gold }]}>{xp}/{xpMax} xp</Text>
        </View>
      </View>

      <ScrollView
        style={S.flex}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLOR} />}
      >
        {/* Stats row */}
        <View style={S.statsRow}>
          <StatChip label={t.score}      value={String(pillars?.impact ?? 0)} color={COLOR} bg={BG} />
          <StatChip label={t.avgEffort} value={String(avgEffort)}            color={COLOR} bg={BG} />
          <StatChip label={t.thisWeek}  value={String(thisWeekCount)}        color={COLOR} bg={BG} />
        </View>

        {/* Quick actions */}
        <View style={S.actionsRow}>
          <ActionCard icon="🗺️" label={t.career} sub={t.jobRoadmaps} color={COLOR} bg={BG}
            onPress={() => router.push("/impact-roadmap" as any)} colors={colors} />
          <ActionCard icon="◈" label={t.goals} sub={t.trackGoals} color={COLOR} bg={BG}
            onPress={() => router.push("/(app)/roadmap")} colors={colors} />
          <ActionCard icon="+" label={t.log} sub={t.newEntry} color={COLOR} bg={BG}
            onPress={() => router.push("/log/new")} colors={colors} />
        </View>

        {/* Activity list */}
        <View style={S.sectionRow}>
          <Text style={[S.sectionLabel, { color: colors.textMuted }]}>{t.activity}</Text>
          <Text style={[S.sectionCount, { color: colors.textDisabled }]}>{impactLogs.length} {t.entries}</Text>
        </View>

        {isLoading ? (
          <ImpactListSkeleton colors={colors} />
        ) : isError ? (
          <View style={S.center}>
            <Text style={[S.stateText, { color: colors.textMuted }]}>{t.couldntLoad}</Text>
            <Pressable onPress={() => refetch()} style={[S.retryBtn, { borderColor: colors.border }]}>
              <Text style={[S.retryText, { color: colors.textPrimary }]}>{t.retry}</Text>
            </Pressable>
          </View>
        ) : impactLogs.length === 0 ? (
          <View style={S.emptyWrap}>
            <Text style={S.emptyEmoji}>📭</Text>
            <Text style={[S.emptyTitle, { color: colors.textPrimary }]}>No impact logs yet</Text>
            <Text style={[S.emptySub, { color: colors.textMuted }]}>Log a PR, shipped feature, or task closed.</Text>
          </View>
        ) : (
          grouped.map(({ date, logs: dayLogs }) => (
            <View key={date} style={S.group}>
              <Text style={[S.groupDate, { color: colors.textMuted }]}>{date}</Text>
              <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {dayLogs.map((log, idx) => (
                  <ImpactRow key={log.id} log={log} colors={colors}
                    last={idx === dayLogs.length - 1} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ImpactRow({ log, colors, last }: { log: Log; colors: Colors; last: boolean }) {
  const meta  = log.metadata as Record<string, unknown> | null;
  // prefer explicit title, fall back to description, then a generic label
  const title = String(meta?.title || meta?.description || "Impact activity");
  const catIcon  = meta?.category_icon as string | undefined;
  const catLabel = meta?.category as string | undefined;
  const pct   = Math.min(log.value / 10, 1);
  const effortColor = log.value >= 8 ? "#1D9E75" : log.value >= 5 ? COLOR : "#D85A30";
  return (
    <View style={[S.row, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <View style={[S.rowDot, { backgroundColor: BG }]}>
        <Text style={{ fontSize: 14, color: COLOR }}>
          {catIcon ?? "◈"}
        </Text>
      </View>
      <View style={S.rowInfo}>
        <Text style={[S.rowTitle, { color: colors.textPrimary }]} numberOfLines={2}>{title}</Text>
        <View style={S.rowMeta}>
          {catLabel && (
            <View style={[S.catBadge, { backgroundColor: BG }]}>
              <Text style={[S.catBadgeText, { color: COLOR }]}>
                {catLabel.charAt(0).toUpperCase() + catLabel.slice(1)}
              </Text>
            </View>
          )}
          <View style={[S.effortTrack, { backgroundColor: colors.border }]}>
            <View style={[S.effortFill, { width: `${pct * 100}%` as any, backgroundColor: effortColor }]} />
          </View>
          <Text style={[S.effortLabel, { color: effortColor }]}>{log.value}/10</Text>
        </View>
      </View>
      <View style={S.rowRight}>
        <Text style={[S.rowTime, { color: colors.textDisabled }]}>{formatTime(log.created_at)}</Text>
        {log.evidence_url ? (
          <Pressable onPress={() => openSafeUrl(log.evidence_url, "evidence link")}>
            <Text style={[S.rowLink, { color: COLOR }]}>↗</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionCard({ icon, label, sub, color, bg, onPress, colors }: {
  icon: string; label: string; sub: string; color: string; bg: string;
  onPress: () => void; colors: Colors;
}) {
  return (
    <Pressable
      style={[S.actionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={onPress}
      android_ripple={{ color: bg }}
    >
      <View style={[S.actionIconWrap, { backgroundColor: bg }]}>
        <Text style={[S.actionIcon, { color }]}>{icon}</Text>
      </View>
      <Text style={[S.actionLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[S.actionSub, { color: colors.textMuted }]}>{sub}</Text>
    </Pressable>
  );
}

function ImpactListSkeleton({ colors }: { colors: Colors }) {
  return (
    <>
      {[0, 1].map((g) => (
        <View key={g} style={S.group}>
          <Skeleton width={100} height={11} borderRadius={4} style={{ marginBottom: 8 }} />
          <View style={[S.groupCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {[0, 1, 2].map((r) => (
              <View key={r} style={S.row}>
                <Skeleton width={36} height={36} borderRadius={18} />
                <View style={S.rowInfo}>
                  <Skeleton width={130} height={14} borderRadius={6} />
                  <View style={S.rowMeta}>
                    <Skeleton width={55} height={18} borderRadius={99} />
                    <Skeleton width={50} height={4} borderRadius={99} />
                  </View>
                </View>
                <Skeleton width={40} height={11} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: { fontSize: 20, fontWeight: "300" },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  levelBadge: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 4, alignItems: "center", minWidth: 90 },
  levelNum: { fontSize: 13, fontWeight: "800" },
  levelTrack: { width: "100%", height: 4, borderRadius: 99, overflow: "hidden" },
  levelFill: { height: 4, borderRadius: 99, backgroundColor: COLOR },
  levelXp: { fontSize: 10, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statChip: { flex: 1, borderRadius: 14, padding: 12, gap: 3 },
  statLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  statValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },

  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, alignItems: "center", gap: 6, overflow: "hidden" },
  actionIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 13, fontWeight: "700" },
  actionSub: { fontSize: 10 },

  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  sectionCount: { fontSize: 12 },

  center: { paddingVertical: 40, alignItems: "center" },
  stateText: { fontSize: 15, marginBottom: 12 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryText: { fontSize: 14 },
  emptyWrap: { paddingVertical: 40, alignItems: "center", gap: 6 },
  emptyEmoji: { fontSize: 36, marginBottom: 6 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySub: { fontSize: 13, textAlign: "center" },

  group: { marginBottom: 18 },
  groupDate: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  groupCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowInfo: { flex: 1, gap: 6 },
  rowTitle: { fontSize: 14, fontWeight: "500" },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  catBadgeText: { fontSize: 10, fontWeight: "700" },
  effortRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  effortTrack: { flex: 1, height: 4, borderRadius: 99, overflow: "hidden" },
  effortFill: { height: 4, borderRadius: 99 },
  effortLabel: { fontSize: 11, fontWeight: "700", minWidth: 28 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowTime: { fontSize: 11 },
  rowLink: { fontSize: 16, fontWeight: "700" },
});
