/**
 * Centralised TanStack Query key factory.
 *
 * A typo in a query key string silently breaks cache invalidation.
 * Use these helpers everywhere instead of raw string literals.
 */

export const qk = {
  pillars:  (uid: string)               => ["pillars", uid] as const,
  logs:     (uid: string)               => ["logs", uid] as const,
  ledger:   (uid: string)               => ["ledger", uid] as const,
  streak:   (uid: string)               => ["streak", uid] as const,
  goals:    (uid: string)               => ["goals", uid] as const,
  exercises: (filters: Record<string, unknown>) => ["exercises", filters] as const,
  exercise:  (id: string)               => ["exercise", id] as const,
} as const;
