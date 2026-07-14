import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "../src/api/supabase";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";
import {
  loadNotifSettings,
  applyNotificationSettings,
  setupAndroidChannels,
} from "../src/services/notificationService";
import { clearStaleExerciseCache } from "../src/utils/offlineCache";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { OfflineBanner } from "../src/components/OfflineBanner";
import { initSentry, setSentryUser, clearSentryUser } from "../src/services/sentry";

// Initialise Sentry before anything else renders.
// Safe to call multiple times — subsequent calls are no-ops once initialised.
initSentry();

const queryClient = new QueryClient();

export default function RootLayout() {
  const setUserId  = useAuthStore((s) => s.setUserId);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const hydrate   = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();

    // Clear any stale exercise data cached from the old broken API source
    clearStaleExerciseCache();

    // Set up Android notification channels immediately
    setupAndroidChannels();

    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user.id ?? undefined;
      setUserId(uid);
      setHydrated();
      // Attach user to Sentry on initial session restore
      if (uid) setSentryUser(uid);
      // Apply notification schedule once we know auth state
      if (uid) {
        loadNotifSettings().then((settings) => {
          // Prayer times not available at this point — only schedule
          // reminder + streak. Prayer times get rescheduled from SoulScreen
          // when the user opens it and prayer data loads.
          applyNotificationSettings(settings, undefined).catch(console.warn);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const uid = session?.user.id ?? undefined;
        setUserId(uid);
        // Keep Sentry's user context in sync so crash reports are identifiable
        if (uid) setSentryUser(uid);
        else      clearSentryUser();
      }
    );

    return () => subscription.unsubscribe();
  }, [setUserId, hydrate]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="log/new" options={{ presentation: "modal" }} />
          <Stack.Screen name="impact-roadmap" options={{ presentation: "card" }} />
          <Stack.Screen name="vessel-profile" options={{ presentation: "card" }} />
          <Stack.Screen name="vessel-plan" options={{ presentation: "card" }} />
          <Stack.Screen name="soul" options={{ presentation: "card" }} />
          <Stack.Screen name="stewardship-budget" options={{ presentation: "card" }} />
          <Stack.Screen name="notification-settings" options={{ presentation: "card" }} />
        </Stack>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
