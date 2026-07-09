import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  StyleSheet, FlatList, Modal, TextInput, RefreshControl, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
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
import {
  loadPlan, savePlan, deletePlan, buildPlan, updateMilestone,
  planProgress, HafalanPlan, HafalanMilestone, MilestoneStatus,
} from "../services/hafalanStore";
import { SalahTracker } from "../components/Soul/SalahTracker";
import {
  loadNotifSettings, schedulePrayerNotifications,
} from "../services/notificationService";

type Tab = "daily" | "dua" | "dzikir" | "asmaul" | "quran" | "hafalan";
type Lang = "id" | "en";
type C = ReturnType<typeof useThemeStore.getState>["colors"];

const SOUL_COLOR = "#1D9E75";
const SOUL_BG    = "#F0FBF7";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌙", Sunrise: "🌅", Dhuhr: "☀️",
  Asr: "🌤", Maghrib: "🌇", Isha: "🌃",
};

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "daily",   label: "Daily",      icon: "🌿" },
  { key: "dua",     label: "Doa",        icon: "🤲" },
  { key: "dzikir",  label: "Dzikir",     icon: "📿" },
  { key: "asmaul",  label: "Asmaul",     icon: "✨" },
  { key: "quran",   label: "Al-Qur'an",  icon: "📖" },
  { key: "hafalan", label: "Hafalan",    icon: "🧠" },
];

// ─── Root screen ─────────────────────────────────────────────────────────────

export default function SoulScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeStore();
  const userId = useAuthStore((s) => s.userId) ?? "";
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
        </Pressable>
        <View style={S.headerCenter}>
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Soul</Text>
          <Text style={[S.headerSub, { color: colors.textMuted }]}>Spirit & Devotion</Text>
        </View>
        <Pressable
          onPress={() => router.push("/log/new")}
          style={[S.logChip, { backgroundColor: SOUL_BG }]}
        >
          <Text style={[S.logChipText, { color: SOUL_COLOR }]}>+ Log</Text>
        </Pressable>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[S.tabScroll, { borderBottomColor: colors.border }]}
        contentContainerStyle={S.tabRow}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={[S.tab, active && S.tabActive]} onPress={() => setTab(t.key)}>
              <Text style={S.tabIcon}>{t.icon}</Text>
              <Text style={[S.tabText, { color: active ? SOUL_COLOR : colors.textMuted }, active && S.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {tab === "daily"   && <DailyTab  colors={colors} userId={userId} />}
      {tab === "dua"     && <DuaTab    colors={colors} />}
      {tab === "dzikir"  && <DzikirTab colors={colors} />}
      {tab === "asmaul"  && <AsmaulHusnaTab colors={colors} />}
      {tab === "quran"   && <QuranTab  colors={colors} />}
      {tab === "hafalan" && <HafalanTab colors={colors} userId={userId} />}
    </SafeAreaView>
  );
}

// ─── Daily Tab ───────────────────────────────────────────────────────────────

function DailyTab({ colors, userId }: { colors: C; userId: string }) {
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
      // Reschedule prayer notifications with fresh times (silent — no-op if disabled)
      if (timesResult.data) {
        loadNotifSettings().then((s) => {
          if (s.prayerEnabled) {
            schedulePrayerNotifications(timesResult.data).catch(console.warn);
          }
        });
      }
    } catch (e) { console.warn("Daily load error:", e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={S.center}>
        <ActivityIndicator color={SOUL_COLOR} size="large" />
        <Text style={[S.loadingText, { color: colors.textMuted }]}>Loading daily content…</Text>
      </View>
    );
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
    </ScrollView>
  );
}

// ─── Dua Tab ─────────────────────────────────────────────────────────────────

function DuaTab({ colors }: { colors: C }) {
  const [lang, setLang] = useState<Lang>("id");
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);

  if (selectedDua) {
    return (
      <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => setSelectedDua(null)} style={S.breadcrumb}>
          <Text style={[S.breadcrumbText, { color: SOUL_COLOR }]}>← {selectedCategory?.title_id}</Text>
        </Pressable>
        <LangToggle lang={lang} setLang={setLang} colors={colors} />
        <View style={[S.arabicCard, { backgroundColor: SOUL_BG }]}>
          <Text style={[S.arabicCardSource, { color: "#BA7517" }]}>{selectedDua.source}</Text>
          <Text style={[S.arabicCardMain, { color: colors.textPrimary }]}>{selectedDua.arabic}</Text>
          <Text style={[S.arabicCardLatin, { color: colors.textMuted }]}>{selectedDua.transliteration}</Text>
        </View>
        <View style={[S.translationCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[S.translationCardText, { color: colors.textSecondary }]}>
            {lang === "id" ? selectedDua.translation_id : selectedDua.translation_en}
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (selectedCategory) {
    return (
      <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => setSelectedCategory(null)} style={S.breadcrumb}>
          <Text style={[S.breadcrumbText, { color: SOUL_COLOR }]}>← Semua Doa</Text>
        </Pressable>
        <Text style={[S.pageTitle, { color: colors.textPrimary }]}>
          {selectedCategory.icon} {selectedCategory.title_id}
        </Text>
        <View style={[S.listCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          {selectedCategory.duas.map((dua, i) => (
            <Pressable
              key={dua.id}
              style={[S.listItem, i < selectedCategory.duas.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
              onPress={() => setSelectedDua(dua)}
              android_ripple={{ color: SOUL_BG }}
            >
              <View style={S.listNum}><Text style={S.listNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[S.listArabic, { color: colors.textPrimary }]} numberOfLines={1}>{dua.arabic}</Text>
                <Text style={[S.listSub, { color: colors.textMuted }]} numberOfLines={1}>{dua.translation_id}</Text>
              </View>
              <Text style={[S.listArrow, { color: colors.textDisabled }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[S.sectionLabel, { color: colors.textMuted }]}>KATEGORI DOA</Text>
      <View style={[S.listCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        {DUA_CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat.id}
            style={[S.listItem, i < DUA_CATEGORIES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={() => setSelectedCategory(cat)}
            android_ripple={{ color: SOUL_BG }}
          >
            <Text style={S.catEmoji}>{cat.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[S.listTitle, { color: colors.textPrimary }]}>{cat.title_id}</Text>
              <Text style={[S.listSub, { color: colors.textMuted }]}>{cat.title_en}</Text>
            </View>
            <View style={S.countBadge}><Text style={S.countBadgeText}>{cat.duas.length}</Text></View>
            <Text style={[S.listArrow, { color: colors.textDisabled }]}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Dzikir Tab ──────────────────────────────────────────────────────────────

function DzikirTab({ colors }: { colors: C }) {
  const [lang, setLang] = useState<Lang>("id");
  const [selectedCategory, setSelectedCategory] = useState<DzikirCategory | null>(null);
  const [selectedDzikir, setSelectedDzikir] = useState<Dzikir | null>(null);
  const [count, setCount] = useState(0);

  if (selectedDzikir) {
    const done = count >= selectedDzikir.count;
    const pct = Math.min(count / selectedDzikir.count, 1);
    return (
      <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => { setSelectedDzikir(null); setCount(0); }} style={S.breadcrumb}>
          <Text style={[S.breadcrumbText, { color: SOUL_COLOR }]}>← {selectedCategory?.title_id}</Text>
        </Pressable>
        <LangToggle lang={lang} setLang={setLang} colors={colors} />

        <View style={[S.arabicCard, { backgroundColor: SOUL_BG }]}>
          <Text style={[S.arabicCardMain, { color: "#1a1a1a" }]}>{selectedDzikir.arabic}</Text>
          <Text style={[S.arabicCardLatin, { color: "#666" }]}>{selectedDzikir.transliteration}</Text>
          <View style={[S.divider, { backgroundColor: "#c8ede2" }]} />
          <Text style={[S.translationText, { color: colors.textSecondary }]}>
            {lang === "id" ? selectedDzikir.translation_id : selectedDzikir.translation_en}
          </Text>
        </View>

        {/* Counter */}
        <Pressable
          style={[S.counter, done ? S.counterDone : { borderColor: SOUL_COLOR }]}
          onPress={() => !done && setCount((c) => c + 1)}
          disabled={done}
          android_ripple={{ color: "#c8ede2", borderless: true, radius: 72 }}
        >
          <Text style={[S.counterNum, { color: done ? "#fff" : SOUL_COLOR }]}>{count}</Text>
          <Text style={[S.counterOf, { color: done ? "rgba(255,255,255,0.8)" : SOUL_COLOR }]}>
            / {selectedDzikir.count}
          </Text>
        </Pressable>

        {/* Progress bar */}
        <View style={[S.counterProgress, { backgroundColor: colors.border }]}>
          <View style={[S.counterProgressFill, { width: `${pct * 100}%` as any }]} />
        </View>

        {done && (
          <View style={S.doneRow}>
            <Text style={S.doneText}>✓ Selesai!</Text>
            <Pressable onPress={() => setCount(0)} style={[S.resetBtn, { borderColor: SOUL_COLOR }]}>
              <Text style={[S.resetBtnText, { color: SOUL_COLOR }]}>Ulangi</Text>
            </Pressable>
          </View>
        )}

        <View style={[S.virtueCard, { borderLeftColor: SOUL_COLOR, backgroundColor: colors.bgSubtle }]}>
          <Text style={S.virtueLabel}>Keutamaan</Text>
          <Text style={[S.virtueText, { color: colors.textSecondary }]}>{selectedDzikir.virtue}</Text>
          <Text style={[S.virtueSource, { color: colors.textMuted }]}>{selectedDzikir.source}</Text>
        </View>
      </ScrollView>
    );
  }

  if (selectedCategory) {
    return (
      <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => setSelectedCategory(null)} style={S.breadcrumb}>
          <Text style={[S.breadcrumbText, { color: SOUL_COLOR }]}>← Semua Dzikir</Text>
        </Pressable>
        <Text style={[S.pageTitle, { color: colors.textPrimary }]}>
          {selectedCategory.icon} {selectedCategory.title_id}
        </Text>
        <View style={[S.listCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          {selectedCategory.dzikirList.map((dzikir, i) => (
            <Pressable
              key={dzikir.id}
              style={[S.listItem, i < selectedCategory.dzikirList.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
              onPress={() => { setSelectedDzikir(dzikir); setCount(0); }}
              android_ripple={{ color: SOUL_BG }}
            >
              <View style={S.listNum}><Text style={S.listNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[S.listArabic, { color: colors.textPrimary }]} numberOfLines={1}>{dzikir.arabic}</Text>
                <Text style={[S.listSub, { color: colors.textMuted }]}>{dzikir.count}× · {dzikir.source}</Text>
              </View>
              <View style={S.countBadge}><Text style={S.countBadgeText}>{dzikir.count}×</Text></View>
              <Text style={[S.listArrow, { color: colors.textDisabled }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[S.sectionLabel, { color: colors.textMuted }]}>KATEGORI DZIKIR</Text>
      <View style={[S.listCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        {DZIKIR_CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat.id}
            style={[S.listItem, i < DZIKIR_CATEGORIES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={() => setSelectedCategory(cat)}
            android_ripple={{ color: SOUL_BG }}
          >
            <Text style={S.catEmoji}>{cat.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[S.listTitle, { color: colors.textPrimary }]}>{cat.title_id}</Text>
              <Text style={[S.listSub, { color: colors.textMuted }]}>{cat.title_en}</Text>
            </View>
            <View style={S.countBadge}><Text style={S.countBadgeText}>{cat.dzikirList.length}</Text></View>
            <Text style={[S.listArrow, { color: colors.textDisabled }]}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Asmaul Husna Tab ────────────────────────────────────────────────────────

function AsmaulHusnaTab({ colors }: { colors: C }) {
  const [lang, setLang] = useState<Lang>("id");
  const [selected, setSelected] = useState<AsmaulHusna | null>(null);

  if (selected) {
    return (
      <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => setSelected(null)} style={S.breadcrumb}>
          <Text style={[S.breadcrumbText, { color: SOUL_COLOR }]}>← 99 Asmaul Husna</Text>
        </Pressable>
        <LangToggle lang={lang} setLang={setLang} colors={colors} />
        <View style={[S.asmaulDetailCard, { backgroundColor: SOUL_BG }]}>
          <View style={S.asmaulDetailNum}>
            <Text style={S.asmaulDetailNumText}>{selected.number}</Text>
          </View>
          <Text style={[S.asmaulDetailArabic, { color: colors.textPrimary }]}>{selected.arabic}</Text>
          <Text style={S.asmaulDetailLatin}>{selected.transliteration}</Text>
        </View>
        <View style={[S.translationCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[S.translationCardText, { color: colors.textSecondary }]}>
            {lang === "id" ? selected.meaning_id : selected.meaning_en}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[S.asmaulTop, { borderBottomColor: colors.border }]}>
        <LangToggle lang={lang} setLang={setLang} colors={colors} />
        <Text style={[S.asmaulTotal, { color: colors.textMuted }]}>99 Nama Indah Allah SWT</Text>
      </View>
      <FlatList
        data={ASMAUL_HUSNA}
        keyExtractor={(item) => String(item.number)}
        numColumns={2}
        contentContainerStyle={S.asmaulGrid}
        columnWrapperStyle={S.asmaulRow}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[S.asmaulCard, { backgroundColor: SOUL_BG }]}
            onPress={() => setSelected(item)}
            android_ripple={{ color: "#c8ede2" }}
          >
            <Text style={S.asmaulNum}>{item.number}</Text>
            <Text style={[S.asmaulArabic, { color: colors.textPrimary }]}>{item.arabic}</Text>
            <Text style={S.asmaulLatin} numberOfLines={1}>{item.transliteration}</Text>
            <Text style={[S.asmaulMeaning, { color: colors.textSecondary }]} numberOfLines={2}>
              {lang === "id" ? item.meaning_id : item.meaning_en}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

// ─── Quran Tab ───────────────────────────────────────────────────────────────

function QuranTab({ colors }: { colors: C }) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSurahList()
      .then((r) => { setSurahs(r.data); setFromCache(r.fromCache); })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? surahs.filter((s) =>
        s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
        s.arti.toLowerCase().includes(search.toLowerCase())
      )
    : surahs;

  if (loading) {
    return (
      <View style={S.center}>
        <ActivityIndicator color={SOUL_COLOR} size="large" />
        <Text style={[S.loadingText, { color: colors.textMuted }]}>Memuat surah…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {fromCache && <OfflineBanner />}
      <View style={[S.quranSearch, { borderBottomColor: colors.border }]}>
        <View style={[S.quranSearchBox, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
          <Text style={[S.quranSearchIcon, { color: colors.textMuted }]}>🔍</Text>
          <TextInput
            style={[S.quranSearchInput, { color: colors.textPrimary }]}
            placeholder="Cari surah…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.nomor)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        renderItem={({ item }) => (
          <Pressable
            style={S.surahRow}
            onPress={() => setSelectedSurah(item.nomor)}
            android_ripple={{ color: SOUL_BG }}
          >
            <View style={S.surahNum}>
              <Text style={S.surahNumText}>{item.nomor}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.surahLatin, { color: colors.textPrimary }]}>{item.namaLatin}</Text>
              <Text style={[S.surahMeta, { color: colors.textMuted }]}>
                {item.arti} · {item.jumlahAyat} ayat · {item.tempatTurun}
              </Text>
            </View>
            <Text style={[S.surahArabic, { color: colors.textPrimary }]}>{item.nama}</Text>
          </Pressable>
        )}
      />
      {selectedSurah !== null && (
        <SurahReaderModal surahNumber={selectedSurah} onClose={() => setSelectedSurah(null)} colors={colors} />
      )}
    </View>
  );
}

// ─── Surah Reader Modal ──────────────────────────────────────────────────────

function SurahReaderModal({ surahNumber, onClose, colors }: { surahNumber: number; onClose: () => void; colors: C }) {
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
        const [idR, enR, tafsirR] = await Promise.all([
          fetchSurahID(surahNumber), fetchSurahEN(surahNumber), fetchTafsir(surahNumber),
        ]);
        setSurahName(idR.data.namaLatin);
        setFromCache(idR.fromCache || enR.fromCache || tafsirR.fromCache);
        setAyahs(idR.data.ayat.map((a) => ({
          ...a,
          teksEnglish: enR.data[a.nomorAyat] ?? "",
          tafsir: tafsirR.data[a.nomorAyat] ?? "",
        })));
      } catch (e) { console.warn("Surah load error:", e); }
      finally { setLoading(false); }
    }
    load();
  }, [surahNumber]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[S.readerRoot, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
        <View style={[S.readerHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[S.back, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
          <Text style={[S.readerTitle, { color: colors.textPrimary }]}>{surahName}</Text>
          <View style={S.readerControls}>
            <Pressable onPress={() => setLang(lang === "id" ? "en" : "id")} style={[S.readerChip, { backgroundColor: SOUL_BG }]}>
              <Text style={[S.readerChipText, { color: SOUL_COLOR }]}>{lang.toUpperCase()}</Text>
            </Pressable>
            <Pressable onPress={() => setShowTafsir(!showTafsir)} style={[S.readerChip, showTafsir ? { backgroundColor: SOUL_COLOR } : { borderWidth: 1, borderColor: SOUL_COLOR }]}>
              <Text style={[S.readerChipText, { color: showTafsir ? "#fff" : SOUL_COLOR }]}>Tafsir</Text>
            </Pressable>
          </View>
        </View>
        {loading ? (
          <View style={S.center}>
            <ActivityIndicator color={SOUL_COLOR} size="large" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={S.readerContent} showsVerticalScrollIndicator={false}>
            {fromCache && <OfflineBanner />}
            {surahNumber !== 9 && (
              <View style={[S.bismillahCard, { backgroundColor: SOUL_BG }]}>
                <Text style={S.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
              </View>
            )}
            {ayahs.map((ayah) => (
              <Pressable
                key={ayah.nomorAyat}
                style={[S.ayahBlock, { borderBottomColor: colors.border }]}
                onPress={() => setExpandedAyah(expandedAyah === ayah.nomorAyat ? null : ayah.nomorAyat)}
              >
                <View style={S.ayahTopRow}>
                  <View style={S.ayahNum}><Text style={S.ayahNumText}>{ayah.nomorAyat}</Text></View>
                </View>
                <Text style={[S.ayahArabic, { color: colors.textPrimary }]}>{ayah.teksArab}</Text>
                <Text style={[S.ayahLatin, { color: colors.textMuted }]}>{ayah.teksLatin}</Text>
                <Text style={[S.ayahTranslation, { color: colors.textSecondary }]}>
                  {lang === "id" ? ayah.teksIndonesia : ayah.teksEnglish}
                </Text>
                {showTafsir && expandedAyah === ayah.nomorAyat && ayah.tafsir && (
                  <View style={[S.tafsirBlock, { backgroundColor: colors.bgSubtle }]}>
                    <Text style={S.tafsirLabel}>Tafsir</Text>
                    <Text style={[S.tafsirText, { color: colors.textSecondary }]}>{ayah.tafsir}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Hafalan Tab ─────────────────────────────────────────────────────────────

const CHUNK_OPTIONS = [3, 5, 7, 10];

const MILESTONE_META: Record<MilestoneStatus, { label: string; color: string; bg: string; icon: string }> = {
  todo:       { label: "Belum",      color: "#aaa",    bg: "#f5f5f5", icon: "○" },
  memorizing: { label: "Dihafal",    color: "#378ADD", bg: "#F0F7FE", icon: "◑" },
  done:       { label: "Hafal ✓",    color: "#1D9E75", bg: "#F0FBF7", icon: "●" },
};

function HafalanTab({ colors, userId }: { colors: C; userId: string }) {
  const [plan,        setPlan]        = useState<HafalanPlan | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [showPicker,  setShowPicker]  = useState(false);
  // true when picker is opened via "Ganti" (replacing existing plan)
  const [isReplacing, setIsReplacing] = useState(false);
  const [surahs,      setSurahs]      = useState<Surah[]>([]);
  const [surahSearch, setSurahSearch] = useState("");
  const [surahLoading, setSurahLoading] = useState(false);
  const [chunkSize,   setChunkSize]   = useState(5);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [detailOpen,  setDetailOpen]  = useState<HafalanMilestone | null>(null);
  const [ayahs,       setAyahs]       = useState<Ayah[]>([]);
  const [ayahLoading, setAyahLoading] = useState(false);

  // Load persisted plan on mount
  useEffect(() => {
    loadPlan(userId).then((p) => { setPlan(p); setLoading(false); });
  }, [userId]);

  // Load surah list when picker opens
  useEffect(() => {
    if (!showPicker || surahs.length > 0) return;
    setSurahLoading(true);
    fetchSurahList()
      .then((r) => setSurahs(r.data))
      .catch(console.warn)
      .finally(() => setSurahLoading(false));
  }, [showPicker]);

  // Load ayahs when a milestone detail is opened
  useEffect(() => {
    if (!detailOpen || !plan) return;
    setAyahLoading(true);
    fetchSurahID(plan.surahNumber)
      .then((r) => {
        setAyahs(r.data.ayat.filter(
          (a) => a.nomorAyat >= detailOpen.from && a.nomorAyat <= detailOpen.to
        ));
      })
      .catch(console.warn)
      .finally(() => setAyahLoading(false));
  }, [detailOpen?.id]);

  async function handleCreatePlan() {
    if (!selectedSurah) return;
    const newPlan = buildPlan(selectedSurah.nomor, selectedSurah.namaLatin, selectedSurah.jumlahAyat, chunkSize);
    await savePlan(userId, newPlan);
    setPlan(newPlan);
    setShowPicker(false);
    setIsReplacing(false);
    setSelectedSurah(null);
    setSurahSearch("");
  }

  function handleGanti() {
    // Open picker directly so the user picks a new surah first.
    // Old plan is only deleted once they confirm a new one.
    setIsReplacing(true);
    setSelectedSurah(null);
    setSurahSearch("");
    setShowPicker(true);
  }

  async function handleStatusChange(milestoneId: string, status: MilestoneStatus) {
    if (!plan) return;
    const updated = updateMilestone(plan, milestoneId, status);
    await savePlan(userId, updated);
    setPlan(updated);
    if (detailOpen?.id === milestoneId) setDetailOpen(updated.milestones.find((m) => m.id === milestoneId) ?? null);
  }

  async function handleReset() {
    Alert.alert(
      "Reset progres?",
      "Semua sesi akan dikembalikan ke awal. Surah tetap sama.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset", style: "destructive", onPress: async () => {
            // Rebuild the same plan from scratch — keeps surah, resets all milestones
            if (!plan) return;
            const fresh = buildPlan(plan.surahNumber, plan.surahName, plan.totalAyat, plan.chunkSize);
            await savePlan(userId, fresh);
            setPlan(fresh);
          },
        },
      ]
    );
  }

  const filteredSurahs = surahSearch.trim()
    ? surahs.filter((s) =>
        s.namaLatin.toLowerCase().includes(surahSearch.toLowerCase()) ||
        s.arti.toLowerCase().includes(surahSearch.toLowerCase()) ||
        String(s.nomor).includes(surahSearch)
      )
    : surahs;

  if (loading) {
    return (
      <View style={S.center}>
        <ActivityIndicator color={SOUL_COLOR} size="large" />
      </View>
    );
  }

  // ── No plan yet ──
  if (!plan) {
    return (
      <ScrollView contentContainerStyle={[S.tabContent, { alignItems: "center" }]} showsVerticalScrollIndicator={false}>
        <View style={[S.hafalanHero, { backgroundColor: SOUL_BG }]}>
          <Text style={S.hafalanHeroEmoji}>🧠</Text>
          <Text style={[S.hafalanHeroTitle, { color: "#1a1a1a" }]}>Hafalan Al-Qur'an</Text>
          <Text style={[S.hafalanHeroSub, { color: "#666" }]}>
            Pilih surah dan tentukan berapa ayat per sesi. Kami akan membuat timeline hafalan untukmu.
          </Text>
        </View>
        <Pressable
          style={[S.hafalanStartBtn, { backgroundColor: SOUL_COLOR }]}
          onPress={() => setShowPicker(true)}
          android_ripple={{ color: "#1a8060" }}
        >
          <Text style={S.hafalanStartBtnText}>Mulai Hafalan</Text>
        </Pressable>

        {/* Surah Picker Modal */}
        <Modal visible={showPicker} animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <SafeAreaView style={[S.readerRoot, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
            <View style={[S.readerHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={() => setShowPicker(false)} hitSlop={12}>
                <Text style={[S.back, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
              <Text style={[S.readerTitle, { color: colors.textPrimary }]}>Pilih Surah</Text>
            </View>

            {/* Chunk size selector */}
            <View style={[S.chunkRow, { borderBottomColor: colors.border }]}>
              <Text style={[S.chunkLabel, { color: colors.textMuted }]}>Ayat per sesi:</Text>
              {CHUNK_OPTIONS.map((n) => (
                <Pressable key={n} onPress={() => setChunkSize(n)}
                  style={[S.chunkBtn, { borderColor: colors.border },
                    chunkSize === n && { backgroundColor: SOUL_COLOR, borderColor: SOUL_COLOR }]}>
                  <Text style={[S.chunkBtnText, { color: chunkSize === n ? "#fff" : colors.textMuted }]}>
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Search */}
            <View style={[S.quranSearch, { borderBottomColor: colors.border }]}>
              <View style={[S.quranSearchBox, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
                <Text style={[S.quranSearchIcon, { color: colors.textMuted }]}>🔍</Text>
                <TextInput
                  style={[S.quranSearchInput, { color: colors.textPrimary }]}
                  placeholder="Cari surah…"
                  placeholderTextColor={colors.textMuted}
                  value={surahSearch}
                  onChangeText={setSurahSearch}
                />
              </View>
            </View>

            {surahLoading ? (
              <View style={S.center}><ActivityIndicator color={SOUL_COLOR} size="large" /></View>
            ) : (
              <FlatList
                data={filteredSurahs}
                keyExtractor={(item) => String(item.nomor)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
                renderItem={({ item }) => {
                  const sel = selectedSurah?.nomor === item.nomor;
                  return (
                    <Pressable
                      style={[S.surahRow, sel && { backgroundColor: SOUL_BG }]}
                      onPress={() => setSelectedSurah(sel ? null : item)}
                      android_ripple={{ color: SOUL_BG }}
                    >
                      <View style={[S.surahNum, sel && { backgroundColor: SOUL_COLOR }]}>
                        <Text style={[S.surahNumText, sel && { color: "#fff" }]}>{item.nomor}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[S.surahLatin, { color: colors.textPrimary }]}>{item.namaLatin}</Text>
                        <Text style={[S.surahMeta, { color: colors.textMuted }]}>
                          {item.arti} · {item.jumlahAyat} ayat · {Math.ceil(item.jumlahAyat / chunkSize)} sesi
                        </Text>
                      </View>
                      <Text style={[S.surahArabic, { color: sel ? SOUL_COLOR : colors.textPrimary }]}>{item.nama}</Text>
                    </Pressable>
                  );
                }}
              />
            )}

            {selectedSurah && (
              <View style={[S.pickerFooter, { backgroundColor: colors.bgCard, borderTopColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[S.pickerFooterTitle, { color: colors.textPrimary }]}>{selectedSurah.namaLatin}</Text>
                  <Text style={[S.pickerFooterSub, { color: colors.textMuted }]}>
                    {selectedSurah.jumlahAyat} ayat · {Math.ceil(selectedSurah.jumlahAyat / chunkSize)} sesi · {chunkSize} ayat/sesi
                  </Text>
                </View>
                <Pressable style={[S.pickerConfirmBtn, { backgroundColor: SOUL_COLOR }]} onPress={handleCreatePlan}>
                  <Text style={S.pickerConfirmText}>Mulai</Text>
                </Pressable>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </ScrollView>
    );
  }

  // ── Active plan view ──
  const prog         = planProgress(plan);
  const resumeMilestone = plan.milestones.find((m) => m.status === "memorizing")
    ?? plan.milestones.find((m) => m.status === "todo")
    ?? null;
  const isComplete   = prog.done === prog.total;

  return (
    <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
      {/* ── Resume / completion hero ── */}
      {isComplete ? (
        <View style={[S.resumeCard, { backgroundColor: "#0B7A5C" }]}>
          <Text style={S.resumeEmoji}>🎉</Text>
          <Text style={[S.resumeTitle, { color: "#fff" }]}>MasyaAllah! Selesai!</Text>
          <Text style={[S.resumeSub, { color: "rgba(255,255,255,0.75)" }]}>
            Kamu telah menghafal semua {plan.totalAyat} ayat {plan.surahName}.
          </Text>
          <Pressable
            onPress={handleGanti}
            style={[S.resumeBtn, { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.4)" }]}
          >
            <Text style={[S.resumeBtnText, { color: "#fff" }]}>Pilih Surah Baru</Text>
          </Pressable>
        </View>
      ) : resumeMilestone ? (
        <View style={[S.resumeCard, { backgroundColor: SOUL_COLOR }]}>
          <View style={S.resumeTop}>
            <View>
              <Text style={[S.resumeLabel, { color: "rgba(255,255,255,0.7)" }]}>LANJUT HAFALAN</Text>
              <Text style={[S.resumeTitle, { color: "#fff" }]}>{plan.surahName}</Text>
              <Text style={[S.resumeRange, { color: "rgba(255,255,255,0.85)" }]}>
                Ayat {resumeMilestone.from}–{resumeMilestone.to}
              </Text>
            </View>
            <View style={S.resumeProgress}>
              <Text style={[S.resumeProgressNum, { color: "#fff" }]}>{prog.done}</Text>
              <Text style={[S.resumeProgressOf, { color: "rgba(255,255,255,0.65)" }]}>/{prog.total}</Text>
              <Text style={[S.resumeProgressLabel, { color: "rgba(255,255,255,0.65)" }]}>sesi</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={S.resumeTrack}>
            <View style={[S.resumeFill, { width: `${prog.pct * 100}%` as any }]} />
          </View>
          <Text style={[S.resumePct, { color: "rgba(255,255,255,0.7)" }]}>
            {prog.ayatDone}/{plan.totalAyat} ayat hafal · {Math.round(prog.pct * 100)}%
          </Text>
          <Pressable
            onPress={() => setDetailOpen(resumeMilestone)}
            style={S.resumeBtn}
          >
            <Text style={S.resumeBtnText}>▶ Mulai Sesi Ini</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Plan header (compact) */}
      <View style={[S.hafalanHeader, { backgroundColor: SOUL_BG }]}>
        <View style={S.hafalanHeaderTop}>
          <View style={{ flex: 1 }}>
            <Text style={[S.hafalanSurahName, { color: "#1a1a1a" }]}>{plan.surahName}</Text>
            <Text style={[S.hafalanSurahMeta, { color: "#666" }]}>
              {plan.totalAyat} ayat · {plan.milestones.length} sesi · {plan.chunkSize} ayat/sesi
            </Text>
          </View>
          <Pressable onPress={handleGanti} style={S.hafalanResetBtn} hitSlop={10}>
            <Text style={[S.hafalanResetBtnText, { color: "#D85A30" }]}>🔄 Ganti</Text>
          </Pressable>
        </View>
        <View style={S.hafalanStats}>
          <View style={S.hafalanStat}>
            <Text style={[S.hafalanStatNum, { color: "#1D9E75" }]}>{prog.done}</Text>
            <Text style={[S.hafalanStatLabel, { color: "#666" }]}>Hafal</Text>
          </View>
          <View style={S.hafalanStat}>
            <Text style={[S.hafalanStatNum, { color: "#378ADD" }]}>{prog.memorizing}</Text>
            <Text style={[S.hafalanStatLabel, { color: "#666" }]}>Dihafal</Text>
          </View>
          <View style={S.hafalanStat}>
            <Text style={[S.hafalanStatNum, { color: "#aaa" }]}>{prog.total - prog.done - prog.memorizing}</Text>
            <Text style={[S.hafalanStatLabel, { color: "#666" }]}>Belum</Text>
          </View>
          <View style={S.hafalanStat}>
            <Text style={[S.hafalanStatNum, { color: "#1D9E75" }]}>{prog.ayatDone}</Text>
            <Text style={[S.hafalanStatLabel, { color: "#666" }]}>Ayat</Text>
          </View>
        </View>
        <View style={[S.hafalanTrack, { backgroundColor: "#c8ede2" }]}>
          <View style={[S.hafalanFill, { width: `${prog.pct * 100}%` as any }]} />
        </View>
        <Text style={[S.hafalanPct, { color: SOUL_COLOR }]}>
          {Math.round(prog.pct * 100)}% hafal
        </Text>
      </View>

      {/* Reset progress — standalone button outside the card so it's never touch-blocked */}
      <Pressable
        onPress={handleReset}
        hitSlop={12}
        style={[S.hafalanResetProgBtn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
        android_ripple={{ color: colors.bgSubtle }}
      >
        <Text style={[S.hafalanResetProgText, { color: colors.textMuted }]}>↺  Reset progres</Text>
      </Pressable>

      <Text style={[S.sectionLabel, { color: colors.textMuted }]}>TIMELINE SESI</Text>
      <View style={S.timeline}>
        {plan.milestones.map((m, idx) => {
          const meta      = MILESTONE_META[m.status];
          const isLast    = idx === plan.milestones.length - 1;
          const locked    = m.status === "todo";
          return (
            <View key={m.id} style={S.timelineRow}>
              {/* Left: stem + dot */}
              <View style={S.timelineStemCol}>
                <View style={[S.timelineDot, { backgroundColor: meta.color, borderColor: meta.color },
                  locked && { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[S.timelineDotIcon, { color: locked ? colors.textDisabled : "#fff" }]}>
                    {locked ? String(idx + 1) : meta.icon}
                  </Text>
                </View>
                {!isLast && <View style={[S.timelineStem, { backgroundColor: colors.border }]} />}
              </View>

              {/* Right: card */}
              <Pressable
                style={[S.milestoneCard, { backgroundColor: colors.bgCard, borderColor: colors.border },
                  m.status === "memorizing" && { borderColor: "#378ADD", borderWidth: 1.5 },
                  m.status === "done"       && { borderColor: "#1D9E75" },
                  locked && { opacity: 0.55 }]}
                onPress={() => !locked && setDetailOpen(m)}
                disabled={locked}
                android_ripple={{ color: SOUL_BG }}
              >
                <View style={S.milestoneTop}>
                  <Text style={[S.milestoneRange, { color: colors.textPrimary }]}>
                    Ayat {m.from}–{m.to}
                  </Text>
                  <View style={[S.milestoneBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[S.milestoneBadgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={[S.milestoneAyatCount, { color: colors.textMuted }]}>
                  {m.to - m.from + 1} ayat
                  {m.doneAt ? `  ·  ✓ ${new Date(m.doneAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}` : ""}
                </Text>
                {/* Mini status changer */}
                {!locked && (
                  <View style={S.milestoneActions}>
                    {(["memorizing", "done"] as MilestoneStatus[]).map((s) => (
                      <Pressable
                        key={s}
                        onPress={(e) => { e.stopPropagation?.(); handleStatusChange(m.id, s); }}
                        style={[S.milestoneActionBtn,
                          { borderColor: MILESTONE_META[s].color },
                          m.status === s && { backgroundColor: MILESTONE_META[s].color }]}
                      >
                        <Text style={[S.milestoneActionText,
                          { color: m.status === s ? "#fff" : MILESTONE_META[s].color }]}>
                          {MILESTONE_META[s].label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Milestone detail modal — shows ayahs to memorize */}
      <Modal visible={!!detailOpen} animationType="slide" onRequestClose={() => setDetailOpen(null)}>
        <SafeAreaView style={[S.readerRoot, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
          <View style={[S.readerHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setDetailOpen(null)} hitSlop={12}>
              <Text style={[S.back, { color: colors.textMuted }]}>✕</Text>
            </Pressable>
            <Text style={[S.readerTitle, { color: colors.textPrimary }]}>
              {plan.surahName} · Ayat {detailOpen?.from}–{detailOpen?.to}
            </Text>
            {detailOpen && (
              <Pressable
                onPress={() => handleStatusChange(detailOpen.id, detailOpen.status === "done" ? "memorizing" : "done")}
                style={[S.readerChip, detailOpen.status === "done" ? { backgroundColor: "#1D9E75" } : { borderWidth: 1, borderColor: SOUL_COLOR }]}
              >
                <Text style={[S.readerChipText, { color: detailOpen.status === "done" ? "#fff" : SOUL_COLOR }]}>
                  {detailOpen.status === "done" ? "✓ Hafal" : "Tandai Hafal"}
                </Text>
              </Pressable>
            )}
          </View>
          {ayahLoading ? (
            <View style={S.center}><ActivityIndicator color={SOUL_COLOR} size="large" /></View>
          ) : (
            <ScrollView contentContainerStyle={S.readerContent} showsVerticalScrollIndicator={false}>
              {ayahs.map((ayah) => (
                <View key={ayah.nomorAyat} style={[S.ayahBlock, { borderBottomColor: colors.border }]}>
                  <View style={S.ayahTopRow}>
                    <View style={S.ayahNum}><Text style={S.ayahNumText}>{ayah.nomorAyat}</Text></View>
                  </View>
                  <Text style={[S.ayahArabic, { color: colors.textPrimary }]}>{ayah.teksArab}</Text>
                  <Text style={[S.ayahLatin,  { color: colors.textMuted }]}>{ayah.teksLatin}</Text>
                  <Text style={[S.ayahTranslation, { color: colors.textSecondary }]}>{ayah.teksIndonesia}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ── Surah picker modal (for "Ganti") ── */}
      <Modal visible={showPicker} animationType="slide" onRequestClose={() => { setShowPicker(false); setIsReplacing(false); setSurahSearch(""); setSelectedSurah(null); }}>
        <SafeAreaView style={[S.readerRoot, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
          <View style={[S.readerHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => { setShowPicker(false); setIsReplacing(false); setSurahSearch(""); setSelectedSurah(null); }} hitSlop={12}>
              <Text style={[S.back, { color: colors.textMuted }]}>✕</Text>
            </Pressable>
            <Text style={[S.readerTitle, { color: colors.textPrimary }]}>
              {isReplacing ? "Ganti Surah" : "Pilih Surah"}
            </Text>
          </View>

          {/* Chunk size selector */}
          <View style={[S.chunkRow, { borderBottomColor: colors.border }]}>
            <Text style={[S.chunkLabel, { color: colors.textMuted }]}>Ayat per sesi:</Text>
            {CHUNK_OPTIONS.map((n) => (
              <Pressable key={n} onPress={() => setChunkSize(n)}
                style={[S.chunkBtn, { borderColor: colors.border },
                  chunkSize === n && { backgroundColor: SOUL_COLOR, borderColor: SOUL_COLOR }]}>
                <Text style={[S.chunkBtnText, { color: chunkSize === n ? "#fff" : colors.textMuted }]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Search */}
          <View style={[S.quranSearch, { borderBottomColor: colors.border }]}>
            <View style={[S.quranSearchBox, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
              <Text style={[S.quranSearchIcon, { color: colors.textMuted }]}>🔍</Text>
              <TextInput
                style={[S.quranSearchInput, { color: colors.textPrimary }]}
                placeholder="Cari surah…"
                placeholderTextColor={colors.textMuted}
                value={surahSearch}
                onChangeText={setSurahSearch}
              />
            </View>
          </View>

          {surahLoading ? (
            <View style={S.center}><ActivityIndicator color={SOUL_COLOR} size="large" /></View>
          ) : (
            <FlatList
              data={filteredSurahs}
              keyExtractor={(item) => String(item.nomor)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
              renderItem={({ item }) => {
                const sel = selectedSurah?.nomor === item.nomor;
                return (
                  <Pressable
                    style={[S.surahRow, sel && { backgroundColor: SOUL_BG }]}
                    onPress={() => setSelectedSurah(sel ? null : item)}
                    android_ripple={{ color: SOUL_BG }}
                  >
                    <View style={[S.surahNum, sel && { backgroundColor: SOUL_COLOR }]}>
                      <Text style={[S.surahNumText, sel && { color: "#fff" }]}>{item.nomor}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[S.surahLatin, { color: colors.textPrimary }]}>{item.namaLatin}</Text>
                      <Text style={[S.surahMeta, { color: colors.textMuted }]}>
                        {item.arti} · {item.jumlahAyat} ayat · {Math.ceil(item.jumlahAyat / chunkSize)} sesi
                      </Text>
                    </View>
                    <Text style={[S.surahArabic, { color: sel ? SOUL_COLOR : colors.textPrimary }]}>{item.nama}</Text>
                  </Pressable>
                );
              }}
            />
          )}

          {selectedSurah && (
            <View style={[S.pickerFooter, { backgroundColor: colors.bgCard, borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[S.pickerFooterTitle, { color: colors.textPrimary }]}>{selectedSurah.namaLatin}</Text>
                <Text style={[S.pickerFooterSub, { color: colors.textMuted }]}>
                  {selectedSurah.jumlahAyat} ayat · {Math.ceil(selectedSurah.jumlahAyat / chunkSize)} sesi · {chunkSize} ayat/sesi
                </Text>
              </View>
              <Pressable style={[S.pickerConfirmBtn, { backgroundColor: SOUL_COLOR }]} onPress={handleCreatePlan}>
                <Text style={S.pickerConfirmText}>{isReplacing ? "Ganti" : "Mulai"}</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

// ─── Shared components ───────────────────────────────────────────────────────

function LangToggle({ lang, setLang, colors }: { lang: Lang; setLang: (l: Lang) => void; colors: C }) {
  return (
    <View style={[S.langRow, { backgroundColor: colors.bgSubtle, borderRadius: 10 }]}>
      <Pressable
        style={[S.langBtn, lang === "id" && S.langBtnActive]}
        onPress={() => setLang("id")}
      >
        <Text style={[S.langBtnText, lang === "id" && S.langBtnTextActive]}>🇮🇩 Indonesia</Text>
      </Pressable>
      <Pressable
        style={[S.langBtn, lang === "en" && S.langBtnActive]}
        onPress={() => setLang("en")}
      >
        <Text style={[S.langBtnText, lang === "en" && S.langBtnTextActive]}>🇬🇧 English</Text>
      </Pressable>
    </View>
  );
}

function SectionCard({
  title, badge, badgeColor = SOUL_COLOR, children, colors,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  colors: C;
}) {
  return (
    <View style={[S.sectionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={S.sectionCardTop}>
        <Text style={[S.sectionCardTitle, { color: colors.textPrimary }]}>{title}</Text>
        {badge ? (
          <View style={[S.sectionCardBadge, { backgroundColor: badgeColor + "18" }]}>
            <Text style={[S.sectionCardBadgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  logChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  logChipText: { fontSize: 12, fontWeight: "700" },

  // Tab bar
  tabScroll: { borderBottomWidth: 1, flexGrow: 0 },
  tabRow: { paddingHorizontal: 12, gap: 2 },
  tab: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 2.5, borderBottomColor: "transparent", gap: 2 },
  tabActive: { borderBottomColor: SOUL_COLOR },
  tabIcon: { fontSize: 16 },
  tabText: { fontSize: 11, fontWeight: "500" },
  tabTextActive: { fontWeight: "700" },

  // Tab content
  tabContent: { padding: 16, paddingBottom: 40, gap: 14 },

  // Lang toggle
  langRow: { flexDirection: "row", padding: 4, gap: 4 },
  langBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  langBtnActive: { backgroundColor: SOUL_COLOR },
  langBtnText: { fontSize: 12, fontWeight: "600", color: "#888" },
  langBtnTextActive: { color: "#fff" },

  // Section card
  sectionCard: { borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  sectionCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, paddingBottom: 10 },
  sectionCardTitle: { fontSize: 14, fontWeight: "700" },
  sectionCardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  sectionCardBadgeText: { fontSize: 11, fontWeight: "600" },

  // Prayer grid
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  prayerItem: { width: "30%", alignItems: "center", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 },
  prayerEmoji: { fontSize: 22, marginBottom: 4 },
  prayerName: { fontSize: 10, color: SOUL_COLOR, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  prayerTime: { fontSize: 13, fontWeight: "600", marginTop: 3 },

  // Arabic card
  arabicCard: { borderRadius: 16, padding: 18, gap: 8 },
  arabicCardSource: { fontSize: 11, fontWeight: "700" },
  arabicCardMain: { fontSize: 26, textAlign: "right", lineHeight: 46 },
  arabicCardLatin: { fontSize: 13, fontStyle: "italic", lineHeight: 20 },

  // Translation card
  translationCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  translationCardText: { fontSize: 14, lineHeight: 24 },

  // In-card text (for sectionCard children)
  arabicText: { fontSize: 24, textAlign: "right", lineHeight: 44, paddingHorizontal: 14, paddingBottom: 8 },
  latinText: { fontSize: 13, fontStyle: "italic", lineHeight: 20, color: "#888", paddingHorizontal: 14, paddingBottom: 8 },
  translationText: { fontSize: 14, lineHeight: 22, paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 1, marginHorizontal: 14, marginBottom: 10 },

  // Breadcrumb / nav
  breadcrumb: { marginBottom: 12 },
  breadcrumbText: { fontSize: 14, fontWeight: "600" },
  pageTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },

  // List card
  listCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 14 },
  listNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: SOUL_BG, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  listNumText: { fontSize: 11, fontWeight: "700", color: SOUL_COLOR },
  listTitle: { fontSize: 15, fontWeight: "500" },
  listArabic: { fontSize: 16, textAlign: "right", fontWeight: "500" },
  listSub: { fontSize: 12, marginTop: 2 },
  listArrow: { fontSize: 20, paddingLeft: 4 },
  catEmoji: { fontSize: 22 },
  countBadge: { backgroundColor: SOUL_BG, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  countBadgeText: { fontSize: 11, fontWeight: "700", color: SOUL_COLOR },

  // Dzikir counter
  counter: {
    width: 144, height: 144, borderRadius: 72,
    backgroundColor: SOUL_BG, borderWidth: 3,
    alignSelf: "center", alignItems: "center", justifyContent: "center",
    marginVertical: 20,
  },
  counterDone: { backgroundColor: SOUL_COLOR, borderColor: SOUL_COLOR },
  counterNum: { fontSize: 52, fontWeight: "800", lineHeight: 58 },
  counterOf: { fontSize: 14, fontWeight: "600" },
  counterProgress: { height: 6, borderRadius: 99, marginHorizontal: 32, overflow: "hidden", marginBottom: 16 },
  counterProgressFill: { height: 6, borderRadius: 99, backgroundColor: SOUL_COLOR },
  doneRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 },
  doneText: { fontSize: 16, fontWeight: "700", color: SOUL_COLOR },
  resetBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  resetBtnText: { fontSize: 13, fontWeight: "600" },
  virtueCard: { borderRadius: 12, padding: 14, borderLeftWidth: 3 },
  virtueLabel: { fontSize: 10, fontWeight: "700", color: SOUL_COLOR, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  virtueText: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
  virtueSource: { fontSize: 11 },

  // Asmaul Husna
  asmaulTop: { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1 },
  asmaulTotal: { fontSize: 12, textAlign: "center", marginTop: 6, marginBottom: 4 },
  asmaulGrid: { padding: 12, paddingBottom: 32 },
  asmaulRow: { gap: 10, marginBottom: 10 },
  asmaulCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4, overflow: "hidden" },
  asmaulNum: { fontSize: 10, fontWeight: "700", color: SOUL_COLOR },
  asmaulArabic: { fontSize: 22, textAlign: "center" },
  asmaulLatin: { fontSize: 11, fontWeight: "700", color: SOUL_COLOR, textAlign: "center" },
  asmaulMeaning: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  asmaulDetailCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 8, marginBottom: 12 },
  asmaulDetailNum: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  asmaulDetailNumText: { fontSize: 18, fontWeight: "800", color: SOUL_COLOR },
  asmaulDetailArabic: { fontSize: 36, textAlign: "center", lineHeight: 54, marginVertical: 8 },
  asmaulDetailLatin: { fontSize: 16, fontWeight: "700", color: SOUL_COLOR },

  // Quran search
  quranSearch: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  quranSearchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  quranSearchIcon: { fontSize: 14 },
  quranSearchInput: { flex: 1, fontSize: 14, padding: 0 },
  surahRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 12 },
  surahNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: SOUL_BG, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  surahNumText: { fontSize: 12, fontWeight: "700", color: SOUL_COLOR },
  surahLatin: { fontSize: 15, fontWeight: "600" },
  surahMeta: { fontSize: 12, marginTop: 2 },
  surahArabic: { fontSize: 20 },

  // Surah reader modal
  readerRoot: { flex: 1 },
  readerHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1 },
  readerTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  readerControls: { flexDirection: "row", gap: 8 },
  readerChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  readerChipText: { fontSize: 12, fontWeight: "700" },
  readerContent: { padding: 20, paddingBottom: 60 },
  bismillahCard: { borderRadius: 14, padding: 18, alignItems: "center", marginBottom: 20 },
  bismillah: { fontSize: 26, textAlign: "center", color: SOUL_COLOR, lineHeight: 44 },
  ayahBlock: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1 },
  ayahTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  ayahNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: SOUL_BG, alignItems: "center", justifyContent: "center" },
  ayahNumText: { fontSize: 11, fontWeight: "700", color: SOUL_COLOR },
  ayahArabic: { fontSize: 22, textAlign: "right", lineHeight: 44, marginBottom: 8 },
  ayahLatin: { fontSize: 13, fontStyle: "italic", lineHeight: 20, marginBottom: 8, color: "#888" },
  ayahTranslation: { fontSize: 14, lineHeight: 22 },
  tafsirBlock: { marginTop: 12, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: SOUL_COLOR },
  tafsirLabel: { fontSize: 10, fontWeight: "700", color: SOUL_COLOR, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  tafsirText: { fontSize: 13, lineHeight: 20 },

  // ── Hafalan ──
  hafalanHero: { borderRadius: 20, padding: 24, alignItems: "center", gap: 10, marginBottom: 20, width: "100%" },
  hafalanHeroEmoji: { fontSize: 48, marginBottom: 4 },
  hafalanHeroTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  hafalanHeroSub: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  hafalanStartBtn: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, overflow: "hidden" },
  hafalanStartBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  chunkRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  chunkLabel: { fontSize: 13, fontWeight: "600", marginRight: 4 },
  chunkBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5 },
  chunkBtnText: { fontSize: 13, fontWeight: "700" },

  pickerFooter: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderTopWidth: 1 },
  pickerFooterTitle: { fontSize: 15, fontWeight: "700" },
  pickerFooterSub: { fontSize: 12, marginTop: 2 },
  pickerConfirmBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  pickerConfirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  hafalanHeader: { borderRadius: 20, padding: 18, marginBottom: 20, gap: 10 },
  hafalanHeaderTop: { flexDirection: "row", alignItems: "flex-start" },
  hafalanSurahName: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  hafalanSurahMeta: { fontSize: 12, marginTop: 2 },
  hafalanResetBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#D85A30" },
  hafalanResetBtnText: { fontSize: 13, fontWeight: "600" },
  hafalanStats: { flexDirection: "row", justifyContent: "space-around" },
  hafalanStat: { alignItems: "center", gap: 2 },
  hafalanStatNum: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  hafalanStatLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  hafalanTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  hafalanFill: { height: 6, borderRadius: 99, backgroundColor: SOUL_COLOR },
  hafalanPct: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  hafalanResetProgBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center", marginBottom: 4 },
  hafalanResetProgText: { fontSize: 13, fontWeight: "600" },

  // Resume card
  resumeCard: {
    borderRadius: 20, padding: 18, gap: 10, marginBottom: 4,
  },
  resumeTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  resumeLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  resumeTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  resumeRange: { fontSize: 13, marginTop: 3 },
  resumeEmoji: { fontSize: 36, textAlign: "center" },
  resumeSub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  resumeProgress: { alignItems: "center" },
  resumeProgressNum: { fontSize: 32, fontWeight: "800", lineHeight: 36 },
  resumeProgressOf: { fontSize: 14, fontWeight: "600" },
  resumeProgressLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  resumeTrack: { height: 5, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  resumeFill: { height: 5, borderRadius: 99, backgroundColor: "#fff" },
  resumePct: { fontSize: 11, fontWeight: "600" },
  resumeBtn: {
    marginTop: 4, borderRadius: 12, paddingVertical: 11,
    alignItems: "center", borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.15)",
  },
  resumeBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  timeline: { gap: 0, paddingBottom: 32 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineStemCol: { alignItems: "center", width: 28 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  timelineDotIcon: { fontSize: 11, fontWeight: "800" },
  timelineStem: { width: 2, flex: 1, minHeight: 16, marginTop: 2 },
  milestoneCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10, gap: 6 },
  milestoneTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  milestoneRange: { fontSize: 15, fontWeight: "700" },
  milestoneBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  milestoneBadgeText: { fontSize: 11, fontWeight: "700" },
  milestoneAyatCount: { fontSize: 12 },
  milestoneActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  milestoneActionBtn: { flex: 1, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  milestoneActionText: { fontSize: 12, fontWeight: "700" },
});
