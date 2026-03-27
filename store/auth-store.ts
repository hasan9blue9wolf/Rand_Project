import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import type { AuthSession } from "../features/auth/types";

type AuthState = {
  demoSession: AuthSession | null;
  initialized: boolean;
  session: Session | null;
  setDemoSession: (session: AuthSession | null) => void;
  setInitialized: (initialized: boolean) => void;
  setSession: (session: Session | null) => void;
  user: User | null;
};

export const useAuthStore = create<AuthState>()((set) => ({
  demoSession: null,
  initialized: false,
  session: null,
  setDemoSession: (demoSession) => set({ demoSession }),
  setInitialized: (initialized) => set({ initialized }),
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
  user: null,
}));

export const selectActiveUserId = (state: AuthState) =>
  state.user?.id ?? state.demoSession?.userId ?? null;
