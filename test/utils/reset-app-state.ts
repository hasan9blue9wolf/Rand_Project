import {
  defaultTravelDiscoveryFilters,
  defaultTravelSearchRequest,
} from "../../features/catalog/data/catalog.mock";
import type { TravelDiscoveryFilters } from "../../features/catalog/types";
import { defaultNotificationPreferences } from "../../features/notifications/types";
import { useAuthStore } from "../../store/auth-store";
import { useDemoBookingsStore } from "../../store/demo-bookings-store";
import { useDemoModeStore } from "../../store/demo-mode-store";
import { useNotificationsStore } from "../../store/notifications-store";
import { useSettingsStore } from "../../store/settings-store";
import { useTravelDiscoveryStore } from "../../store/travel-discovery-store";
import { useTravelPreferencesStore } from "../../store/travel-preferences-store";
import { useTutorialStore } from "../../store/tutorial-store";

const cloneDiscoveryFilters = (): TravelDiscoveryFilters => ({
  ...defaultTravelDiscoveryFilters,
  durationRange: { ...defaultTravelDiscoveryFilters.durationRange },
  hotelClasses: [...defaultTravelDiscoveryFilters.hotelClasses],
  priceRange: { ...defaultTravelDiscoveryFilters.priceRange },
  themes: [...defaultTravelDiscoveryFilters.themes],
});

const cloneDefaultSearch = () => ({
  ...defaultTravelSearchRequest,
});

export const resetAllStores = async () => {
  await Promise.all([
    useSettingsStore.persist.clearStorage(),
    useDemoBookingsStore.persist.clearStorage(),
    useDemoModeStore.persist.clearStorage(),
    useTravelPreferencesStore.persist.clearStorage(),
    useTutorialStore.persist.clearStorage(),
    useNotificationsStore.persist.clearStorage(),
  ]);

  useSettingsStore.setState({
    language: "en",
    notificationPermissionStatus: "unknown",
    notificationPreferences: { ...defaultNotificationPreferences },
    notificationsEnabled: true,
  });

  useAuthStore.setState({
    demoSession: null,
    initialized: false,
    session: null,
    user: null,
  });

  useDemoModeStore.setState({
    authSession: null,
    profile: null,
    savedDestinations: [],
    travelPreferences: null,
  });

  useDemoBookingsStore.setState({
    bookings: [],
  });

  useTravelPreferencesStore.setState({
    guestModeEnabled: false,
    onboardingCompleted: false,
    preferences: null,
  });

  useTutorialStore.setState({
    completed: false,
  });

  useNotificationsStore.setState({
    notifications: [],
    unreadCount: 0,
  });

  const defaultSearch = cloneDefaultSearch();

  useTravelDiscoveryStore.setState({
    draftSearch: defaultSearch,
    filters: cloneDiscoveryFilters(),
    sort: "recommended",
    submittedSearch: defaultSearch,
  });
};
