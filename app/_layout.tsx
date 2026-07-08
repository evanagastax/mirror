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

const queryClient = new QueryClient();

export default function RootLayout() {
  const setUserId = useAuthStore((s) => s.setUserId);
  const hydrate   = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();

    // Set up Android notification channels immediately
    setupAndroidChannels();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? undefined);
      // Apply notification schedule once we know auth state
      if (session?.user.id) {
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
        setUserId(session?.user.id ?? undefined);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUserId, hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="log/new" options={{ presentation: "modal" }} />
        <Stack.Screen name="github-sync" options={{ presentation: "card" }} />
        <Stack.Screen name="impact-roadmap" options={{ presentation: "card" }} />
        <Stack.Screen name="vessel-profile" options={{ presentation: "card" }} />
        <Stack.Screen name="vessel-plan" options={{ presentation: "card" }} />
        <Stack.Screen name="soul" options={{ presentation: "card" }} />
        <Stack.Screen name="stewardship-budget" options={{ presentation: "card" }} />
        <Stack.Screen name="notification-settings" options={{ presentation: "card" }} />
      </Stack>
    </QueryClientProvider>
  );
}
