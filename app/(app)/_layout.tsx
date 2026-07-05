import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "../../src/store/authStore";

export default function AppLayout() {
  const userId = useAuthStore((s) => s.userId);
  const router = useRouter();

  useEffect(() => {
    if (!userId) router.replace("/(auth)");
  }, [userId]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#f0f0f0",
          borderTopWidth: 1,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#ccc",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
      }}
    >
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
        name="roadmap"
        options={{
          title: "Roadmap",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◈</Text>,
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: "Ledger",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>₿</Text>,
        }}
      />
      <Tabs.Screen
        name="fellowship"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◉</Text>,
        }}
      />
    </Tabs>
  );
}
