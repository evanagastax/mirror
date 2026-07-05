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
  const [result, setResult] = useState<{ synced: number; total: number } | null>(null);

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
    setResult(null);
    try {
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

      const { synced, total } = await syncGitHubToImpact(userId, {
        token: token.trim(),
        username: username.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });

      setResult({ synced, total });
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
        <Text style={styles.infoText}>• Published release → 10pts</Text>
      </View>

      <View style={styles.fields}>
        <Field label="GitHub username">
          <TextInput
            style={styles.input}
            placeholder="your-github-username"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
        </Field>

        <Field label="Personal Access Token (classic)">
          <TextInput
            style={styles.input}
            placeholder="ghp_..."
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={token}
            onChangeText={setToken}
          />
        </Field>

        <Text style={styles.tokenHint}>
          Use a Classic token (not fine-grained) with repo and read:user scopes.{"\n"}
          GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
        </Text>
      </View>

      {/* Result */}
      {result && (
        <View style={[
          styles.resultCard,
          { backgroundColor: result.synced > 0 ? "#F0FBF7" : "#fafafa" }
        ]}>
          {result.total === 0 ? (
            <>
              <Text style={styles.resultTitle}>No activity found</Text>
              <Text style={styles.resultSub}>
                GitHub returned no recent events. Make sure you have pushed commits or opened PRs recently.
              </Text>
            </>
          ) : result.synced === 0 ? (
            <>
              <Text style={styles.resultTitle}>Already up to date</Text>
              <Text style={styles.resultSub}>
                Found {result.total} event{result.total > 1 ? "s" : ""} but all were already synced.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.resultTitle, { color: "#1D9E75" }]}>
                ✓ {result.synced} event{result.synced > 1 ? "s" : ""} synced
              </Text>
              <Text style={styles.resultSub}>Added to your Impact pillar.</Text>
            </>
          )}
        </View>
      )}

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
  fields: { gap: 16, marginBottom: 16 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, color: "#888", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111", backgroundColor: "#fafafa" },
  tokenHint: { fontSize: 12, color: "#aaa", lineHeight: 18 },
  resultCard: { borderRadius: 12, padding: 14, marginBottom: 16 },
  resultTitle: { fontSize: 15, fontWeight: "600", color: "#111", marginBottom: 4 },
  resultSub: { fontSize: 13, color: "#888" },
  syncBtn: { backgroundColor: "#378ADD", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  syncBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
