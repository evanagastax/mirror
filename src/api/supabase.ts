if (typeof window !== "undefined" && !window.URLSearchParams) {
  require("react-native-url-polyfill/auto");
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Secure storage adapter ───────────────────────────────────────────────────
//
// iOS Keychain (and Android Keystore via SecureStore) is the right place for
// auth tokens — it is encrypted at rest and unavailable to other apps.
//
// iOS has a soft limit of ~2 048 bytes per SecureStore value. Supabase's
// persisted session JSON can exceed that (access token + refresh token + user
// object). We handle this with a transparent fallback: if SecureStore throws
// (value too large), we store the value in AsyncStorage instead. AsyncStorage
// is less secure than the Keychain, but this only ever affects the large session
// blob — the compact refresh token and smaller keys still go into SecureStore.
//
// Web (Expo web) does not have SecureStore, so we skip straight to AsyncStorage.

const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    try {
      // Check SecureStore first; if the value was previously spilled to
      // AsyncStorage (due to size), fall through to the AsyncStorage path.
      const secure = await SecureStore.getItemAsync(key);
      if (secure !== null) return secure;
    } catch {
      // SecureStore unavailable (simulator, old OS) — fall through
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
    try {
      await SecureStore.setItemAsync(key, value);
      // If this key was previously spilled to AsyncStorage, clean it up
      // so there is no stale copy lying around.
      await AsyncStorage.removeItem(key).catch(() => {});
      return;
    } catch {
      // Value too large for SecureStore (> ~2 048 bytes on iOS) or
      // SecureStore unavailable — spill to AsyncStorage.
    }
    return AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") return AsyncStorage.removeItem(key);
    // Remove from both stores — we don't know which one holds the value.
    await Promise.allSettled([
      SecureStore.deleteItemAsync(key),
      AsyncStorage.removeItem(key),
    ]);
  },
};

// ─── Supabase client ──────────────────────────────────────────────────────────

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:          SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
