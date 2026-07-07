import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { usePillars } from "../hooks/usePillars";
import { useAuthStore } from "../store/authStore";
import { useHealthSync } from "../hooks/useHealthSync";
import { calculateSynergy } from "../utils/synergy";
import { scoreToLevel } from "../utils/pillarLevel";

// ─── pillar config ────────────────────────────────────────────────────────────

const PILLARS = [
  {
    key: "soul" as const,
    label: "Soul",
    subtitle: "Spirit & Devotion",
    color: "#1D9E75",
    bg: "#F0FBF7",
    icon: "✦",
    route: "/soul",
  },
  {
    key: "vessel" as const,
    label: "Vessel",
    subtitle: "Body & Strength",
    color: "#D85A30",
    bg: "#FEF3EE",
    icon: "⬡",
    route: "/(app)/vessel",
  },
  {
    key: "impact" as const,
    label: "Impact",
    subtitle: "Work & Output",
    color: "#378ADD",
    bg: "#F0F7FE",
    icon: "◈",
    route: "/(app)/impact",
  },
  {
    key: "stewardship" as const,
    label: "Stewardship",
    subtitle: "Wealth & Resources",
    color: "#BA7517",
    bg: "#FEF9EE",
    icon: "◎",
    route: "/(app)/ledger",
  },
] as const;

// ─── helpers ──────────────────────────────────────────────────────────────────

function getRank(synergy: number): string {
  if (synergy < 10) return "Novice";
  if (synergy < 25) return "Apprentice";
  if (synergy < 50) return "Adept";
  if (synergy < 100) return "Journeyman";
  if (synergy < 200) return "Expert";
  if (synergy < 400) return "Master";
  if (synergy < 700) return "Grandmaster";
  return "Legend";
}

// ─── screen ───────────────────────────────────────────────────────────────────

export default function CompassScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { data: pillars, isLoading, isError, refetch } = usePillars(userId);
  const { sync: syncHealth, syncing: syncingHealth, isSupported } = useHealthSync(userId!);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color="#111" /></View>;
  }

  if (isError || !pillars) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn't load your stats.</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const synergy = calculateSynergy(pillars);
  const rank = getRank(synergy);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Character header ── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
          <View style={styles.avatarLevel}>
            <Text style={styles.avatarLevelText}>{Math.floor(synergy / 100) + 1}</Text>
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.characterName}>Made</Text>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <Pressable onPress={() => router.push("/log/new")} style={styles.logBtn}>
          <Text style={styles.logBtnText}>+ Log</Text>
        </Pressable>
      </View>

      {/* ── Synergy score card ── */}
      <View style={styles.synergyCard}>
        <View style={styles.synergyLeft}>
          <Text style={styles.synergyLabel}>SYNERGY SCORE</Text>
          <Text style={styles.synergyValue}>{synergy}</Text>
        </View>
        <View style={styles.synergyRight}>
          <Text style={styles.synergyRankLabel}>RANK</Text>
          <Text style={styles.synergyRank}>{rank}</Text>
          <Text style={styles.synergySub}>
            {400 - synergy > 0 ? `${400 - synergy} pts to Master` : "Maximum reached"}
          </Text>
        </View>
      </View>

      {/* ── Section label ── */}
      <Text style={styles.sectionLabel}>ATTRIBUTES</Text>

      {/* ── Pillar stat cards ── */}
      <View style={styles.pillarList}>
        {PILLARS.map((pillar) => {
          const { level, xp, xpMax } = scoreToLevel(pillars[pillar.key]);
          const barWidth = `${(xp / xpMax) * 100}%` as `${number}%`;
          return (
            <Pressable
              key={pillar.key}
              style={styles.pillarCard}
              onPress={() => router.push(pillar.route as any)}
            >
              {/* Icon + label */}
              <View style={[styles.pillarIconWrap, { backgroundColor: pillar.bg }]}>
                <Text style={[styles.pillarIcon, { color: pillar.color }]}>{pillar.icon}</Text>
              </View>

              <View style={styles.pillarBody}>
                <View style={styles.pillarTopRow}>
                  <View>
                    <Text style={styles.pillarName}>{pillar.label}</Text>
                    <Text style={styles.pillarSubtitle}>{pillar.subtitle}</Text>
                  </View>
                  <View style={styles.pillarLevelBadge}>
                    <Text style={styles.pillarLevelLabel}>LVL</Text>
                    <Text style={[styles.pillarLevelNum, { color: pillar.color }]}>{level}</Text>
                  </View>
                </View>

                {/* XP bar */}
                <View style={styles.xpTrack}>
                  <View
                    style={[
                      styles.xpFill,
                      { width: barWidth, backgroundColor: pillar.color },
                    ]}
                  />
                </View>
                <View style={styles.xpRow}>
                  <Text style={styles.xpText}>{xp} / {xpMax} XP</Text>
                  <Text style={styles.xpArrow}>›</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ── Sync row ── */}
      <Text style={styles.sectionLabel}>SYNC</Text>
      <View style={styles.syncRow}>
        <Pressable
          onPress={() => router.push("/github-sync")}
          style={[styles.syncBtn, { backgroundColor: "#F0F7FE" }]}
        >
          <Text style={[styles.syncIcon, { color: "#378ADD" }]}>⟳</Text>
          <Text style={[styles.syncBtnText, { color: "#378ADD" }]}>GitHub</Text>
        </Pressable>

        {isSupported && (
          <Pressable
            onPress={syncHealth}
            disabled={syncingHealth}
            style={[styles.syncBtn, { backgroundColor: "#FEF3EE" }, syncingHealth && { opacity: 0.5 }]}
          >
            {syncingHealth ? (
              <ActivityIndicator color="#D85A30" size="small" />
            ) : (
              <>
                <Text style={[styles.syncIcon, { color: "#D85A30" }]}>⟳</Text>
                <Text style={[styles.syncBtnText, { color: "#D85A30" }]}>Workouts</Text>
              </>
            )}
          </Pressable>
        )}

        <Pressable
          onPress={() => router.push("/(app)/roadmap")}
          style={[styles.syncBtn, { backgroundColor: "#f5f5f5" }]}
        >
          <Text style={[styles.syncIcon, { color: "#888" }]}>◈</Text>
          <Text style={[styles.syncBtnText, { color: "#888" }]}>Roadmap</Text>
        </Pressable>
      </View>

    </ScrollView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D0D0D" },
  errorText: { color: "#666", marginBottom: 12, fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#333", borderRadius: 8 },
  retryText: { fontSize: 14, color: "#aaa" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  avatarLevel: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#BA7517",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  avatarLevelText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  headerInfo: { flex: 1 },
  characterName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  rankText: { fontSize: 12, color: "#888", marginTop: 2, letterSpacing: 0.3 },
  logBtn: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logBtnText: { fontSize: 13, color: "#aaa", fontWeight: "500" },

  // Synergy card
  synergyCard: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  synergyLeft: { flex: 1 },
  synergyLabel: { fontSize: 10, color: "#555", fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  synergyValue: { fontSize: 52, fontWeight: "800", color: "#fff", letterSpacing: -2, marginTop: 2 },
  synergyRight: { alignItems: "flex-end" },
  synergyRankLabel: { fontSize: 10, color: "#555", fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  synergyRank: { fontSize: 20, fontWeight: "700", color: "#BA7517", marginTop: 2 },
  synergySub: { fontSize: 11, color: "#555", marginTop: 4 },

  // Section label
  sectionLabel: {
    fontSize: 10,
    color: "#444",
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Pillar cards
  pillarList: { gap: 10, marginBottom: 28 },
  pillarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 14,
    padding: 14,
  },
  pillarIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pillarIcon: { fontSize: 20 },
  pillarBody: { flex: 1, gap: 8 },
  pillarTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  pillarName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  pillarSubtitle: { fontSize: 11, color: "#555", marginTop: 2 },
  pillarLevelBadge: { alignItems: "center" },
  pillarLevelLabel: { fontSize: 9, color: "#555", fontWeight: "700", letterSpacing: 1 },
  pillarLevelNum: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },

  // XP bar
  xpTrack: {
    height: 4,
    backgroundColor: "#2a2a2a",
    borderRadius: 99,
    overflow: "hidden",
  },
  xpFill: { height: 4, borderRadius: 99 },
  xpRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpText: { fontSize: 10, color: "#444" },
  xpArrow: { fontSize: 16, color: "#333" },

  // Sync
  syncRow: { flexDirection: "row", gap: 8 },
  syncBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 12,
    paddingVertical: 12,
  },
  syncIcon: { fontSize: 14 },
  syncBtnText: { fontSize: 12, fontWeight: "600" },
});
