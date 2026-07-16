import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { usePillars } from "../hooks/usePillars";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useStreak } from "../hooks/useStreak";
import { calculateSynergy } from "../utils/synergy";
import { scoreToLevel } from "../utils/pillarLevel";
import { supabase } from "../api/supabase";
import { useXPToast } from "../hooks/useXPToast";
import { XPToastContainer } from "../components/XPToast";
import { OnboardingModal } from "../components/OnboardingModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PILLAR_META, type PillarKey } from "../theme/pillars";
import { CompassSkeleton } from "../components/skeletons";

// ─── pillar config ────────────────────────────────────────────────────────────

const PILLARS = PILLAR_META.map((p) => ({
  ...p,
  subtitle: p.key === "soul" ? "Spirit & Devotion"
    : p.key === "vessel" ? "Body & Strength"
    : p.key === "impact" ? "Work & Output"
    : "Wealth & Resources",
  route: p.key === "soul" ? "/soul"
    : p.key === "vessel" ? "/(app)/vessel"
    : p.key === "impact" ? "/(app)/impact"
    : "/(app)/ledger",
}));

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
  const { isDark, colors } = useThemeStore();
  const { data: pillars, isLoading, isError, refetch, isRefetching } = usePillars(userId);
  const { data: streak } = useStreak(userId);
  const { toasts, removeToast, trackScores } = useXPToast();

  const [displayName, setDisplayName] = useState("You");
  const [initial,     setInitial]     = useState("?");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Track pillar score changes to fire XP toasts
  useEffect(() => {
    if (pillars) trackScores(pillars);
  }, [pillars]);

  // Check if this is a first-time user (no username, all pillars 0)
  useEffect(() => {
    if (!userId || isLoading || !pillars) return;
    const allZero = pillars.soul === 0 && pillars.vessel === 0 &&
                    pillars.impact === 0 && pillars.stewardship === 0;
    if (!allZero) return; // already has activity — skip onboarding

    AsyncStorage.getItem(`onboarding_done_${userId}`).then((done) => {
      if (!done) setShowOnboarding(true);
    });
  }, [userId, isLoading, pillars]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data?.username) {
          setDisplayName(data.username);
          setInitial(data.username[0].toUpperCase());
        }
      });
  }, [userId]);

  async function handleOnboardingDone(username: string, focusPillar: string) {
    if (!userId) return;
    // Save username if provided
    if (username) {
      const { data } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", userId)
        .select("username")
        .single();
      if (data?.username) {
        setDisplayName(data.username);
        setInitial(data.username[0].toUpperCase());
      }
    }
    // Mark onboarding complete
    await AsyncStorage.setItem(`onboarding_done_${userId}`, "1");
    setShowOnboarding(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <CompassSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !pillars) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Couldn't load your stats.</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.border }]}>
            <Text style={[styles.retryText, { color: colors.textMuted }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const synergy = calculateSynergy(pillars);
  const rank = getRank(synergy);
  const RANK_MILESTONES = [0, 10, 25, 50, 100, 200, 400, 700];
  const nextMilestone = RANK_MILESTONES.find((m) => m > synergy) ?? 700;
  const prevMilestone = [...RANK_MILESTONES].reverse().find((m) => m <= synergy) ?? 0;
  const ptsToNext = nextMilestone - synergy;
  const rankPct = nextMilestone === prevMilestone
    ? 1
    : (synergy - prevMilestone) / (nextMilestone - prevMilestone);
  const nextRank = getRank(nextMilestone);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OnboardingModal
        visible={showOnboarding}
        onDone={handleOnboardingDone}
      />
      {/* XP toast layer — floats above everything */}
      <View style={styles.toastAnchor} pointerEvents="none">
        <XPToastContainer toasts={toasts} onDone={removeToast} />
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.textPrimary} />
        }
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>The Mirror</Text>
            <Text style={[styles.appSub, { color: colors.textMuted }]}>Know thyself.</Text>
          </View>

        </View>

        {/* ── Character / Synergy banner ── */}
        <View style={[styles.banner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.bannerLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
              <Text style={[styles.avatarText, { color: colors.textPrimary }]}>{initial}</Text>
              <View style={[styles.avatarLevel, { backgroundColor: "#BA7517" }]}>
                <Text style={styles.avatarLevelText}>{Math.floor(synergy / 100) + 1}</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.characterName, { color: colors.textPrimary }]}>{displayName}</Text>
              <Text style={[styles.rankBadge, { color: "#BA7517" }]}>{rank}</Text>
              {streak && streak.current > 0 && (
                <View style={styles.streakRow}>
                  <Text style={styles.streakFire}>🔥</Text>
                  <Text style={[styles.streakText, { color: "#D85A30" }]}>
                    {streak.current} day streak
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.bannerRight}>
            <Text style={[styles.synergyLabel, { color: colors.textMuted }]}>SYNERGY</Text>
            <Text style={[styles.synergyValue, { color: colors.textPrimary }]}>{synergy}</Text>
            {/* Rank progression bar */}
            <View style={styles.rankProgressWrap}>
              <View style={[styles.rankProgressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.rankProgressFill, {
                  width: `${Math.min(rankPct * 100, 100)}%` as any,
                  backgroundColor: "#BA7517",
                }]} />
              </View>
              <Text style={[styles.rankProgressHint, { color: colors.textDisabled }]}>
                {ptsToNext > 0 ? `${ptsToNext} pts → ${nextRank}` : "Max rank 🏆"}
              </Text>
            </View>
            {streak && streak.loggedToday && (
              <View style={[styles.todayBadge, { backgroundColor: "#F0FBF7" }]}>
                <Text style={[styles.todayBadgeText, { color: "#1D9E75" }]}>✓ Logged today</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Attributes ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ATTRIBUTES</Text>
          <Pressable onPress={() => router.push("/(app)/roadmap")}>
            <Text style={[styles.sectionAction, { color: "#378ADD" }]}>Roadmap ›</Text>
          </Pressable>
        </View>

        {/* Empty state — shown when all pillars are 0 and onboarding is done */}
        {pillars.soul === 0 && pillars.vessel === 0 &&
         pillars.impact === 0 && pillars.stewardship === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>✦</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Your journey starts here
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Tap + to log your first activity and start building your Synergy score.
            </Text>
            <View style={styles.emptyPillars}>
              {PILLARS.map((p) => (
                <Pressable
                  key={p.key}
                  style={[styles.emptyPillarChip, { backgroundColor: p.bg, borderColor: p.color + "40" }]}
                  onPress={() => router.push("/log/new" as any)}
                >
                  <Text style={{ color: p.color, fontSize: 14 }}>{p.icon}</Text>
                  <Text style={[styles.emptyPillarLabel, { color: p.color }]}>{p.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.emptyLogBtn, { backgroundColor: colors.textPrimary }]}
              onPress={() => router.push("/log/new" as any)}
            >
              <Text style={[styles.emptyLogBtnText, { color: colors.bg }]}>+ Log your first activity</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.pillarGrid}>
            {PILLARS.map((pillar) => {
              const { level, xp, xpMax } = scoreToLevel(pillars[pillar.key]);
              const barPct = xp / xpMax;
              return (
                <Pressable
                  key={pillar.key}
                  style={[styles.pillarCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                  onPress={() => router.push(pillar.route as any)}
                  android_ripple={{ color: pillar.bg, borderless: false }}
                >
                  <View style={[styles.pillarIconBg, { backgroundColor: pillar.bg }]}>
                    <Text style={[styles.pillarIcon, { color: pillar.color }]}>{pillar.icon}</Text>
                  </View>
                  <Text style={[styles.pillarName, { color: colors.textPrimary }]}>{pillar.label}</Text>
                  <Text style={[styles.pillarSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {pillar.subtitle}
                  </Text>
                  <View style={styles.pillarFooter}>
                    <View style={[styles.xpTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[styles.xpFill, { width: `${barPct * 100}%` as any, backgroundColor: pillar.color }]}
                      />
                    </View>
                    <Text style={[styles.pillarLevel, { color: pillar.color }]}>Lv {level}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Bottom hint ── */}
        <Text style={[styles.hint, { color: colors.textDisabled }]}>
          Tap a pillar to drill in · Use + to log
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  toastAnchor: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: "center",
    pointerEvents: "none",
  },
  errorText: { marginBottom: 12, fontSize: 15 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryText: { fontSize: 14 },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  topLeft: { gap: 1 },
  appTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  appSub: { fontSize: 11, letterSpacing: 0.5 },
  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700" },
  avatarLevel: {
    position: "absolute",
    bottom: -4,
    right: -4,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  avatarLevelText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  characterName: { fontSize: 16, fontWeight: "700" },
  rankBadge: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  bannerRight: { alignItems: "flex-end" },
  synergyLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  synergyValue: { fontSize: 44, fontWeight: "800", letterSpacing: -2, lineHeight: 50 },
  synergyHint: { fontSize: 10, marginTop: 2 },

  // Rank progression
  rankProgressWrap: { gap: 4, marginTop: 4, width: "100%" },
  rankProgressTrack: { height: 5, borderRadius: 99, overflow: "hidden", width: "100%" },
  rankProgressFill: { height: 5, borderRadius: 99 },
  rankProgressHint: { fontSize: 9, fontWeight: "600" },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  sectionAction: { fontSize: 12, fontWeight: "600" },

  // Pillar 2×2 grid
  pillarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  pillarCard: {
    width: "47.5%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
    overflow: "hidden",
  },
  pillarIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  pillarIcon: { fontSize: 18 },
  pillarName: { fontSize: 15, fontWeight: "700" },
  pillarSub: { fontSize: 11 },
  pillarFooter: { gap: 5, marginTop: 2 },
  xpTrack: { height: 4, borderRadius: 99, overflow: "hidden" },
  xpFill: { height: 4, borderRadius: 99 },
  pillarLevel: { fontSize: 11, fontWeight: "700" },

  hint: { textAlign: "center", fontSize: 11, marginTop: 4 },

  // Empty state
  emptyState: {
    borderWidth: 1, borderRadius: 20, padding: 24,
    alignItems: "center", gap: 10, marginBottom: 24,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5, textAlign: "center" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  emptyPillars: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 },
  emptyPillarChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1,
  },
  emptyPillarLabel: { fontSize: 12, fontWeight: "700" },
  emptyLogBtn: {
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28,
    marginTop: 4, alignItems: "center",
  },
  emptyLogBtnText: { fontSize: 15, fontWeight: "700" },

  // Streak
  streakRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
  streakFire: { fontSize: 11 },
  streakText: { fontSize: 11, fontWeight: "700" },
  todayBadge: { marginTop: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
  todayBadgeText: { fontSize: 10, fontWeight: "700" },
});
