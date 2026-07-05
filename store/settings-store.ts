import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  defaultNotificationPreferences,
  type NotificationPermissionState,
  type NotificationPreferenceId,
  type NotificationPreferences,
} from "../features/notifications/types";
import { getDeviceLocale } from "../services/i18n";
import { appStorage } from "../services/storage";
import type { AppLocale } from "../types/i18n";

type SettingsState = {
  language: AppLocale;
  notificationPermissionStatus: NotificationPermissionState;
  notificationPreferences: NotificationPreferences;
  notificationsEnabled: boolean;
  setNotificationPermissionStatus: (
    status: NotificationPermissionState,
  ) => void;
  setNotificationPreference: (
    preferenceId: NotificationPreferenceId,
    value: boolean,
  ) => void;
  setLanguage: (language: AppLocale) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleNotifications: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: getDeviceLocale(),
      notificationPermissionStatus: "unknown",
      notificationPreferences: defaultNotificationPreferences,
      notificationsEnabled: true,
      setNotificationPermissionStatus: (notificationPermissionStatus) =>
        set({ notificationPermissionStatus }),
      setNotificationPreference: (preferenceId, value) =>
        set((state) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            [preferenceId]: value,
          },
        })),
      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
    }),
    {
      name: "hayatrips-settings",
      storage: appStorage,
    },
  ),
);
