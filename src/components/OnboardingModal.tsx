import React, { useState } from "react";
import {
  View, Text, Modal, Pressable, TextInput,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PILLAR_META } from "../theme/pillars";
import { useThemeStore } from "../store/themeStore";

const PILLARS = PILLAR_META.map((p) => ({
  ...p,
  sub: p.hint,
}));

type PillarKey = typeof PILLARS[number]["key"];

type Props = {
  visible: boolean;
  onDone: (_username: string, _focusPillar: PillarKey) => Promise<void>;
};

export function OnboardingModal({ visible, onDone }: Props) {
  const { colors } = useThemeStore();
  const [step,        setStep]        = useState<1 | 2>(1);
  const [username,    setUsername]    = useState("");
  const [focus,       setFocus]       = useState<PillarKey | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [usernameErr, setUsernameErr] = useState("");

  function handleNextStep() {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 2) { setUsernameErr("At least 2 characters."); return; }
    if (trimmed.length > 30) { setUsernameErr("Max 30 characters."); return; }
    if (!/^[a-z0-9_]+$/.test(trimmed)) { setUsernameErr("Letters, numbers and _ only."); return; }
    setUsernameErr("");
    setStep(2);
  }

  async function handleFinish() {
    if (!focus) return;
    setSaving(true);
    await onDone(username.trim().toLowerCase(), focus);
    setSaving(false);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={S.overlay}>
        <SafeAreaView style={S.safeArea} edges={["bottom"]}>
          <View style={S.sheet}>
            {/* Step dots */}
            <View style={S.dots}>
              <View style={[S.dot, step >= 1 && S.dotActive]} />
              <View style={[S.dot, step >= 2 && S.dotActive]} />
            </View>

            {step === 1 ? (
              <>
                <Text style={S.emoji}>👋</Text>
                <Text style={[S.title, { color: colors.textPrimary }]}>Welcome to The Mirror</Text>
                <Text style={[S.sub, { color: colors.textMuted }]}>
                  Track your Soul, Vessel, Impact and Stewardship — all in one place.
                  First, what should we call you?
                </Text>

                <View style={S.inputWrap}>
                  <Text style={S.inputLabel}>USERNAME</Text>
                  <TextInput
                    style={[S.input, usernameErr ? S.inputError : null]}
                    placeholder="e.g. made_agastya"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={username}
                    onChangeText={(t) => { setUsername(t); setUsernameErr(""); }}
                    returnKeyType="next"
                    onSubmitEditing={handleNextStep}
                  />
                  {usernameErr ? (
                    <Text style={S.errorText}>{usernameErr}</Text>
                  ) : null}
                </View>

                <Pressable
                  style={[S.cta, !username.trim() && S.ctaDisabled]}
                  onPress={handleNextStep}
                  disabled={!username.trim()}
                >
                  <Text style={S.ctaText}>Continue →</Text>
                </Pressable>

                <Text style={S.skip} onPress={() => setStep(2)}>Skip for now</Text>
              </>
            ) : (
              <>
                <Text style={S.emoji}>🎯</Text>
                <Text style={[S.title, { color: colors.textPrimary }]}>Pick your focus pillar</Text>
                <Text style={[S.sub, { color: colors.textMuted }]}>
                  Which area do you most want to grow right now?
                  You can log everything, but this sets your default.
                </Text>

                <View style={S.pillarGrid}>
                  {PILLARS.map((p) => {
                    const selected = focus === p.key;
                    return (
                      <Pressable
                        key={p.key}
                        style={[
                          S.pillarBtn,
                          { borderColor: selected ? p.color : "#e5e5e5" },
                          selected && { backgroundColor: p.bg },
                        ]}
                        onPress={() => setFocus(p.key)}
                      >
                        <Text style={[S.pillarIcon, { color: p.color }]}>{p.icon}</Text>
                        <Text style={[S.pillarLabel, { color: selected ? p.color : colors.textPrimary }]}>
                          {p.label}
                        </Text>
                        <Text style={[S.pillarSub, { color: selected ? p.color : colors.textMuted }]}>
                          {p.sub}
                        </Text>
                        {selected && (
                          <View style={[S.pillarCheck, { backgroundColor: p.color }]}>
                            <Text style={S.pillarCheckText}>✓</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  style={[S.cta, (!focus || saving) && S.ctaDisabled]}
                  onPress={handleFinish}
                  disabled={!focus || saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={S.ctaText}>Let's go ✦</Text>
                  }
                </Pressable>

                <Text style={S.skip} onPress={() => focus && handleFinish()}>
                  {focus ? "Skip and start" : "← Back"}
                </Text>
                {!focus && (
                  <Text style={S.skip} onPress={() => setStep(1)}>← Back</Text>
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  safeArea: { backgroundColor: "transparent" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 36,
    gap: 12,
  },

  dots: { flexDirection: "row", gap: 6, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ddd" },
  dotActive: { backgroundColor: "#1D9E75", width: 18 },

  emoji: { fontSize: 36, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 21 },

  inputWrap: { gap: 6 },
  inputLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "#999", textTransform: "uppercase" },
  input: {
    borderWidth: 1.5, borderColor: "#e5e5e5", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 16, color: "#1a1a1a",
  },
  inputError: { borderColor: "#D85A30" },
  errorText: { fontSize: 12, color: "#D85A30" },

  pillarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillarBtn: {
    width: "47.5%", borderWidth: 1.5, borderRadius: 16,
    padding: 14, gap: 4, position: "relative",
  },
  pillarIcon: { fontSize: 20 },
  pillarLabel: { fontSize: 14, fontWeight: "700" },
  pillarSub: { fontSize: 11, lineHeight: 16 },
  pillarCheck: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  pillarCheckText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  cta: {
    backgroundColor: "#1D9E75", borderRadius: 14,
    paddingVertical: 15, alignItems: "center", marginTop: 4,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  skip: { textAlign: "center", fontSize: 13, color: "#999", paddingVertical: 4 },
});
