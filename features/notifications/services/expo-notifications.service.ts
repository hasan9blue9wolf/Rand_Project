import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { featuredOffers, upcomingTrips } from "../../../constants/mock-data";
import i18n, { normalizeLocale } from "../../../services/i18n";
import {
  formatCurrencyByLocale,
  formatDateByLocale,
} from "../../../services/i18n/localization";
import type { AppLocale } from "../../../types/i18n";
import {
  bookingRecordsById,
  tripToBookingMap,
} from "../../booking/data/booking.mock";
import type {
  NotificationCapabilitySnapshot,
  NotificationPermissionState,
  NotificationPreferences,
  PushPreparationState,
  ScheduledTravelNotification,
  ScheduledTravelNotificationCategory,
} from "../types";

const TRAVELGENIOUS_SCOPE = "travelgenious" as const;
const TRAVELGENIOUS_CHANNEL_ID = "travel-updates";
const HOUR_IN_MS = 1000 * 60 * 60;
const MINIMUM_LEAD_IN_MS = 1000 * 60 * 10;
const notificationsSupported =
  Platform.OS === "android" || Platform.OS === "ios";

if (notificationsSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      // Android foreground notifications need sound enabled to show a drop-down alert.
      shouldPlaySound: Platform.OS === "android",
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

type TravelgeniousNotificationData = {
  category: ScheduledTravelNotificationCategory;
  scheduledFor: string;
  scope: typeof TRAVELGENIOUS_SCOPE;
  url?: string;
};

type PermissionSnapshot = {
  canAskAgain: boolean;
  permissionsStatus: NotificationPermissionState;
};

const notificationCategories = new Set<ScheduledTravelNotificationCategory>([
  "tripReminder",
  "aiPrompt",
  "savedOfferAlert",
  "bookingMilestone",
  "travelChecklist",
]);

const parseTripDate = (value: string) => {
  const [year, month, day] = value.split("-").map((segment) => Number(segment));

  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day);
};

const withTime = (value: string, hour: number, minute: number) => {
  const date = parseTripDate(value);

  date.setHours(hour, minute, 0, 0);
  return date;
};

const ensureFutureDate = (candidate: Date, fallbackHours: number) => {
  const fallbackDate = new Date(Date.now() + fallbackHours * HOUR_IN_MS);

  if (Number.isNaN(candidate.getTime())) {
    return fallbackDate;
  }

  return candidate.getTime() > Date.now() + MINIMUM_LEAD_IN_MS
    ? candidate
    : fallbackDate;
};

const resolveTripLeadDate = (
  tripDate: string,
  daysBefore: number,
  hour: number,
  minute: number,
  fallbackHours: number,
) => {
  const candidate = withTime(tripDate, hour, minute);

  candidate.setDate(candidate.getDate() - daysBefore);
  return ensureFutureDate(candidate, fallbackHours);
};

const mapPermissionStatus = (
  value?: string | null,
): NotificationPermissionState => {
  if (value === "granted" || value === "denied" || value === "undetermined") {
    return value;
  }

  return "unknown";
};

const getPermissionSnapshotAsync = async (): Promise<PermissionSnapshot> => {
  if (!notificationsSupported) {
    return {
      canAskAgain: false,
      permissionsStatus: "unknown",
    };
  }

  try {
    const permissions = await Notifications.getPermissionsAsync();

    return {
      canAskAgain: permissions.canAskAgain,
      permissionsStatus: mapPermissionStatus(permissions.status),
    };
  } catch {
    return {
      canAskAgain: false,
      permissionsStatus: "unknown",
    };
  }
};

const isTravelgeniousNotificationData = (
  value: unknown,
): value is TravelgeniousNotificationData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TravelgeniousNotificationData>;

  return (
    candidate.scope === TRAVELGENIOUS_SCOPE &&
    typeof candidate.scheduledFor === "string" &&
    typeof candidate.category === "string" &&
    notificationCategories.has(
      candidate.category as ScheduledTravelNotificationCategory,
    )
  );
};

const mapScheduledRequest = (
  request: Notifications.NotificationRequest,
): ScheduledTravelNotification | null => {
  if (!isTravelgeniousNotificationData(request.content.data)) {
    return null;
  }

  const data = request.content.data;

  return {
    body: request.content.body ?? "",
    category: data.category,
    date: data.scheduledFor,
    ...(typeof data.url === "string" ? { deepLink: data.url } : {}),
    id: request.identifier,
    scope: TRAVELGENIOUS_SCOPE,
    ...(request.content.subtitle ? { subtitle: request.content.subtitle } : {}),
    title: request.content.title ?? "",
  };
};

const getTripDurationInDays = (startDate: string, endDate: string) => {
  const start = parseTripDate(startDate);
  const end = parseTripDate(endDate);
  const duration =
    Math.round((end.getTime() - start.getTime()) / (24 * HOUR_IN_MS)) + 1;

  return Math.max(duration, 1);
};

const getPrimaryTripBooking = (tripId: string) => {
  if (!(tripId in tripToBookingMap)) {
    return null;
  }

  const bookingId = tripToBookingMap[tripId as keyof typeof tripToBookingMap];

  return bookingRecordsById[bookingId] ?? null;
};

const getPushPreparationState = (): PushPreparationState => {
  const projectId = Constants.easConfig?.projectId?.trim();

  return {
    hasExpoProjectId: Boolean(projectId),
    ...(projectId ? { projectId } : {}),
    strategy: "expo-notifications",
  };
};

export const ensureNotificationChannelsAsync = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(TRAVELGENIOUS_CHANNEL_ID, {
    description: "Trip reminders, Heia prompts, and concierge alerts.",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#0F49BD",
    name: "Travel updates",
    showBadge: true,
    vibrationPattern: [0, 180, 80, 180],
  });
};

export const getNotificationPermissionStateAsync = async () =>
  (await getPermissionSnapshotAsync()).permissionsStatus;

export const requestLocalNotificationPermissionsAsync = async () => {
  if (!notificationsSupported) {
    return "unknown" as const;
  }

  try {
    const permissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });

    return mapPermissionStatus(permissions.status);
  } catch {
    return "unknown" as const;
  }
};

export const buildLocalReminderTemplates = (
  localeInput?: AppLocale,
): ScheduledTravelNotification[] => {
  const locale = normalizeLocale(localeInput ?? i18n.language);
  const prioritizedTrips = [...upcomingTrips]
    .filter((trip) => trip.status !== "wishlist")
    .sort(
      (leftTrip, rightTrip) =>
        parseTripDate(leftTrip.startDate).getTime() -
        parseTripDate(rightTrip.startDate).getTime(),
    );
  const nextTrip = prioritizedTrips[0];
  const planningTrip =
    prioritizedTrips.find((trip) => trip.status === "planning") ?? nextTrip;
  const featuredOffer = featuredOffers[0];
  const templates: ScheduledTravelNotification[] = [];

  if (nextTrip) {
    templates.push({
      body: i18n.t("notificationTemplates.tripReminder.body", {
        date: formatDateByLocale(nextTrip.startDate, locale, {
          day: "numeric",
          month: "short",
          weekday: "short",
        }),
        destination: nextTrip.destination,
      }),
      category: "tripReminder",
      date: resolveTripLeadDate(nextTrip.startDate, 2, 9, 0, 18).toISOString(),
      deepLink: "/trips",
      id: `travelgenious-trip-reminder-${nextTrip.id}`,
      scope: TRAVELGENIOUS_SCOPE,
      title: i18n.t("notificationTemplates.tripReminder.title", {
        title: nextTrip.title,
      }),
    });

    templates.push({
      body: i18n.t("notificationTemplates.travelChecklist.body", {
        destination: nextTrip.destination,
      }),
      category: "travelChecklist",
      date: resolveTripLeadDate(
        nextTrip.startDate,
        1,
        18,
        30,
        26,
      ).toISOString(),
      deepLink: "/trips",
      id: `travelgenious-travel-checklist-${nextTrip.id}`,
      scope: TRAVELGENIOUS_SCOPE,
      title: i18n.t("notificationTemplates.travelChecklist.title"),
    });
  }

  if (planningTrip) {
    templates.push({
      body: i18n.t("notificationTemplates.aiPrompt.body", {
        destination: planningTrip.destination,
        duration: getTripDurationInDays(
          planningTrip.startDate,
          planningTrip.endDate,
        ),
        travelers: planningTrip.travelers,
      }),
      category: "aiPrompt",
      date: ensureFutureDate(
        withTime(planningTrip.startDate, 11, 0),
        8,
      ).toISOString(),
      deepLink: "/heia",
      id: `travelgenious-ai-prompt-${planningTrip.id}`,
      scope: TRAVELGENIOUS_SCOPE,
      title: i18n.t("notificationTemplates.aiPrompt.title"),
    });
  }

  if (featuredOffer) {
    templates.push({
      body: i18n.t("notificationTemplates.savedOfferAlert.body", {
        price: formatCurrencyByLocale(featuredOffer.priceFrom, locale),
        title: featuredOffer.title,
      }),
      category: "savedOfferAlert",
      date: ensureFutureDate(
        new Date(Date.now() + 6 * HOUR_IN_MS),
        6,
      ).toISOString(),
      deepLink: `/package/${featuredOffer.id}`,
      id: `travelgenious-saved-offer-${featuredOffer.id}`,
      scope: TRAVELGENIOUS_SCOPE,
      title: i18n.t("notificationTemplates.savedOfferAlert.title", {
        destination: featuredOffer.destination,
      }),
    });
  }

  if (nextTrip) {
    const booking = getPrimaryTripBooking(nextTrip.id);

    if (booking) {
      templates.push({
        body: i18n.t("notificationTemplates.bookingMilestone.body", {
          cabin: booking.cabinLabel,
          hotel: booking.hotelName,
        }),
        category: "bookingMilestone",
        date: resolveTripLeadDate(
          nextTrip.startDate,
          5,
          10,
          30,
          10,
        ).toISOString(),
        deepLink: `/flight-booking/${booking.id}`,
        id: `travelgenious-booking-milestone-${booking.id}`,
        scope: TRAVELGENIOUS_SCOPE,
        title: i18n.t("notificationTemplates.bookingMilestone.title", {
          title: nextTrip.title,
        }),
      });
    }
  }

  return templates;
};

export const getTravelgeniousScheduledNotificationsAsync = async () => {
  if (!notificationsSupported) {
    return [] as ScheduledTravelNotification[];
  }

  try {
    const requests = await Notifications.getAllScheduledNotificationsAsync();

    return requests
      .map(mapScheduledRequest)
      .filter(
        (notification): notification is ScheduledTravelNotification =>
          notification !== null,
      )
      .sort(
        (leftNotification, rightNotification) =>
          new Date(leftNotification.date).getTime() -
          new Date(rightNotification.date).getTime(),
      );
  } catch {
    return [] as ScheduledTravelNotification[];
  }
};

export const cancelTravelgeniousScheduledNotificationsAsync = async (
  category?: ScheduledTravelNotificationCategory,
) => {
  if (!notificationsSupported) {
    return;
  }

  const scheduledNotifications =
    await getTravelgeniousScheduledNotificationsAsync();

  await Promise.all(
    scheduledNotifications
      .filter((notification) =>
        category ? notification.category === category : true,
      )
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.id),
      ),
  );
};

export const syncLocalTravelNotificationsAsync = async ({
  locale,
  notificationPreferences,
  notificationsEnabled,
}: {
  locale?: AppLocale;
  notificationPreferences: NotificationPreferences;
  notificationsEnabled: boolean;
}) => {
  if (!notificationsSupported) {
    return [] as ScheduledTravelNotification[];
  }

  const permissions = await getPermissionSnapshotAsync();

  if (!notificationsEnabled || permissions.permissionsStatus !== "granted") {
    await cancelTravelgeniousScheduledNotificationsAsync();
    return [] as ScheduledTravelNotification[];
  }

  await ensureNotificationChannelsAsync();
  await cancelTravelgeniousScheduledNotificationsAsync();

  const templates = buildLocalReminderTemplates(locale).filter(
    (notification) => notificationPreferences[notification.category],
  );

  await Promise.all(
    templates.map((notification) =>
      Notifications.scheduleNotificationAsync({
        content: {
          ...(notification.subtitle ? { subtitle: notification.subtitle } : {}),
          body: notification.body,
          data: {
            category: notification.category,
            scheduledFor: notification.date,
            scope: TRAVELGENIOUS_SCOPE,
            ...(notification.deepLink ? { url: notification.deepLink } : {}),
          },
          title: notification.title,
        },
        identifier: notification.id,
        trigger: {
          ...(Platform.OS === "android"
            ? { channelId: TRAVELGENIOUS_CHANNEL_ID }
            : {}),
          date: new Date(notification.date),
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      }),
    ),
  );

  return getTravelgeniousScheduledNotificationsAsync();
};

export const getNotificationCapabilitySnapshotAsync =
  async (): Promise<NotificationCapabilitySnapshot> => {
    const [permissionSnapshot, scheduledNotifications] = await Promise.all([
      getPermissionSnapshotAsync(),
      getTravelgeniousScheduledNotificationsAsync(),
    ]);

    return {
      canAskAgain: permissionSnapshot.canAskAgain,
      permissionsStatus: permissionSnapshot.permissionsStatus,
      pushPreparation: getPushPreparationState(),
      scheduledCount: scheduledNotifications.length,
      supportsLocalNotifications: notificationsSupported,
    };
  };
