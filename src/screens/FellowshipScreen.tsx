import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, ActivityIndicator, TextInput, Alert, Switch,
} from "react-native";
import { supabase } from "../api/supabase";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { usePillars } from "../hooks/usePillars";
import { useGoals } from "../hooks/useGoals";

type Privacy = { gym: boolean; spirit: boolean; impact: boolean };

const PILLAR_META = [
  { key: "soul" as const,        label: "Soul",        color: "#1D9E75", bg: "#F0FBF7" },
  { key: "vessel" as const,      label: "Vessel",      color: "#D85A30", bg: "#FEF3EE" },
  { key: "impact" as const,      label: "Impact",      color: "#378ADD", bg: "#F0F7FE" },
  { key: "stewardship" as const, label: "Stewardship", color: "#BA7517", bg: "#FAEEDA" },
];

export default function FellowshipScreen() {
  const userId = useAuthStore((s) => s.userId)!;
  const { data: pillars } = usePillars(userId);
  const { data: goals } = useGoals(userId);
  const { isDark, colors, toggle: toggleTheme } = useThemeStore();

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
  const doneGoals = (goals ?? []).filter((g) => g.is_done).length;
  const synergy = pillars
    ? Math.round((pillars.soul + pillars.vessel + pillars.impact + pillars.stewardship) / 4)
    : 0;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
            {username ? username[0].toUpperCase() : "?"}
          </Text>
        </View>
        <View style={styles.profileInfo}>
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
              <Pressable onPress={() => setEditingUsername(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { setNewUsername(username); setEditingUsername(true); }}>
              <Text style={[styles.username, { color: colors.textPrimary }]}>
                @{username || "set username"}{" "}
                <Text style={[styles.editHint, { color: colors.textMuted }]}>✎</Text>
              </Text>
            </Pressable>
          )}
          <Text style={[styles.email, { color: colors.textMuted }]}>{email}</Text>
        </View>
      </View>

      {/* Synergy card */}
      <View style={[styles.synergyCard, { borderColor: colors.border, backgroundColor: colors.bgSubtle }]}>
        <Text style={[styles.synergyNum, { color: colors.textPrimary }]}>{synergy}</Text>
        <Text style={[styles.synergyLabel, { color: colors.textMuted }]}>SYNERGY SCORE</Text>
        <Text style={[styles.synergyGoals, { color: colors.textDisabled }]}>
          {doneGoals}/{totalGoals} goals complete
        </Text>
      </View>

      {/* Pillars section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attributes</Text>
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Your pillar scores at a glance.</Text>
        <View style={styles.pillarsGrid}>
          {PILLAR_META.map((meta) => (
            <View key={meta.key} style={[styles.pillarCard, { backgroundColor: meta.bg }]}>
              <Text style={[styles.pillarLabel, { color: meta.color }]}>{meta.label}</Text>
              <Text style={[styles.pillarValue, { color: meta.color }]}>
                {pillars?.[meta.key] ?? 0}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Appearance section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
          Choose how the app looks.
        </Text>
        <View style={[styles.themeRow, { borderColor: colors.border }]}>
          <View style={styles.themeInfo}>
            <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>
              {isDark ? "🌙 Dark mode" : "☀️ Light mode"}
            </Text>
            <Text style={[styles.themeDesc, { color: colors.textMuted }]}>
              {isDark ? "Switch to a bright theme" : "Switch to a dark theme"}
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

      {/* Privacy section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Privacy</Text>
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
          Choose what others can see. Financials are always private.
        </Text>
        <View style={[styles.privacyList, { borderColor: colors.borderStrong }]}>
          <PrivacyRow
            label="Vessel (gym)"
            description="Share workout activity"
            value={privacy.gym}
            onToggle={() => togglePrivacy("gym")}
            colors={colors}
          />
          <PrivacyRow
            label="Soul (spirit)"
            description="Share spiritual activity"
            value={privacy.spirit}
            onToggle={() => togglePrivacy("spirit")}
            colors={colors}
          />
          <PrivacyRow
            label="Impact (work)"
            description="Share professional activity"
            value={privacy.impact}
            onToggle={() => togglePrivacy("impact")}
            colors={colors}
            last
          />
        </View>
      </View>

      {/* Sign out */}
      <Pressable
        onPress={() => supabase.auth.signOut()}
        style={[styles.signOutBtn, { borderColor: colors.borderStrong }]}
      >
        <Text style={[styles.signOutText, { color: colors.textMuted }]}>Sign out</Text>
      </Pressable>

      <Text style={[styles.versionText, { color: colors.textDisabled }]}>The Mirror v0.1</Text>
    </ScrollView>
  );
}

function PrivacyRow({
  label, description, value, onToggle, colors, last = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
  last?: boolean;
}) {
  return (
    <View style={[
      styles.privacyRow,
      { borderBottomColor: colors.borderStrong },
      last && styles.privacyRowLast,
    ]}>
      <View style={styles.privacyInfo}>
        <Text style={[styles.privacyLabel, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>{description}</Text>
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
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "600" },
  profileInfo: { flex: 1 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  usernameInput: {
    flex: 1, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, fontSize: 15,
  },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  saveBtnText: { fontSize: 13, fontWeight: "500" },
  cancelBtn: { padding: 6 },
  cancelBtnText: { fontSize: 14 },
  username: { fontSize: 18, fontWeight: "600" },
  editHint: { fontSize: 12, fontWeight: "400" },
  email: { fontSize: 13, marginTop: 2 },
  synergyCard: {
    borderWidth: 1, borderRadius: 16, padding: 20,
    alignItems: "center", marginBottom: 24,
  },
  synergyNum: { fontSize: 48, fontWeight: "700", letterSpacing: -2 },
  synergyLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  synergyGoals: { fontSize: 12, marginTop: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 12 },
  pillarsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillarCard: { width: "47%", borderRadius: 12, padding: 14 },
  pillarLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  pillarValue: { fontSize: 28, fontWeight: "700" },
  // Appearance
  themeRow: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderWidth: 1, borderRadius: 12,
  },
  themeInfo: { flex: 1 },
  themeLabel: { fontSize: 14, fontWeight: "500" },
  themeDesc: { fontSize: 12, marginTop: 2 },
  // Privacy
  privacyList: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  privacyRow: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderBottomWidth: 1,
  },
  privacyRowLast: { borderBottomWidth: 0 },
  privacyInfo: { flex: 1 },
  privacyLabel: { fontSize: 14, fontWeight: "500" },
  privacyDesc: { fontSize: 12, marginTop: 2 },
  signOutBtn: {
    borderWidth: 1, borderRadius: 12,
    paddingVertical: 14, alignItems: "center", marginBottom: 12,
  },
  signOutText: { fontSize: 15 },
  versionText: { textAlign: "center", fontSize: 12 },
});
