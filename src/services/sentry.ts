/**
 * Sentry initialisation and helpers.
 *
 * Call `initSentry()` once at app startup (root layout).
 * Use `captureError(err, ctx)` anywhere you want to report a caught exception.
 * Use `setSentryUser(id)` / `clearSentryUser()` to attach the auth user to events.
 *
 * DSN is read from EXPO_PUBLIC_SENTRY_DSN so it stays out of source code.
 * Sentry is silently disabled when:
 *   - The DSN env var is not set (local dev)
 *   - Running on web (Sentry RN is a native-only SDK)
 *   - Running in unit tests (module is mocked)
 */

import { Platform } from "react-native";

// @sentry/react-native is resolved to an empty module on web via metro.config.js,
// so this dynamic import is safe. We type it loosely to avoid pulling in the
// @sentry/react-native type definitions on web.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

let _initialised = false;

export function initSentry() {
  // Sentry React Native SDK has no web support — skip entirely on web.
  if (Platform.OS === "web") return;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // No DSN configured — skip initialisation.
    // Expected in local dev until the project is connected to Sentry.
    return;
  }

  // Lazy-require so the module isn't evaluated during the web bundle parse.
   
  Sentry = require("@sentry/react-native");

  Sentry.init({
    dsn,
    // Send 100% of errors, 10% of performance traces.
    tracesSampleRate: 0.1,
    _experiments: { replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0.5 },
    ignoreErrors: [
      "Network request failed",
      "Load failed",
      "AbortError",
    ],
    environment: __DEV__ ? "development" : "production",
  });

  _initialised = true;
}

/**
 * Report a caught exception.
 * Safe to call even when Sentry is not initialised or on web.
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  if (!_initialised || !Sentry) {
    if (__DEV__) console.error("[Sentry disabled]", error, context);
    return;
  }
  Sentry.withScope((scope: any) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

/**
 * Attach the authenticated user ID to all subsequent Sentry events.
 */
export function setSentryUser(userId: string) {
  if (!_initialised || !Sentry) return;
  Sentry.setUser({ id: userId });
}

/**
 * Clear the user from Sentry scope on sign-out.
 */
export function clearSentryUser() {
  if (!_initialised || !Sentry) return;
  Sentry.setUser(null);
}
