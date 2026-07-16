/**
 * Generic per-user AsyncStorage store factory.
 *
 * Replaces the identical load/save/delete boilerplate duplicated across
 * 7 service files (careerProgress, hafalanStore, stewardshipBudget,
 * vesselProfile, vesselPlan, salahTracker, notificationService).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserStore<T> {
  /** Returns the stored value, or `fallback` (default: null) on miss/error. */
  load(userId: string): Promise<T | null>;
  /** Persists a value under the user's key. */
  save(userId: string, data: T): Promise<void>;
  /** Removes the stored value. */
  remove(userId: string): Promise<void>;
}

/**
 * Create a per-user AsyncStorage store.
 *
 * @param keyPrefix  Storage key namespace, e.g. "vessel_profile".
 *                   Actual key: `${keyPrefix}_${userId}`
 * @param fallback   Value returned on read error (default: null).
 */
export function createUserStore<T>(
  keyPrefix: string,
  fallback: T | null = null
): UserStore<T> {
  function key(userId: string): string {
    return `${keyPrefix}_${userId}`;
  }

  return {
    async load(userId: string): Promise<T | null> {
      try {
        const raw = await AsyncStorage.getItem(key(userId));
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    },

    async save(userId: string, data: T): Promise<void> {
      await AsyncStorage.setItem(key(userId), JSON.stringify(data));
    },

    async remove(userId: string): Promise<void> {
      await AsyncStorage.removeItem(key(userId));
    },
  };
}

/**
 * Global (non-user-scoped) AsyncStorage store.
 * For app-wide settings like notification preferences or theme.
 */
export interface GlobalStore<T> {
  load(): Promise<T | null>;
  save(data: T): Promise<void>;
  remove(): Promise<void>;
}

export function createGlobalStore<T>(
  key: string,
  fallback: T | null = null
): GlobalStore<T> {
  return {
    async load(): Promise<T | null> {
      try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    },

    async save(data: T): Promise<void> {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    },

    async remove(): Promise<void> {
      await AsyncStorage.removeItem(key);
    },
  };
}
