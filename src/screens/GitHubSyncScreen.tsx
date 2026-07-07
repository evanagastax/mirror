import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useQueryClient } from "@tanstack/react-query";
import { syncGitHubToImpact } from "../services/githubSync";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_TOKEN = "github_token";
const STORAGE_KEY_USERNAME = "github_username";

export default function GitHubSyncScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId)!;
  const colors = useThemeStore((s) => s.colors);
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ synced: number; total: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const savedUsername = await AsyncStorage.getItem(STORAGE_KEY_USERNAME);
        const savedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        if (savedUsername) setUsername(savedUsername);
        if (savedToken) setToken(savedToken);
      } catch (e) {
        console.warn("Could not load GitHub credentials from storage:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSync() {
    if (!username.trim()) return Alert.alert("Enter your GitHub username.");
    if (!token.trim()) return Alert.alert("Enter your GitHub token.");

    setSyncing(true);
    setResult(null);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERNAME, username.trim());
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token.trim());

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

  async function handleClearCredentials() {
    Alert.alert(
      "Clear credentials?",
      "Your GitHub username and token will be removed from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEY_USERNAME);
            setUsername("");
            setToken("");
            setResult(null);
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  const inputStyle = [styles.input, {
    borderColor: colors.border,
    color: colors.textPrimary,
    backgroundColor: colors.bgInput,
  }];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.textMuted }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Sync GitHub</Text>
      </View>

      {/* Security notice */}
      <View style={[styles.securityCard, { backgroundColor: colors.bgSubtle }]}>
        <Text style={[styles.securityTitle, { color: colors.textPrimary }]}>🔒 Stored on device only</Text>
        <Text style={[styles.securityText, { color: colors.textSecondary }]}>
          Your GitHub token is saved locally on this device using AsyncStorage.
          It is never sent to or stored in the database.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What gets synced</Text>
        <Text style={styles.infoText}>• Pushes → 2pts per commit (max 10)</Text>
        <Text style={styles.infoText}>• Merged PR → 10pts</Text>
        <Text style={styles.infoText}>• Opened PR → 7pts</Text>
        <Text style={styles.infoText}>• Closed issue → 5pts</Text>
        <Text style={styles.infoText}>• New repository → 8pts</Text>
        <Text style={styles.infoText}>• Published release → 10pts</Text>
      </View>

      <View style={styles.fields}>
        <Field label="GitHub username" colors={colors}>
          <TextInput
            style={inputStyle}
            placeholder="your-github-username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
        </Field>

        <Field label="Personal Access Token (classic)" colors={colors}>
          <TextInput
            style={inputStyle}
            placeholder="ghp_..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={token}
            onChangeText={setToken}
          />
        </Field>

        <Text style={[styles.tokenHint, { color: colors.textMuted }]}>
          Use a Classic token (not fine-grained) with repo and read:user scopes.{"\n"}
          GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
        </Text>
      </View>

      {/* Result */}
      {result && (
        <View style={[
          styles.resultCard,
          { backgroundColor: result.synced > 0 ? "#F0FBF7" : colors.bgSubtle }
        ]}>
          {result.total === 0 ? (
            <>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>No activity found</Text>
              <Text style={[styles.resultSub, { color: colors.textSecondary }]}>
                GitHub returned no recent events. Make sure you have pushed commits or opened PRs recently.
              </Text>
            </>
          ) : result.synced === 0 ? (
            <>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Already up to date</Text>
              <Text style={[styles.resultSub, { color: colors.textSecondary }]}>
                Found {result.total} event{result.total > 1 ? "s" : ""} but all were already synced.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.resultTitle, { color: "#1D9E75" }]}>
                ✓ {result.synced} event{result.synced > 1 ? "s" : ""} synced
              </Text>
              <Text style={[styles.resultSub, { color: colors.textSecondary }]}>Added to your Impact pillar.</Text>
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

      {(username || token) && (
        <Pressable onPress={handleClearCredentials} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear saved credentials</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Field({
  label, children, colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  back: { fontSize: 15 },
  title: { fontSize: 18, fontWeight: "600" },
  securityCard: { borderRadius: 12, padding: 14, marginBottom: 12 },
  securityTitle: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  securityText: { fontSize: 12, lineHeight: 18 },
  infoCard: { backgroundColor: "#F0F7FE", borderRadius: 12, padding: 14, marginBottom: 24 },
  infoTitle: { fontSize: 13, fontWeight: "600", color: "#185FA5", marginBottom: 8 },
  infoText: { fontSize: 13, color: "#378ADD", marginBottom: 4 },
  fields: { gap: 16, marginBottom: 16 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  tokenHint: { fontSize: 12, lineHeight: 18 },
  resultCard: { borderRadius: 12, padding: 14, marginBottom: 16 },
  resultTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  resultSub: { fontSize: 13 },
  syncBtn: { backgroundColor: "#378ADD", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  syncBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  clearBtn: { alignItems: "center", paddingVertical: 10 },
  clearBtnText: { fontSize: 13, color: "#D85A30" },
});
