import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { light, dark, ThemeColors } from "../theme/colors";

const STORAGE_KEY = "app_theme";

type ThemeState = {
  isDark: boolean;
  colors: ThemeColors;
  /** Toggle between light and dark, persisting the choice */
  toggle: () => Promise<void>;
  /** Load the persisted preference (call once at app start) */
  hydrate: () => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false, // default to light
  colors: light,

  toggle: async () => {
    const next = !get().isDark;
    set({ isDark: next, colors: next ? dark : light });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch (e) {
      console.warn("Could not persist theme preference:", e);
    }
  },

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === "light") {
        set({ isDark: false, colors: light });
      } else {
        // "dark" or no value → stay dark
        set({ isDark: true, colors: dark });
      }
    } catch (e) {
      console.warn("Could not load theme preference:", e);
    }
  },
}));
