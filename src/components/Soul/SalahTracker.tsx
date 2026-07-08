import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, Animated,
} from "react-native";
import {
  PRAYERS, PRAYER_META, PrayerName,
  SalahRecord, loadTodaySalah, togglePrayer,
  countCompleted, calcTodayXP,
} from "../../services/salahTracker";
import { useQueryClient } from "@tanstack/react-query";

const SOUL_COLOR = "#1D9E75";
const SOUL_BG    = "#F0FBF7";
const SOUL_DARK  = "#0B7A5C";

type C = {
  textPrimary: string; textMuted: string; textDisabled: string;
  border: string; bgCard: string; bgSubtle: string;
};

export function SalahTracker({
  userId,
  colors,
}: {
  userId: string;
  colors: C;
}) {
  const queryClient = useQueryClient();
  const [record,  setRecord]  = useState<SalahRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PrayerName | null>(null);

  const load = useCallback(async () => {
    const r = await loadTodaySalah(userId);
    setRecord(r);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(prayer: PrayerName) {
    if (!record || pending) return;
    setPending(prayer);
    try {
      const updated = await togglePrayer(userId, prayer, record);
      setRecord(updated);
      // Invalidate pillars so Compass XP bar refreshes
      queryClient.invalidateQueries({ queryKey: ["pillars", userId] });
    } finally {
      setPending(null);
    }
  }

  if (loading || !record) {
    return (
      <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <ActivityIndicator color={SOUL_COLOR} size="small" style={{ margin: 20 }} />
      </View>
    );
  }

  const done     = countCompleted(record);
  const totalXP  = calcTodayXP(record);
  const allDone  = done === PRAYERS.length;
  const pct      = done / PRAYERS.length;

  return (
    <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      {/* Header */}
      <View style={S.headerRow}>
        <View style={[S.iconWrap, { backgroundColor: SOUL_BG }]}>
          <Text style={S.icon}>🕌</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[S.title, { color: colors.textPrimary }]}>Sholat Hari Ini</Text>
          <Text style={[S.sub, { color: colors.textMuted }]}>
            {done}/5 waktu · +{totalXP} XP hari ini
          </Text>
        </View>
        {allDone && (
          <View style={[S.completeBadge, { backgroundColor: SOUL_COLOR }]}>
            <Text style={S.completeBadgeText}>✓ Lengkap</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={[S.progressTrack, { backgroundColor: colors.bgSubtle }]}>
        <View style={[S.progressFill, {
          width: `${pct * 100}%` as any,
          backgroundColor: allDone ? SOUL_DARK : SOUL_COLOR,
        }]} />
      </View>

      {/* Prayer circles */}
      <View style={S.prayerRow}>
        {PRAYERS.map((prayer) => {
          const meta    = PRAYER_META[prayer];
          const done    = !!record.completed[prayer];
          const loading = pending === prayer;
          return (
            <Pressable
              key={prayer}
              style={[
                S.prayerBtn,
                done
                  ? { backgroundColor: SOUL_COLOR, borderColor: SOUL_COLOR }
                  : { backgroundColor: colors.bgSubtle, borderColor: colors.border },
              ]}
              onPress={() => handleToggle(prayer)}
              disabled={!!pending}
              android_ripple={{ color: SOUL_BG, borderless: true, radius: 36 }}
            >
              {loading ? (
                <ActivityIndicator color={done ? "#fff" : SOUL_COLOR} size="small" />
              ) : (
                <>
                  <Text style={S.prayerIcon}>{meta.icon}</Text>
                  <Text style={[S.prayerName, { color: done ? "#fff" : colors.textPrimary }]}>
                    {prayer}
                  </Text>
                  <View style={[
                    S.prayerCheck,
                    done
                      ? { backgroundColor: "rgba(255,255,255,0.25)" }
                      : { backgroundColor: colors.border },
                  ]}>
                    <Text style={[S.prayerCheckText, { color: done ? "#fff" : colors.textDisabled }]}>
                      {done ? "✓" : "○"}
                    </Text>
                  </View>
                  <Text style={[S.prayerXP, { color: done ? "rgba(255,255,255,0.75)" : colors.textDisabled }]}>
                    +{meta.xp} xp
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Full-day bonus hint */}
      {!allDone && (
        <View style={[S.bonusHint, { backgroundColor: SOUL_BG }]}>
          <Text style={[S.bonusHintText, { color: SOUL_COLOR }]}>
            🌟 Selesaikan semua 5 waktu → bonus +10 XP
          </Text>
        </View>
      )}

      {allDone && record.bonusAwarded && (
        <View style={[S.bonusHint, { backgroundColor: SOUL_DARK + "18" }]}>
          <Text style={[S.bonusHintText, { color: SOUL_DARK }]}>
            🌟 Bonus +10 XP sudah diterima. MasyaAllah!
          </Text>
        </View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 18, overflow: "hidden",
  },

  headerRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 10,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  icon: { fontSize: 20 },
  title: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 1 },
  completeBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  completeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  progressTrack: {
    height: 4, marginHorizontal: 16, borderRadius: 99, overflow: "hidden", marginBottom: 16,
  },
  progressFill: { height: 4, borderRadius: 99 },

  prayerRow: {
    flexDirection: "row", paddingHorizontal: 12, paddingBottom: 12, gap: 8,
  },
  prayerBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1.5,
    paddingVertical: 10, alignItems: "center", gap: 4,
    minHeight: 80,
  },
  prayerIcon: { fontSize: 16 },
  prayerName: { fontSize: 10, fontWeight: "700" },
  prayerCheck: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  prayerCheckText: { fontSize: 12, fontWeight: "800" },
  prayerXP: { fontSize: 9, fontWeight: "600" },

  bonusHint: {
    marginHorizontal: 12, marginBottom: 12, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  bonusHintText: { fontSize: 12, fontWeight: "600", textAlign: "center" },
});
