import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { fetchDailyAyah, fetchPrayerTimes } from "../../services/quranApi";
import { loadPrayerLocation } from "../../utils/prayerLocation";
import {
  loadNotifSettings, schedulePrayerNotifications,
} from "../../services/notificationService";
import { captureError } from "../../services/sentry";
import { useLogs } from "../../hooks/useLogs";
import { buildPillarTrend } from "../../services/pillarTrend";
import { PillarTrendChart } from "../PillarTrendChart";
import { SalahTracker } from "./SalahTracker";
import { LangToggle, SectionCard } from "./SoulShared";
import { SoulSkeleton } from "../skeletons";
import { OfflineBanner } from "../OfflineBanner";
import { getDailyDua } from "../../services/quranApi";
import { PILLAR_COLORS } from "../../theme/pillars";
import type { Colors } from "../../types";

const SOUL_COLOR = PILLAR_COLORS.soul.primary;
const SOUL_BG    = PILLAR_COLORS.soul.bg;

type Lang = "id" | "en";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌙", Sunrise: "🌅", Dhuhr: "☀️",
  Asr: "🌤", Maghrib: "🌇", Isha: "🌃",
};

export function DailyTab({ colors, userId }: { colors: Colors; userId: string }) {
  const [lang, setLang] = useState<Lang>("id");
  const [ayah, setAyah] = useState<any>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const dua = getDailyDua();
  const { data: logs } = useLogs(userId);
  const soulTrend = useMemo(() => buildPillarTrend(logs ?? [], "soul", 6), [logs]);

  const load = useCallback(async () => {
    try {
      const loc = await loadPrayerLocation();
      const [ayahResult, timesResult] = await Promise.all([
        fetchDailyAyah(),
        fetchPrayerTimes(loc.latitude, loc.longitude),
      ]);
      setAyah(ayahResult.data);
      setPrayerTimes(timesResult.data);
      setFromCache(ayahResult.fromCache || timesResult.fromCache);
      if (timesResult.data) {
        loadNotifSettings().then((s) => {
          if (s.prayerEnabled) {
            schedulePrayerNotifications(timesResult.data).catch((e) => captureError(e, { context: "schedulePrayerNotifications" }));
          }
        });
      }
    } catch (e) { captureError(e, { context: "Daily load error" }); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <SoulSkeleton />;
  }

  return (
    <ScrollView
      contentContainerStyle={S.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={SOUL_COLOR} />}
    >
      {fromCache && <OfflineBanner />}
      <SalahTracker userId={userId} colors={colors} prayerTimes={prayerTimes} />
      <LangToggle lang={lang} setLang={setLang} colors={colors} />

      {/* Prayer times */}
      {prayerTimes && (
        <SectionCard title="🕌 Waktu Sholat" colors={colors}>
          <View style={S.prayerGrid}>
            {Object.entries(prayerTimes).map(([name, time]) => (
              <View key={name} style={[S.prayerItem, { backgroundColor: SOUL_BG }]}>
                <Text style={S.prayerEmoji}>{PRAYER_ICONS[name] ?? "🕐"}</Text>
                <Text style={S.prayerName}>{name}</Text>
                <Text style={[S.prayerTime, { color: colors.textPrimary }]}>{time as string}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {/* Daily Ayah */}
      {ayah && (
        <SectionCard title="📖 Ayah Hari Ini" badge={`${ayah.surahName} : ${ayah.ayahNumber}`} colors={colors}>
          <Text style={[S.arabicText, { color: colors.textPrimary }]}>{ayah.arabic}</Text>
          <View style={[S.divider, { backgroundColor: colors.border }]} />
          <Text style={[S.translationText, { color: colors.textSecondary }]}>
            {lang === "id" ? ayah.translation_id : ayah.translation_en}
          </Text>
        </SectionCard>
      )}

      {/* Daily Dua */}
      <SectionCard title="🤲 Doa Hari Ini" badge={dua.source} badgeColor="#BA7517" colors={colors}>
        <Text style={[S.arabicText, { color: colors.textPrimary }]}>{dua.arabic}</Text>
        <Text style={[S.latinText, { color: colors.textMuted }]}>{dua.transliteration}</Text>
        <View style={[S.divider, { backgroundColor: colors.border }]} />
        <Text style={[S.translationText, { color: colors.textSecondary }]}>
          {lang === "id" ? dua.translation_id : dua.translation_en}
        </Text>
      </SectionCard>

      {/* Soul Trend */}
      {soulTrend.some((b) => b.total > 0) && (
        <PillarTrendChart
          data={soulTrend}
          color={SOUL_COLOR}
          title="Soul Trend"
          unit="min"
          colors={colors}
        />
      )}
    </ScrollView>
  );
}

const S = StyleSheet.create({
  tabContent: { padding: 16, paddingBottom: 40, gap: 14 },
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  prayerItem: { width: "30%", alignItems: "center", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 },
  prayerEmoji: { fontSize: 22, marginBottom: 4 },
  prayerName: { fontSize: 10, color: SOUL_COLOR, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  prayerTime: { fontSize: 13, fontWeight: "600", marginTop: 3 },
  arabicText: { fontSize: 24, textAlign: "right", lineHeight: 44, paddingHorizontal: 14, paddingBottom: 8 },
  latinText: { fontSize: 13, fontStyle: "italic", lineHeight: 20, color: "#888", paddingHorizontal: 14, paddingBottom: 8 },
  translationText: { fontSize: 14, lineHeight: 22, paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 1, marginHorizontal: 14, marginBottom: 10 },
});
