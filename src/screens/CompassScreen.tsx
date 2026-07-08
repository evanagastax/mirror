import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { usePillars } from "../hooks/usePillars";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
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
  const { isDark, colors } = useThemeStore();
  const { data: pillars, isLoading, isError, refetch } = usePillars(userId);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
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
  const nextMilestone = [10, 25, 50, 100, 200, 400, 700].find((m) => m > synergy) ?? 700;
  const ptsToNext = nextMilestone - synergy;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>The Mirror</Text>
            <Text style={[styles.appSub, { color: colors.textMuted }]}>Know thyself.</Text>
          </View>
          <Pressable
            onPress={() => router.push("/github-sync")}
            style={[styles.syncChip, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}
          >
            <Text style={[styles.syncChipIcon, { color: "#378ADD" }]}>⟳</Text>
            <Text style={[styles.syncChipText, { color: "#378ADD" }]}>GitHub</Text>
          </Pressable>
        </View>

        {/* ── Character / Synergy banner ── */}
        <View style={[styles.banner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.bannerLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
              <Text style={[styles.avatarText, { color: colors.textPrimary }]}>M</Text>
              <View style={[styles.avatarLevel, { backgroundColor: "#BA7517" }]}>
                <Text style={styles.avatarLevelText}>{Math.floor(synergy / 100) + 1}</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.characterName, { color: colors.textPrimary }]}>Made</Text>
              <Text style={[styles.rankBadge, { color: "#BA7517" }]}>{rank}</Text>
            </View>
          </View>
          <View style={styles.bannerRight}>
            <Text style={[styles.synergyLabel, { color: colors.textMuted }]}>SYNERGY</Text>
            <Text style={[styles.synergyValue, { color: colors.textPrimary }]}>{synergy}</Text>
            <Text style={[styles.synergyHint, { color: colors.textDisabled }]}>
              {ptsToNext > 0 ? `${ptsToNext} to next rank` : "Max rank"}
            </Text>
          </View>
        </View>

        {/* ── Attributes ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ATTRIBUTES</Text>
          <Pressable onPress={() => router.push("/(app)/roadmap")}>
            <Text style={[styles.sectionAction, { color: "#378ADD" }]}>Roadmap ›</Text>
          </Pressable>
        </View>

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
  syncChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  syncChipIcon: { fontSize: 13 },
  syncChipText: { fontSize: 12, fontWeight: "600" },

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
});
