import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Platform } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { queryKeys } from "../../../constants/query-keys";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { useSettingsStore } from "../../../store/settings-store";
import type { AppLocale } from "../../../types/i18n";
import {
  cancelHayaTripsScheduledNotificationsAsync,
  getHayaTripsScheduledNotificationsAsync,
  getNotificationCapabilitySnapshotAsync,
  requestLocalNotificationPermissionsAsync,
  syncLocalTravelNotificationsAsync,
} from "../../notifications/services/expo-notifications.service";
import {
  type NotificationPreferenceId,
  notificationPreferenceIds,
  type ScheduledTravelNotificationCategory,
} from "../../notifications/types";
import { settingsScreenMock } from "../data/settings.mock";
import { getSettingsScreenData } from "../services/settings.service";

const notificationKindLabelKeyMap: Record<
  ScheduledTravelNotificationCategory,
  string
> = {
  aiPrompt: "settingsScreen.notificationKinds.aiPrompt",
  bookingMilestone: "settingsScreen.notificationKinds.bookingMilestone",
  savedOfferAlert: "settingsScreen.notificationKinds.savedOfferAlert",
  travelChecklist: "settingsScreen.notificationKinds.travelChecklist",
  tripReminder: "settingsScreen.notificationKinds.tripReminder",
};

export const useSettingsScreen = () => {
  const settingsQuery = useQuery({
    placeholderData: settingsScreenMock,
    queryKey: queryKeys.settings,
    queryFn: getSettingsScreenData,
  });
  const capabilityQuery = useQuery({
    queryKey: queryKeys.notificationCapability,
    queryFn: getNotificationCapabilitySnapshotAsync,
  });
  const scheduledNotificationsQuery = useQuery({
    queryKey: queryKeys.notificationsScheduled,
    queryFn: getHayaTripsScheduledNotificationsAsync,
  });
  const screenData = settingsQuery.data ?? settingsScreenMock;
  const { formatDate, t } = useLocalization();
  const { changeLanguage, isRTL, language } = useAppLanguage();
  const {
    notificationsEnabled,
    notificationPermissionStatus,
    notificationPreferences,
    setNotificationPermissionStatus,
    setNotificationPreference,
    setNotificationsEnabled,
  } = useSettingsStore(
    useShallow((state) => ({
      notificationPermissionStatus: state.notificationPermissionStatus,
      notificationPreferences: state.notificationPreferences,
      notificationsEnabled: state.notificationsEnabled,
      setNotificationPermissionStatus: state.setNotificationPermissionStatus,
      setNotificationPreference: state.setNotificationPreference,
      setNotificationsEnabled: state.setNotificationsEnabled,
    })),
  );
  const [busyLocale, setBusyLocale] = useState<AppLocale | null>(null);
  const [busyNotifications, setBusyNotifications] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        return;
      }

      void capabilityQuery.refetch();
      void scheduledNotificationsQuery.refetch();
    });

    return () => {
      subscription.remove();
    };
  }, [capabilityQuery, scheduledNotificationsQuery]);

  useEffect(() => {
    if (!capabilityQuery.data?.permissionsStatus) {
      return;
    }

    setNotificationPermissionStatus(capabilityQuery.data.permissionsStatus);
  }, [
    capabilityQuery.data?.permissionsStatus,
    setNotificationPermissionStatus,
  ]);

  const handleLanguageChange = useCallback(
    async (nextLanguage: AppLocale) => {
      setBusyLocale(nextLanguage);

      try {
        await changeLanguage(nextLanguage);
      } finally {
        setBusyLocale(null);
      }
    },
    [changeLanguage],
  );

  const refreshNotificationQueries = useCallback(async () => {
    const [capabilityResult, scheduledResult] = await Promise.all([
      capabilityQuery.refetch(),
      scheduledNotificationsQuery.refetch(),
    ]);

    return {
      capability: capabilityResult.data,
      scheduled: scheduledResult.data ?? [],
    };
  }, [capabilityQuery, scheduledNotificationsQuery]);

  const handleNotificationsToggle = useCallback(
    async (nextValue: boolean) => {
      setBusyNotifications(true);

      try {
        if (!nextValue) {
          setNotificationsEnabled(false);
          await cancelHayaTripsScheduledNotificationsAsync();
          return;
        }

        const permissionsStatus =
          await requestLocalNotificationPermissionsAsync();

        setNotificationPermissionStatus(permissionsStatus);

        if (permissionsStatus !== "granted") {
          setNotificationsEnabled(true);
          await cancelHayaTripsScheduledNotificationsAsync();
          return;
        }

        setNotificationsEnabled(true);
        await syncLocalTravelNotificationsAsync({
          locale: language,
          notificationPreferences,
          notificationsEnabled: true,
        });
      } finally {
        await refreshNotificationQueries();
        setBusyNotifications(false);
      }
    },
    [
      language,
      notificationPreferences,
      refreshNotificationQueries,
      setNotificationPermissionStatus,
      setNotificationsEnabled,
    ],
  );

  const handleNotificationPreferenceChange = useCallback(
    async (preferenceId: NotificationPreferenceId, value: boolean) => {
      const nextPreferences = {
        ...notificationPreferences,
        [preferenceId]: value,
      };

      setNotificationPreference(preferenceId, value);

      if (!notificationsEnabled) {
        return;
      }

      setBusyNotifications(true);

      try {
        await syncLocalTravelNotificationsAsync({
          locale: language,
          notificationPreferences: nextPreferences,
          notificationsEnabled,
        });
      } finally {
        await refreshNotificationQueries();
        setBusyNotifications(false);
      }
    },
    [
      language,
      notificationPreferences,
      notificationsEnabled,
      refreshNotificationQueries,
      setNotificationPreference,
    ],
  );

  const handleOpenSystemSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const resolvedPermissionStatus =
    capabilityQuery.data?.permissionsStatus ?? notificationPermissionStatus;
  const scheduledNotifications = scheduledNotificationsQuery.data ?? [];
  const scheduledPreviewItems = scheduledNotifications
    .slice(0, 3)
    .map((item) => ({
      dateLabel: formatDate(item.date, {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        weekday: "short",
      }),
      id: item.id,
      kindLabel: t(notificationKindLabelKeyMap[item.category]),
      title: item.title,
    }));
  const notificationPreferenceItems = notificationPreferenceIds.map((id) => ({
    description: t(`settingsScreen.preferenceLabels.${id}.body`),
    id,
    title: t(`settingsScreen.preferenceLabels.${id}.title`),
    value: notificationPreferences[id],
  }));
  const supportsLocalNotifications =
    capabilityQuery.data?.supportsLocalNotifications ?? Platform.OS !== "web";
  const pushPreparation = capabilityQuery.data?.pushPreparation ?? {
    hasExpoProjectId: false,
    strategy: "expo-notifications" as const,
  };

  return {
    busyLocale,
    busyNotifications,
    canAskAgain:
      capabilityQuery.data?.canAskAgain ??
      resolvedPermissionStatus !== "denied",
    capabilityQuery,
    handleLanguageChange,
    handleNotificationPreferenceChange,
    handleNotificationsToggle,
    handleOpenSystemSettings,
    isRTL,
    language,
    notificationPermissionStatus: resolvedPermissionStatus,
    notificationPreferenceItems,
    notificationsEnabled,
    pushPreparation,
    scheduledPreviewItems,
    scheduledSummary: t("settingsScreen.scheduledSummary", {
      count:
        capabilityQuery.data?.scheduledCount ?? scheduledNotifications.length,
    }),
    scheduledSummaryCount:
      capabilityQuery.data?.scheduledCount ?? scheduledNotifications.length,
    scheduledSummaryEmpty: scheduledNotifications.length === 0,
    settingsQuery,
    shortcutIds: screenData.shortcutIds,
    supportsLocalNotifications,
    t,
  };
};
