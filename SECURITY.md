# Security Posture — The Mirror

_Last reviewed: July 2026_

---

## 1. Scope

This document covers the security posture of **The Mirror** — an Expo / React Native app backed by Supabase. It documents what is already in place, outstanding risks, and recommended next steps.

---

## 2. What Is Already Secured

### 2.1 Authentication

| Control | Status | Location |
|---|---|---|
| Supabase JWT-based auth | ✅ In place | `src/api/supabase.ts` |
| Session persisted in AsyncStorage | ✅ In place | `src/api/supabase.ts` |
| Auto token refresh | ✅ In place | `src/api/supabase.ts` (`autoRefreshToken: true`) |
| Auth guard — app route redirects unauthenticated users | ✅ In place | `app/(app)/_layout.tsx` |
| Auth guard — auth route redirects authenticated users | ✅ In place | `app/(auth)/_layout.tsx` |
| Hydration guard prevents premature redirect on fresh launch | ✅ In place | `useAuthStore.isHydrated` |
| Password minimum length enforced client-side (≥ 8 chars) | ✅ In place | `app/(auth)/index.tsx` — `handleSignUp` |
| Email trimmed before passing to Supabase | ✅ In place | `email.trim()` in all auth handlers |

### 2.2 Database — Row Level Security (RLS)

All four tables are locked down so authenticated users only access their own rows.

| Table | RLS | Policy |
|---|---|---|
| `profiles` | ✅ Enabled | `auth.uid() = id` |
| `pillars` | ✅ Enabled | `auth.uid() = user_id` |
| `logs` | ✅ Enabled | `auth.uid() = user_id` |
| `transactions` | ✅ Enabled | `auth.uid() = user_id` |

See `migrations/001_initial_schema.sql` §3.

### 2.3 Database — Rate Limiting

Server-side triggers prevent abuse even if the client is bypassed.

| Resource | Limit | Trigger |
|---|---|---|
| `logs` inserts | 100 per user per day | `enforce_log_rate_limit` |
| `transactions` inserts | 200 per user per day | `enforce_transaction_rate_limit` |

See `migrations/003_security_and_indexes.sql` §2–3.

### 2.4 Database — Field Length Constraints

| Field | Constraint |
|---|---|
| `transactions.note` | `< 500 chars` |
| `logs.metadata` | `< 10 000 chars (JSON text)` |
| `goals.title` | `< 300 chars` |
| `profiles.username` | `< 50 chars` |

See `migrations/003_security_and_indexes.sql` §1.

### 2.5 Delete Operations — User-Scoped

All delete mutations include an explicit `user_id` equality check to prevent horizontal privilege escalation via ID guessing:

```ts
// Example from useDeleteLog
supabase.from("logs").delete().eq("id", id).eq("user_id", userId)
```

### 2.6 Error Boundary

`src/components/ErrorBoundary.tsx` catches unhandled render errors and shows a recoverable fallback screen rather than a blank crash. Dev-only stack traces are gated behind `__DEV__`.

### 2.7 Offline Detection

`OfflineBanner` monitors network state and surfaces it to the user, preventing silent data-loss assumptions when offline.

### 2.8 Sensitive Data Cleanup

`migrations/003_security_and_indexes.sql` §5 cleans up any residual GitHub tokens that were accidentally stored in `profiles.privacy_settings` during a previous feature.

### 2.9 Environment Variable Handling

Supabase credentials use the `EXPO_PUBLIC_` prefix, which is the Expo-standard way of exposing non-secret client-side keys. The anon key is intentionally public (controlled by RLS, not secrecy). The project `.gitignore` should exclude `.env`.

---

## 3. Outstanding Risks and Recommendations

### 3.1 HIGH — No Server-Side Password Strength Enforcement

**Risk:** Password minimum length (8 chars) is only enforced client-side in `handleSignUp`. A raw API call bypasses this entirely. Supabase's default minimum is 6 characters.

**Recommendation:** Set a stronger minimum in the Supabase dashboard: **Authentication → Password → Minimum password length → 10** and enable **Have I Been Pwned** protection (Supabase supports this natively).

---

### 3.2 HIGH — No Email Format Validation

**Risk:** The sign-in and sign-up handlers only check `!email` (non-empty). A string like `"notanemail"` passes client validation and hits the Supabase API, which may return unhelpful errors.

**Recommendation:** Add a simple regex or use a library like `validator.js`:

```ts
// Simple, sufficient for most cases
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!EMAIL_RE.test(email.trim())) {
  Alert.alert("Enter a valid email address.");
  return;
}
```

---

### 3.3 MEDIUM — Username Exposed Directly in Profile Query

**Risk:** `CompassScreen` fetches `profiles.username` client-side with a plain `.select("username")`. If an attacker obtains another user's UUID (possible via Supabase Realtime subscription leakage), they could query that user's username.

**Recommendation:** Verify that `profiles` RLS only allows `auth.uid() = id`. This is already in place (migration 001), but add an integration test or Supabase dashboard RLS test to confirm it cannot be bypassed.

---

### 3.4 MEDIUM — Whitespace-Only Email Passes the `!email` Guard

**Risk:** `validateSignIn("   ", "password")` returns `null` (passes). The email is trimmed before hitting the API, so Supabase will reject it, but the error message will be a raw Supabase error rather than a friendly client validation message.

**Recommendation:** Validate the _trimmed_ email:

```ts
if (!email.trim() || !password) {
  Alert.alert("Fill in email and password.");
  return;
}
```

---

### 3.5 MEDIUM — No Rate Limiting on Auth Endpoints (Client Side)

**Risk:** The sign-in button can be tapped rapidly, sending many auth requests. Supabase has its own rate limits, but the client provides no protection (no debounce, no lockout UI).

**Recommendation:** Disable the submit button for a short period (e.g. 2 seconds) after each failed auth attempt, and surface the remaining cooldown to the user. For production, configure Supabase's built-in auth rate limits in the dashboard.

---

### 3.6 MEDIUM — `AsyncStorage` Stores the Session Token Unencrypted

**Risk:** On rooted Android or jailbroken iOS devices, `AsyncStorage` contents (including the Supabase JWT) can be read by other apps.

**Recommendation:** Use `expo-secure-store` (backed by the OS keychain / Keystore) instead of `AsyncStorage` for the Supabase session:

```ts
import * as SecureStore from "expo-secure-store";

// In createClient options:
storage: {
  getItem:    (key) => SecureStore.getItemAsync(key),
  setItem:    (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
},
```

---

### 3.7 MEDIUM — No Error Logging Service

**Risk:** `ErrorBoundary` logs to `console.error` in development and silently swallows errors in production. Crashes that happen between sessions are invisible.

**Recommendation:** Integrate [Sentry](https://sentry.io) for React Native:

```ts
// In componentDidCatch:
import * as Sentry from "@sentry/react-native";
Sentry.captureException(error);
```

---

### 3.8 LOW — `_nextId` Counter in `useXPToast` Is Module-Level Mutable State

**Risk:** The `let _nextId = 1` counter in `useXPToast.ts` persists across all hook instances in the same JS bundle. In tests this can cause ID collisions if module state is not reset between runs.

**Recommendation:** Move the counter inside the hook using a `useRef`, or use `crypto.randomUUID()` for IDs:

```ts
// Replace module-level counter
const idRef = useRef(0);
// In trackScores:
id: ++idRef.current,
```

---

### 3.9 LOW — No Content Security on `evidence_url`

**Risk:** `logs.evidence_url` is stored as a free-text string. If it is ever rendered as a clickable link (likely in a future feature), an attacker who controls their own account could store a `javascript:` URI.

**Recommendation:** Validate the URL scheme before rendering:

```ts
function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:";
  } catch {
    return false;
  }
}
```

---

### 3.10 LOW — EAS Project ID Hardcoded in `app.json`

**Risk:** The `extra.eas.projectId` in `app.json` is not a secret, but it ties this codebase to a specific EAS project. If the project is ever transferred or deleted, builds will fail.

**Recommendation:** No immediate action needed. Keep this in mind when rotating EAS projects.

---

## 4. Test Coverage Summary

The unit test suite (`npm test`) covers:

| Module | Tests | What Is Verified |
|---|---|---|
| `src/utils/synergy.ts` | 12 | Weighted formula, balance bonus, rounding, large values |
| `src/utils/pillarLevel.ts` | 11 | Level boundaries, xp range, progress ratio |
| `src/hooks/useLedger.ts` — `summarizeLedger` | 10 | Category segregation, netScore formula, decimals, large datasets |
| `src/services/stewardshipStats.ts` | 36 | `calcZakat` (9), `calcHealthScore` (8), `getHealthTier` (7), `buildMonthlyTrend` (7), `getLastNMonths` (5) |
| `src/hooks/useStreak.ts` — date logic | 15 | Empty, single, active streak, gaps, dedup, longest, loggedToday |
| `src/hooks/useXPToast.ts` | 15 | Delta detection, toast contents, removeToast, null guards |
| `src/components/ErrorBoundary.tsx` | 7 | Passthrough, fallback UI, reset, nested errors |
| `app/(auth)/index.tsx` — validation | 22 | Sign-in/up/forgot guards, username normalisation, duplicate detection |
| **Total** | **138** | **138 / 138 passing** |

Run the suite:

```bash
npm test                  # run once
npm run test:coverage     # generate coverage report in coverage/
```

---

## 5. Checklist for Production Readiness

- [ ] Set Supabase minimum password length ≥ 10 in dashboard
- [ ] Enable HaveIBeenPwned password check in Supabase dashboard
- [ ] Add email format validation in `app/(auth)/index.tsx`
- [ ] Validate trimmed email (not just non-empty raw string)
- [ ] Replace `AsyncStorage` with `expo-secure-store` for session storage
- [ ] Integrate Sentry (or equivalent) for crash reporting
- [ ] Verify `profiles` RLS cannot be bypassed with an Supabase integration test
- [ ] Add `Linking.canOpenURL` / scheme check before rendering `evidence_url`
- [ ] Confirm `.env` is in `.gitignore` and no secrets in source history
- [ ] Add end-to-end auth flow tests (Detox or similar) before v2 release
