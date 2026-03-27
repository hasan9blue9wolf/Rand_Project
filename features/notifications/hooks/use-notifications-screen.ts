import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { queryKeys } from "../../../constants/query-keys";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { notificationsScreenMock } from "../data/notifications.mock";
import {
  getNotificationMetadata,
  getNotificationsScreenData,
  upsertNotificationMetadata,
} from "../services/notifications.service";

const notificationCategoryMap = {
  aiPrompt: "heia",
  bookingMilestone: "booking",
  savedOfferAlert: "price_alert",
  travelChecklist: "marketing",
  tripReminder: "booking",
} as const;

const getNotificationCategory = (itemId: string) =>
  notificationCategoryMap[itemId as keyof typeof notificationCategoryMap] ??
  "marketing";

export const useNotificationsScreen = () => {
  const userId = useAuthStore(selectActiveUserId);
  const notificationsQuery = useQuery({
    placeholderData: notificationsScreenMock,
    queryKey: queryKeys.notifications,
    queryFn: getNotificationsScreenData,
  });
  const metadataQuery = useQuery({
    queryKey: queryKeys.notificationMetadata(userId),
    queryFn: getNotificationMetadata,
  });
  const screenData = notificationsQuery.data ?? notificationsScreenMock;
  const [readIds, setReadIds] = useState<string[]>([]);
  const allRead = screenData.items.every((item) => readIds.includes(item.id));

  const markAllRead = useCallback(() => {
    setReadIds(screenData.items.map((item) => item.id));

    if (!userId) {
      return;
    }

    void Promise.all(
      screenData.items.map((item) =>
        upsertNotificationMetadata({
          category: getNotificationCategory(item.id),
          channel: "in_app",
          lastOpenedAt: new Date().toISOString(),
          unreadCount: 0,
        }),
      ),
    ).then(() => metadataQuery.refetch());
  }, [metadataQuery, screenData.items, userId]);

  return {
    allRead,
    items: screenData.items,
    markAllRead,
    metadata: metadataQuery.data ?? [],
    metadataQuery,
    notificationsQuery,
  };
};
