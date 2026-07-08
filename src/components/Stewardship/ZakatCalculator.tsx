import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { calcZakat, ZakatInput } from "../../services/stewardshipStats";

const GOLD = "#BA7517";
const GOLD_BG = "#FEF9EE";
const GREEN = "#1D9E75";
const GREEN_BG = "#F0FBF7";

type C = { textPrimary: string; textMuted: string; textSecondary: string; border: string; bgCard: string; bgInput: string; bgSubtle: string };

function formatRp(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function ZakatCalculator({ colors }: { colors: C }) {
  const [savings,      setSavings]      = useState("");
  const [investments,  setInvestments]  = useState("");
  const [other,        setOther]        = useState("");
  const [liabilities,  setLiabilities]  = useState("");
  const [goldPrice,    setGoldPrice]    = useState("1500000");
  const [showCalc,     setShowCalc]     = useState(false);

  const result = useMemo(() => {
    const input: ZakatInput = {
      savings:          parseFloat(savings.replace(/\D/g, ""))      || 0,
      investments:      parseFloat(investments.replace(/\D/g, ""))  || 0,
      other:            parseFloat(other.replace(/\D/g, ""))        || 0,
      liabilities:      parseFloat(liabilities.replace(/\D/g, ""))  || 0,
      goldPricePerGram: parseFloat(goldPrice.replace(/\D/g, ""))    || 1500000,
    };
    return calcZakat(input);
  }, [savings, investments, other, liabilities, goldPrice]);

  const inp = [S.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput }];

  return (
    <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      {/* Header row */}
      <Pressable style={S.headerRow} onPress={() => setShowCalc(!showCalc)}>
        <View style={[S.iconWrap, { backgroundColor: GOLD_BG }]}>
          <Text style={S.icon}>🌙</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[S.title, { color: colors.textPrimary }]}>Zakat Calculator</Text>
          <Text style={[S.sub, { color: colors.textMuted }]}>Check if you meet nisab threshold</Text>
        </View>
        <Text style={[S.chevron, { color: colors.textMuted }]}>{showCalc ? "▲" : "▼"}</Text>
      </Pressable>

      {showCalc && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[S.divider, { backgroundColor: colors.border }]} />
          <View style={S.fields}>
            <Field label="Savings / Cash (Rp)"         value={savings}     onChange={setSavings}     colors={colors} />
            <Field label="Investments / Stocks (Rp)"   value={investments} onChange={setInvestments} colors={colors} />
            <Field label="Other Zakatble Assets (Rp)"  value={other}       onChange={setOther}       colors={colors} />
            <Field label="Liabilities / Debts (Rp)"    value={liabilities} onChange={setLiabilities} colors={colors} />

            {/* Gold price row */}
            <View style={S.goldRow}>
              <Text style={[S.fieldLabel, { color: colors.textMuted }]}>Gold price / gram (Rp)</Text>
              <TextInput
                style={[inp, S.goldInput]}
                value={goldPrice}
                onChangeText={setGoldPrice}
                keyboardType="number-pad"
                placeholder="1500000"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Result */}
          <View style={[S.result, { backgroundColor: result.meetsNisab ? GREEN_BG : GOLD_BG,
            borderColor: result.meetsNisab ? GREEN : GOLD }]}>
            <View style={S.resultRow}>
              <Text style={[S.resultLabel, { color: result.meetsNisab ? GREEN : GOLD }]}>Net Assets</Text>
              <Text style={[S.resultValue, { color: result.meetsNisab ? GREEN : GOLD }]}>
                {formatRp(result.netAssets)}
              </Text>
            </View>
            <View style={S.resultRow}>
              <Text style={[S.resultLabel, { color: result.meetsNisab ? GREEN : GOLD }]}>Nisab (85g gold)</Text>
              <Text style={[S.resultValue, { color: result.meetsNisab ? GREEN : GOLD }]}>
                {formatRp(result.nisabGold)}
              </Text>
            </View>
            <View style={[S.divider, { backgroundColor: result.meetsNisab ? GREEN + "30" : GOLD + "30", marginVertical: 10 }]} />
            {result.meetsNisab ? (
              <>
                <Text style={[S.nisabMet, { color: GREEN }]}>✓ Nisab threshold met</Text>
                <View style={S.zakatRow}>
                  <Text style={[S.zakatLabel, { color: GREEN }]}>Zakat Due (2.5%)</Text>
                  <Text style={[S.zakatAmount, { color: GREEN }]}>{formatRp(result.zakatDue)}</Text>
                </View>
              </>
            ) : (
              <Text style={[S.nisabNotMet, { color: GOLD }]}>
                ✗ Below nisab — no zakat required yet
              </Text>
            )}
          </View>

          <Text style={[S.disclaimer, { color: colors.textMuted }]}>
            Calculation is approximate. Consult a qualified scholar for your specific situation.
          </Text>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function Field({ label, value, onChange, colors }: {
  label: string; value: string; onChange: (v: string) => void; colors: C;
}) {
  return (
    <View style={S.fieldWrap}>
      <Text style={[S.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[S.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgInput }]}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const S = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, overflow: "hidden", marginBottom: 2 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  title: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 1 },
  chevron: { fontSize: 12 },
  divider: { height: 1 },
  fields: { padding: 16, gap: 12 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontWeight: "600" },
  goldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  goldInput: { flex: 1, textAlign: "right" },
  result: { margin: 16, marginTop: 0, borderWidth: 1.5, borderRadius: 14, padding: 14, gap: 6 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { fontSize: 12, fontWeight: "600" },
  resultValue: { fontSize: 13, fontWeight: "700" },
  nisabMet: { fontSize: 13, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  nisabNotMet: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  zakatRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  zakatLabel: { fontSize: 13, fontWeight: "600" },
  zakatAmount: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  disclaimer: { fontSize: 10, textAlign: "center", paddingHorizontal: 16, paddingBottom: 14, lineHeight: 15 },
});
