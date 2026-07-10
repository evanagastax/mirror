import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, Linking, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  CAREER_ROADMAPS, getRoadmapById,
  CareerRoadmap, Section, Topic, TopicLevel,
} from "../data/careerRoadmaps";
import {
  loadAllProgress, setTopicStatus, deleteRoadmapProgress,
  calcRoadmapStats, initRoadmapProgress, saveAllProgress,
  AllProgress, TopicStatus,
} from "../services/careerProgress";

const IMPACT_COLOR = "#378ADD";
const IMPACT_BG    = "#F0F7FE";
type C = ReturnType<typeof useThemeStore.getState>["colors"];

const LEVEL_META: Record<TopicLevel, { label: string; color: string; bg: string }> = {
  foundation: { label: "Foundation", color: "#1D9E75", bg: "#F0FBF7" },
  core:       { label: "Core",       color: "#378ADD", bg: "#F0F7FE" },
  advanced:   { label: "Advanced",   color: "#D85A30", bg: "#FEF3EE" },
  optional:   { label: "Optional",   color: "#888",    bg: "#f5f5f5" },
};

const STATUS_META: Record<TopicStatus, { icon: string; color: string; bg: string; label: string }> = {
  todo:        { icon: "○", color: "#aaa",    bg: "#f5f5f5", label: "To Learn"   },
  in_progress: { icon: "◑", color: "#378ADD", bg: "#F0F7FE", label: "Learning"   },
  done:        { icon: "●", color: "#1D9E75", bg: "#F0FBF7", label: "Learned ✓"  },
};

const RESOURCE_ICONS: Record<string, string> = {
  article: "📄", video: "▶️", course: "🎓", docs: "📚", book: "📖",
};

const DIFF_META: Record<import("../data/careerRoadmaps").ProjectDifficulty, { label: string; color: string; bg: string }> = {
  beginner:     { label: "Beginner",     color: "#1D9E75", bg: "#F0FBF7" },
  intermediate: { label: "Intermediate", color: "#D97706", bg: "#FFFBEB" },
  advanced:     { label: "Advanced",     color: "#D85A30", bg: "#FEF3EE" },
};

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ImpactRoadmapScreen() {
  const router             = useRouter();
  const userId             = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();

  const [progress,      setProgress]      = useState<AllProgress>({});
  const [loading,       setLoading]       = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);

  useEffect(() => {
    loadAllProgress(userId).then((p) => { setProgress(p); setLoading(false); });
  }, [userId]);

  async function startRoadmap(roadmap: CareerRoadmap) {
    if (!progress[roadmap.id]) {
      const init = initRoadmapProgress(roadmap);
      const updated = { ...progress, [roadmap.id]: init };
      await saveAllProgress(userId, updated);
      setProgress(updated);
    }
    setActiveRoadmap(roadmap);
  }

  async function handleStatusChange(roadmap: CareerRoadmap, topicId: string, status: TopicStatus) {
    const updated = await setTopicStatus(userId, roadmap.id, topicId, status);
    setProgress(updated);
  }

  async function handleReset(roadmapId: string) {
    const updated = await deleteRoadmapProgress(userId, roadmapId);
    setProgress(updated);
  }

  if (loading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={IMPACT_COLOR} size="large" /></View>
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
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Career Roadmaps</Text>
          <Text style={[S.headerSub, { color: colors.textMuted }]}>Pick a path. Track your progress.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

        {/* Active roadmaps first */}
        {Object.keys(progress).length > 0 && (
          <>
            <Text style={[S.sectionLabel, { color: colors.textMuted }]}>IN PROGRESS</Text>
            {Object.keys(progress).map((id) => {
              const rm = getRoadmapById(id);
              if (!rm) return null;
              const stats = calcRoadmapStats(rm, progress[id]);
              return (
                <Pressable key={id}
                  style={[S.activeCard, { backgroundColor: colors.bgCard, borderColor: rm.color + "60" }]}
                  onPress={() => startRoadmap(rm)}
                  android_ripple={{ color: rm.bg }}>
                  <View style={S.activeCardLeft}>
                    <Text style={S.activeCardIcon}>{rm.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[S.activeCardTitle, { color: colors.textPrimary }]}>{rm.title}</Text>
                      <Text style={[S.activeCardMeta, { color: colors.textMuted }]}>
                        {stats.done}/{stats.total} topics · {stats.active > 0 ? `${stats.active} learning` : ""}
                      </Text>
                    </View>
                  </View>
                  <View style={S.activeCardRight}>
                    <Text style={[S.activeCardPct, { color: rm.color }]}>{Math.round(stats.pct * 100)}%</Text>
                  </View>
                  {/* Progress bar */}
                  <View style={[S.activeBarTrack, { backgroundColor: colors.border }]}>
                    <View style={[S.activeBarFill, { width: `${stats.pct * 100}%` as any, backgroundColor: rm.color }]} />
                  </View>
                </Pressable>
              );
            })}
            <View style={[S.separator, { backgroundColor: colors.border }]} />
          </>
        )}

        {/* All roadmaps grid */}
        <Text style={[S.sectionLabel, { color: colors.textMuted }]}>ALL PATHS</Text>
        <View style={S.grid}>
          {CAREER_ROADMAPS.map((rm) => {
            const stats   = calcRoadmapStats(rm, progress[rm.id]);
            const started = !!progress[rm.id];
            return (
              <Pressable key={rm.id}
                style={[S.gridCard, { backgroundColor: colors.bgCard, borderColor: colors.border },
                  started && { borderColor: rm.color }]}
                onPress={() => startRoadmap(rm)}
                android_ripple={{ color: rm.bg }}>
                <View style={[S.gridCardIconWrap, { backgroundColor: rm.bg }]}>
                  <Text style={S.gridCardIcon}>{rm.icon}</Text>
                </View>
                <Text style={[S.gridCardTitle, { color: colors.textPrimary }]}>{rm.title}</Text>
                <Text style={[S.gridCardTime, { color: colors.textMuted }]}>{rm.timeToJob}</Text>
                <Text style={[S.gridCardSalary, { color: rm.color }]}>{rm.avgSalary}</Text>
                {started && (
                  <View style={[S.gridCardProgress, { backgroundColor: colors.border }]}>
                    <View style={[S.gridCardProgressFill, { width: `${stats.pct * 100}%` as any, backgroundColor: rm.color }]} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Roadmap detail modal */}
      {activeRoadmap && (
        <RoadmapDetail
          roadmap={activeRoadmap}
          progress={progress[activeRoadmap.id]}
          colors={colors}
          isDark={isDark}
          onClose={() => setActiveRoadmap(null)}
          onStatusChange={(topicId, status) => handleStatusChange(activeRoadmap, topicId, status)}
          onReset={() => { handleReset(activeRoadmap.id); setActiveRoadmap(null); }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Roadmap detail modal ─────────────────────────────────────────────────────

function RoadmapDetail({ roadmap: rm, progress, colors, isDark, onClose, onStatusChange, onReset }: {
  roadmap: CareerRoadmap;
  progress: import("../services/careerProgress").RoadmapProgress | undefined;
  colors: C; isDark: boolean;
  onClose: () => void;
  onStatusChange: (topicId: string, status: TopicStatus) => void;
  onReset: () => void;
}) {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([rm.sections[0]?.id]));
  const stats = calcRoadmapStats(rm, progress);

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function nextStatus(s: TopicStatus): TopicStatus {
    if (s === "todo")        return "in_progress";
    if (s === "in_progress") return "done";
    return "todo";
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Modal header */}
        <View style={[S.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[S.back, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
          <View style={S.headerCenter}>
            <Text style={[S.headerTitle, { color: colors.textPrimary }]}>
              {rm.icon} {rm.title}
            </Text>
            <Text style={[S.headerSub, { color: colors.textMuted }]}>
              {stats.done}/{stats.total} topics complete
            </Text>
          </View>
          <Pressable onPress={onReset} hitSlop={12}>
            <Text style={[S.resetText, { color: "#D85A30" }]}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={S.detailContent} showsVerticalScrollIndicator={false}>

          {/* Hero banner */}
          <View style={[S.heroBanner, { backgroundColor: rm.bg }]}>
            <View style={S.heroTop}>
              <Text style={[S.heroTitle, { color: "#111" }]}>{rm.description}</Text>
            </View>
            <View style={S.heroStats}>
              <HeroStat label="⏱ Time"   value={rm.timeToJob}  color={rm.color} />
              <HeroStat label="💰 Salary" value={rm.avgSalary}  color={rm.color} />
              <HeroStat label="📋 Topics" value={`${stats.total}`} color={rm.color} />
            </View>
            {/* Progress bar */}
            <View style={[S.heroTrack, { backgroundColor: rm.color + "30" }]}>
              <View style={[S.heroFill, { width: `${stats.pct * 100}%` as any, backgroundColor: rm.color }]} />
            </View>
            <Text style={[S.heroPct, { color: rm.color }]}>{Math.round(stats.pct * 100)}% complete</Text>
          </View>

          {/* Job titles */}
          <Text style={[S.sectionLabel, { color: colors.textMuted }]}>JOB TITLES</Text>
          <View style={S.jobTitleRow}>
            {rm.jobTitles.map((jt) => (
              <View key={jt} style={[S.jobTitleChip, { backgroundColor: rm.bg }]}>
                <Text style={[S.jobTitleText, { color: rm.color }]}>{jt}</Text>
              </View>
            ))}
          </View>

          {/* Projects to build */}
          <Text style={[S.sectionLabel, { color: colors.textMuted }]}>PROJECTS TO BUILD</Text>
          {rm.projects.map((project, i) => {
            const diffMeta = DIFF_META[project.difficulty];
            return (
              <View
                key={i}
                style={[S.projectCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              >
                <View style={S.projectCardTop}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[S.projectTitle, { color: colors.textPrimary }]}>{project.title}</Text>
                    <Text style={[S.projectDesc, { color: colors.textMuted }]}>{project.description}</Text>
                  </View>
                  <View style={[S.diffBadge, { backgroundColor: diffMeta.bg }]}>
                    <Text style={[S.diffBadgeText, { color: diffMeta.color }]}>{diffMeta.label}</Text>
                  </View>
                </View>
                <View style={S.skillsRow}>
                  {project.skills.map((skill) => (
                    <View key={skill} style={[S.skillChip, { backgroundColor: rm.bg }]}>
                      <Text style={[S.skillChipText, { color: rm.color }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          </View>

          {/* Legend */}
          <View style={S.legendRow}>
            {(Object.keys(STATUS_META) as TopicStatus[]).map((s) => {
              const m = STATUS_META[s];
              return (
                <View key={s} style={S.legendItem}>
                  <Text style={[S.legendIcon, { color: m.color }]}>{m.icon}</Text>
                  <Text style={[S.legendLabel, { color: colors.textMuted }]}>{m.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Sections */}
          {rm.sections.map((section) => {
            const expanded  = expandedSections.has(section.id);
            const doneTopic = section.topics.filter((t) => progress?.topics[t.id] === "done").length;
            return (
              <View key={section.id} style={S.sectionWrap}>
                {/* Section header */}
                <Pressable
                  style={[S.sectionHeader, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}
                  onPress={() => toggleSection(section.id)}
                  android_ripple={{ color: IMPACT_BG }}
                >
                  <Text style={S.sectionIcon}>{section.icon}</Text>
                  <Text style={[S.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
                  <View style={[S.sectionBadge, { backgroundColor: IMPACT_BG }]}>
                    <Text style={[S.sectionBadgeText, { color: IMPACT_COLOR }]}>
                      {doneTopic}/{section.topics.length}
                    </Text>
                  </View>
                  <Text style={[S.sectionChevron, { color: colors.textMuted }]}>{expanded ? "▲" : "▼"}</Text>
                </Pressable>

                {/* Topics */}
                {expanded && (
                  <View style={[S.topicList, { borderColor: colors.border }]}>
                    {section.topics.map((topic, ti) => {
                      const status = progress?.topics[topic.id] ?? "todo";
                      const sm     = STATUS_META[status];
                      const lm     = LEVEL_META[topic.level];
                      const isLast = ti === section.topics.length - 1;
                      return (
                        <Pressable
                          key={topic.id}
                          style={[S.topicRow, !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                          onPress={() => setActiveTopic(topic)}
                          android_ripple={{ color: IMPACT_BG }}
                        >
                          {/* Status circle — tap cycles status */}
                          <Pressable
                            onPress={() => onStatusChange(topic.id, nextStatus(status))}
                            style={[S.statusCircle, { backgroundColor: sm.bg }]}
                            hitSlop={10}
                          >
                            <Text style={[S.statusCircleIcon, { color: sm.color }]}>{sm.icon}</Text>
                          </Pressable>

                          <View style={S.topicInfo}>
                            <Text style={[S.topicTitle, { color: colors.textPrimary },
                              status === "done" && { textDecorationLine: "line-through", color: colors.textMuted }]}>
                              {topic.title}
                            </Text>
                            <Text style={[S.topicDesc, { color: colors.textMuted }]} numberOfLines={2}>
                              {topic.description}
                            </Text>
                          </View>

                          <View style={S.topicRight}>
                            <View style={[S.levelBadge, { backgroundColor: lm.bg }]}>
                              <Text style={[S.levelBadgeText, { color: lm.color }]}>{lm.label}</Text>
                            </View>
                            <Text style={[S.topicArrow, { color: colors.textDisabled }]}>›</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Topic detail sheet */}
        {activeTopic && (
          <TopicSheet
            topic={activeTopic}
            status={progress?.topics[activeTopic.id] ?? "todo"}
            colors={colors}
            isDark={isDark}
            onClose={() => setActiveTopic(null)}
            onStatusChange={(s) => { onStatusChange(activeTopic.id, s); setActiveTopic(null); }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Topic detail bottom sheet ────────────────────────────────────────────────

function TopicSheet({ topic, status, colors, isDark, onClose, onStatusChange }: {
  topic: Topic; status: TopicStatus; colors: C; isDark: boolean;
  onClose: () => void;
  onStatusChange: (s: TopicStatus) => void;
}) {
  const lm = LEVEL_META[topic.level];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={S.sheetBackdrop} onPress={onClose} />
      <SafeAreaView style={[S.sheet, { backgroundColor: colors.bgCard }]} edges={["bottom"]}>
        <View style={[S.sheetHandle, { backgroundColor: colors.border }]} />

        {/* Topic header */}
        <View style={S.sheetHeader}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[S.sheetTitle, { color: colors.textPrimary }]}>{topic.title}</Text>
            <View style={[S.levelBadge, { backgroundColor: lm.bg, alignSelf: "flex-start" }]}>
              <Text style={[S.levelBadgeText, { color: lm.color }]}>{lm.label}</Text>
            </View>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[S.sheetClose, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        </View>

        <Text style={[S.sheetDesc, { color: colors.textSecondary }]}>{topic.description}</Text>

        {/* Status selector */}
        <View style={S.statusRow}>
          {(Object.keys(STATUS_META) as TopicStatus[]).map((s) => {
            const m      = STATUS_META[s];
            const active = status === s;
            return (
              <Pressable key={s} onPress={() => onStatusChange(s)}
                style={[S.statusBtn, { borderColor: colors.border },
                  active && { backgroundColor: m.color, borderColor: m.color }]}
                android_ripple={{ color: m.bg }}>
                <Text style={[S.statusBtnIcon, { color: active ? "#fff" : m.color }]}>{m.icon}</Text>
                <Text style={[S.statusBtnLabel, { color: active ? "#fff" : colors.textMuted },
                  active && { fontWeight: "700" }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Resources */}
        {topic.resources.length > 0 && (
          <>
            <Text style={[S.resourcesLabel, { color: colors.textMuted }]}>RESOURCES</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {topic.resources.map((r, i) => (
                <Pressable key={i}
                  style={[S.resourceRow, { borderColor: colors.border }, i > 0 && { borderTopWidth: 0 }]}
                  onPress={() => Linking.openURL(r.url)}
                  android_ripple={{ color: IMPACT_BG }}>
                  <View style={[S.resourceIcon, { backgroundColor: IMPACT_BG }]}>
                    <Text style={S.resourceIconText}>{RESOURCE_ICONS[r.type] ?? "🔗"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.resourceLabel, { color: colors.textPrimary }]} numberOfLines={2}>{r.label}</Text>
                    <Text style={[S.resourceType, { color: colors.textMuted }]}>{r.type}</Text>
                  </View>
                  <Text style={[S.resourceArrow, { color: IMPACT_COLOR }]}>↗</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function HeroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={S.heroStat}>
      <Text style={[S.heroStatLabel, { color }]}>{label}</Text>
      <Text style={[S.heroStatValue, { color }]}>{value}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  detailContent: { padding: 16, paddingBottom: 40, gap: 14 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  resetText: { fontSize: 13, fontWeight: "600" },

  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  separator: { height: 1, marginVertical: 4 },

  // Active cards
  activeCard: { borderWidth: 1.5, borderRadius: 18, padding: 14, gap: 8, overflow: "hidden" },
  activeCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  activeCardIcon: { fontSize: 28 },
  activeCardTitle: { fontSize: 15, fontWeight: "700" },
  activeCardMeta: { fontSize: 11, marginTop: 2 },
  activeCardRight: { position: "absolute", top: 14, right: 14 },
  activeCardPct: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  activeBarTrack: { height: 4, borderRadius: 99, overflow: "hidden" },
  activeBarFill: { height: 4, borderRadius: 99 },

  // All-paths grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: { width: "47.5%", borderWidth: 1, borderRadius: 18, padding: 14, gap: 6, overflow: "hidden" },
  gridCardIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  gridCardIcon: { fontSize: 22 },
  gridCardTitle: { fontSize: 14, fontWeight: "700" },
  gridCardTime: { fontSize: 11 },
  gridCardSalary: { fontSize: 12, fontWeight: "600" },
  gridCardProgress: { height: 3, borderRadius: 99, overflow: "hidden", marginTop: 4 },
  gridCardProgressFill: { height: 3, borderRadius: 99 },

  // Hero banner
  heroBanner: { borderRadius: 20, padding: 18, gap: 10 },
  heroTop: { gap: 4 },
  heroTitle: { fontSize: 14, lineHeight: 22 },
  heroStats: { flexDirection: "row", justifyContent: "space-around" },
  heroStat: { alignItems: "center", gap: 2 },
  heroStatLabel: { fontSize: 10, fontWeight: "600" },
  heroStatValue: { fontSize: 13, fontWeight: "700" },
  heroTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  heroFill: { height: 6, borderRadius: 99 },
  heroPct: { fontSize: 12, fontWeight: "700", textAlign: "center" },

  // Job titles
  jobTitleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  jobTitleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  jobTitleText: { fontSize: 12, fontWeight: "600" },

  // Projects
  projectCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  projectCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  projectTitle: { fontSize: 14, fontWeight: "700" },
  projectDesc: { fontSize: 12, lineHeight: 18 },
  diffBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, flexShrink: 0 },
  diffBadgeText: { fontSize: 10, fontWeight: "700" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99 },
  skillChipText: { fontSize: 11, fontWeight: "600" },

  // Legend
  legendRow: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendIcon: { fontSize: 14 },
  legendLabel: { fontSize: 11 },

  // Sections
  sectionWrap: { gap: 0 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: "700" },
  sectionBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  sectionBadgeText: { fontSize: 11, fontWeight: "700" },
  sectionChevron: { fontSize: 11 },

  // Topics
  topicList: { borderWidth: 1, borderTopWidth: 0, borderRadius: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: "hidden" },
  topicRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  statusCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  statusCircleIcon: { fontSize: 16 },
  topicInfo: { flex: 1, gap: 4 },
  topicTitle: { fontSize: 14, fontWeight: "600" },
  topicDesc: { fontSize: 12, lineHeight: 17 },
  topicRight: { alignItems: "flex-end", gap: 4, flexShrink: 0 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  levelBadgeText: { fontSize: 10, fontWeight: "700" },
  topicArrow: { fontSize: 18 },

  // Topic sheet
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "80%", elevation: 24 },
  sheetHandle: { width: 36, height: 4, borderRadius: 99, alignSelf: "center", marginBottom: 18 },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: "800" },
  sheetClose: { fontSize: 18 },
  sheetDesc: { fontSize: 14, lineHeight: 22, marginBottom: 16 },

  // Status selector
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statusBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  statusBtnIcon: { fontSize: 16 },
  statusBtnLabel: { fontSize: 12 },

  // Resources
  resourcesLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  resourceRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 8 },
  resourceIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  resourceIconText: { fontSize: 16 },
  resourceLabel: { fontSize: 14, fontWeight: "500" },
  resourceType: { fontSize: 11, marginTop: 2 },
  resourceArrow: { fontSize: 16, fontWeight: "700" },
});
