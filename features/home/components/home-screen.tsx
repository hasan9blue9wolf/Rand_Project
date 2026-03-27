import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientBackground } from "../../../components/ui/ambient-background";
import { EmptyState } from "../../../components/ui/empty-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { preloadRemoteImages } from "../../../services/media/remote-images";
import {
  colors,
  getContentMaxWidth,
  getScreenPadding,
  spacing,
} from "../../../theme";
import { homeTrendingRouteMap } from "../../catalog/data/catalog.mock";
import { homeScreenMock } from "../data/home.mock";
import { useHomeData } from "../hooks/use-home-data";
import { useHomeSearchFlow } from "../hooks/use-home-search-flow";
import type { HomeTrendingPackage } from "../types";
import { HeiaBanner } from "./heia-banner";
import { HomeBookingCard } from "./home-booking-card";
import { HomeTopHeader } from "./home-top-header";
import { TrendingPackagesSection } from "./trending-packages-section";

export const HomeScreen = () => {
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const homeQuery = useHomeData();
  const {
    cycleField,
    draftSearch,
    fieldValues,
    isSubmitting,
    setMode,
    submitSearch,
  } = useHomeSearchFlow();
  const screenPadding = getScreenPadding(width);
  const contentMaxWidth = getContentMaxWidth(width);
  const homeData = homeQuery.data ?? homeScreenMock;
  const headerData = homeData.header;
  const isInitialLoading = homeQuery.isLoading && !homeQuery.data;

  useEffect(() => {
    void preloadRemoteImages([
      headerData.profileAvatarUri,
      ...homeData.trendingPackages.map((packageItem) => packageItem.imageUri),
    ]);
  }, [headerData.profileAvatarUri, homeData.trendingPackages]);

  const handleNotificationsPress = useCallback(
    () => router.push(appRoutes.notifications),
    [],
  );
  const handleProfilePress = useCallback(
    () => router.push(appRoutes.profile),
    [],
  );
  const handleSearchPress = useCallback(async () => {
    const didSubmit = await submitSearch();
    if (!didSubmit) {
      return;
    }
    router.push(
      appRoutes.searchResults({
        mode: draftSearch.mode,
        source: "home",
      }),
    );
  }, [draftSearch.mode, submitSearch]);
  const handleHeiaPress = useCallback(() => router.push(appRoutes.heia), []);
  const handleSeeAllPress = useCallback(() => router.push(appRoutes.offers), []);
  const handlePackagePress = useCallback(
    (packageItem: HomeTrendingPackage) =>
      router.push(
        appRoutes.packageDetails(homeTrendingRouteMap[packageItem.id]),
      ),
    [],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.surface.base, flex: 1 }}
    >
      <AmbientBackground baseColor={colors.background.app}>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.88)",
            borderBottomColor: "rgba(223, 232, 242, 0.72)",
            borderBottomWidth: 1,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              maxWidth: contentMaxWidth,
              paddingBottom: spacing.sm,
              paddingHorizontal: screenPadding,
              paddingTop: spacing.xs,
              width: "100%",
            }}
          >
            <HomeTopHeader
              hasUnreadNotifications={headerData.hasUnreadNotifications}
              onNotificationsPress={handleNotificationsPress}
              onProfilePress={handleProfilePress}
              profileAvatarUri={headerData.profileAvatarUri}
            />
          </View>
        </View>

        {isInitialLoading ? (
          <View
            style={{
              flex: 1,
              paddingHorizontal: screenPadding,
              paddingTop: spacing.hero,
            }}
          >
            <LoadingState label={t("home.trendingPackages.title")} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                alignSelf: "center",
                gap: spacing.section,
                maxWidth: contentMaxWidth,
                paddingBottom: 132,
                paddingHorizontal: screenPadding,
                paddingTop: spacing.xl,
                width: "100%",
              }}
            >
              {homeQuery.isError && !homeQuery.data ? (
                <EmptyState
                  actionLabel={t("common.retry")}
                  description={t("home.subheading")}
                  onPress={() => homeQuery.refetch()}
                  title={t("common.retry")}
                  tone="error"
                />
              ) : (
                <>
                  <HomeBookingCard
                    ctaLabel={
                      draftSearch.mode === "flights"
                        ? t("home.booking.ctaFlights")
                        : t("home.booking.ctaPackages")
                    }
                    fields={homeData.bookingFields}
                    fieldValues={fieldValues}
                    mode={draftSearch.mode}
                    onFieldPress={(field) => cycleField(field.id)}
                    onModeChange={setMode}
                    onSearchPress={handleSearchPress}
                    submitting={isSubmitting}
                  />

                  <HeiaBanner onPress={handleHeiaPress} />

                  <TrendingPackagesSection
                    onPackagePress={handlePackagePress}
                    onSeeAllPress={handleSeeAllPress}
                    packages={homeData.trendingPackages}
                  />
                </>
              )}
            </View>
          </ScrollView>
        )}
      </AmbientBackground>
    </SafeAreaView>
  );
};
