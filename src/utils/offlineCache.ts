import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── types ────────────────────────────────────────────────────────────────────

type CacheEntry<T> = {
  data: T;
  cachedAt: number; // Unix ms timestamp
};

// ─── TTL presets (ms) ─────────────────────────────────────────────────────────

export const TTL = {
  /** Exercise library — essentially static, refresh once a week */
  EXERCISE_LIST: 7 * 24 * 60 * 60 * 1000,
  /** Surah list (114 surahs) — never changes */
  SURAH_LIST: 30 * 24 * 60 * 60 * 1000,
  /** Individual surah text — never changes */
  SURAH_DETAIL: 30 * 24 * 60 * 60 * 1000,
  /** Prayer times — refresh daily */
  PRAYER_TIMES: 24 * 60 * 60 * 1000,
  /** Daily ayah — refresh daily */
  DAILY_AYAH: 24 * 60 * 60 * 1000,
  /** No expiry — keep forever */
  FOREVER: Infinity,
} as const;

// ─── key namespacing ─────────────────────────────────────────────────────────

const NS = "@mirror_cache:";

export const CACHE_KEYS = {
  exercisePage: (cursor: string, bodyPart: string, name: string) =>
    `${NS}exercises:${bodyPart}:${name}:${cursor}`,
  exerciseAll: () => `${NS}exercises:all`,
  surahList: () => `${NS}surah_list`,
  surahDetail: (n: number) => `${NS}surah:${n}`,
  surahEN: (n: number) => `${NS}surah_en:${n}`,
  tafsir: (n: number) => `${NS}tafsir:${n}`,
  prayerTimes: (lat: number, lng: number) => `${NS}prayer:${lat}:${lng}`,
  dailyAyah: (dayOfYear: number) => `${NS}daily_ayah:${dayOfYear}`,
} as const;

// ─── core helpers ─────────────────────────────────────────────────────────────

/**
 * Read a cached value. Returns null if missing OR stale (past TTL).
 * Pass ttl=Infinity to ignore expiry (always return cached value if present).
 */
export async function cacheGet<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.cachedAt;

    if (ttl !== Infinity && age > ttl) return null; // stale
    return entry.data;
  } catch {
    return null; // corrupt entry — treat as miss
  }
}

/**
 * Write a value to cache.
 */
export async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — silently skip caching
  }
}

/**
 * Check whether a key has ANY cached entry (ignoring TTL).
 * Useful for deciding whether to show an offline fallback.
 */
export async function cacheHas(key: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw !== null;
  } catch {
    return false;
  }
}

/**
 * Delete a single key.
 */
export async function cacheClear(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

/**
 * Delete all keys under the Mirror cache namespace.
 */
export async function cacheClearAll(): Promise<void> {
  try {
    const all = await AsyncStorage.getAllKeys();
    const ours = (all as string[]).filter((k) => k.startsWith(NS));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {}
}

// ─── stale-while-revalidate ───────────────────────────────────────────────────

/**
 * Returns cached data immediately (even if stale), then fetches fresh data
 * in the background and calls onFresh when it arrives.
 *
 * - If nothing is cached, awaits the fetch and returns the fresh result.
 * - If fetch fails and cache exists, silently keeps serving stale data.
 *
 * Returns { data, fromCache } so callers can show an offline badge.
 */
export async function cacheStaleWhileRevalidate<T>(opts: {
  key: string;
  ttl: number;
  fetcher: () => Promise<T>;
  onFresh?: (data: T) => void;
}): Promise<{ data: T; fromCache: boolean }> {
  const { key, ttl, fetcher, onFresh } = opts;

  // 1. Try fresh cache first
  const fresh = await cacheGet<T>(key, ttl);
  if (fresh !== null) {
    // Revalidate in background — don't await
    fetcher()
      .then(async (newData) => {
        await cacheSet(key, newData);
        onFresh?.(newData);
      })
      .catch(() => {/* network unavailable — keep serving cached */});

    return { data: fresh, fromCache: false }; // cache is still within TTL
  }

  // 2. Try stale cache (any age)
  const stale = await cacheGet<T>(key, Infinity);
  if (stale !== null) {
    // Try to revalidate
    fetcher()
      .then(async (newData) => {
        await cacheSet(key, newData);
        onFresh?.(newData);
      })
      .catch(() => {/* stay offline */});

    return { data: stale, fromCache: true }; // stale — show offline badge
  }

  // 3. No cache at all — must fetch
  const data = await fetcher();
  await cacheSet(key, data);
  return { data, fromCache: false };
}
