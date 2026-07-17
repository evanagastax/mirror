import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { PILLAR_COLORS } from "../../theme/pillars";
import type { Colors } from "../../types";

const SOUL_COLOR = PILLAR_COLORS.soul.primary;

type Lang = "id" | "en";

export function LangToggle({ lang, setLang, colors }: { lang: Lang; setLang: (l: Lang) => void; colors: Colors }) {
  return (
    <View style={[ST.langRow, { backgroundColor: colors.bgSubtle, borderRadius: 10 }]}>
      <Pressable
        style={[ST.langBtn, lang === "id" && ST.langBtnActive]}
        onPress={() => setLang("id")}
      >
        <Text style={[ST.langBtnText, lang === "id" && ST.langBtnTextActive]}>🇮🇩 Indonesia</Text>
      </Pressable>
      <Pressable
        style={[ST.langBtn, lang === "en" && ST.langBtnActive]}
        onPress={() => setLang("en")}
      >
        <Text style={[ST.langBtnText, lang === "en" && ST.langBtnTextActive]}>🇬🇧 English</Text>
      </Pressable>
    </View>
  );
}

export function SectionCard({
  title, badge, badgeColor = SOUL_COLOR, children, colors,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  colors: Colors;
}) {
  return (
    <View style={[ST.sectionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={ST.sectionCardTop}>
        <Text style={[ST.sectionCardTitle, { color: colors.textPrimary }]}>{title}</Text>
        {badge ? (
          <View style={[ST.sectionCardBadge, { backgroundColor: badgeColor + "18" }]}>
            <Text style={[ST.sectionCardBadgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const ST = StyleSheet.create({
  langRow: { flexDirection: "row", padding: 4, gap: 4 },
  langBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  langBtnActive: { backgroundColor: SOUL_COLOR },
  langBtnText: { fontSize: 12, fontWeight: "600", color: "#888" },
  langBtnTextActive: { color: "#fff" },

  sectionCard: { borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  sectionCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, paddingBottom: 10 },
  sectionCardTitle: { fontSize: 14, fontWeight: "700" },
  sectionCardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  sectionCardBadgeText: { fontSize: 11, fontWeight: "600" },
});
