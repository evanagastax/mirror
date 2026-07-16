/**
 * Notification Service
 *
 * Handles:
 * - Permission requests
 * - Android channel setup
 * - Scheduling: prayer times, daily log reminder, streak-at-risk
 * - Cancellation helpers
 *
 * All schedule state is persisted in AsyncStorage so we can cancel
 * and re-schedule when the user changes settings.
 *
 * NOTE: expo-notifications remote push support was removed from Expo Go
 * on Android in SDK 53. Local scheduled notifications still work in a
 * development build. In Expo Go on Android, all functions below no-op
 * silently so the app doesn't crash.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ─── Safe Notifications import ────────────────────────────────────────────────
// Wrap in try/catch so Expo Go on Android (SDK 53+) doesn't crash the app.

let Notifications: typeof import("expo-notifications") | null = null;
try {
  // Skip on web — expo-notifications stubs exist but methods throw at runtime
  if (Platform.OS !== "web") {
    Notifications = require("expo-notifications");
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch {
  Notifications = null;
}

export const notificationsAvailable = Notifications !== null;

// ─── Android channels ─────────────────────────────────────────────────────────

export async function setupAndroidChannels() {
  if (Platform.OS !== "android" || !Notifications) return;
  await Notifications.setNotificationChannelAsync("prayer", {
    name: "Prayer Times",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1D9E75",
    sound: "default",
  });
  await Notifications.setNotificationChannelAsync("reminder", {
    name: "Daily Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200],
    lightColor: "#378ADD",
  });
  await Notifications.setNotificationChannelAsync("streak", {
    name: "Streak Alerts",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 200, 300],
    lightColor: "#D85A30",
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<string> {
  if (!Notifications) return "unavailable";
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// ─── Settings persistence ─────────────────────────────────────────────────────

export type NotifSettings = {
  prayerEnabled:   boolean;
  reminderEnabled: boolean;
  /** 24h hour for daily reminder e.g. 20 = 8pm */
  reminderHour:    number;
  reminderMinute:  number;
  streakEnabled:   boolean;
  /** 24h hour for streak warning e.g. 21 = 9pm */
  streakHour:      number;
  streakMinute:    number;
};

export const DEFAULT_NOTIF_SETTINGS: NotifSettings = {
  prayerEnabled:   true,
  reminderEnabled: true,
  reminderHour:    20,
  reminderMinute:  0,
  streakEnabled:   true,
  streakHour:      21,
  streakMinute:    0,
};

const SETTINGS_KEY = "notification_settings";

export async function loadNotifSettings(): Promise<NotifSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_NOTIF_SETTINGS };
  } catch {
    return { ...DEFAULT_NOTIF_SETTINGS };
  }
}

export async function saveNotifSettings(s: NotifSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ─── Identifier storage ───────────────────────────────────────────────────────

const IDS_KEY = "notification_ids";

type ScheduledIDs = {
  prayer:   string[];
  reminder: string | null;
  streak:   string | null;
};

async function loadIDs(): Promise<ScheduledIDs> {
  try {
    const raw = await AsyncStorage.getItem(IDS_KEY);
    return raw ? JSON.parse(raw) : { prayer: [], reminder: null, streak: null };
  } catch {
    return { prayer: [], reminder: null, streak: null };
  }
}

async function saveIDs(ids: ScheduledIDs): Promise<void> {
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
}

// ─── Cancel helpers ───────────────────────────────────────────────────────────

export async function cancelPrayerNotifications() {
  if (!Notifications) return;
  const ids = await loadIDs();
  for (const id of ids.prayer) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
  ids.prayer = [];
  await saveIDs(ids);
}

export async function cancelReminderNotification() {
  if (!Notifications) return;
  const ids = await loadIDs();
  if (ids.reminder) {
    await Notifications.cancelScheduledNotificationAsync(ids.reminder).catch(() => {});
    ids.reminder = null;
    await saveIDs(ids);
  }
}

export async function cancelStreakNotification() {
  if (!Notifications) return;
  const ids = await loadIDs();
  if (ids.streak) {
    await Notifications.cancelScheduledNotificationAsync(ids.streak).catch(() => {});
    ids.streak = null;
    await saveIDs(ids);
  }
}

export async function cancelAllNotifications() {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await saveIDs({ prayer: [], reminder: null, streak: null });
}

// ─── Prayer time notifications ────────────────────────────────────────────────

type PrayerTime = { name: string; hour: number; minute: number };

const PRAYER_MESSAGES: Record<string, { title: string; body: string }> = {
  Fajr:    { title: "🌙 Fajr",    body: "Waktunya sholat Fajr. Mulai hari dengan mengingat Allah." },
  Dhuhr:   { title: "☀️ Dhuhr",   body: "Waktunya sholat Dhuhr. Luangkan waktu sejenak." },
  Asr:     { title: "🌤 Asr",     body: "Waktunya sholat Asr. Jangan sampai terlewat." },
  Maghrib: { title: "🌇 Maghrib", body: "Waktunya sholat Maghrib. Syukuri hari ini." },
  Isha:    { title: "🌃 Isha",    body: "Waktunya sholat Isha. Tutup malam dengan ibadah." },
};

export async function schedulePrayerNotifications(
  prayerTimes: Record<string, string>
): Promise<void> {
  if (!Notifications) return;
  await cancelPrayerNotifications();
  const ids: string[] = [];

  for (const [name, timeStr] of Object.entries(prayerTimes)) {
    const msg = PRAYER_MESSAGES[name];
    if (!msg) continue;
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour   = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (isNaN(hour) || isNaN(minute)) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body:  msg.body,
        sound: "default",
        data:  { type: "prayer", prayer: name },
        ...(Platform.OS === "android" ? { channelId: "prayer" } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    ids.push(id);
  }

  const stored = await loadIDs();
  stored.prayer = ids;
  await saveIDs(stored);
}

// ─── Daily log reminder ───────────────────────────────────────────────────────

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (!Notifications) return;
  await cancelReminderNotification();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "📔 Mirror — Log your day",
      body:  "Take 2 minutes to log your Soul, Vessel, Impact, and Stewardship.",
      sound: "default",
      data:  { type: "reminder" },
      ...(Platform.OS === "android" ? { channelId: "reminder" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  const stored = await loadIDs();
  stored.reminder = id;
  await saveIDs(stored);
}

// ─── Streak at-risk warning ───────────────────────────────────────────────────

export async function scheduleStreakWarning(hour: number, minute: number): Promise<void> {
  if (!Notifications) return;
  await cancelStreakNotification();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Don't break your streak!",
      body:  "You haven't logged anything today. Keep your Mirror streak alive.",
      sound: "default",
      data:  { type: "streak" },
      ...(Platform.OS === "android" ? { channelId: "streak" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  const stored = await loadIDs();
  stored.streak = id;
  await saveIDs(stored);
}

// ─── Master scheduler ─────────────────────────────────────────────────────────

export async function applyNotificationSettings(
  settings: NotifSettings,
  prayerTimes?: Record<string, string>
): Promise<void> {
  if (!Notifications) return;
  await setupAndroidChannels();

  if (settings.prayerEnabled && prayerTimes) {
    await schedulePrayerNotifications(prayerTimes);
  } else {
    await cancelPrayerNotifications();
  }

  if (settings.reminderEnabled) {
    await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute);
  } else {
    await cancelReminderNotification();
  }

  if (settings.streakEnabled) {
    await scheduleStreakWarning(settings.streakHour, settings.streakMinute);
  } else {
    await cancelStreakNotification();
  }
}
