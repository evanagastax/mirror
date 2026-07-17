import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, type Lang, type Translations } from "../i18n/translations";

const STORAGE_KEY = "app_lang";

type LangState = {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useLangStore = create<LangState>((set, get) => ({
  lang: "id",
  t: translations.id,

  setLang: async (lang: Lang) => {
    set({ lang, t: translations[lang] });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not persist language preference:", e);
    }
  },

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "id") {
        set({ lang: saved, t: translations[saved] });
      }
    } catch (e) {
      console.warn("Could not load language preference:", e);
    }
  },
}));
