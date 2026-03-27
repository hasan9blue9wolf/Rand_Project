import * as Notifications from "expo-notifications";
import { type Href,router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

const extractNotificationUrl = (
  response: Notifications.NotificationResponse | null,
) => {
  const url = response?.notification.request.content.data?.["url"];

  return typeof url === "string" ? url : null;
};

export const useNotificationObserver = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const navigateFromResponse = (
      response: Notifications.NotificationResponse | null,
    ) => {
      const url = extractNotificationUrl(response);

      if (!url) {
        return;
      }

      router.push(url as Href);
      Notifications.clearLastNotificationResponse();
    };

    navigateFromResponse(Notifications.getLastNotificationResponse());

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        navigateFromResponse(response);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
};
