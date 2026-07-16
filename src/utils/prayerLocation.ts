import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "prayer_location";

export type PrayerLocation = {
  latitude: number;
  longitude: number;
  label: string; // city name for display
};

const DEFAULT: PrayerLocation = {
  latitude: -7.9666,
  longitude: 112.6326,
  label: "Malang",
};

export async function loadPrayerLocation(): Promise<PrayerLocation> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
        return { ...DEFAULT, ...parsed };
      }
    }
  } catch {}
  return DEFAULT;
}

export async function savePrayerLocation(loc: PrayerLocation): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(loc));
}

export async function geocodeCity(name: string): Promise<PrayerLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1`,
      { headers: { "User-Agent": "the-mirror-app/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        label: data[0].display_name?.split(",")[0] ?? name,
      };
    }
  } catch {}
  return null;
}
