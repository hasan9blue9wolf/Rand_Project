import { router } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PackageCard } from "../../../components/ui/package-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";
import { featuredOffersById } from "../../catalog/data/catalog.mock";
import { useSavedDestinationsScreen } from "../hooks/use-saved-destinations-screen";

export const SavedDestinationsScreen = () => {
  const { t } = useLocalization();
  const { destinations, hasDestinations } = useSavedDestinationsScreen();

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
      subtitle={t("savedDestinations.subtitle")}
      title={t("common.savedDestinations")}
      withBottomTabSpacing={false}
    >
      {!hasDestinations ? (
        <EmptyState
          description={t("savedDestinations.emptyBody")}
          title={t("savedDestinations.emptyTitle")}
          tone="premium"
        />
      ) : (
        destinations.map((destination, index) => {
          const packageId = destination.packageId;
          const offer = packageId ? featuredOffersById[packageId] : undefined;

          if (!offer || !packageId) {
            return (
              <AppCard key={destination.id}>
                <AppText variant="title">{destination.destinationName}</AppText>
                {destination.countryName ? (
                  <AppText color={colors.text.secondary}>
                    {destination.countryName}
                  </AppText>
                ) : null}
                {destination.summary ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <AppText>{destination.summary}</AppText>
                  </View>
                ) : null}
              </AppCard>
            );
          }

          return (
            <PackageCard
              actionLabel={t("common.viewDetails")}
              enteringIndex={index}
              key={destination.id}
              offer={offer}
              onActionPress={() =>
                router.push(appRoutes.packageDetails(packageId))
              }
            />
          );
        })
      )}
    </ScreenContainer>
  );
};
