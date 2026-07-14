/**
 * Sentry initialisation and helpers.
 *
 * Call `initSentry()` once at app startup (root layout).
 * Use `captureError(err, ctx)` anywhere you want to report a caught exception.
 * Use `setSentryUser(id)` / `clearSentryUser()` to attach the auth user to events.
 *
 * DSN is read from EXPO_PUBLIC_SENTRY_DSN so it stays out of source code.
 * Sentry is silently disabled when the DSN is not set (e.g. local dev without
 * the variable, or in unit tests).
 */

import * as Sentry from "@sentry/react-native";

let _initialised = false;

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // No DSN configured — skip initialisation.
    // This is expected in local dev until the project is connected to Sentry.
    return;
  }

  Sentry.init({
    dsn,
    // Send 100 % of errors but only 10 % of performance traces.
    // Adjust tracesSampleRate upward once you have baseline data.
    tracesSampleRate: 0.1,
    // Mask all text content in session replays to protect user data.
    _experiments: { replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0.5 },
    // Ignore known non-fatal network noise
    ignoreErrors: [
      "Network request failed",
      "Load failed",
      "AbortError",
    ],
    // Tag every event with the app environment
    environment: __DEV__ ? "development" : "production",
  });

  _initialised = true;
}

/**
 * Report a caught exception.
 * Safe to call even if Sentry was not initialised.
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  if (!_initialised) {
    // Still log to console in dev so nothing is silently swallowed
    if (__DEV__) console.error("[Sentry disabled]", error, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

/**
 * Attach the authenticated user ID to all subsequent Sentry events.
 * Call this after a successful sign-in.
 */
export function setSentryUser(userId: string) {
  if (!_initialised) return;
  Sentry.setUser({ id: userId });
}

/**
 * Clear the user from Sentry scope on sign-out.
 */
export function clearSentryUser() {
  if (!_initialised) return;
  Sentry.setUser(null);
}
