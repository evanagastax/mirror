import { create } from "zustand";

type AuthState = {
  userId: string | undefined;
  setUserId: (id: string | undefined) => void;
};

/**
 * Populate this from supabase.auth.onAuthStateChange in your root layout
 * (e.g. app/_layout.tsx), so userId is available app-wide without prop
 * drilling it into every screen.
 */
export const useAuthStore = create<AuthState>((set) => ({
  userId: undefined,
  setUserId: (id) => set({ userId: id }),
}));
