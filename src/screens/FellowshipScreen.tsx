import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, ActivityIndicator, TextInput, Alert, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { supabase } from "../api/supabase";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { usePillars } from "../hooks/usePillars";
import { useGoals } from "../hooks/useGoals";

type Privacy = { gym: boolean; spirit: boolean; impact: boolean };

const PILLAR_META = [
  { key: "soul" as const,        label: "Soul",        color: "#1D9E75", bg: "#F0FBF7", icon: "✦" },
  { key: "vessel" as const,      label: "Vessel",      color: "#D85A30", bg: "#FEF3EE", icon: "⬡" },
  { key: "impact" as const,      label: "Impact",      color: "#378ADD", bg: "#F0F7FE", icon: "◈" },
  { key: "stewardship" as const, label: "Stewardship", color: "#BA7517", bg: "#FAEEDA", icon: "◎" },
];

export default function FellowshipScreen() {
  const userId = useAuthStore((s) => s.userId)!;
  const { data: pillars } = usePillars(userId);
  const { data: goals } = useGoals(userId);
  const { isDark, colors, toggle: toggleTheme } = useThemeStore();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>({ gym: false, spirit: false, impact: false });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("username, privacy_settings")
        .eq("id", userId)
        .single();

      if (data) {
        setUsername(data.username ?? "");
        setPrivacy(data.privacy_settings ?? { gym: false, spirit: false, impact: false });
      }
      setLoading(false);
    }
    loadProfile();
  }, [userId]);

  async function saveUsername() {
    if (!newUsername.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername.toLowerCase().trim() })
      .eq("id", userId);
    setSaving(false);
    if (error) return Alert.alert("Couldn't save.", error.message);
    setUsername(newUsername.toLowerCase().trim());
    setEditingUsername(false);
  }

  async function togglePrivacy(key: keyof Privacy) {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    await supabase
      .from("profiles")
      .update({ privacy_settings: updated })
      .eq("id", userId);
  }

  const totalGoals = (goals ?? []).length;
  const doneGoals  = (goals ?? []).filter((g) => g.is_done).length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identity card ── */}
        <View style={[styles.identityCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}>
            <Text style={[styles.avatarText, { color: colors.textPrimary }]}>{initial}</Text>
          </View>
          <View style={styles.identityInfo}>
            {editingUsername ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.usernameInput, {
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    backgroundColor: colors.bgInput,
                  }]}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoFocus
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={saveUsername}
                  disabled={saving}
                  style={[styles.saveBtn, { backgroundColor: colors.textPrimary }]}
                >
                  <Text style={[styles.saveBtnText, { color: colors.bg }]}>
                    {saving ? "…" : "Save"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setEditingUsername(false)}>
                  <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>✕</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => { setNewUsername(username); setEditingUsername(true); }}
                style={styles.usernameRow}
              >
                <Text style={[styles.username, { color: colors.textPrimary }]}>
                  @{username || "set username"}
                </Text>
                <View style={[styles.editChip, { backgroundColor: colors.bgSubtle }]}>
                  <Text style={[styles.editChipText, { color: colors.textMuted }]}>Edit</Text>
                </View>
              </Pressable>
            )}
            <Text style={[styles.email, { color: colors.textMuted }]}>{email}</Text>
          </View>
        </View>

        {/* ── Goals summary ── */}
        <View style={[styles.goalsRow, { backgroundColor: colors.bgSubtle, borderRadius: 14 }]}>
          <View style={styles.goalsStat}>
            <Text style={[styles.goalsNum, { color: colors.textPrimary }]}>{doneGoals}</Text>
            <Text style={[styles.goalsLabel, { color: colors.textMuted }]}>Done</Text>
          </View>
          <View style={[styles.goalsDivider, { backgroundColor: colors.border }]} />
          <View style={styles.goalsStat}>
            <Text style={[styles.goalsNum, { color: colors.textPrimary }]}>{totalGoals - doneGoals}</Text>
            <Text style={[styles.goalsLabel, { color: colors.textMuted }]}>Pending</Text>
          </View>
          <View style={[styles.goalsDivider, { backgroundColor: colors.border }]} />
          <View style={styles.goalsStat}>
            <Text style={[styles.goalsNum, { color: colors.textPrimary }]}>{totalGoals}</Text>
            <Text style={[styles.goalsLabel, { color: colors.textMuted }]}>Total Goals</Text>
          </View>
        </View>

        {/* ── Attributes ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ATTRIBUTES</Text>
        <View style={styles.pillarsGrid}>
          {PILLAR_META.map((meta) => (
            <View
              key={meta.key}
              style={[styles.pillarCard, { backgroundColor: meta.bg }]}
            >
              <Text style={[styles.pillarIcon, { color: meta.color }]}>{meta.icon}</Text>
              <Text style={[styles.pillarLabel, { color: meta.color }]}>{meta.label}</Text>
              <Text style={[styles.pillarValue, { color: meta.color }]}>
                {pillars?.[meta.key] ?? 0}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Appearance ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                {isDark ? "🌙 Dark mode" : "☀️ Light mode"}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                {isDark ? "Switch to light theme" : "Switch to dark theme"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#e5e5e5", true: "#333" }}
              thumbColor={isDark ? "#fff" : "#111"}
            />
          </View>
        </View>

        {/* ── Notifications ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>NOTIFICATIONS</Text>
        <Pressable
          style={[styles.settingCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => router.push("/notification-settings" as any)}
          android_ripple={{ color: colors.bgSubtle }}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>🔔 Notification settings</Text>
              <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                Prayer alerts, daily reminder, streak warnings
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: colors.textDisabled }]}>›</Text>
          </View>
        </Pressable>

        {/* ── Privacy ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PRIVACY</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <PrivacyRow label="Vessel (gym)"    description="Share workout activity"    value={privacy.gym}    onToggle={() => togglePrivacy("gym")}    colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PrivacyRow label="Soul (spirit)"   description="Share spiritual activity"  value={privacy.spirit} onToggle={() => togglePrivacy("spirit")} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PrivacyRow label="Impact (work)"   description="Share professional activity" value={privacy.impact} onToggle={() => togglePrivacy("impact")} colors={colors} />
        </View>

        {/* ── Sign out ── */}
        <Pressable
          onPress={() => supabase.auth.signOut()}
          style={[styles.signOutBtn, { borderColor: "#D85A30" }]}
          android_ripple={{ color: "#FEF3EE" }}
        >
          <Text style={[styles.signOutText, { color: "#D85A30" }]}>Sign out</Text>
        </Pressable>

        <Text style={[styles.versionText, { color: colors.textDisabled }]}>The Mirror v0.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrivacyRow({
  label, description, value, onToggle, colors,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#e5e5e5", true: "#333" }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },

  content: { padding: 16, paddingBottom: 40 },

  // Identity
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 24, fontWeight: "700" },
  identityInfo: { flex: 1 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  usernameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
  },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  saveBtnText: { fontSize: 13, fontWeight: "600" },
  cancelBtnText: { fontSize: 16, paddingHorizontal: 4 },
  usernameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  username: { fontSize: 17, fontWeight: "700" },
  editChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  editChipText: { fontSize: 11, fontWeight: "600" },
  email: { fontSize: 13, marginTop: 2 },

  // Goals row
  goalsRow: {
    flexDirection: "row",
    paddingVertical: 16,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  goalsStat: { flex: 1, alignItems: "center", gap: 3 },
  goalsNum: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  goalsLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  goalsDivider: { width: 1, height: 30 },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  // Pillars
  pillarsGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  pillarCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  pillarIcon: { fontSize: 18 },
  pillarLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  pillarValue: { fontSize: 22, fontWeight: "800" },

  // Setting cards
  settingCard: { borderWidth: 1, borderRadius: 14, overflow: "hidden", marginBottom: 24 },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: "500" },
  settingDesc: { fontSize: 12, marginTop: 2 },
  settingArrow: { fontSize: 20 },
  divider: { height: 1 },

  // Sign out
  signOutBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  signOutText: { fontSize: 15, fontWeight: "600" },

  versionText: { textAlign: "center", fontSize: 12 },
});
