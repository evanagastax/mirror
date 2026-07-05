import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { syncGitHubToImpact } from "../services/githubSync";
import { supabase } from "../api/supabase";

export default function GitHubSyncScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId)!;
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved credentials
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("privacy_settings")
        .eq("id", userId)
        .single();

      const settings = data?.privacy_settings ?? {};
      if (settings.github_username) setUsername(settings.github_username);
      if (settings.github_token) setToken(settings.github_token);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function handleSync() {
    if (!username.trim()) return Alert.alert("Enter your GitHub username.");
    if (!token.trim()) return Alert.alert("Enter your GitHub token.");

    setSyncing(true);
    try {
      // Save credentials
      const { data } = await supabase
        .from("profiles")
        .select("privacy_settings")
        .eq("id", userId)
        .single();

      await supabase
        .from("profiles")
        .update({
          privacy_settings: {
            ...(data?.privacy_settings ?? {}),
            github_username: username.trim(),
            github_token: token.trim(),
          },
        })
        .eq("id", userId);

      // Run sync
      const count = await syncGitHubToImpact(userId, {
        token: token.trim(),
        username: username.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });

      if (count === 0) {
        Alert.alert("Up to date", "No new GitHub activity found in recent events.");
      } else {
        Alert.alert(
          "Synced!",
          `${count} GitHub event${count > 1 ? "s" : ""} added to your Impact pillar.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (e: any) {
      Alert.alert("Sync failed", e.message ?? "Check your token and try again.");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#111" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Sync GitHub</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What gets synced</Text>
        <Text style={styles.infoText}>• Pushes → 2pts per commit (max 10)</Text>
        <Text style={styles.infoText}>• Merged PR → 10pts</Text>
        <Text style={styles.infoText}>• Opened PR → 7pts</Text>
        <Text style={styles.infoText}>• Closed issue → 5pts</Text>
        <Text style={styles.infoText}>• New repo → 8pts</Text>
        <Text style={styles.infoSub}>Only events from the last 30 days. Already-synced events are skipped.</Text>
      </View>

      <View style={styles.fields}>
        <Field label="GitHub username">
          <TextInput
            style={styles.input}
            placeholder="made-agastya"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
        </Field>

        <Field label="Personal Access Token">
          <TextInput
            style={styles.input}
            placeholder="github_pat_..."
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={token}
            onChangeText={setToken}
          />
        </Field>

        <Text style={styles.tokenHint}>
          Generate at: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens{"\n"}
          Permissions needed: Contents (read), Metadata (read), Pull requests (read)
        </Text>
      </View>

      <Pressable
        onPress={handleSync}
        disabled={syncing}
        style={[styles.syncBtn, syncing && { opacity: 0.5 }]}
      >
        {syncing
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.syncBtnText}>Sync now</Text>
        }
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  back: { fontSize: 15, color: "#aaa" },
  title: { fontSize: 18, fontWeight: "600", color: "#111" },
  infoCard: { backgroundColor: "#F0F7FE", borderRadius: 12, padding: 14, marginBottom: 24 },
  infoTitle: { fontSize: 13, fontWeight: "600", color: "#185FA5", marginBottom: 8 },
  infoText: { fontSize: 13, color: "#378ADD", marginBottom: 4 },
  infoSub: { fontSize: 12, color: "#888", marginTop: 8 },
  fields: { gap: 16, marginBottom: 8 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, color: "#888", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111", backgroundColor: "#fafafa" },
  tokenHint: { fontSize: 12, color: "#aaa", lineHeight: 18, marginTop: 4 },
  syncBtn: { backgroundColor: "#378ADD", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  syncBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
