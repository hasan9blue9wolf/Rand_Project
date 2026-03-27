import { type Href,router } from "expo-router";

export const navigateBackOr = (fallbackRoute: Href) => {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackRoute);
};
