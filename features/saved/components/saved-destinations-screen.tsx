import { router } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { usePackageFavoritesStore } from "../../../store/package-favorites-store";
import { colors, spacing } from "../../../theme";
import { DemoPackageCard } from "../../packages/components/demo-package-card";
import { demoTravelPackages } from "../../packages/data/demo-travel-packages.seed";

export const SavedDestinationsScreen = () => {
  const { t } = useLocalization();
  const favoriteSnapshots = usePackageFavoritesStore((state) => state.favorites);
  const favoritePackages = useMemo(
    () =>
      favoriteSnapshots.flatMap((favorite) => {
        const packageItem = demoTravelPackages.find(
          (item) => item.id === favorite.packageId,
        );

        return packageItem ? [packageItem] : [];
      }),
    [favoriteSnapshots],
  );
  const hasFavorites = favoritePackages.length > 0;

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.profile)}
        />
      }
      subtitle={t("favorites.subtitle")}
      title={t("favorites.title")}
      withBottomTabSpacing={false}
    >
      {!hasFavorites ? (
        <EmptyState
          actionLabel={t("favorites.browseCta")}
          description={t("favorites.emptyBody")}
          icon="heart-outline"
          onPress={() => router.push(appRoutes.packages)}
          title={t("favorites.emptyTitle")}
          tone="premium"
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText color={colors.text.secondary} variant="bodySmall">
            {t("favorites.count", { count: favoritePackages.length })}
          </AppText>
          {favoritePackages.map((packageItem, index) => (
            <DemoPackageCard
              enteringIndex={index}
              key={packageItem.id}
              packageItem={packageItem}
              onPress={() => router.push(appRoutes.packageDetails(packageItem.id))}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};
