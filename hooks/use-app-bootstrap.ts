import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { startTransition, useEffect, useState } from "react";
import { InteractionManager } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { bootstrapDemoAuthSession } from "../features/auth/services/demo-auth.service";
import {
  cancelHayaTripsScheduledNotificationsAsync,
  getNotificationPermissionStateAsync,
  syncLocalTravelNotificationsAsync,
} from "../features/notifications/services/expo-notifications.service";
import i18n from "../services/i18n";
import { isDemoModeEnabled } from "../services/runtime/app-mode";
import { bootstrapSupabaseAuth } from "../services/supabase/auth";
import { useSettingsStore } from "../store/settings-store";
import { syncRTLDirection } from "../utils/rtl";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const APP_SYSTEM_BACKGROUND = "#F6F9FC";

export const useAppBootstrap = () => {
  const {
    language,
    notificationsEnabled,
    notificationPreferences,
    setNotificationPermissionStatus,
  } = useSettingsStore(
    useShallow((state) => ({
      language: state.language,
      notificationPreferences: state.notificationPreferences,
      notificationsEnabled: state.notificationsEnabled,
      setNotificationPermissionStatus: state.setNotificationPermissionStatus,
    })),
  );
  const [hydrated, setHydrated] = useState(
    useSettingsStore.persist.hasHydrated(),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = useSettingsStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );

    setHydrated(useSettingsStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const bootstrapTasks: Promise<unknown>[] = [
          i18n.changeLanguage(language),
          syncRTLDirection(language),
        ];

        if (isDemoModeEnabled()) {
          bootstrapTasks.push(bootstrapDemoAuthSession());
        } else {
          bootstrapTasks.push(bootstrapSupabaseAuth());
        }

        await SystemUI.setBackgroundColorAsync(APP_SYSTEM_BACKGROUND).catch(
          () => undefined,
        );
        await Promise.all(bootstrapTasks);
      } catch {
        // Investor/demo builds should still start even if optional bootstrap work fails.
      } finally {
        if (!mounted) {
          return;
        }

        startTransition(() => {
          setReady(true);
        });
        await SplashScreen.hideAsync().catch(() => undefined);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [hydrated, language]);

  useEffect(() => {
    if (!hydrated || !ready) {
      return;
    }

    let mounted = true;
    let interactionHandle: { cancel: () => void } | undefined;

    const syncNotifications = async () => {
      try {
        const permissionStatus = await getNotificationPermissionStateAsync();

        if (!mounted) {
          return;
        }

        setNotificationPermissionStatus(permissionStatus);

        if (!notificationsEnabled || permissionStatus !== "granted") {
          await cancelHayaTripsScheduledNotificationsAsync();
          return;
        }

        await syncLocalTravelNotificationsAsync({
          locale: language,
          notificationPreferences,
          notificationsEnabled,
        });
      } catch {
        // Notification availability differs by platform and build type. Ignore boot-time failures.
      }
    };

    interactionHandle = InteractionManager.runAfterInteractions(() => {
      void syncNotifications();
    });

    return () => {
      mounted = false;
      interactionHandle?.cancel();
    };
  }, [
    hydrated,
    language,
    notificationPreferences,
    notificationsEnabled,
    ready,
    setNotificationPermissionStatus,
  ]);

  return {
    ready,
  };
};
