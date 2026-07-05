import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, ActivityIndicator, TextInput, Alert, Switch,
} from "react-native";
import { supabase } from "../api/supabase";
import { useAuthStore } from "../store/authStore";
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
    return <View style={styles.center}><ActivityIndicator color="#111" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar + name */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(username || email).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          {editingUsername ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
                autoFocus
                placeholder="username"
                placeholderTextColor="#aaa"
              />
              <Pressable onPress={saveUsername} disabled={saving} style={styles.saveBtn}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>
                }
              </Pressable>
              <Pressable onPress={() => setEditingUsername(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { setNewUsername(username); setEditingUsername(true); }}>
              <Text style={styles.username}>
                {username || "Set username"} <Text style={styles.editHint}>edit</Text>
              </Text>
            </Pressable>
          )}
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>

      {/* Synergy score */}
      <View style={styles.synergyCard}>
        <Text style={styles.synergyNum}>{synergy}</Text>
        <Text style={styles.synergyLabel}>synergy score</Text>
        <Text style={styles.synergyGoals}>{doneGoals} of {totalGoals} goals complete</Text>
      </View>

      {/* Pillar stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your pillars</Text>
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

      {/* Privacy settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.sectionSub}>Choose what others can see. Financials are always private.</Text>
        <View style={styles.privacyList}>
          <PrivacyRow
            label="Vessel (gym)"
            description="Share workout activity"
            value={privacy.gym}
            onToggle={() => togglePrivacy("gym")}
          />
          <PrivacyRow
            label="Soul (spirit)"
            description="Share spiritual activity"
            value={privacy.spirit}
            onToggle={() => togglePrivacy("spirit")}
          />
          <PrivacyRow
            label="Impact (work)"
            description="Share professional activity"
            value={privacy.impact}
            onToggle={() => togglePrivacy("impact")}
          />
        </View>
      </View>

      {/* Sign out */}
      <Pressable
        onPress={() => supabase.auth.signOut()}
        style={styles.signOutBtn}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Text style={styles.versionText}>The Mirror v0.1</Text>
    </ScrollView>
  );
}

function PrivacyRow({
  label, description, value, onToggle,
}: { label: string; description: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.privacyRow}>
      <View style={styles.privacyInfo}>
        <Text style={styles.privacyLabel}>{label}</Text>
        <Text style={styles.privacyDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#e5e5e5", true: "#111" }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "600", color: "#fff" },
  profileInfo: { flex: 1 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  usernameInput: { flex: 1, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, color: "#111" },
  saveBtn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  cancelBtn: { padding: 6 },
  cancelBtnText: { fontSize: 14, color: "#aaa" },
  username: { fontSize: 18, fontWeight: "600", color: "#111" },
  editHint: { fontSize: 12, color: "#aaa", fontWeight: "400" },
  email: { fontSize: 13, color: "#aaa", marginTop: 2 },
  synergyCard: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 24, backgroundColor: "#fafafa" },
  synergyNum: { fontSize: 48, fontWeight: "700", color: "#111", letterSpacing: -2 },
  synergyLabel: { fontSize: 13, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  synergyGoals: { fontSize: 12, color: "#ccc", marginTop: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#111", marginBottom: 4 },
  sectionSub: { fontSize: 13, color: "#aaa", marginBottom: 12 },
  pillarsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillarCard: { width: "47%", borderRadius: 12, padding: 14 },
  pillarLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  pillarValue: { fontSize: 28, fontWeight: "700" },
  privacyList: { borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 12, overflow: "hidden" },
  privacyRow: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  privacyInfo: { flex: 1 },
  privacyLabel: { fontSize: 14, fontWeight: "500", color: "#111" },
  privacyDesc: { fontSize: 12, color: "#aaa", marginTop: 2 },
  signOutBtn: { borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  signOutText: { fontSize: 15, color: "#aaa" },
  versionText: { textAlign: "center", fontSize: 12, color: "#ddd" },
});
