import type { Ionicons } from "@expo/vector-icons";

import type { Json } from "../../services/supabase/database.types";

export const notificationPreferenceIds = [
  "tripReminder",
  "aiPrompt",
  "savedOfferAlert",
  "bookingMilestone",
  "travelChecklist",
] as const;

export type NotificationPreferenceId =
  (typeof notificationPreferenceIds)[number];

export type NotificationPreferences = Record<NotificationPreferenceId, boolean>;

export const defaultNotificationPreferences: NotificationPreferences = {
  aiPrompt: true,
  bookingMilestone: true,
  savedOfferAlert: true,
  travelChecklist: true,
  tripReminder: true,
};

export type NotificationPermissionState =
  | "denied"
  | "granted"
  | "undetermined"
  | "unknown";

export type ScheduledTravelNotificationCategory = NotificationPreferenceId;

export type NotificationItem = {
  bodyKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  id: string;
  timeKey: string;
  titleKey: string;
};

export type ScheduledTravelNotification = {
  body: string;
  category: ScheduledTravelNotificationCategory;
  date: string;
  deepLink?: string;
  id: string;
  scope: "travelgenious";
  subtitle?: string;
  title: string;
};

export type PushPreparationState = {
  hasExpoProjectId: boolean;
  projectId?: string;
  strategy: "expo-notifications";
};

export type NotificationCapabilitySnapshot = {
  canAskAgain: boolean;
  permissionsStatus: NotificationPermissionState;
  pushPreparation: PushPreparationState;
  scheduledCount: number;
  supportsLocalNotifications: boolean;
};

export type NotificationMetadata = {
  category: "booking" | "heia" | "marketing" | "price_alert";
  channel: "email" | "in_app" | "push";
  createdAt: string;
  id: string;
  lastOpenedAt?: string;
  lastReceivedAt?: string;
  metadata: Json;
  mutedUntil?: string;
  unreadCount: number;
  updatedAt: string;
  userId: string;
};

export type UpsertNotificationMetadataInput = {
  category: NotificationMetadata["category"];
  channel: NotificationMetadata["channel"];
  lastOpenedAt?: string;
  lastReceivedAt?: string;
  metadata?: Json;
  mutedUntil?: string;
  unreadCount?: number;
};

export type NotificationsScreenData = {
  items: NotificationItem[];
};
