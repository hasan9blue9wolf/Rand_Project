import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Platform, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientBackground } from "../../../components/ui/ambient-background";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { SectionHeader } from "../../../components/ui/section-header";
import { queryKeys } from "../../../constants/query-keys";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { getRemoteImageSource,preloadRemoteImages  } from "../../../services/media/remote-images";
import { useDemoModeStore } from "../../../store/demo-mode-store";
import { useNotificationsStore } from "../../../store/notifications-store";
import { useTutorialStore } from "../../../store/tutorial-store";
import {
  colors,
  getContentMaxWidth,
  getScreenPadding,
  spacing,
} from "../../../theme";
import type { AppLocale } from "../../../types/i18n";
import { DemoPackageCard } from "../../packages/components/demo-package-card";
import { PackageCategoriesRail } from "../../packages/components/package-categories-rail";
import { packageCategories } from "../../packages/data/package-categories";
import {
  resolvePackageImageUrl,
  resolvePackageText,
} from "../../packages/helpers/package-helpers";
import {
  getAIRecommendedPackages,
  getBestSellerPackages,
  getFeaturedPackages,
} from "../../packages/services/demo-travel-packages.service";
import type { TravelPackage } from "../../packages/types";
import { homeScreenMock } from "../data/home.mock";
import { useHomeData } from "../hooks/use-home-data";
import { useHomeSearchFlow } from "../hooks/use-home-search-flow";
import { HeiaBanner } from "./heia-banner";
import { HomeBookingCard } from "./home-booking-card";
import { HomeTopHeader } from "./home-top-header";

type TrendingDestination = {
  count: number;
  country: string;
  imageUrl: string;
  packageId: string;
  title: string;
};

const buildTrendingDestinations = (
  packages: TravelPackage[],
  language: AppLocale,
) => {
  const destinations = new Map<string, TrendingDestination>();

  for (const packageItem of packages) {
    const title = resolvePackageText(packageItem.destinationCity, language);
    const country = resolvePackageText(packageItem.destinationCountry, language);
    const key = `${title}-${country}`;
    const currentDestination = destinations.get(key);

    destinations.set(key, {
      count: (currentDestination?.count ?? 0) + 1,
      country,
      imageUrl: currentDestination?.imageUrl ?? packageItem.imageUrl,
      packageId: currentDestination?.packageId ?? packageItem.id,
      title,
    });
  }

  return [...destinations.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
};

const RailSeparator = memo(function RailSeparator() {
  return <View style={{ width: spacing.md }} />;
});

const EmptyRenderItem = () => null;

export const HomeScreen = () => {
  const { isRTL, language, t } = useLocalization();
  const { width } = useWindowDimensions();
  const homeQuery = useHomeData();
  const featuredPackagesQuery = useQuery({
    queryFn: getFeaturedPackages,
    queryKey: [...queryKeys.homeScreen, "featuredPackages"],
  });
  const bestSellerPackagesQuery = useQuery({
    queryFn: getBestSellerPackages,
    queryKey: [...queryKeys.homeScreen, "bestSellerPackages"],
  });
  const aiRecommendedPackagesQuery = useQuery({
    queryFn: getAIRecommendedPackages,
    queryKey: [...queryKeys.homeScreen, "aiRecommendedPackages"],
  });
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
  const profileAvatarUri = useDemoModeStore(
    (state) => state.profile?.avatarUrl,
  );
  const unreadNotificationCount = useNotificationsStore(
    (state) => state.unreadCount,
  );
  const tutorialCompleted = useTutorialStore((state) => state.completed);
  const [tutorialHydrated, setTutorialHydrated] = useState(
    useTutorialStore.persist.hasHydrated(),
  );
  const headerData = homeData.header;
  const featuredPackages = useMemo(
    () => featuredPackagesQuery.data ?? [],
    [featuredPackagesQuery.data],
  );
  const bestSellerPackages = useMemo(
    () => bestSellerPackagesQuery.data ?? [],
    [bestSellerPackagesQuery.data],
  );
  const aiRecommendedPackages = useMemo(
    () => aiRecommendedPackagesQuery.data ?? [],
    [aiRecommendedPackagesQuery.data],
  );
  const homePackages = useMemo(
    () => [
      ...featuredPackages,
      ...bestSellerPackages,
      ...aiRecommendedPackages,
    ],
    [aiRecommendedPackages, bestSellerPackages, featuredPackages],
  );
  const trendingDestinations = useMemo(
    () => buildTrendingDestinations(homePackages, language),
    [homePackages, language],
  );
  const isInitialLoading = homeQuery.isLoading && !homeQuery.data;

  useEffect(() => {
    void preloadRemoteImages([
      profileAvatarUri ?? headerData.profileAvatarUri,
      ...homePackages.slice(0, 12).map((packageItem) =>
        resolvePackageImageUrl(packageItem.imageUrl),
      ),
    ]);
  }, [headerData.profileAvatarUri, homePackages, profileAvatarUri]);

  useEffect(() => {
    const unsubscribe = useTutorialStore.persist.onFinishHydration(() =>
      setTutorialHydrated(true),
    );

    setTutorialHydrated(useTutorialStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!tutorialHydrated || tutorialCompleted) {
      return;
    }

    router.replace(appRoutes.tutorial);
  }, [tutorialCompleted, tutorialHydrated]);

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
        ...(draftSearch.mode === "packages" ? { query: fieldValues.to } : {}),
        source: "home",
      }),
    );
  }, [draftSearch.mode, fieldValues.to, submitSearch]);
  const handleHeiaPress = useCallback(() => router.push(appRoutes.heia), []);
  const handleSeeAllPress = useCallback(() => router.push(appRoutes.packages), []);
  const handlePackagePress = useCallback(
    (packageItem: TravelPackage) =>
      router.push(appRoutes.packageDetails(packageItem.id)),
    [],
  );
  const handlePackageIdPress = useCallback(
    (packageId: string) => router.push(appRoutes.packageDetails(packageId)),
    [],
  );
  const renderPackageRail = useCallback(
    (title: string, packages: TravelPackage[]) =>
      packages.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          <SectionHeader
            actionLabel={t("home.trendingPackages.seeAll")}
            onPress={handleSeeAllPress}
            title={title}
          />
          <FlatList
            data={packages.slice(0, 8)}
            horizontal
            initialNumToRender={4}
            inverted={isRTL}
            ItemSeparatorComponent={RailSeparator}
            keyExtractor={(item) => item.id}
            maxToRenderPerBatch={4}
            removeClippedSubviews={Platform.OS === "android"}
            renderItem={({ index, item }) => (
              <View style={{ width: width >= 768 ? 340 : 304 }}>
                <DemoPackageCard
                  enteringIndex={index}
                  onPress={() => handlePackagePress(item)}
                  packageItem={item}
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            windowSize={5}
          />
        </View>
      ) : null,
    [handlePackagePress, handleSeeAllPress, isRTL, t, width],
  );
  const homeContent = useMemo(
    () => (
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

            <PackageCategoriesRail categories={packageCategories} />

            <AppText
              style={{
                fontSize: 25,
                fontWeight: "800",
                letterSpacing: isRTL ? 0 : -0.6,
              }}
              variant="title"
            >
              {t("home.trendingPackages.title")}
            </AppText>

            {renderPackageRail(
              t("home.inventorySections.featured"),
              featuredPackages,
            )}
            {renderPackageRail(
              t("home.inventorySections.bestSeller"),
              bestSellerPackages,
            )}
            {renderPackageRail(
              t("home.inventorySections.aiRecommended"),
              aiRecommendedPackages,
            )}

            <View style={{ gap: spacing.md }}>
              <SectionHeader
                actionLabel={t("home.trendingPackages.seeAll")}
                onPress={handleSeeAllPress}
                title={t("home.inventorySections.trendingDestinations")}
              />
              <FlatList
                data={trendingDestinations}
                horizontal
                initialNumToRender={4}
                inverted={isRTL}
                ItemSeparatorComponent={RailSeparator}
                keyExtractor={(item) => `${item.title}-${item.country}`}
                maxToRenderPerBatch={4}
                removeClippedSubviews={Platform.OS === "android"}
                renderItem={({ item }) => (
                  <ScalePressable
                    accessibilityRole="button"
                    onPress={() => handlePackageIdPress(item.packageId)}
                    scaleTo={0.97}
                    style={{ width: 220 }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.surface.base,
                        borderColor: colors.border.soft,
                        borderRadius: 16,
                        borderWidth: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        resizeMode="cover"
                        source={getRemoteImageSource(
                          resolvePackageImageUrl(item.imageUrl),
                        )}
                        style={{
                          backgroundColor: colors.surface.muted,
                          height: 116,
                          width: "100%",
                        }}
                      />
                      <View style={{ gap: spacing.sm, padding: spacing.md }}>
                        <AppText variant="title">{item.title}</AppText>
                        <AppText color={colors.text.secondary} variant="bodySmall">
                          {item.country}
                        </AppText>
                        <Chip
                          label={t("home.inventorySections.destinationCount", {
                            count: item.count,
                          })}
                          tone="primary"
                        />
                      </View>
                    </View>
                  </ScalePressable>
                )}
                showsHorizontalScrollIndicator={false}
                windowSize={5}
              />
            </View>
          </>
        )}
      </View>
    ),
    [
      aiRecommendedPackages,
      bestSellerPackages,
      contentMaxWidth,
      cycleField,
      draftSearch.mode,
      featuredPackages,
      fieldValues,
      handleHeiaPress,
      handlePackageIdPress,
      handleSearchPress,
      handleSeeAllPress,
      homeData.bookingFields,
      homeQuery,
      isInitialLoading,
      isRTL,
      isSubmitting,
      renderPackageRail,
      screenPadding,
      setMode,
      t,
      trendingDestinations,
    ],
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
              hasUnreadNotifications={
                unreadNotificationCount > 0 || headerData.hasUnreadNotifications
              }
              onNotificationsPress={handleNotificationsPress}
              onProfilePress={handleProfilePress}
              profileAvatarUri={profileAvatarUri ?? headerData.profileAvatarUri}
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
          <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            data={[]}
            keyExtractor={(_, index) => `home-${index}`}
            ListHeaderComponent={homeContent}
            renderItem={EmptyRenderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </AmbientBackground>
    </SafeAreaView>
  );
};
