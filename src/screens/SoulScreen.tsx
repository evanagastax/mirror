import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  StyleSheet, FlatList, Modal, Switch, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import {
  fetchSurahList, fetchSurahID, fetchSurahEN, fetchTafsir,
  fetchPrayerTimes, fetchDailyAyah, getDailyDua,
  Surah, Ayah,
} from "../services/quranApi";
import { DUA_CATEGORIES, DuaCategory, Dua } from "../services/duaData";

type Tab = "daily" | "dua" | "quran";
type Lang = "id" | "en";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌙", Sunrise: "🌅", Dhuhr: "☀️",
  Asr: "🌤", Maghrib: "🌇", Isha: "🌃",
};

export default function SoulScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Soul</Text>
        <Pressable onPress={() => router.push("/log/new")} style={styles.logBtn}>
          <Text style={styles.logBtnText}>+ Log</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(["daily", "dua", "quran"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "daily" ? "Daily" : t === "dua" ? "Doa" : "Al-Qur'an"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "daily" && <DailyTab />}
      {tab === "dua" && <DuaTab />}
      {tab === "quran" && <QuranTab />}
    </View>
  );
}

// ─── Daily Tab ────────────────────────────────────────────────
function DailyTab() {
  const [lang, setLang] = useState<Lang>("id");
  const [ayah, setAyah] = useState<any>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dua = getDailyDua();

  const load = useCallback(async () => {
    try {
      const [ayahData, times] = await Promise.all([
        fetchDailyAyah(),
        fetchPrayerTimes(-7.9666, 112.6326),
      ]);
      setAyah(ayahData);
      setPrayerTimes(times);
    } catch (e) {
      console.warn("Daily content load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#1D9E75" /></View>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.langRow}>
        <Text style={styles.langLabel}>Indonesia</Text>
        <Switch
          value={lang === "en"}
          onValueChange={(v) => setLang(v ? "en" : "id")}
          trackColor={{ false: "#1D9E75", true: "#378ADD" }}
          thumbColor="#fff"
        />
        <Text style={styles.langLabel}>English</Text>
      </View>

      {prayerTimes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕌 Waktu Sholat</Text>
          <View style={styles.prayerGrid}>
            {Object.entries(prayerTimes).map(([name, time]) => (
              <View key={name} style={styles.prayerItem}>
                <Text style={styles.prayerIcon}>{PRAYER_ICONS[name]}</Text>
                <Text style={styles.prayerName}>{name}</Text>
                <Text style={styles.prayerTime}>{time as string}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {ayah && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📖 Ayah Hari Ini</Text>
          <Text style={styles.surahRef}>{ayah.surahName} : {ayah.ayahNumber}</Text>
          <Text style={styles.arabicText}>{ayah.arabic}</Text>
          <Text style={styles.translationText}>
            {lang === "id" ? ayah.translation_id : ayah.translation_en}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤲 Doa Hari Ini</Text>
        <Text style={styles.duaSource}>{dua.source}</Text>
        <Text style={styles.arabicText}>{dua.arabic}</Text>
        <Text style={styles.latinText}>{dua.transliteration}</Text>
        <Text style={styles.translationText}>
          {lang === "id" ? dua.translation_id : dua.translation_en}
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Dua Tab ──────────────────────────────────────────────────
function DuaTab() {
  const [lang, setLang] = useState<Lang>("id");
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);

  if (selectedDua) {
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Pressable onPress={() => setSelectedDua(null)} style={{ marginBottom: 16 }}>
          <Text style={styles.back}>← {selectedCategory?.title_id}</Text>
        </Pressable>

        <View style={styles.langRow}>
          <Text style={styles.langLabel}>Indonesia</Text>
          <Switch
            value={lang === "en"}
            onValueChange={(v) => setLang(v ? "en" : "id")}
            trackColor={{ false: "#1D9E75", true: "#378ADD" }}
            thumbColor="#fff"
          />
          <Text style={styles.langLabel}>English</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.duaSource}>{selectedDua.source}</Text>
          <Text style={styles.arabicText}>{selectedDua.arabic}</Text>
          <Text style={styles.latinText}>{selectedDua.transliteration}</Text>
          <View style={styles.divider} />
          <Text style={styles.translationText}>
            {lang === "id" ? selectedDua.translation_id : selectedDua.translation_en}
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (selectedCategory) {
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Pressable onPress={() => setSelectedCategory(null)} style={{ marginBottom: 16 }}>
          <Text style={styles.back}>← Semua Doa</Text>
        </Pressable>

        <Text style={styles.categoryHeader}>
          {selectedCategory.icon} {selectedCategory.title_id}
        </Text>

        {selectedCategory.duas.map((dua, i) => (
          <Pressable
            key={dua.id}
            style={styles.duaRow}
            onPress={() => setSelectedDua(dua)}
          >
            <View style={styles.duaRowNumber}>
              <Text style={styles.duaRowNumberText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.duaRowArabic} numberOfLines={1}>
                {dua.arabic}
              </Text>
              <Text style={styles.duaRowTranslation} numberOfLines={1}>
                {dua.translation_id}
              </Text>
            </View>
            <Text style={styles.duaRowArrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionLabel}>Pilih Kategori Doa</Text>
      {DUA_CATEGORIES.map((cat) => (
        <Pressable
          key={cat.id}
          style={styles.categoryRow}
          onPress={() => setSelectedCategory(cat)}
        >
          <Text style={styles.categoryIcon}>{cat.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryTitle}>{cat.title_id}</Text>
            <Text style={styles.categorySubtitle}>{cat.title_en}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{cat.duas.length}</Text>
          </View>
          <Text style={styles.duaRowArrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Quran Tab ────────────────────────────────────────────────
function QuranTab() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  useEffect(() => {
    fetchSurahList()
      .then(setSurahs)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#1D9E75" /></View>;
  }

  return (
    <>
      <FlatList
        data={surahs}
        keyExtractor={(item) => String(item.nomor)}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#f5f5f5" }} />}
        renderItem={({ item }) => (
          <Pressable style={styles.surahRow} onPress={() => setSelectedSurah(item.nomor)}>
            <View style={styles.surahNumber}>
              <Text style={styles.surahNumberText}>{item.nomor}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={styles.surahLatin}>{item.namaLatin}</Text>
              <Text style={styles.surahMeta}>
                {item.arti} · {item.jumlahAyat} ayat · {item.tempatTurun}
              </Text>
            </View>
            <Text style={styles.surahArabic}>{item.nama}</Text>
          </Pressable>
        )}
      />
      {selectedSurah && (
        <SurahReaderModal surahNumber={selectedSurah} onClose={() => setSelectedSurah(null)} />
      )}
    </>
  );
}

// ─── Surah Reader Modal ───────────────────────────────────────
function SurahReaderModal({ surahNumber, onClose }: { surahNumber: number; onClose: () => void }) {
  const [lang, setLang] = useState<Lang>("id");
  const [showTafsir, setShowTafsir] = useState(false);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedAyah, setExpandedAyah] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [surahID, enMap, tafsirMap] = await Promise.all([
          fetchSurahID(surahNumber),
          fetchSurahEN(surahNumber),
          fetchTafsir(surahNumber),
        ]);
        setSurahName(surahID.namaLatin);
        setAyahs(surahID.ayat.map((a) => ({
          ...a,
          teksEnglish: enMap[a.nomorAyat] ?? "",
          tafsir: tafsirMap[a.nomorAyat] ?? "",
        })));
      } catch (e) {
        console.warn("Surah load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [surahNumber]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.readerContainer}>
        <View style={styles.readerHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.back}>← Tutup</Text>
          </Pressable>
          <Text style={styles.readerTitle}>{surahName}</Text>
          <View style={styles.readerControls}>
            <Pressable onPress={() => setLang(lang === "id" ? "en" : "id")} style={styles.langToggle}>
              <Text style={styles.langToggleText}>{lang.toUpperCase()}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowTafsir(!showTafsir)}
              style={[styles.tafsirToggle, showTafsir && styles.tafsirToggleActive]}
            >
              <Text style={[styles.tafsirToggleText, showTafsir && { color: "#fff" }]}>Tafsir</Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator color="#1D9E75" /></View>
        ) : (
          <ScrollView contentContainerStyle={styles.readerContent}>
            {surahNumber !== 9 && (
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
            )}
            {ayahs.map((ayah) => (
              <Pressable
                key={ayah.nomorAyat}
                style={styles.ayahBlock}
                onPress={() => setExpandedAyah(expandedAyah === ayah.nomorAyat ? null : ayah.nomorAyat)}
              >
                <View style={styles.ayahNumberBadge}>
                  <Text style={styles.ayahNumberText}>{ayah.nomorAyat}</Text>
                </View>
                <Text style={styles.ayahArabic}>{ayah.teksArab}</Text>
                <Text style={styles.ayahLatin}>{ayah.teksLatin}</Text>
                <Text style={styles.ayahTranslation}>
                  {lang === "id" ? ayah.teksIndonesia : ayah.teksEnglish}
                </Text>
                {showTafsir && expandedAyah === ayah.nomorAyat && ayah.tafsir && (
                  <View style={styles.tafsirBlock}>
                    <Text style={styles.tafsirLabel}>Tafsir</Text>
                    <Text style={styles.tafsirText}>{ayah.tafsir}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 0 },
  back: { fontSize: 15, color: "#aaa" },
  title: { fontSize: 18, fontWeight: "600", color: "#111" },
  logBtn: { backgroundColor: "#F0FBF7", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logBtnText: { fontSize: 13, color: "#1D9E75", fontWeight: "600" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f0f0f0", marginTop: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#1D9E75" },
  tabText: { fontSize: 13, color: "#aaa" },
  tabTextActive: { color: "#1D9E75", fontWeight: "600" },
  tabContent: { padding: 16, paddingBottom: 40 },
  langRow: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 16 },
  langLabel: { fontSize: 13, color: "#888" },
  card: { borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111", marginBottom: 12 },
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  prayerItem: { width: "30%", alignItems: "center", backgroundColor: "#F0FBF7", borderRadius: 10, padding: 10 },
  prayerIcon: { fontSize: 20, marginBottom: 4 },
  prayerName: { fontSize: 11, color: "#1D9E75", fontWeight: "600" },
  prayerTime: { fontSize: 13, color: "#111", fontWeight: "500", marginTop: 2 },
  surahRef: { fontSize: 12, color: "#1D9E75", fontWeight: "600", marginBottom: 10 },
  arabicText: { fontSize: 22, color: "#111", textAlign: "right", lineHeight: 40, marginBottom: 10 },
  latinText: { fontSize: 13, color: "#888", fontStyle: "italic", marginBottom: 8, lineHeight: 20 },
  translationText: { fontSize: 14, color: "#444", lineHeight: 22 },
  duaSource: { fontSize: 12, color: "#BA7517", fontWeight: "600", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 12 },
  sectionLabel: { fontSize: 12, color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  categoryIcon: { fontSize: 24 },
  categoryTitle: { fontSize: 15, fontWeight: "500", color: "#111" },
  categorySubtitle: { fontSize: 12, color: "#aaa", marginTop: 2 },
  categoryBadge: { backgroundColor: "#F0FBF7", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  categoryBadgeText: { fontSize: 12, color: "#1D9E75", fontWeight: "600" },
  categoryHeader: { fontSize: 18, fontWeight: "600", color: "#111", marginBottom: 16 },
  duaRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  duaRowNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F0FBF7", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  duaRowNumberText: { fontSize: 12, fontWeight: "600", color: "#1D9E75" },
  duaRowArabic: { fontSize: 16, color: "#111", textAlign: "right" },
  duaRowTranslation: { fontSize: 12, color: "#aaa", marginTop: 2 },
  duaRowArrow: { fontSize: 20, color: "#ccc" },
  surahRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  surahNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0FBF7", alignItems: "center", justifyContent: "center" },
  surahNumberText: { fontSize: 13, fontWeight: "600", color: "#1D9E75" },
  surahInfo: { flex: 1 },
  surahLatin: { fontSize: 15, fontWeight: "500", color: "#111" },
  surahMeta: { fontSize: 12, color: "#aaa", marginTop: 2 },
  surahArabic: { fontSize: 18, color: "#111" },
  readerContainer: { flex: 1, backgroundColor: "#fff" },
  readerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  readerTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  readerControls: { flexDirection: "row", gap: 8 },
  langToggle: { backgroundColor: "#F0FBF7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  langToggleText: { fontSize: 12, fontWeight: "600", color: "#1D9E75" },
  tafsirToggle: { borderWidth: 1, borderColor: "#1D9E75", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  tafsirToggleActive: { backgroundColor: "#1D9E75" },
  tafsirToggleText: { fontSize: 12, fontWeight: "600", color: "#1D9E75" },
  readerContent: { padding: 20, paddingBottom: 60 },
  bismillah: { fontSize: 24, textAlign: "center", color: "#1D9E75", marginBottom: 24, lineHeight: 40 },
  ayahBlock: { marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  ayahNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F0FBF7", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  ayahNumberText: { fontSize: 11, fontWeight: "600", color: "#1D9E75" },
  ayahArabic: { fontSize: 22, textAlign: "right", lineHeight: 44, color: "#111", marginBottom: 8 },
  ayahLatin: { fontSize: 13, color: "#aaa", fontStyle: "italic", marginBottom: 8, lineHeight: 20 },
  ayahTranslation: { fontSize: 14, color: "#444", lineHeight: 22 },
  tafsirBlock: { marginTop: 12, backgroundColor: "#FAFFF8", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: "#1D9E75" },
  tafsirLabel: { fontSize: 11, fontWeight: "600", color: "#1D9E75", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  tafsirText: { fontSize: 13, color: "#555", lineHeight: 20 },
});
