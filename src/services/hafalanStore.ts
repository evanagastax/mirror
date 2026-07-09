/**
 * Hafalan (Quran memorization) local store.
 * Persisted entirely in AsyncStorage — no DB schema change needed.
 *
 * Data model:
 *   HafalanPlan {
 *     surahNumber, surahName, totalAyat, chunkSize,
 *     milestones: HafalanMilestone[]
 *   }
 *
 *   HafalanMilestone {
 *     id, from, to,           // ayah range (inclusive)
 *     status: "todo" | "memorizing" | "done",
 *     startedAt?, doneAt?
 *   }
 *
 * One active plan per user. Key: hafalan_plan_<userId>
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type MilestoneStatus = "todo" | "memorizing" | "done";

export type HafalanMilestone = {
  id: string;
  from: number;   // first ayah number (1-indexed)
  to: number;     // last ayah number (inclusive)
  status: MilestoneStatus;
  startedAt?: string;
  doneAt?: string;
};

export type HafalanPlan = {
  surahNumber: number;
  surahName: string;
  totalAyat: number;
  chunkSize: number;
  createdAt: string;
  milestones: HafalanMilestone[];
};

function key(userId: string) {
  return `hafalan_plan_${userId}`;
}

export async function loadPlan(userId: string): Promise<HafalanPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as HafalanPlan) : null;
  } catch {
    return null;
  }
}

export async function savePlan(userId: string, plan: HafalanPlan): Promise<void> {
  await AsyncStorage.setItem(key(userId), JSON.stringify(plan));
}

export async function deletePlan(userId: string): Promise<void> {
  await AsyncStorage.removeItem(key(userId));
}

/** Build a fresh plan by chunking totalAyat into groups of chunkSize. */
export function buildPlan(
  surahNumber: number,
  surahName: string,
  totalAyat: number,
  chunkSize: number
): HafalanPlan {
  const milestones: HafalanMilestone[] = [];
  let ayah = 1;
  let idx  = 0;
  while (ayah <= totalAyat) {
    const from = ayah;
    const to   = Math.min(ayah + chunkSize - 1, totalAyat);
    milestones.push({
      id:     `m_${surahNumber}_${idx}`,
      from,
      to,
      status: idx === 0 ? "memorizing" : "todo",
    });
    ayah += chunkSize;
    idx++;
  }
  return {
    surahNumber,
    surahName,
    totalAyat,
    chunkSize,
    createdAt: new Date().toISOString(),
    milestones,
  };
}

export function updateMilestone(
  plan: HafalanPlan,
  milestoneId: string,
  status: MilestoneStatus
): HafalanPlan {
  const now = new Date().toISOString();
  const milestones = plan.milestones.map((m, i) => {
    if (m.id !== milestoneId) return m;
    return {
      ...m,
      status,
      startedAt: status === "memorizing" && !m.startedAt ? now : m.startedAt,
      doneAt:    status === "done" ? now : undefined,
    };
  });

  // Auto-unlock next todo milestone when one is marked done
  const doneIdx = milestones.findIndex((m) => m.id === milestoneId);
  if (status === "done" && doneIdx >= 0 && doneIdx + 1 < milestones.length) {
    const next = milestones[doneIdx + 1];
    if (next.status === "todo") {
      milestones[doneIdx + 1] = { ...next, status: "memorizing" };
    }
  }

  return { ...plan, milestones };
}

export function planProgress(plan: HafalanPlan) {
  const total      = plan.milestones.length;
  const done       = plan.milestones.filter((m) => m.status === "done").length;
  const memorizing = plan.milestones.filter((m) => m.status === "memorizing").length;
  const pct        = total > 0 ? done / total : 0;
  const ayatDone   = plan.milestones
    .filter((m) => m.status === "done")
    .reduce((s, m) => s + (m.to - m.from + 1), 0);
  return { total, done, memorizing, pct, ayatDone };
}

// ─── Completed surah history ─────────────────────────────────────────────────

export type HafalanHistoryEntry = {
  surahNumber: number;
  surahName:   string;
  totalAyat:   number;
  completedAt: string; // ISO date string
};

function historyKey(userId: string) {
  return `hafalan_history_${userId}`;
}

export async function loadHistory(userId: string): Promise<HafalanHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(historyKey(userId));
    return raw ? (JSON.parse(raw) as HafalanHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Append a completed surah to history.
 * Deduplicates by surahNumber — if the same surah is completed again,
 * the completedAt date is updated rather than adding a duplicate.
 */
export async function recordCompletion(
  userId: string,
  entry: HafalanHistoryEntry
): Promise<void> {
  const existing = await loadHistory(userId);
  const idx = existing.findIndex((e) => e.surahNumber === entry.surahNumber);
  if (idx >= 0) {
    existing[idx] = entry; // update date
  } else {
    existing.unshift(entry); // newest first
  }
  await AsyncStorage.setItem(historyKey(userId), JSON.stringify(existing));
}
