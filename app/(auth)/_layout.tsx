import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function AuthLayout() {
  const userId = useAuthStore((s) => s.userId);
  const router = useRouter();

  // If a session already exists, skip auth and go straight to the app
  useEffect(() => {
    if (userId) router.replace("/(app)");
  }, [userId]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
