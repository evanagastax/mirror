import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useThemeStore } from "../../src/store/themeStore";

export default function AppLayout() {
  const userId = useAuthStore((s) => s.userId);
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);

  useEffect(() => {
    if (!userId) router.replace("/(auth)");
  }, [userId]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
      }}
    >
      {/* ── Visible tabs (3) ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Compass",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◎</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◷</Text>,
        }}
      />
      <Tabs.Screen
        name="fellowship"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◉</Text>,
        }}
      />

      {/* ── Hidden routes — reachable via navigation, not tab bar ── */}
      <Tabs.Screen name="vessel"     options={{ href: null }} />
      <Tabs.Screen name="ledger"     options={{ href: null }} />
      <Tabs.Screen name="roadmap"    options={{ href: null }} />
      <Tabs.Screen name="impact"     options={{ href: null }} />
    </Tabs>
  );
}
