/**
 * Shared cache invalidation helpers for TanStack Query.
 *
 * Previously the same 3-line invalidation block was copy-pasted
 * into 5 mutation onSuccess handlers. Extracted here so any
 * future change to the invalidation set only needs one edit.
 */

import type { QueryClient } from "@tanstack/react-query";
import { qk } from "./queryKeys";

/**
 * Invalidate core queries affected by soul / vessel / impact changes.
 * Use in useCreateLog, useDeleteLog, and SalahTracker.
 */
export function invalidateCore(qc: QueryClient, uid: string): void {
  qc.invalidateQueries({ queryKey: qk.pillars(uid) });
  qc.invalidateQueries({ queryKey: qk.logs(uid) });
  qc.invalidateQueries({ queryKey: qk.streak(uid) });
}

/**
 * Invalidate queries affected by stewardship transaction changes.
 * Use in useCreateTransaction and useDeleteTransaction.
 */
export function invalidateLedger(qc: QueryClient, uid: string): void {
  qc.invalidateQueries({ queryKey: qk.pillars(uid) });
  qc.invalidateQueries({ queryKey: qk.ledger(uid) });
  qc.invalidateQueries({ queryKey: qk.streak(uid) });
}

/**
 * Invalidate all user queries. Use after operations that affect
 * multiple pillars (e.g. full account reset).
 */
export function invalidateAll(qc: QueryClient, uid: string): void {
  qc.invalidateQueries({ queryKey: qk.pillars(uid) });
  qc.invalidateQueries({ queryKey: qk.logs(uid) });
  qc.invalidateQueries({ queryKey: qk.ledger(uid) });
  qc.invalidateQueries({ queryKey: qk.streak(uid) });
  qc.invalidateQueries({ queryKey: qk.goals(uid) });
}
