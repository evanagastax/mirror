import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function AuthLayout() {
  const userId     = useAuthStore((s) => s.userId);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router     = useRouter();

  // Only redirect once the persisted session has been restored.
  // Without this guard, userId is always undefined on first render
  // so logged-in users never get redirected to the app.
  useEffect(() => {
    if (isHydrated && userId) router.replace("/(app)");
  }, [isHydrated, userId]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
