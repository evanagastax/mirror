/**
 * Salah Tracker — daily prayer completion.
 *
 * Stores which prayers were completed today.
 * Resets automatically when the calendar date changes.
 * Awards Soul XP on completion via the logs table.
 *
 * Key: salah_tracker_<userId>
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../api/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export const PRAYERS: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export const PRAYER_META: Record<PrayerName, {
  icon: string;
  arabicName: string;
  xp: number;
  timeHint: string;
}> = {
  Fajr:    { icon: "🌙", arabicName: "الفجر",   xp: 10, timeHint: "Before sunrise" },
  Dhuhr:   { icon: "☀️", arabicName: "الظهر",   xp: 5,  timeHint: "Midday" },
  Asr:     { icon: "🌤", arabicName: "العصر",   xp: 5,  timeHint: "Afternoon" },
  Maghrib: { icon: "🌇", arabicName: "المغرب",  xp: 5,  timeHint: "After sunset" },
  Isha:    { icon: "🌃", arabicName: "العشاء",   xp: 5,  timeHint: "Night" },
};

// Total XP for completing all 5 prayers in a day
export const FULL_DAY_BONUS_XP = 10;

export type SalahRecord = {
  /** ISO date string YYYY-MM-DD — the day this record is for */
  date: string;
  /** which prayers are done */
  completed: Partial<Record<PrayerName, boolean>>;
  /** whether the full-day bonus XP has been awarded */
  bonusAwarded: boolean;
};

// ─── Storage ──────────────────────────────────────────────────────────────────

function storageKey(userId: string) {
  return `salah_tracker_${userId}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Load today's record, resetting if the stored date is in the past. */
export async function loadTodaySalah(userId: string): Promise<SalahRecord> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (raw) {
      const stored: SalahRecord = JSON.parse(raw);
      if (stored.date === todayISO()) return stored;
    }
  } catch { /* fall through to fresh record */ }
  return { date: todayISO(), completed: {}, bonusAwarded: false };
}

async function saveSalah(userId: string, record: SalahRecord): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(record));
}

// ─── Prayer window helpers ───────────────────────────────────────────────────

/** Parse "HH:MM" → total minutes since midnight. */
function parseMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Each prayer's window:
 *   Opens  → at its own adhan time
 *   Closes → 15 minutes before the next prayer's adhan
 *   Isha   → closes at midnight (1440 min)
 *
 * Sunrise acts as Fajr's "next prayer" since there is no adhan for it.
 * If prayer times are unavailable all prayers default to available.
 */
const NEXT_PRAYER_KEY: Record<PrayerName, string> = {
  Fajr:    "Sunrise",
  Dhuhr:   "Asr",
  Asr:     "Maghrib",
  Maghrib: "Isha",
  Isha:    "", // no next — closes at midnight
};

function windowFor(
  prayer: PrayerName,
  prayerTimes: Record<string, string>
): { open: number; close: number } | null {
  const openStr  = prayerTimes[prayer];
  const nextKey  = NEXT_PRAYER_KEY[prayer];
  const closeStr = nextKey ? prayerTimes[nextKey] : null;

  if (!openStr) return null;

  const open  = parseMinutes(openStr);
  const close = closeStr ? parseMinutes(closeStr) - 15 : 1440; // midnight

  return { open, close };
}

/**
 * Returns whether a prayer button should be tappable right now.
 * If prayer times aren't loaded yet, everything is enabled.
 */
export function isPrayerAvailable(
  prayer: PrayerName,
  prayerTimes: Record<string, string> | null | undefined
): boolean {
  if (!prayerTimes) return true;
  const win = windowFor(prayer, prayerTimes);
  if (!win) return true;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  return nowMin >= win.open && nowMin < win.close;
}

/**
 * Returns display status for each prayer button:
 *   "upcoming"  → adhan hasn't happened yet
 *   "passed"    → window has closed (15 min before next prayer)
 *   "available" → currently in window
 */
export function getPrayerStatus(
  prayer: PrayerName,
  prayerTimes: Record<string, string> | null | undefined
): "upcoming" | "passed" | "available" {
  if (!prayerTimes) return "available";
  const win = windowFor(prayer, prayerTimes);
  if (!win) return "available";
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  if (nowMin < win.open)  return "upcoming";
  if (nowMin >= win.close) return "passed";
  return "available";
}

// ─── Business logic ───────────────────────────────────────────────────────────

/**
 * Mark a prayer as done (or undo it).
 * Awards XP to the Soul pillar via the logs table when completing.
 * Awards a full-day bonus when all 5 are done.
 * Returns the updated record.
 */
export async function togglePrayer(
  userId: string,
  prayer: PrayerName,
  currentRecord: SalahRecord
): Promise<SalahRecord> {
  const alreadyDone = !!currentRecord.completed[prayer];
  const updated: SalahRecord = {
    ...currentRecord,
    completed: {
      ...currentRecord.completed,
      [prayer]: !alreadyDone,
    },
  };

  // Award XP when completing (not when un-completing)
  if (!alreadyDone) {
    const meta = PRAYER_META[prayer];
    await supabase.from("logs").insert({
      user_id:      userId,
      pillar_type:  "soul",
      value:        meta.xp,
      evidence_url: null,
      metadata: {
        activity:    prayer,
        type:        "salah",
        prayer_name: prayer,
        source:      "salah_tracker",
      },
    });

    // Check for full-day bonus
    const allDone = PRAYERS.every((p) => updated.completed[p]);
    if (allDone && !updated.bonusAwarded) {
      await supabase.from("logs").insert({
        user_id:      userId,
        pillar_type:  "soul",
        value:        FULL_DAY_BONUS_XP,
        evidence_url: null,
        metadata: {
          activity: "Sholat 5 Waktu Lengkap",
          type:     "salah_bonus",
          source:   "salah_tracker",
        },
      });
      updated.bonusAwarded = true;
    }
  }

  await saveSalah(userId, updated);
  return updated;
}

/** How many prayers are done today */
export function countCompleted(record: SalahRecord): number {
  return PRAYERS.filter((p) => record.completed[p]).length;
}

/** Total XP earned today from salah */
export function calcTodayXP(record: SalahRecord): number {
  const base = PRAYERS.filter((p) => record.completed[p])
    .reduce((sum, p) => sum + PRAYER_META[p].xp, 0);
  const bonus = record.bonusAwarded ? FULL_DAY_BONUS_XP : 0;
  return base + bonus;
}
