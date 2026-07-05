import type { NotificationItem, NotificationsScreenData } from "../types";

export const notificationItems: NotificationItem[] = [
  {
    bodyKey: "notificationsScreen.items.tripReminder.body",
    icon: "calendar-outline",
    id: "tripReminder",
    timeKey: "notificationsScreen.items.tripReminder.time",
    titleKey: "notificationsScreen.items.tripReminder.title",
  },
  {
    bodyKey: "notificationsScreen.items.aiPrompt.body",
    icon: "sparkles-outline",
    id: "aiPrompt",
    timeKey: "notificationsScreen.items.aiPrompt.time",
    titleKey: "notificationsScreen.items.aiPrompt.title",
  },
  {
    bodyKey: "notificationsScreen.items.savedOfferAlert.body",
    icon: "pricetags-outline",
    id: "savedOfferAlert",
    timeKey: "notificationsScreen.items.savedOfferAlert.time",
    titleKey: "notificationsScreen.items.savedOfferAlert.title",
  },
  {
    bodyKey: "notificationsScreen.items.bookingMilestone.body",
    icon: "airplane-outline",
    id: "bookingMilestone",
    timeKey: "notificationsScreen.items.bookingMilestone.time",
    titleKey: "notificationsScreen.items.bookingMilestone.title",
  },
  {
    bodyKey: "notificationsScreen.items.travelChecklist.body",
    icon: "list-outline",
    id: "travelChecklist",
    timeKey: "notificationsScreen.items.travelChecklist.time",
    titleKey: "notificationsScreen.items.travelChecklist.title",
  },
];

export const notificationsScreenMock: NotificationsScreenData = {
  items: notificationItems,
};
