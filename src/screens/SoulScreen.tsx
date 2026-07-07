import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  StyleSheet, FlatList, Modal, Switch, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  fetchSurahList, fetchSurahID, fetchSurahEN, fetchTafsir,
  fetchPrayerTimes, fetchDailyAyah, getDailyDua,
  Surah, Ayah,
} from "../services/quranApi";
import {
  DUA_CATEGORIES, DZIKIR_CATEGORIES, ASMAUL_HUSNA,
  DuaCategory, Dua, DzikirCategory, Dzikir, AsmaulHusna,
} from "../services/duaData";
import { OfflineBanner } from "../components/OfflineBanner";

type Tab = "daily" | "dua" | "dzikir" | "asmaul" | "quran";
type Lang = "id" | "en";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌙", Sunrise: "🌅", Dhuhr: "☀️",
  Asr: "🌤", Maghrib: "🌇", Isha: "🌃",
};

const TABS: { key: Tab; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "dua", label: "Doa" },
  { key: "dzikir", label: "Dzikir" },
  { key: "asmaul", label: "Asmaul Husna" },
  { key: "quran", label: "Al-Qur'an" },
];

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

      {/* Horizontal scrollable tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "daily" && <DailyTab />}
      {tab === "dua" && <DuaTab />}
      {tab === "dzikir" && <DzikirTab />}
      {tab === "asmaul" && <AsmaulHusnaTab />}
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
  const [fromCache, setFromCache] = useState(false);
  const dua = getDailyDua();

  const load = useCallback(async () => {
    try {
      const [ayahResult, timesResult] = await Promise.all([
        fetchDailyAyah(),
        fetchPrayerTimes(-7.9666, 112.6326),
      ]);
      setAyah(ayahResult.data);
      setPrayerTimes(timesResult.data);
      setFromCache(ayahResult.fromCache || timesResult.fromCache);
    } catch (e) {
      console.warn("Daily load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#1D9E75" /></View>;

  return (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {fromCache && <OfflineBanner />}
      <LangToggle lang={lang} setLang={setLang} />

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
        <Pressable onPress={() => setSelectedDua(null)} style={styles.backRow}>
          <Text style={styles.back}>← {selectedCategory?.title_id}</Text>
        </Pressable>
        <LangToggle lang={lang} setLang={setLang} />
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
        <Pressable onPress={() => setSelectedCategory(null)} style={styles.backRow}>
          <Text style={styles.back}>← Semua Doa</Text>
        </Pressable>
        <Text style={styles.categoryHeader}>{selectedCategory.icon} {selectedCategory.title_id}</Text>
        {selectedCategory.duas.map((dua, i) => (
          <Pressable key={dua.id} style={styles.listRow} onPress={() => setSelectedDua(dua)}>
            <View style={styles.numberBadge}><Text style={styles.numberBadgeText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listArabic} numberOfLines={1}>{dua.arabic}</Text>
              <Text style={styles.listSubtitle} numberOfLines={1}>{dua.translation_id}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionLabel}>Pilih Kategori Doa</Text>
      {DUA_CATEGORIES.map((cat) => (
        <Pressable key={cat.id} style={styles.listRow} onPress={() => setSelectedCategory(cat)}>
          <Text style={styles.catIcon}>{cat.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>{cat.title_id}</Text>
            <Text style={styles.listSubtitle}>{cat.title_en}</Text>
          </View>
          <View style={styles.countBadge}><Text style={styles.countBadgeText}>{cat.duas.length}</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Dzikir Tab ───────────────────────────────────────────────
function DzikirTab() {
  const [lang, setLang] = useState<Lang>("id");
  const [selectedCategory, setSelectedCategory] = useState<DzikirCategory | null>(null);
  const [selectedDzikir, setSelectedDzikir] = useState<Dzikir | null>(null);
  const [count, setCount] = useState(0);

  if (selectedDzikir) {
    const done = count >= selectedDzikir.count;
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Pressable onPress={() => { setSelectedDzikir(null); setCount(0); }} style={styles.backRow}>
          <Text style={styles.back}>← {selectedCategory?.title_id}</Text>
        </Pressable>

        <LangToggle lang={lang} setLang={setLang} />

        <View style={styles.card}>
          <Text style={styles.arabicText}>{selectedDzikir.arabic}</Text>
          <Text style={styles.latinText}>{selectedDzikir.transliteration}</Text>
          <View style={styles.divider} />
          <Text style={styles.translationText}>
            {lang === "id" ? selectedDzikir.translation_id : selectedDzikir.translation_en}
          </Text>
        </View>

        {/* Counter */}
        <Pressable
          style={[styles.counterBtn, done && styles.counterBtnDone]}
          onPress={() => setCount((c) => Math.min(c + 1, selectedDzikir.count))}
          disabled={done}
        >
          <Text style={styles.counterNum}>{count}</Text>
          <Text style={styles.counterOf}>/ {selectedDzikir.count}</Text>
        </Pressable>

        {done && (
          <View style={styles.doneCard}>
            <Text style={styles.doneText}>✓ Selesai</Text>
            <Pressable onPress={() => setCount(0)} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Ulangi</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.virtueCard}>
          <Text style={styles.virtueLabel}>Keutamaan</Text>
          <Text style={styles.virtueText}>{selectedDzikir.virtue}</Text>
          <Text style={styles.virtueSource}>{selectedDzikir.source}</Text>
        </View>
      </ScrollView>
    );
  }

  if (selectedCategory) {
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Pressable onPress={() => setSelectedCategory(null)} style={styles.backRow}>
          <Text style={styles.back}>← Semua Dzikir</Text>
        </Pressable>
        <Text style={styles.categoryHeader}>{selectedCategory.icon} {selectedCategory.title_id}</Text>
        {selectedCategory.dzikirList.map((dzikir, i) => (
          <Pressable key={dzikir.id} style={styles.listRow} onPress={() => { setSelectedDzikir(dzikir); setCount(0); }}>
            <View style={styles.numberBadge}><Text style={styles.numberBadgeText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listArabic} numberOfLines={1}>{dzikir.arabic}</Text>
              <Text style={styles.listSubtitle}>{dzikir.count}x · {dzikir.source}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionLabel}>Pilih Kategori Dzikir</Text>
      {DZIKIR_CATEGORIES.map((cat) => (
        <Pressable key={cat.id} style={styles.listRow} onPress={() => setSelectedCategory(cat)}>
          <Text style={styles.catIcon}>{cat.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>{cat.title_id}</Text>
            <Text style={styles.listSubtitle}>{cat.title_en}</Text>
          </View>
          <View style={styles.countBadge}><Text style={styles.countBadgeText}>{cat.dzikirList.length}</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Asmaul Husna Tab ─────────────────────────────────────────
function AsmaulHusnaTab() {
  const [lang, setLang] = useState<Lang>("id");
  const [selected, setSelected] = useState<AsmaulHusna | null>(null);

  if (selected) {
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Pressable onPress={() => setSelected(null)} style={styles.backRow}>
          <Text style={styles.back}>← Asmaul Husna</Text>
        </Pressable>
        <LangToggle lang={lang} setLang={setLang} />
        <View style={styles.card}>
          <View style={styles.asmaulNumberBadge}>
            <Text style={styles.asmaulNumberText}>{selected.number}</Text>
          </View>
          <Text style={[styles.arabicText, { fontSize: 32, marginVertical: 16 }]}>{selected.arabic}</Text>
          <Text style={[styles.latinText, { fontSize: 16, fontStyle: "normal", fontWeight: "600", color: "#1D9E75" }]}>
            {selected.transliteration}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.translationText}>
            {lang === "id" ? selected.meaning_id : selected.meaning_en}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.asmaulHeader}>
        <LangToggle lang={lang} setLang={setLang} />
        <Text style={styles.asmaulTotal}>99 Nama Allah</Text>
      </View>
      <FlatList
        data={ASMAUL_HUSNA}
        keyExtractor={(item) => String(item.number)}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.asmaulCard} onPress={() => setSelected(item)}>
            <Text style={styles.asmaulNum}>{item.number}</Text>
            <Text style={styles.asmaulArabic}>{item.arabic}</Text>
            <Text style={styles.asmaulLatin} numberOfLines={1}>{item.transliteration}</Text>
            <Text style={styles.asmaulMeaning} numberOfLines={2}>
              {lang === "id" ? item.meaning_id : item.meaning_en}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

// ─── Quran Tab ────────────────────────────────────────────────
function QuranTab() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  useEffect(() => {
    fetchSurahList()
      .then((result) => {
        setSurahs(result.data);
        setFromCache(result.fromCache);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#1D9E75" /></View>;

  return (
    <>
      {fromCache && <OfflineBanner />}
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
              <Text style={styles.surahMeta}>{item.arti} · {item.jumlahAyat} ayat · {item.tempatTurun}</Text>
            </View>
            <Text style={styles.surahArabic}>{item.nama}</Text>
          </Pressable>
        )}
      />
      {selectedSurah && <SurahReaderModal surahNumber={selectedSurah} onClose={() => setSelectedSurah(null)} />}
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
  const [fromCache, setFromCache] = useState(false);
  const [expandedAyah, setExpandedAyah] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [surahIDResult, enResult, tafsirResult] = await Promise.all([
          fetchSurahID(surahNumber),
          fetchSurahEN(surahNumber),
          fetchTafsir(surahNumber),
        ]);
        const surahID = surahIDResult.data;
        const enMap = enResult.data;
        const tafsirMap = tafsirResult.data;
        const offline = surahIDResult.fromCache || enResult.fromCache || tafsirResult.fromCache;
        setSurahName(surahID.namaLatin);
        setFromCache(offline);
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
          <Pressable onPress={onClose}><Text style={styles.back}>← Tutup</Text></Pressable>
          <Text style={styles.readerTitle}>{surahName}</Text>
          <View style={styles.readerControls}>
            <Pressable onPress={() => setLang(lang === "id" ? "en" : "id")} style={styles.langToggle}>
              <Text style={styles.langToggleText}>{lang.toUpperCase()}</Text>
            </Pressable>
            <Pressable onPress={() => setShowTafsir(!showTafsir)} style={[styles.tafsirToggle, showTafsir && styles.tafsirToggleActive]}>
              <Text style={[styles.tafsirToggleText, showTafsir && { color: "#fff" }]}>Tafsir</Text>
            </Pressable>
          </View>
        </View>
        {loading ? (
          <View style={styles.center}><ActivityIndicator color="#1D9E75" /></View>
        ) : (
          <ScrollView contentContainerStyle={styles.readerContent}>
            {fromCache && <OfflineBanner />}
            {surahNumber !== 9 && <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>}
            {ayahs.map((ayah) => (
              <Pressable
                key={ayah.nomorAyat}
                style={styles.ayahBlock}
                onPress={() => setExpandedAyah(expandedAyah === ayah.nomorAyat ? null : ayah.nomorAyat)}
              >
                <View style={styles.ayahNumberBadge}><Text style={styles.ayahNumberText}>{ayah.nomorAyat}</Text></View>
                <Text style={styles.ayahArabic}>{ayah.teksArab}</Text>
                <Text style={styles.ayahLatin}>{ayah.teksLatin}</Text>
                <Text style={styles.ayahTranslation}>{lang === "id" ? ayah.teksIndonesia : ayah.teksEnglish}</Text>
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

// ─── Shared Components ────────────────────────────────────────
function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <View style={styles.langRow}>
      <Text style={styles.langLabel}>Indonesia</Text>
      <Switch value={lang === "en"} onValueChange={(v) => setLang(v ? "en" : "id")} trackColor={{ false: "#1D9E75", true: "#378ADD" }} thumbColor="#fff" />
      <Text style={styles.langLabel}>English</Text>
    </View>
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
  tabScroll: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0", marginTop: 16, flexGrow: 0 },
  tabRow: { paddingHorizontal: 16, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
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
  backRow: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  categoryHeader: { fontSize: 18, fontWeight: "600", color: "#111", marginBottom: 16 },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  numberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F0FBF7", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  numberBadgeText: { fontSize: 12, fontWeight: "600", color: "#1D9E75" },
  listTitle: { fontSize: 15, fontWeight: "500", color: "#111" },
  listArabic: { fontSize: 16, color: "#111", textAlign: "right" },
  listSubtitle: { fontSize: 12, color: "#aaa", marginTop: 2 },
  catIcon: { fontSize: 24 },
  countBadge: { backgroundColor: "#F0FBF7", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  countBadgeText: { fontSize: 12, color: "#1D9E75", fontWeight: "600" },
  arrow: { fontSize: 20, color: "#ccc" },
  counterBtn: { alignItems: "center", justifyContent: "center", width: 140, height: 140, borderRadius: 70, backgroundColor: "#F0FBF7", alignSelf: "center", marginVertical: 24, borderWidth: 3, borderColor: "#1D9E75" },
  counterBtnDone: { backgroundColor: "#1D9E75" },
  counterNum: { fontSize: 48, fontWeight: "700", color: "#1D9E75" },
  counterOf: { fontSize: 14, color: "#1D9E75" },
  doneCard: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 },
  doneText: { fontSize: 16, fontWeight: "600", color: "#1D9E75" },
  resetBtn: { borderWidth: 1, borderColor: "#1D9E75", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  resetBtnText: { fontSize: 13, color: "#1D9E75" },
  virtueCard: { backgroundColor: "#FAFFF8", borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: "#1D9E75" },
  virtueLabel: { fontSize: 11, fontWeight: "600", color: "#1D9E75", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  virtueText: { fontSize: 13, color: "#444", lineHeight: 20, marginBottom: 8 },
  virtueSource: { fontSize: 11, color: "#aaa" },
  asmaulHeader: { paddingHorizontal: 16, paddingTop: 12 },
  asmaulTotal: { fontSize: 12, color: "#aaa", textAlign: "center", marginBottom: 8 },
  asmaulCard: { flex: 1, backgroundColor: "#F0FBF7", borderRadius: 12, padding: 12, alignItems: "center" },
  asmaulNum: { fontSize: 11, fontWeight: "600", color: "#1D9E75", marginBottom: 4 },
  asmaulArabic: { fontSize: 20, color: "#111", textAlign: "center", marginBottom: 4 },
  asmaulLatin: { fontSize: 12, fontWeight: "600", color: "#1D9E75", marginBottom: 4, textAlign: "center" },
  asmaulMeaning: { fontSize: 11, color: "#888", textAlign: "center", lineHeight: 16 },
  asmaulNumberBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F0FBF7", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 8 },
  asmaulNumberText: { fontSize: 18, fontWeight: "700", color: "#1D9E75" },
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
