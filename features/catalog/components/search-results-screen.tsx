import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { FlightsScreen } from "../../flights/components/flights-screen";
import { PackageDiscoveryExperience } from "../../packages/components/package-discovery-experience";

export const SearchResultsScreen = () => {
  const params = useLocalSearchParams<{
    mode?: string;
    query?: string;
  }>();
  const { t } = useLocalization();
  const handleBackPress = useCallback(() => navigateBackOr(appRoutes.home), []);
  const handleHayaPress = useCallback(() => router.push(appRoutes.heia), []);

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={handleBackPress}
        />
      }
      scrollable={false}
      subtitle={t("searchResults.subtitle")}
      title={t("searchResults.title")}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("tabs.heia")}
          icon="sparkles-outline"
          onPress={handleHayaPress}
        />
      }
      withBottomTabSpacing={false}
    >
      {params.mode === "flights" ? (
        <FlightsScreen />
      ) : (
        <PackageDiscoveryExperience initialQuery={params.query ?? ""} />
      )}
    </ScreenContainer>
  );
};
