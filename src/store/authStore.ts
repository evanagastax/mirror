import { create } from "zustand";

type AuthState = {
  userId: string | undefined;
  /**
   * True once the first supabase.auth.getSession() call has resolved.
   * Guards in (app) and (auth) layouts must wait for this before
   * redirecting, otherwise they fire before the persisted session
   * is restored from AsyncStorage and always see userId as undefined.
   */
  isHydrated: boolean;
  setUserId: (id: string | undefined) => void;
  setHydrated: () => void;
};

/**
 * Populate this from supabase.auth.onAuthStateChange in your root layout
 * (e.g. app/_layout.tsx), so userId is available app-wide without prop
 * drilling it into every screen.
 */
export const useAuthStore = create<AuthState>((set) => ({
  userId: undefined,
  isHydrated: false,
  setUserId:  (id) => set({ userId: id }),
  setHydrated: ()  => set({ isHydrated: true }),
}));
