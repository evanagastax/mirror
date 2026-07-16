import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  FlatList, Modal, TextInput, Alert, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchSurahList, fetchSurahID,
  Surah, Ayah,
} from "../../services/quranApi";
import {
  loadPlan, savePlan, deletePlan, buildPlan, updateMilestone,
  planProgress, HafalanPlan, HafalanMilestone, MilestoneStatus,
  loadHistory, recordCompletion, HafalanHistoryEntry,
} from "../../services/hafalanStore";
import { captureError } from "../../services/sentry";
import { PILLAR_COLORS } from "../../theme/pillars";
import type { Colors } from "../../types";

const SOUL_COLOR = PILLAR_COLORS.soul.primary;
const SOUL_BG    = PILLAR_COLORS.soul.bg;

const CHUNK_OPTIONS = [3, 5, 7, 10];

const MILESTONE_META: Record<MilestoneStatus, { label: string; color: string; bg: string; icon: string }> = {
  todo:       { label: "Belum",      color: "#aaa",    bg: "#f5f5f5", icon: "○" },
  memorizing: { label: "Dihafal",    color: "#378ADD", bg: "#F0F7FE", icon: "◑" },
  done:       { label: "Hafal ✓",    color: "#1D9E75", bg: "#F0FBF7", icon: "●" },
};

export function HafalanTab({ colors, userId }: { colors: Colors; userId: string }) {
  const [plan,        setPlan]        = useState<HafalanPlan | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [showPicker,  setShowPicker]  = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [surahs,      setSurahs]      = useState<Surah[]>([]);
  const [surahSearch, setSurahSearch] = useState("");
  const [surahLoading, setSurahLoading] = useState(false);
  const [chunkSize,   setChunkSize]   = useState(5);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [detailOpen,  setDetailOpen]  = useState<HafalanMilestone | null>(null);
  const [ayahs,       setAyahs]       = useState<Ayah[]>([]);
  const [ayahLoading, setAyahLoading] = useState(false);
  const [history,     setHistory]     = useState<HafalanHistoryEntry[]>([]);

  useEffect(() => {
    Promise.all([loadPlan(userId), loadHistory(userId)]).then(([p, h]) => {
      setPlan(p);
      setHistory(h);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!showPicker || surahs.length > 0) return;
    setSurahLoading(true);
    fetchSurahList()
      .then((r) => setSurahs(r.data))
      .catch((e) => captureError(e, { context: "fetchSurahList picker" }))
      .finally(() => setSurahLoading(false));
  }, [showPicker]);

  useEffect(() => {
    if (!detailOpen || !plan) return;
    setAyahLoading(true);
    fetchSurahID(plan.surahNumber)
      .then((r) => {
        setAyahs(r.data.ayat.filter(
          (a) => a.nomorAyat >= detailOpen.from && a.nomorAyat <= detailOpen.to
        ));
      })
      .catch((e) => captureError(e, { context: "fetchSurahDetail" }))
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

    const allDone = updated.milestones.every((m) => m.status === "done");
    if (allDone) {
      const entry: HafalanHistoryEntry = {
        surahNumber: updated.surahNumber,
        surahName:   updated.surahName,
        totalAyat:   updated.totalAyat,
        completedAt: new Date().toISOString(),
      };
      await recordCompletion(userId, entry);
      setHistory((prev) => {
        const idx = prev.findIndex((e) => e.surahNumber === entry.surahNumber);
        if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
        return [entry, ...prev];
      });
    }
  }

  async function handleReset() {
    Alert.alert(
      "Reset progres?",
      "Semua sesi akan dikembalikan ke awal. Surah tetap sama.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset", style: "destructive", onPress: async () => {
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

        <SurahPickerModal
          visible={showPicker}
          surahs={filteredSurahs}
          surahLoading={surahLoading}
          surahSearch={surahSearch}
          setSurahSearch={setSurahSearch}
          selectedSurah={selectedSurah}
          setSelectedSurah={setSelectedSurah}
          chunkSize={chunkSize}
          setChunkSize={setChunkSize}
          onConfirm={handleCreatePlan}
          onClose={() => setShowPicker(false)}
          isReplacing={false}
          colors={colors}
        />
      </ScrollView>
    );
  }

  const prog         = planProgress(plan);
  const resumeMilestone = plan.milestones.find((m) => m.status === "memorizing")
    ?? plan.milestones.find((m) => m.status === "todo")
    ?? null;
  const isComplete   = prog.done === prog.total;

  return (
    <ScrollView contentContainerStyle={S.tabContent} showsVerticalScrollIndicator={false}>
      {history.length > 0 && (
        <View style={S.historySection}>
          <Text style={[S.sectionLabel, { color: colors.textMuted }]}>SUDAH DIHAFAL</Text>
          <View style={[S.historyList, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {history.map((entry, idx) => (
              <View
                key={entry.surahNumber}
                style={[
                  S.historyRow,
                  idx < history.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
              >
                <View style={[S.historyNum, { backgroundColor: SOUL_BG }]}>
                  <Text style={[S.historyNumText, { color: SOUL_COLOR }]}>{entry.surahNumber}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[S.historyName, { color: colors.textPrimary }]}>{entry.surahName}</Text>
                  <Text style={[S.historyMeta, { color: colors.textMuted }]}>
                    {entry.totalAyat} ayat · selesai {new Date(entry.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <Text style={[S.historyCheck, { color: SOUL_COLOR }]}>✓</Text>
              </View>
            ))}
          </View>
        </View>
      )}

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
          <View style={S.resumeTrack}>
            <View style={[S.resumeFill, { width: `${prog.pct * 100}%` as any }]} />
          </View>
          <Text style={[S.resumePct, { color: "rgba(255,255,255,0.7)" }]}>
            {prog.ayatDone}/{plan.totalAyat} ayat hafal · {Math.round(prog.pct * 100)}%
          </Text>
          <Pressable onPress={() => setDetailOpen(resumeMilestone)} style={S.resumeBtn}>
            <Text style={S.resumeBtnText}>▶ Mulai Sesi Ini</Text>
          </Pressable>
        </View>
      ) : null}

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
              <View style={S.timelineStemCol}>
                <View style={[S.timelineDot, { backgroundColor: meta.color, borderColor: meta.color },
                  locked && { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[S.timelineDotIcon, { color: locked ? colors.textDisabled : "#fff" }]}>
                    {locked ? String(idx + 1) : meta.icon}
                  </Text>
                </View>
                {!isLast && <View style={[S.timelineStem, { backgroundColor: colors.border }]} />}
              </View>

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
                {!locked && (
                  <View style={S.milestoneActions}>
                    {(["memorizing", "done"] as MilestoneStatus[]).map((st) => (
                      <Pressable
                        key={st}
                        onPress={(e) => { e.stopPropagation?.(); handleStatusChange(m.id, st); }}
                        style={[S.milestoneActionBtn,
                          { borderColor: MILESTONE_META[st].color },
                          m.status === st && { backgroundColor: MILESTONE_META[st].color }]}
                      >
                        <Text style={[S.milestoneActionText,
                          { color: m.status === st ? "#fff" : MILESTONE_META[st].color }]}>
                          {MILESTONE_META[st].label}
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

      {/* Milestone detail modal */}
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

      {/* Surah picker modal */}
      <SurahPickerModal
        visible={showPicker}
        surahs={filteredSurahs}
        surahLoading={surahLoading}
        surahSearch={surahSearch}
        setSurahSearch={setSurahSearch}
        selectedSurah={selectedSurah}
        setSelectedSurah={setSelectedSurah}
        chunkSize={chunkSize}
        setChunkSize={setChunkSize}
        onConfirm={handleCreatePlan}
        onClose={() => { setShowPicker(false); setIsReplacing(false); setSurahSearch(""); setSelectedSurah(null); }}
        isReplacing={isReplacing}
        colors={colors}
      />
    </ScrollView>
  );
}

// ─── Surah Picker Modal ──────────────────────────────────────────────────────

function SurahPickerModal({
  visible, surahs, surahLoading, surahSearch, setSurahSearch,
  selectedSurah, setSelectedSurah, chunkSize, setChunkSize,
  onConfirm, onClose, isReplacing, colors,
}: {
  visible: boolean;
  surahs: Surah[];
  surahLoading: boolean;
  surahSearch: string;
  setSurahSearch: (s: string) => void;
  selectedSurah: Surah | null;
  setSelectedSurah: (s: Surah | null) => void;
  chunkSize: number;
  setChunkSize: (n: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  isReplacing: boolean;
  colors: Colors;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[S.readerRoot, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
        <View style={[S.readerHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[S.back, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
          <Text style={[S.readerTitle, { color: colors.textPrimary }]}>
            {isReplacing ? "Ganti Surah" : "Pilih Surah"}
          </Text>
        </View>

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
            data={surahs}
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
            <Pressable style={[S.pickerConfirmBtn, { backgroundColor: SOUL_COLOR }]} onPress={onConfirm}>
              <Text style={S.pickerConfirmText}>{isReplacing ? "Ganti" : "Mulai"}</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  tabContent: { padding: 16, paddingBottom: 40, gap: 14 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  back: { fontSize: 20, fontWeight: "300" },

  // Hafalan hero
  hafalanHero: { borderRadius: 20, padding: 24, alignItems: "center", gap: 10, marginBottom: 20, width: "100%" },
  hafalanHeroEmoji: { fontSize: 48, marginBottom: 4 },
  hafalanHeroTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  hafalanHeroSub: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  hafalanStartBtn: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, overflow: "hidden" },
  hafalanStartBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Chunk selector
  chunkRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  chunkLabel: { fontSize: 13, fontWeight: "600", marginRight: 4 },
  chunkBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5 },
  chunkBtnText: { fontSize: 13, fontWeight: "700" },

  // Picker footer
  pickerFooter: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderTopWidth: 1 },
  pickerFooterTitle: { fontSize: 15, fontWeight: "700" },
  pickerFooterSub: { fontSize: 12, marginTop: 2 },
  pickerConfirmBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  pickerConfirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Hafalan header
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
  resumeCard: { borderRadius: 20, padding: 18, gap: 10, marginBottom: 4 },
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

  // History
  historySection: { gap: 8, marginBottom: 4 },
  historyList: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  historyNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  historyNumText: { fontSize: 12, fontWeight: "700" },
  historyName: { fontSize: 15, fontWeight: "600" },
  historyMeta: { fontSize: 12, marginTop: 2 },
  historyCheck: { fontSize: 18, fontWeight: "700" },

  // Timeline
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

  // Reader
  readerRoot: { flex: 1 },
  readerHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1 },
  readerTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  readerChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  readerChipText: { fontSize: 12, fontWeight: "700" },
  readerContent: { padding: 20, paddingBottom: 60 },
  ayahBlock: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1 },
  ayahTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  ayahNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: SOUL_BG, alignItems: "center", justifyContent: "center" },
  ayahNumText: { fontSize: 11, fontWeight: "700", color: SOUL_COLOR },
  ayahArabic: { fontSize: 22, textAlign: "right", lineHeight: 44, marginBottom: 8 },
  ayahLatin: { fontSize: 13, fontStyle: "italic", lineHeight: 20, marginBottom: 8, color: "#888" },
  ayahTranslation: { fontSize: 14, lineHeight: 22 },

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
});
