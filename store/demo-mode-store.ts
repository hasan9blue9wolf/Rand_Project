import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession } from "../features/auth/types";
import type { TravelPreferences, UserProfile } from "../features/profile/types";
import type { SavedDestination } from "../features/saved/types";
import { appStorage } from "../services/storage";

type DemoModeState = {
  authSession: AuthSession | null;
  profile: UserProfile | null;
  resetDemoData: () => void;
  savedDestinations: SavedDestination[];
  setAuthSession: (session: AuthSession | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSavedDestinations: (destinations: SavedDestination[]) => void;
  setTravelPreferences: (preferences: TravelPreferences | null) => void;
  travelPreferences: TravelPreferences | null;
};

const initialDemoModeState = {
  authSession: null,
  profile: null,
  savedDestinations: [] as SavedDestination[],
  travelPreferences: null,
} as const;

export const useDemoModeStore = create<DemoModeState>()(
  persist(
    (set) => ({
      ...initialDemoModeState,
      resetDemoData: () => set(initialDemoModeState),
      setAuthSession: (authSession) => set({ authSession }),
      setProfile: (profile) => set({ profile }),
      setSavedDestinations: (savedDestinations) => set({ savedDestinations }),
      setTravelPreferences: (travelPreferences) => set({ travelPreferences }),
    }),
    {
      name: "travelgenious-demo-mode",
      storage: appStorage,
    },
  ),
);
