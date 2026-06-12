import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthOnboardingPayload } from "../features/auth/types";
import { appStorage } from "../services/storage";

type TravelPreferencesState = {
  guestModeEnabled: boolean;
  onboardingCompleted: boolean;
  preferences: AuthOnboardingPayload | null;
  resetPreferences: () => void;
  setGuestModeEnabled: (enabled: boolean) => void;
  setOnboardingPreferences: (payload: AuthOnboardingPayload) => void;
};

export const useTravelPreferencesStore = create<TravelPreferencesState>()(
  persist(
    (set) => ({
      guestModeEnabled: false,
      onboardingCompleted: false,
      preferences: null,
      resetPreferences: () =>
        set({
          guestModeEnabled: false,
          onboardingCompleted: false,
          preferences: null,
        }),
      setGuestModeEnabled: (enabled) => set({ guestModeEnabled: enabled }),
      setOnboardingPreferences: (payload) =>
        set({
          onboardingCompleted: true,
          preferences: payload,
        }),
    }),
    {
      name: "hayatrip-travel-preferences",
      storage: appStorage,
    },
  ),
);
