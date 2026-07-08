import React, { useEffect } from "react";
import { Tabs, useRouter, usePathname } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/authStore";
import { useThemeStore } from "../../src/store/themeStore";

const TABS = [
  { name: "index",      route: "/(app)",          label: "Compass",  icon: "◎" },
  { name: "history",    route: "/(app)/history",   label: "Activity", icon: "◷" },
  { name: "fellowship", route: "/(app)/fellowship", label: "Profile",  icon: "◉" },
] as const;

export default function AppLayout() {
  const userId = useAuthStore((s) => s.userId);
  const router = useRouter();
  const pathname = usePathname();
  const colors = useThemeStore((s) => s.colors);

  useEffect(() => {
    if (!userId) router.replace("/(auth)");
  }, [userId]);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar colors={colors} pathname={pathname} router={router} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="fellowship" />
      {/* Hidden routes */}
      <Tabs.Screen name="vessel"   options={{ href: null }} />
      <Tabs.Screen name="ledger"   options={{ href: null }} />
      <Tabs.Screen name="roadmap"  options={{ href: null }} />
      <Tabs.Screen name="impact"   options={{ href: null }} />
    </Tabs>
  );
}

function CustomTabBar({
  colors,
  pathname,
  router,
}: {
  colors: ReturnType<typeof useThemeStore.getState>["colors"];
  pathname: string;
  router: ReturnType<typeof useRouter>;
}) {
  // Which tab is active
  function isActive(name: string) {
    if (name === "index") return pathname === "/" || pathname === "/(app)" || pathname === "/(app)/index";
    return pathname.includes(name);
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safeArea, { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder }]}
    >
      <View style={styles.tabRow}>
        {/* Left two tabs */}
        {TABS.slice(0, 2).map((tab) => {
          const active = isActive(tab.name);
          return (
            <Pressable
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
              android_ripple={{ color: colors.border, borderless: false, radius: 40 }}
            >
              <View style={[styles.iconWrap, active && { backgroundColor: colors.bgSubtle }]}>
                <Text style={[styles.tabIcon, { color: active ? colors.tabActive : colors.tabInactive }]}>
                  {tab.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.tabActive : colors.tabInactive },
                  active && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Center FAB — Log */}
        <View style={styles.fabWrap}>
          <Pressable
            onPress={() => router.push("/log/new")}
            style={[styles.fab, { backgroundColor: colors.tabActive }]}
            android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true, radius: 30 }}
          >
            <Text style={[styles.fabIcon, { color: colors.tabBar }]}>+</Text>
          </Pressable>
          <Text style={[styles.fabLabel, { color: colors.tabInactive }]}>Log</Text>
        </View>

        {/* Right tab */}
        {TABS.slice(2).map((tab) => {
          const active = isActive(tab.name);
          return (
            <Pressable
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
              android_ripple={{ color: colors.border, borderless: false, radius: 40 }}
            >
              <View style={[styles.iconWrap, active && { backgroundColor: colors.bgSubtle }]}>
                <Text style={[styles.tabIcon, { color: active ? colors.tabActive : colors.tabInactive }]}>
                  {tab.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.tabActive : colors.tabInactive },
                  active && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 3,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontWeight: "500", letterSpacing: 0.2 },
  tabLabelActive: { fontWeight: "700" },

  // FAB
  fabWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    gap: 3,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  fabIcon: { fontSize: 26, lineHeight: 30, fontWeight: "300" },
  fabLabel: { fontSize: 10, fontWeight: "500", letterSpacing: 0.2 },
});
