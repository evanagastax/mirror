import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../../src/api/supabase";
import { useThemeStore } from "../../src/store/themeStore";

type Tab = "signin" | "signup" | "forgot";

export default function AuthScreen() {
  const { isDark, colors, hydrate } = useThemeStore();
  const [tab,      setTab]      = useState<Tab>("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);

  useEffect(() => { hydrate(); }, []);

  function reset() { setEmail(""); setPassword(""); setUsername(""); setSent(false); }
  function goTab(t: Tab) { setTab(t); reset(); }

  async function handleSignIn() {
    if (!email || !password) { Alert.alert("Fill in email and password."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error.message);
  }

  async function handleSignUp() {
    if (!email || !password) { Alert.alert("Fill in email and password."); return; }
    if (password.length < 8) { Alert.alert("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) { setLoading(false); Alert.alert("Sign up failed", error.message); return; }
    if (username.trim() && data.user) {
      const { error: usernameError } = await supabase
        .from("profiles")
        .update({ username: username.toLowerCase().trim() })
        .eq("id", data.user.id);
      if (usernameError) {
        setLoading(false);
        // Most likely cause: username already taken (unique constraint)
        const taken = usernameError.message.toLowerCase().includes("unique") ||
                      usernameError.message.toLowerCase().includes("duplicate") ||
                      usernameError.code === "23505";
        Alert.alert(
          taken ? "Username taken" : "Couldn't set username",
          taken
            ? `"${username.trim()}" is already in use. You can change it later in your profile.`
            : usernameError.message
        );
        // Account was created successfully — don't block the user, just warn
      }
    }
    setLoading(false);
    if (!data.session) Alert.alert("Check your email", "We sent a confirmation link to activate your account.");
  }

  async function handleForgot() {
    if (!email) { Alert.alert("Enter your email first."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) { Alert.alert("Failed", error.message); return; }
    setSent(true);
  }

  const inp = [S.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput }];

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Logo ── */}
          <View style={S.logoArea}>
            <View style={[S.logoRing, { borderColor: colors.border }]}>
              <Text style={[S.logoSymbol, { color: colors.textPrimary }]}>◎</Text>
            </View>
            <Text style={[S.appName, { color: colors.textPrimary }]}>The Mirror</Text>
            <Text style={[S.tagline, { color: colors.textMuted }]}>Know thyself.</Text>
          </View>

          {/* ── Tab row ── */}
          {tab !== "forgot" && (
            <View style={[S.tabRow, { borderBottomColor: colors.border }]}>
              {(["signin", "signup"] as Tab[]).map((t) => (
                <Pressable key={t} onPress={() => goTab(t)}
                  style={[S.tab, tab === t && { borderBottomColor: colors.textPrimary }]}>
                  <Text style={[S.tabText, { color: tab === t ? colors.textPrimary : colors.textMuted },
                    tab === t && { fontWeight: "700" }]}>
                    {t === "signin" ? "Sign in" : "Create account"}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Forgot password ── */}
          {tab === "forgot" && (
            <View style={S.forgotHeader}>
              <Pressable onPress={() => goTab("signin")} hitSlop={12}>
                <Text style={[S.forgotBack, { color: colors.textMuted }]}>←</Text>
              </Pressable>
              <Text style={[S.forgotTitle, { color: colors.textPrimary }]}>Reset password</Text>
            </View>
          )}

          {/* ── Fields ── */}
          <View style={S.fields}>
            <FieldWrap label="Email" colors={colors}>
              <TextInput style={inp} placeholder="you@email.com" placeholderTextColor={colors.textMuted}
                autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </FieldWrap>

            {tab !== "forgot" && (
              <FieldWrap label="Password" colors={colors}>
                <TextInput style={inp}
                  placeholder={tab === "signup" ? "At least 8 characters" : "••••••••"}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry value={password} onChangeText={setPassword} />
              </FieldWrap>
            )}

            {tab === "signup" && (
              <FieldWrap label="Username (optional)" colors={colors}>
                <TextInput style={inp} placeholder="made_agastya" placeholderTextColor={colors.textMuted}
                  autoCapitalize="none" value={username} onChangeText={setUsername} />
              </FieldWrap>
            )}
          </View>

          {/* ── Forgot sent state ── */}
          {tab === "forgot" && sent && (
            <View style={[S.sentCard, { backgroundColor: "#F0FBF7", borderColor: "#1D9E75" }]}>
              <Text style={[S.sentTitle, { color: "#1D9E75" }]}>✓ Check your inbox</Text>
              <Text style={[S.sentSub, { color: "#1D9E75" }]}>
                We sent a password reset link to {email}.
              </Text>
            </View>
          )}

          {/* ── CTA ── */}
          {!sent && (
            <Pressable
              onPress={tab === "signin" ? handleSignIn : tab === "signup" ? handleSignUp : handleForgot}
              disabled={loading}
              style={[S.cta, { backgroundColor: colors.textPrimary }, loading && { opacity: 0.5 }]}
            >
              {loading
                ? <ActivityIndicator color={colors.bg} />
                : <Text style={[S.ctaText, { color: colors.bg }]}>
                    {tab === "signin" ? "Sign in" : tab === "signup" ? "Create account" : "Send reset link"}
                  </Text>
              }
            </Pressable>
          )}

          {/* ── Footer links ── */}
          {tab === "signin" && (
            <Pressable onPress={() => goTab("forgot")} style={S.footerLink}>
              <Text style={[S.footerLinkText, { color: colors.textMuted }]}>Forgot password?</Text>
            </Pressable>
          )}

          {/* ── Feature pills ── */}
          {tab === "signup" && (
            <View style={S.pills}>
              {["🧘 Soul tracking", "💪 Vessel roadmap", "◈ Impact log", "◎ Stewardship"].map((p) => (
                <View key={p} style={[S.pill, { backgroundColor: colors.bgSubtle }]}>
                  <Text style={[S.pillText, { color: colors.textMuted }]}>{p}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[S.versionText, { color: colors.textDisabled }]}>The Mirror v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldWrap({ label, children, colors }: {
  label: string; children: React.ReactNode;
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
}) {
  return (
    <View style={S.fieldWrap}>
      <Text style={[S.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 28, gap: 0 },

  logoArea: { alignItems: "center", marginBottom: 36 },
  logoRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  logoSymbol: { fontSize: 26 },
  appName: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { fontSize: 13, marginTop: 4, letterSpacing: 0.5 },

  tabRow: { flexDirection: "row", borderBottomWidth: 1, marginBottom: 28 },
  tab: { flex: 1, paddingBottom: 12, alignItems: "center", borderBottomWidth: 2.5, borderBottomColor: "transparent", marginBottom: -1 },
  tabText: { fontSize: 14 },

  forgotHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
  forgotBack: { fontSize: 22, fontWeight: "300" },
  forgotTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },

  fields: { gap: 16, marginBottom: 24 },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },

  sentCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 16, gap: 4 },
  sentTitle: { fontSize: 15, fontWeight: "700" },
  sentSub: { fontSize: 13, lineHeight: 20 },

  cta: { borderRadius: 14, paddingVertical: 15, alignItems: "center", marginBottom: 12 },
  ctaText: { fontSize: 15, fontWeight: "700" },

  footerLink: { alignItems: "center", paddingVertical: 8 },
  footerLinkText: { fontSize: 13 },

  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24, marginBottom: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  pillText: { fontSize: 12 },

  versionText: { textAlign: "center", fontSize: 11, marginTop: 24 },
});
