import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Platform, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SectionHeader } from "../../../components/ui/section-header";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes, type SearchSource } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";
import {
  travelDurationRangeOptions,
  travelPassengerOptionsById,
  travelPriceRangeOptions,
} from "../data/catalog.mock";
import { useSearchResultsScreen } from "../hooks/use-search-results-screen";
import type {
  TravelDiscoverySearchResult,
  TravelDiscoverySortOption,
  TravelDiscoveryTheme,
} from "../types";
import { DiscoveryResultCard } from "./discovery-result-card";

const themeIds: TravelDiscoveryTheme[] = [
  "beach",
  "mountain",
  "city",
  "adventure",
  "luxury",
  "family",
  "business",
];

const sortOptionIds: TravelDiscoverySortOption[] = [
  "recommended",
  "priceAscending",
  "priceDescending",
  "durationAscending",
  "luxuryDescending",
];
const hotelClassOptions = [3, 4, 5] as const;

export const SearchResultsScreen = () => {
  const params = useLocalSearchParams<{
    mode?: "flights" | "packages";
    source?: SearchSource;
  }>();
  const { formatDateRange, t } = useLocalization();
  const {
    activeFilterCount,
    filters,
    resetFilters,
    results,
    searchQuery,
    setDurationRange,
    setPriceRange,
    setSort,
    sort,
    submittedSearch,
    toggleHotelClass,
    toggleTheme,
    updateFilters,
  } = useSearchResultsScreen();
  const selectedMode = params.mode ?? submittedSearch.mode;
  const selectedSource = params.source ?? submittedSearch.source;
  const selectedPassengers =
    travelPassengerOptionsById[submittedSearch.passengerOptionId];
  const showInitialLoading = searchQuery.isLoading && !searchQuery.data;
  const showErrorState = searchQuery.isError && results.length === 0;
  const handleBackPress = useCallback(
    () => navigateBackOr(appRoutes.home),
    [],
  );
  const handleHeiaPress = useCallback(
    () => router.push(appRoutes.heia),
    [],
  );
  const handleRetry = useCallback(() => {
    void searchQuery.refetch();
  }, [searchQuery]);
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);
  const renderResult = useCallback(
    ({ index, item }: { index: number; item: TravelDiscoverySearchResult }) => (
      <DiscoveryResultCard
        actionLabel={t("common.viewDetails")}
        enteringIndex={index}
        onActionPress={() => router.push(appRoutes.packageDetails(item.id))}
        result={item}
      />
    ),
    [t],
  );
  const keyExtractor = useCallback(
    (item: TravelDiscoverySearchResult) => item.id,
    [],
  );
  const listHeader = useMemo(
    () => (
      <View style={{ gap: spacing.xl, paddingBottom: spacing.xl }}>
        <AppCard elevated>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="title">{t("searchResults.summaryTitle")}</AppText>
            <AppText>{t("searchResults.summaryBody")}</AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.xs,
              marginTop: spacing.md,
            }}
          >
            <Chip
              label={t("searchResults.matchCount", {
                count: searchQuery.data?.totalCount ?? results.length,
              })}
              tone="primary"
            />
            <Chip
              label={`${t("searchResults.modeLabel")}: ${t(`home.booking.modes.${selectedMode}`)}`}
              tone="navy"
            />
            <Chip
              label={`${t("searchResults.sourceLabel")}: ${t(`searchResults.sources.${selectedSource}`)}`}
              tone="coral"
            />
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <AppText color={colors.text.primary} variant="label">
              {`${t("searchResults.criteria.from")}: ${t(`searchDiscovery.locations.${submittedSearch.fromId}`)}`}
            </AppText>
            <AppText color={colors.text.primary} variant="label">
              {`${t("searchResults.criteria.to")}: ${t(`searchDiscovery.locations.${submittedSearch.toId}`)}`}
            </AppText>
            <AppText color={colors.text.primary} variant="label">
              {`${t("searchResults.criteria.dates")}: ${formatDateRange(
                submittedSearch.startDate,
                submittedSearch.endDate,
              )}`}
            </AppText>
            <AppText color={colors.text.primary} variant="label">
              {`${t("searchResults.criteria.passengers")}: ${t(
                `searchDiscovery.passengers.${selectedPassengers.id}`,
              )}`}
            </AppText>
          </View>
        </AppCard>

        <AppCard>
          <SectionHeader
            {...(activeFilterCount > 0
              ? {
                  actionLabel: t("searchResults.clearFilters"),
                  onPress: handleResetFilters,
                }
              : {})}
            title={t("searchResults.filtersTitle")}
          />

          <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              <AppText variant="label">{t("searchResults.sortTitle")}</AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                }}
              >
                {sortOptionIds.map((sortId) => (
                  <Chip
                    key={sortId}
                    label={t(`searchResults.sortOptions.${sortId}`)}
                    onPress={() => setSort(sortId)}
                    selected={sort === sortId}
                    tone="navy"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <AppText variant="label">
                {t("searchResults.priceRangeTitle")}
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                }}
              >
                {travelPriceRangeOptions.map((option) => (
                  <Chip
                    key={option.id}
                    label={t(`searchResults.priceRanges.${option.id}`)}
                    onPress={() => setPriceRange(option.id)}
                    selected={filters.priceRangeId === option.id}
                    tone="primary"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <AppText variant="label">
                {t("searchResults.durationTitle")}
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                }}
              >
                {travelDurationRangeOptions.map((option) => (
                  <Chip
                    key={option.id}
                    label={t(`searchResults.durationRanges.${option.id}`)}
                    onPress={() => setDurationRange(option.id)}
                    selected={filters.durationRangeId === option.id}
                    tone="coral"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <AppText variant="label">{t("searchResults.themeTitle")}</AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                }}
              >
                {themeIds.map((themeId) => (
                  <Chip
                    key={themeId}
                    label={t(`searchResults.themes.${themeId}`)}
                    onPress={() => toggleTheme(themeId)}
                    selected={filters.themes.includes(themeId)}
                    tone="navy"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <AppText variant="label">
                {t("searchResults.hotelClassTitle")}
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                }}
              >
                {hotelClassOptions.map((hotelClass) => (
                  <Chip
                    key={hotelClass}
                    label={t("searchResults.hotelClassValue", {
                      count: hotelClass,
                    })}
                    onPress={() => toggleHotelClass(hotelClass)}
                    selected={filters.hotelClasses.includes(hotelClass)}
                    tone="primary"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <AppText variant="label">
                {t("searchResults.preferencesTitle")}
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                }}
              >
                <Chip
                  label={t("searchResults.directFlight")}
                  onPress={() =>
                    updateFilters({
                      directFlightsOnly: !filters.directFlightsOnly,
                    })
                  }
                  selected={filters.directFlightsOnly}
                  tone="success"
                />
                <Chip
                  label={t("searchResults.refundable")}
                  onPress={() =>
                    updateFilters({ refundableOnly: !filters.refundableOnly })
                  }
                  selected={filters.refundableOnly}
                  tone="warning"
                />
                <Chip
                  label={t("searchResults.visaFriendly")}
                  onPress={() =>
                    updateFilters({
                      visaFriendlyOnly: !filters.visaFriendlyOnly,
                    })
                  }
                  selected={filters.visaFriendlyOnly}
                  tone="primary"
                />
              </View>
            </View>
          </View>
        </AppCard>

        <SectionHeader title={t("searchResults.recommendedTitle")} />
      </View>
    ),
    [
      activeFilterCount,
      filters.directFlightsOnly,
      filters.durationRangeId,
      filters.hotelClasses,
      filters.priceRangeId,
      filters.refundableOnly,
      filters.themes,
      filters.visaFriendlyOnly,
      formatDateRange,
      handleResetFilters,
      results.length,
      searchQuery.data?.totalCount,
      selectedMode,
      selectedPassengers.id,
      selectedSource,
      setDurationRange,
      setPriceRange,
      setSort,
      sort,
      submittedSearch.endDate,
      submittedSearch.fromId,
      submittedSearch.startDate,
      submittedSearch.toId,
      t,
      toggleHotelClass,
      toggleTheme,
      updateFilters,
    ],
  );
  const listEmptyComponent = useMemo(() => {
    if (showInitialLoading) {
      return <LoadingState label={t("common.search")} />;
    }

    if (showErrorState) {
      return (
        <EmptyState
          actionLabel={t("common.retry")}
          description={t("searchResults.errorBody")}
          onPress={handleRetry}
          title={t("searchResults.errorTitle")}
          tone="error"
        />
      );
    }

    return (
      <EmptyState
        actionLabel={t("searchResults.clearFilters")}
        description={t("searchResults.emptyBody")}
        icon="options-outline"
        onPress={handleResetFilters}
        title={t("searchResults.emptyTitle")}
        tone="premium"
      />
    );
  }, [handleResetFilters, handleRetry, showErrorState, showInitialLoading, t]);

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
          onPress={handleHeiaPress}
        />
      }
      withBottomTabSpacing={false}
    >
      <FlatList
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: spacing.section,
        }}
        data={results}
        initialNumToRender={4}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        keyExtractor={keyExtractor}
        keyboardDismissMode={
          Platform.OS === "ios" ? "interactive" : "on-drag"
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={listEmptyComponent}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={4}
        removeClippedSubviews={Platform.OS === "android"}
        renderItem={renderResult}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        updateCellsBatchingPeriod={16}
        windowSize={7}
      />
    </ScreenContainer>
  );
};
