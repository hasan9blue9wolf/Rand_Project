import { useMemo } from "react";

import { useNotificationsStore } from "../../../store/notifications-store";
import type { InAppNotificationType } from "../types";

const notificationIconMap: Record<
  InAppNotificationType,
  | "airplane-outline"
  | "briefcase-outline"
  | "calendar-outline"
  | "checkmark-circle-outline"
  | "notifications-outline"
  | "pricetags-outline"
  | "sparkles-outline"
> = {
  booking_created: "briefcase-outline",
  booking_status: "checkmark-circle-outline",
  haya_tip: "sparkles-outline",
  offer: "pricetags-outline",
  system: "notifications-outline",
  trip_reminder: "calendar-outline",
};

export const useNotificationsScreen = () => {
  const clearAll = useNotificationsStore((state) => state.clearAll);
  const deleteNotification = useNotificationsStore(
    (state) => state.deleteNotification,
  );
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const markRead = useNotificationsStore((state) => state.markRead);
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const items = useMemo(
    () =>
      [...notifications].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),
    [notifications],
  );

  return {
    allRead: unreadCount === 0,
    clearAll,
    deleteNotification,
    getNotificationIcon: (type: InAppNotificationType) =>
      notificationIconMap[type],
    items,
    markAllRead,
    markRead,
    unreadCount,
  };
};
