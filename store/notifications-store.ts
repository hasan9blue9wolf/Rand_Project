import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CreateInAppNotificationInput,
  InAppNotification,
} from "../features/notifications/types";
import { appStorage } from "../services/storage";

type NotificationsState = {
  clearAll: () => void;
  createNotification: (input: CreateInAppNotificationInput) => InAppNotification;
  deleteNotification: (notificationId: string) => void;
  markAllRead: () => void;
  markRead: (notificationId: string) => void;
  notifications: InAppNotification[];
  unreadCount: number;
};

const createNotificationId = () =>
  `NT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const getUnreadCount = (notifications: InAppNotification[]) =>
  notifications.filter((notification) => !notification.isRead).length;

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
      createNotification: (input) => {
        const notification: InAppNotification = {
          ...input,
          createdAt: input.createdAt ?? new Date().toISOString(),
          isRead: input.isRead ?? false,
          notificationId: input.notificationId ?? createNotificationId(),
        };

        set((state) => {
          const notifications = [notification, ...state.notifications];

          return {
            notifications,
            unreadCount: getUnreadCount(notifications),
          };
        });

        return notification;
      },
      deleteNotification: (notificationId) =>
        set((state) => {
          const notifications = state.notifications.filter(
            (notification) => notification.notificationId !== notificationId,
          );

          return {
            notifications,
            unreadCount: getUnreadCount(notifications),
          };
        }),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        })),
      markRead: (notificationId) =>
        set((state) => {
          const notifications = state.notifications.map((notification) =>
            notification.notificationId === notificationId
              ? { ...notification, isRead: true }
              : notification,
          );

          return {
            notifications,
            unreadCount: getUnreadCount(notifications),
          };
        }),
      notifications: [],
      unreadCount: 0,
    }),
    {
      name: "hayatrips-in-app-notifications",
      storage: appStorage,
    },
  ),
);
