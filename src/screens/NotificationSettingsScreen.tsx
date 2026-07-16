import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable, Switch,
  StyleSheet, ActivityIndicator, Alert, Platform, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useThemeStore } from "../store/themeStore";
import {
  loadNotifSettings, saveNotifSettings, NotifSettings,
  DEFAULT_NOTIF_SETTINGS, applyNotificationSettings,
  requestNotificationPermission, getNotificationPermissionStatus,
  cancelAllNotifications, notificationsAvailable,
} from "../services/notificationService";
import { PILLAR_COLORS } from "../theme/pillars";
import type { Colors } from "../types";
import {
  loadPrayerLocation, savePrayerLocation, geocodeCity,
  type PrayerLocation,
} from "../utils/prayerLocation";

const ACCENT    = PILLAR_COLORS.soul.primary;
const ACCENT_BG = PILLAR_COLORS.soul.bg;

export default function NotificationSettingsScreen() {
  const router             = useRouter();
  const { isDark, colors } = useThemeStore();

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [permission,  setPermission]  = useState<string>("undetermined");
  const [settings,    setSettings]    = useState<NotifSettings>({ ...DEFAULT_NOTIF_SETTINGS });
  const [location,    setLocation]    = useState<PrayerLocation | null>(null);
  const [cityInput,   setCityInput]   = useState("");
  const [searching,   setSearching]   = useState(false);

  const load = useCallback(async () => {
    const [s, perm, loc] = await Promise.all([
      loadNotifSettings(),
      getNotificationPermissionStatus(),
      loadPrayerLocation(),
    ]);
    setSettings(s);
    setPermission(perm);
    setLocation(loc);
    setCityInput(loc.label);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRequestPermission() {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
    if (!granted) {
      Alert.alert(
        "Permission denied",
        "Enable notifications in your device settings to use this feature.",
        [{ text: "OK" }]
      );
    }
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)" as any);
    }
  }

  async function handleSave() {
    if (permission !== "granted") {
      const granted = await requestNotificationPermission();
      setPermission(granted ? "granted" : "denied");
      if (!granted) return;
    }
    setSaving(true);
    try {
      await saveNotifSettings(settings);
      await applyNotificationSettings(settings);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Couldn't save notifications.");
      setSaving(false);
      return;
    }
    setSaving(false);
    Alert.alert("Settings saved ✓", "Your notification preferences have been updated.", [
      { text: "OK", onPress: goBack },
    ]);
  }

  async function handleDisableAll() {
    Alert.alert("Disable all notifications?", "All scheduled notifications will be cancelled.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disable all", style: "destructive", onPress: async () => {
          const off: NotifSettings = {
            ...settings,
            prayerEnabled: false,
            reminderEnabled: false,
            streakEnabled: false,
          };
          setSettings(off);
          await saveNotifSettings(off);
          await cancelAllNotifications();
        },
      },
    ]);
  }

  function update<K extends keyof NotifSettings>(key: K, value: NotifSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCitySearch() {
    const q = cityInput.trim();
    if (!q) return;
    setSearching(true);
    const result = await geocodeCity(q);
    setSearching(false);
    if (result) {
      setLocation(result);
      setCityInput(result.label);
      await savePrayerLocation(result);
      Alert.alert("Location updated", `Prayer times will use ${result.label} (${result.latitude.toFixed(2)}, ${result.longitude.toFixed(2)}).`);
    } else {
      Alert.alert("Not found", `Could not find "${q}". Try a different city name.`);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={S.center}><ActivityIndicator color={ACCENT} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!notificationsAvailable) {
    return (
      <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={[S.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
          </Pressable>
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={S.center}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🔔</Text>
          <Text style={[S.unavailTitle, { color: colors.textPrimary }]}>
            Not available in Expo Go
          </Text>
          <Text style={[S.unavailSub, { color: colors.textMuted }]}>
            Notifications require a development build.{"\n"}
            Run <Text style={{ fontWeight: "700" }}>npx expo run:android</Text> to enable them.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const permGranted = permission === "granted";

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[S.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Text style={[S.back, { color: colors.textMuted }]}>←</Text>
        </Pressable>
        <View style={S.headerCenter}>
          <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <Text style={[S.headerSub, { color: colors.textMuted }]}>Reminders & alerts</Text>
        </View>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[S.saveBtn, { backgroundColor: ACCENT }, saving && { opacity: 0.5 }]}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={S.saveBtnText}>Save</Text>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

        {/* Permission banner */}
        {!permGranted && (
          <Pressable
            style={[S.permBanner, { backgroundColor: "#FEF3EE", borderColor: "#D85A30" }]}
            onPress={handleRequestPermission}
          >
            <Text style={S.permBannerIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={[S.permBannerTitle, { color: "#D85A30" }]}>
                Notifications are {permission === "denied" ? "blocked" : "not enabled"}
              </Text>
              <Text style={[S.permBannerSub, { color: "#D85A30" }]}>
                {permission === "denied"
                  ? "Enable in Settings → The Mirror → Notifications"
                  : "Tap to grant permission"}
              </Text>
            </View>
            {permission !== "denied" && (
              <Text style={[S.permBannerArrow, { color: "#D85A30" }]}>›</Text>
            )}
          </Pressable>
        )}

        {/* Prayer times */}
        <SectionLabel label="PRAYER TIMES" colors={colors} />
        <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <SettingRow
            icon="🕌"
            iconBg={ACCENT_BG}
            title="Prayer time alerts"
            description={`Get notified at each of the 5 daily prayer times. Location: ${location?.label ?? "Malang"}.`}
            value={settings.prayerEnabled}
            onToggle={(v) => update("prayerEnabled", v)}
            colors={colors}
          />
          {settings.prayerEnabled && (
            <View style={[S.infoRow, { borderTopColor: colors.border, backgroundColor: ACCENT_BG }]}>
              <Text style={[S.infoText, { color: ACCENT }]}>
                ℹ️ Prayer times are fetched from the Aladhan API each day. Open the Soul screen to
                refresh the latest times, then save to reschedule.
              </Text>
            </View>
          )}
        </View>

        {/* Location for prayer times */}
        <SectionLabel label="LOCATION" colors={colors} />
        <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={S.locRow}>
            <View style={S.locInfo}>
              <Text style={[S.locLabel, { color: colors.textMuted }]}>Prayer times location</Text>
              <Text style={[S.locValue, { color: colors.textPrimary }]}>
                {location?.label ?? "Malang"} ({location?.latitude.toFixed(2)}, {location?.longitude.toFixed(2)})
              </Text>
            </View>
          </View>
          <View style={[S.locSearch, { borderTopColor: colors.border }]}>
            <TextInput
              style={[S.locInput, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Search city…"
              placeholderTextColor={colors.textMuted}
              value={cityInput}
              onChangeText={setCityInput}
              onSubmitEditing={handleCitySearch}
              returnKeyType="search"
            />
            <Pressable
              onPress={handleCitySearch}
              style={[S.locBtn, { backgroundColor: ACCENT }]}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={S.locBtnText}>Search</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Daily reminder */}
        <SectionLabel label="DAILY LOG REMINDER" colors={colors} />
        <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <SettingRow
            icon="📔"
            iconBg="#F0F7FE"
            title="Daily log reminder"
            description="A nudge to log your Soul, Vessel, Impact, and Stewardship for the day."
            value={settings.reminderEnabled}
            onToggle={(v) => update("reminderEnabled", v)}
            colors={colors}
          />
          {settings.reminderEnabled && (
            <>
              <View style={[S.divider, { backgroundColor: colors.border }]} />
              <View style={S.timeRow}>
                <Text style={[S.timeLabel, { color: colors.textMuted }]}>Reminder time</Text>
                <TimeSelector
                  hour={settings.reminderHour}
                  minute={settings.reminderMinute}
                  onHourChange={(h) => update("reminderHour", h)}
                  onMinuteChange={(m) => update("reminderMinute", m)}
                  color="#378ADD"
                  colors={colors}
                />
              </View>
            </>
          )}
        </View>

        {/* Streak warning */}
        <SectionLabel label="STREAK PROTECTION" colors={colors} />
        <View style={[S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <SettingRow
            icon="🔥"
            iconBg="#FEF3EE"
            title="Streak at-risk warning"
            description="Alerts you in the evening if you haven't logged anything yet today."
            value={settings.streakEnabled}
            onToggle={(v) => update("streakEnabled", v)}
            colors={colors}
          />
          {settings.streakEnabled && (
            <>
              <View style={[S.divider, { backgroundColor: colors.border }]} />
              <View style={S.timeRow}>
                <Text style={[S.timeLabel, { color: colors.textMuted }]}>Warning time</Text>
                <TimeSelector
                  hour={settings.streakHour}
                  minute={settings.streakMinute}
                  onHourChange={(h) => update("streakHour", h)}
                  onMinuteChange={(m) => update("streakMinute", m)}
                  color="#D85A30"
                  colors={colors}
                />
              </View>
            </>
          )}
        </View>

        {/* Disable all */}
        <Pressable
          onPress={handleDisableAll}
          style={[S.disableBtn, { borderColor: colors.border }]}
        >
          <Text style={[S.disableBtnText, { color: colors.textMuted }]}>Disable all notifications</Text>
        </Pressable>

        {/* Platform note */}
        {Platform.OS === "android" && (
          <Text style={[S.platformNote, { color: colors.textDisabled }]}>
            Push notifications require a development build on Android (Expo Go limitation from SDK 53+).
            They work fully in production builds and TestFlight/Play Store builds.
          </Text>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label, colors }: { label: string; colors: Colors }) {
  return (
    <Text style={[S.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
  );
}

function SettingRow({ icon, iconBg, title, description, value, onToggle, colors }: {
  icon: string; iconBg: string; title: string; description: string;
  value: boolean; onToggle: (v: boolean) => void; colors: Colors;
}) {
  return (
    <View style={S.settingRow}>
      <View style={[S.settingIcon, { backgroundColor: iconBg }]}>
        <Text style={S.settingIconText}>{icon}</Text>
      </View>
      <View style={S.settingInfo}>
        <Text style={[S.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[S.settingDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#e5e5e5", true: ACCENT }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
      />
    </View>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function TimeSelector({ hour, minute, onHourChange, onMinuteChange, color, colors }: {
  hour: number; minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  color: string; colors: Colors;
}) {
  function fmt(n: number) { return String(n).padStart(2, "0"); }
  function formatHour(h: number) {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${ampm}`;
  }

  return (
    <View style={S.timePicker}>
      {/* Hour scroll */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.timeScrollRow}
        style={S.timeScroll}
      >
        {HOURS.map((h) => (
          <Pressable
            key={h}
            onPress={() => onHourChange(h)}
            style={[S.timeChip,
              { borderColor: colors.border },
              hour === h && { backgroundColor: color, borderColor: color }]}
          >
            <Text style={[S.timeChipText, { color: hour === h ? "#fff" : colors.textMuted },
              hour === h && { fontWeight: "700" }]}>
              {formatHour(h)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {/* Minute selector */}
      <View style={S.minuteRow}>
        {MINUTES.map((m) => (
          <Pressable
            key={m}
            onPress={() => onMinuteChange(m)}
            style={[S.minuteChip,
              { borderColor: colors.border },
              minute === m && { backgroundColor: color, borderColor: color }]}
          >
            <Text style={[S.minuteChipText, { color: minute === m ? "#fff" : colors.textMuted },
              minute === m && { fontWeight: "700" }]}>
              :{fmt(m)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[S.timePreview, { color }]}>
        Scheduled for {formatHour(hour)}:{fmt(minute)}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 10 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { fontSize: 20, fontWeight: "300" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, marginTop: 1 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  permBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderRadius: 16, padding: 14 },
  permBannerIcon: { fontSize: 24 },
  permBannerTitle: { fontSize: 14, fontWeight: "700" },
  permBannerSub: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  permBannerArrow: { fontSize: 20 },

  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginTop: 6 },

  card: { borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
  settingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  settingIconText: { fontSize: 20 },
  settingInfo: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 15, fontWeight: "600" },
  settingDesc: { fontSize: 12, lineHeight: 18 },

  divider: { height: 1 },
  timeRow: { padding: 14, paddingTop: 10, gap: 8 },
  timeLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },

  timePicker: { gap: 8 },
  timeScroll: { flexGrow: 0 },
  timeScrollRow: { gap: 6, paddingRight: 8 },
  timeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5 },
  timeChipText: { fontSize: 12 },
  minuteRow: { flexDirection: "row", gap: 8 },
  minuteChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5 },
  minuteChipText: { fontSize: 13, fontWeight: "600" },
  timePreview: { fontSize: 12, fontWeight: "700" },

  infoRow: { padding: 12 },
  infoText: { fontSize: 12, lineHeight: 18 },

  locRow: { padding: 16 },
  locInfo: { gap: 2 },
  locLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  locValue: { fontSize: 14, fontWeight: "600" },
  locSearch: { flexDirection: "row", gap: 8, padding: 12, paddingTop: 0 },
  locInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  locBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  locBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  disableBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  disableBtnText: { fontSize: 14, fontWeight: "600" },

  platformNote: { fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 8 },

  unavailTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  unavailSub: { fontSize: 13, textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
});
