import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  StyleSheet, Alert, ScrollView, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useQueryClient } from "@tanstack/react-query";
import { syncGitHubToImpact } from "../services/githubSync";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLOR = "#378ADD";
const BG    = "#F0F7FE";
const KEY_TOKEN    = "github_token";
const KEY_USERNAME = "github_username";
const KEY_LAST_SYNC = "github_last_sync";

type C = ReturnType<typeof useThemeStore.getState>["colors"];

export default function GitHubSyncScreen() {
  const router       = useRouter();
  const userId       = useAuthStore((s) => s.userId)!;
  const { isDark, colors } = useThemeStore();
  const queryClient  = useQueryClient();

  const [username,  setUsername]  = useState("");
  const [token,     setToken]     = useState("");
  const [syncing,   setSyncing]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [lastSync,  setLastSync]  = useState<string | null>(null);
  const [result,    setResult]    = useState<{ synced: number; total: number } | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([KEY_USERNAME, KEY_TOKEN, KEY_LAST_SYNC]).then((pairs) => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map[KEY_USERNAME]) setUsername(map[KEY_USERNAME]!);
      if (map[KEY_TOKEN])    setToken(map[KEY_TOKEN]!);
      if (map[KEY_LAST_SYNC]) setLastSync(map[KEY_LAST_SYNC]);
      setLoading(false);
    });
  }, []);

  async function handleSync() {
    if (!username.trim()) { Alert.alert("Enter your GitHub username."); return; }
    if (!token.trim())    { Alert.alert("Enter your GitHub token.");    return; }
    setSyncing(true);
    setResult(null);
    try {
      await AsyncStorage.multiSet([
        [KEY_USERNAME, username.trim()],
        [KEY_TOKEN,    token.trim()],
      ]);
      const { synced, total } = await syncGitHubToImpact(userId, {
        token: token.trim(), username: username.trim(),
      });
      const now = new Date().toISOString();
      await AsyncStorage.setItem(KEY_LAST_SYNC, now);
      setLastSync(now);
      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
      queryClient.invalidateQueries({ queryKey: ["logs",    userId] });
      queryClient.invalidateQueries({ queryKey: ["streak",  userId] });
      setResult({ synced, total });
    } catch (e: any) {
      Alert.alert("Sync failed", e.message ?? "Check your token and try again.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleClear() {
    Alert.alert("Clear credentials?", "GitHub token will be removed from this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        await AsyncStorage.multiRemove([KEY_TOKEN, KEY_USERNAME, KEY_LAST_SYNC]);
        setUsername(""); setToken(""); setLastSync(null); setResult(null);
      }},
    ]);
  }

  function formatLastSync(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={COLOR} size="large" /></View>
      </SafeAreaView>
    );
  }

  const inp = [S.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput }];

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
        </Pressable>
        <View style={S.headerCenter}>
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>GitHub Sync</Text>
          <Text style={[S.headerSub, { color: colors.textMuted }]}>
            {lastSync ? `Last sync ${formatLastSync(lastSync)}` : "Never synced"}
          </Text>
        </View>
        <Pressable
          onPress={handleSync}
          disabled={syncing}
          style={[S.syncBtn, { backgroundColor: COLOR }, syncing && { opacity: 0.5 }]}
        >
          {syncing
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={S.syncBtnText}>Sync</Text>}
        </Pressable>
      </View>

      <ScrollView style={S.flex} contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

        {/* Result banner */}
        {result && (
          <View style={[S.resultCard, {
            backgroundColor: result.synced > 0 ? "#F0FBF7" : colors.bgSubtle,
            borderColor:     result.synced > 0 ? "#1D9E75" : colors.border,
          }]}>
            {result.total === 0 ? (
              <>
                <Text style={[S.resultTitle, { color: colors.textPrimary }]}>No activity found</Text>
                <Text style={[S.resultSub, { color: colors.textMuted }]}>
                  No recent events from your GitHub account.
                </Text>
              </>
            ) : result.synced === 0 ? (
              <>
                <Text style={[S.resultTitle, { color: colors.textPrimary }]}>Already up to date</Text>
                <Text style={[S.resultSub, { color: colors.textMuted }]}>
                  Found {result.total} event{result.total !== 1 ? "s" : ""} — all already synced.
                </Text>
              </>
            ) : (
              <>
                <Text style={[S.resultTitle, { color: "#1D9E75" }]}>
                  ✓ {result.synced} event{result.synced !== 1 ? "s" : ""} synced
                </Text>
                <Text style={[S.resultSub, { color: "#1D9E75" }]}>Impact pillar updated.</Text>
              </>
            )}
          </View>
        )}

        {/* Scoring reference */}
        <View style={[S.scoreCard, { backgroundColor: BG }]}>
          <Text style={[S.scoreTitle, { color: COLOR }]}>What earns Impact XP</Text>
          {[
            ["Push (per commit)", "2 pts, max 10"],
            ["Merged PR",         "10 pts"],
            ["Opened PR",         "7 pts"],
            ["Closed issue",      "5 pts"],
            ["New repository",    "8 pts"],
            ["Published release", "10 pts"],
          ].map(([label, pts]) => (
            <View key={label} style={S.scoreRow}>
              <Text style={[S.scoreLabel, { color: COLOR }]}>{label}</Text>
              <Text style={[S.scorePts,   { color: COLOR }]}>{pts}</Text>
            </View>
          ))}
        </View>

        {/* Credentials */}
        <Text style={[S.sectionLabel, { color: colors.textMuted }]}>CREDENTIALS</Text>
        <View style={[S.credCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>

          {/* Username */}
          <View style={S.fieldWrap}>
            <Text style={[S.fieldLabel, { color: colors.textMuted }]}>GITHUB USERNAME</Text>
            <TextInput style={inp} placeholder="your-github-username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none" autoCorrect={false}
              value={username} onChangeText={setUsername} />
          </View>

          <View style={[S.credDivider, { backgroundColor: colors.border }]} />

          {/* Token */}
          <View style={S.fieldWrap}>
            <View style={S.fieldLabelRow}>
              <Text style={[S.fieldLabel, { color: colors.textMuted }]}>PERSONAL ACCESS TOKEN</Text>
              <Pressable onPress={() => setShowToken(!showToken)}>
                <Text style={[S.showToggle, { color: COLOR }]}>{showToken ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            <TextInput style={inp} placeholder="ghp_..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none" autoCorrect={false}
              secureTextEntry={!showToken}
              value={token} onChangeText={setToken} />
          </View>
        </View>

        {/* Setup guide */}
        <Pressable
          style={[S.guideCard, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}
          onPress={() => Linking.openURL("https://github.com/settings/tokens/new?scopes=repo,read:user&description=The+Mirror")}
        >
          <View style={S.guideLeft}>
            <Text style={[S.guideTitle, { color: colors.textPrimary }]}>🔑 Generate a token</Text>
            <Text style={[S.guideSub, { color: colors.textMuted }]}>
              GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).{"\n"}
              Required scopes: <Text style={{ fontWeight: "700" }}>repo</Text> and <Text style={{ fontWeight: "700" }}>read:user</Text>
            </Text>
          </View>
          <Text style={[S.guideArrow, { color: COLOR }]}>↗</Text>
        </Pressable>

        {/* Security notice */}
        <View style={[S.secCard, { backgroundColor: colors.bgSubtle }]}>
          <Text style={[S.secText, { color: colors.textMuted }]}>
            🔒 Your token is stored only on this device via AsyncStorage. It is never sent to or stored in our database.
          </Text>
        </View>

        {/* Clear */}
        {(username || token) && (
          <Pressable onPress={handleClear} style={S.clearBtn}>
            <Text style={[S.clearBtnText, { color: "#D85A30" }]}>Clear saved credentials</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40, gap: 14 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  syncBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  syncBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  resultCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 4 },
  resultTitle: { fontSize: 15, fontWeight: "700" },
  resultSub: { fontSize: 13 },

  scoreCard: { borderRadius: 16, padding: 16, gap: 8 },
  scoreTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between" },
  scoreLabel: { fontSize: 13 },
  scorePts: { fontSize: 13, fontWeight: "700" },

  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },

  credCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  fieldWrap: { padding: 14, gap: 8 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  showToggle: { fontSize: 12, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  credDivider: { height: 1 },

  guideCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderRadius: 16, padding: 14 },
  guideLeft: { flex: 1, gap: 6 },
  guideTitle: { fontSize: 14, fontWeight: "700" },
  guideSub: { fontSize: 12, lineHeight: 18 },
  guideArrow: { fontSize: 18, fontWeight: "700", paddingTop: 2 },

  secCard: { borderRadius: 12, padding: 12 },
  secText: { fontSize: 12, lineHeight: 18 },

  clearBtn: { alignItems: "center", paddingVertical: 10 },
  clearBtnText: { fontSize: 13, fontWeight: "600" },
});
