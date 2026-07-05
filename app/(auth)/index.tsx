import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/api/supabase";

type Tab = "signin" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  function resetFields() {
    setEmail("");
    setPassword("");
    setUsername("");
  }

  async function handleSignIn() {
    if (!email || !password) return Alert.alert("Enter your email and password.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return Alert.alert("Couldn't sign in.", error.message);
  }

  async function handleSignUp() {
    if (!email || !password) return Alert.alert("Enter your email and password.");
    if (password.length < 8) return Alert.alert("Password must be at least 8 characters.");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return Alert.alert("Couldn't create account.", error.message);
    }
    if (username && data.user) {
      await supabase
        .from("profiles")
        .update({ username: username.toLowerCase().trim() })
        .eq("id", data.user.id);
    }
    setLoading(false);
    if (!data.session) {
      Alert.alert("Check your email", "We sent a confirmation link.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoSymbol}>◎</Text>
          </View>
          <Text style={styles.appName}>The Mirror</Text>
          <Text style={styles.tagline}>Know thyself.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["signin", "signup"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); resetFields(); }}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "signin" ? "Sign in" : "Create account"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <Field label="Email">
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </Field>

          <Field label="Password">
            <TextInput
              style={styles.input}
              placeholder={tab === "signup" ? "At least 8 characters" : "••••••••"}
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </Field>

          {tab === "signup" && (
            <Field label="Username (optional)">
              <TextInput
                style={styles.input}
                placeholder="made_agastya"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </Field>
          )}
        </View>

        {/* CTA */}
        <Pressable
          onPress={tab === "signin" ? handleSignIn : handleSignUp}
          disabled={loading}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>
                {tab === "signin" ? "Sign in" : "Create account"}
              </Text>
          }
        </Pressable>

        {tab === "signin" && (
          <Pressable style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoSymbol: {
    fontSize: 24,
    color: "#111",
  },
  appName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingBottom: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: "#111",
  },
  tabText: {
    fontSize: 14,
    color: "#aaa",
  },
  tabTextActive: {
    color: "#111",
    fontWeight: "500",
  },
  fields: {
    gap: 16,
    marginBottom: 8,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  forgotWrap: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotText: {
    fontSize: 13,
    color: "#aaa",
  },
});
