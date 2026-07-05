import { useCallback } from "react";

import { useLocalization } from "../../../hooks/use-localization";
import { triggerFeedback } from "../../../services/feedback";
import { usePackageFavoritesStore } from "../../../store/package-favorites-store";
import { useToastStore } from "../../../store/toast-store";
import type { TravelPackage } from "../types";

export const usePackageFavoriteToggle = (
  packageItem: TravelPackage | null | undefined,
) => {
  const { t } = useLocalization();
  const isFavorite = usePackageFavoritesStore((state) =>
    packageItem
      ? state.favorites.some((favorite) => favorite.packageId === packageItem.id)
      : false,
  );
  const toggleFavoritePackage = usePackageFavoritesStore(
    (state) => state.toggleFavoritePackage,
  );
  const showToast = useToastStore((state) => state.showToast);

  const toggleFavorite = useCallback(async () => {
    if (!packageItem) {
      return;
    }

    const saved = toggleFavoritePackage(packageItem);

    showToast({
      message: saved
        ? t("favorites.savedToast")
        : t("favorites.removedToast"),
      tone: saved ? "success" : "info",
    });

    await triggerFeedback(saved ? "success" : "selection");
  }, [packageItem, showToast, t, toggleFavoritePackage]);

  return {
    accessibilityLabel: isFavorite
      ? t("favorites.removeA11y")
      : t("favorites.saveA11y"),
    iconName: isFavorite ? "heart" : "heart-outline",
    isFavorite,
    label: isFavorite ? t("favorites.removeCta") : t("favorites.saveCta"),
    toggleFavorite,
  } as const;
};
