import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Platform, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { SearchField } from "../../../components/ui/search-field";
import { SectionHeader } from "../../../components/ui/section-header";
import { queryKeys } from "../../../constants/query-keys";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { spacing } from "../../../theme";
import {
  matchesPackageFilters,
  normalizePackageSearchTerm,
  resolvePackageText,
} from "../helpers/package-helpers";
import { getAllPackages } from "../services/demo-travel-packages.service";
import type {
  TravelPackage,
  TravelPackageCategory,
  TravelPackageFilters,
  TravelPackageLuxuryLevel,
  TravelPackageSortOption,
  TravelPackageTripType,
} from "../types";
import { DemoPackageCard } from "./demo-package-card";

type PackageDiscoveryExperienceProps = {
  headerAddon?: ReactNode;
  initialFilters?: TravelPackageFilters;
  initialQuery?: string;
};

const categoryOptions: TravelPackageCategory[] = [
  "luxury",
  "family",
  "honeymoon",
  "budget",
  "student",
  "adventure",
  "culture",
  "beach",
  "mountain",
  "city break",
  "business",
];

const tripTypeOptions: TravelPackageTripType[] = [
  "beach",
  "mountain",
  "city",
  "adventure",
  "family",
  "honeymoon",
  "business",
  "cultural",
  "student",
];

const luxuryLevelOptions: TravelPackageLuxuryLevel[] = [
  "budget",
  "comfort",
  "premium",
  "luxury",
  "ultraLuxury",
];

const hotelClassOptions = [3, 4, 5] as const;

const sortOptions: TravelPackageSortOption[] = [
  "recommended",
  "priceAscending",
  "priceDescending",
  "ratingDescending",
  "durationAscending",
  "bestSeller",
];

const priceRanges = [
  { id: "all", maxPrice: undefined, minPrice: undefined },
  { id: "budget", maxPrice: 999, minPrice: undefined },
  { id: "premium", maxPrice: 1999, minPrice: 1000 },
  { id: "luxury", maxPrice: undefined, minPrice: 2000 },
] as const;

const durationRanges = [
  { id: "all", maxDurationDays: undefined, minDurationDays: undefined },
  { id: "short", maxDurationDays: 4, minDurationDays: undefined },
  { id: "week", maxDurationDays: 7, minDurationDays: 5 },
  { id: "long", maxDurationDays: undefined, minDurationDays: 8 },
] as const;

const searchPackage = (packageItem: TravelPackage, query: string) => {
  const normalizedQuery = normalizePackageSearchTerm(query);

  if (!normalizedQuery) {
    return true;
  }

  const blob = [
    resolvePackageText(packageItem.title),
    resolvePackageText(packageItem.destinationCity),
    resolvePackageText(packageItem.destinationCountry),
    packageItem.tags.join(" "),
    packageItem.tripType,
    packageItem.category,
    packageItem.region,
    packageItem.luxuryLevel,
    packageItem.rating,
    packageItem.isBestSeller ? "best seller bestseller popular" : "",
    packageItem.isFeatured ? "featured" : "",
    packageItem.departureCities.join(" "),
    resolvePackageText(packageItem.shortDescription),
    resolvePackageText(packageItem.longDescription),
    packageItem.durationDays,
    packageItem.durationNights,
    packageItem.priceFrom,
  ]
    .join(" ")
    .toLowerCase();

  return blob.includes(normalizedQuery);
};

const PackageListSeparator = memo(function PackageListSeparator() {
  return <View style={{ height: spacing.lg }} />;
});

const PackageRailSeparator = memo(function PackageRailSeparator() {
  return <View style={{ width: spacing.md }} />;
});

const sortPackages = (
  packages: TravelPackage[],
  sortBy: TravelPackageSortOption,
) => {
  const nextPackages = [...packages];

  switch (sortBy) {
    case "bestSeller":
      return nextPackages.sort(
        (left, right) =>
          Number(right.isBestSeller) - Number(left.isBestSeller) ||
          right.reviewCount - left.reviewCount,
      );
    case "durationAscending":
      return nextPackages.sort((left, right) => left.durationDays - right.durationDays);
    case "priceAscending":
      return nextPackages.sort((left, right) => left.priceFrom - right.priceFrom);
    case "priceDescending":
      return nextPackages.sort((left, right) => right.priceFrom - left.priceFrom);
    case "ratingDescending":
      return nextPackages.sort((left, right) => right.rating - left.rating);
    case "recommended":
    default:
      return nextPackages.sort(
        (left, right) =>
          Number(right.isAIRecommended) - Number(left.isAIRecommended) ||
          Number(right.isFeatured) - Number(left.isFeatured) ||
          right.rating - left.rating,
      );
  }
};

export const PackageDiscoveryExperience = ({
  headerAddon,
  initialFilters = {},
  initialQuery = "",
}: PackageDiscoveryExperienceProps) => {
  const { isRTL, t } = useLocalization();
  const [searchText, setSearchText] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<TravelPackageSortOption>("recommended");
  const [filters, setFilters] = useState<TravelPackageFilters>(initialFilters);
  const packagesQuery = useQuery({
    queryKey: [...queryKeys.packages, "demoInventory"],
    queryFn: getAllPackages,
  });
  const packages = packagesQuery.data ?? [];
  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) => key !== "sortBy" && value !== undefined,
      ).length,
    [filters],
  );
  const filteredPackages = useMemo(
    () =>
      sortPackages(
        packages.filter(
          (packageItem) =>
            searchPackage(packageItem, searchText) &&
            matchesPackageFilters(packageItem, filters),
        ),
        sortBy,
      ),
    [filters, packages, searchText, sortBy],
  );
  const featuredPackages = useMemo(
    () => packages.filter((packageItem) => packageItem.isFeatured).slice(0, 6),
    [packages],
  );
  const bestSellerPackages = useMemo(
    () => packages.filter((packageItem) => packageItem.isBestSeller).slice(0, 6),
    [packages],
  );
  const aiPackages = useMemo(
    () => packages.filter((packageItem) => packageItem.isAIRecommended).slice(0, 6),
    [packages],
  );
  const updateFilter = useCallback(
    <Key extends keyof TravelPackageFilters>(
      key: Key,
      value: TravelPackageFilters[Key] | undefined,
    ) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        [key]: currentFilters[key] === value ? undefined : value,
      }));
    },
    [],
  );
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchText("");
    setSortBy("recommended");
  }, [initialFilters]);
  const handlePackagePress = useCallback(
    (packageId: string) => router.push(appRoutes.packageDetails(packageId)),
    [],
  );
  const renderPackage = useCallback(
    ({ index, item }: { index: number; item: TravelPackage }) => (
      <DemoPackageCard
        enteringIndex={index}
        onPress={() => handlePackagePress(item.id)}
        packageItem={item}
      />
    ),
    [handlePackagePress],
  );
  const keyExtractor = useCallback((item: TravelPackage) => item.id, []);
  const renderRail = useCallback(
    (title: string, data: TravelPackage[]) =>
      data.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          <SectionHeader title={title} />
          <FlatList
            data={data}
            horizontal
            initialNumToRender={4}
            inverted={isRTL}
            ItemSeparatorComponent={PackageRailSeparator}
            keyExtractor={keyExtractor}
            maxToRenderPerBatch={4}
            removeClippedSubviews={Platform.OS === "android"}
            renderItem={({ index, item }) => (
              <View style={{ width: 300 }}>
                <DemoPackageCard
                  enteringIndex={index}
                  onPress={() => handlePackagePress(item.id)}
                  packageItem={item}
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            windowSize={5}
          />
        </View>
      ) : null,
    [handlePackagePress, isRTL, keyExtractor],
  );
  const header = useMemo(() => (
    <View style={{ gap: spacing.xl, paddingBottom: spacing.xl }}>
      <AppCard elevated>
        <View style={{ gap: spacing.md }}>
          <AppText variant="title">{t("packagesDiscovery.heroTitle")}</AppText>
          <AppText>{t("packagesDiscovery.heroBody")}</AppText>
          <SearchField
            label={t("packagesDiscovery.searchLabel")}
            onChangeText={setSearchText}
            placeholder={t("packagesDiscovery.searchPlaceholder")}
            value={searchText}
          />
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.xs,
            }}
          >
            <Chip
              label={t("packagesDiscovery.meta.total", {
                count: filteredPackages.length,
              })}
              tone="primary"
            />
            <Chip
              label={t("packagesDiscovery.meta.inventory", {
                count: packages.length,
              })}
              tone="navy"
            />
            <Chip
              label={
                activeFilterCount > 0
                  ? t("packagesDiscovery.meta.activeFilters", {
                      count: activeFilterCount,
                    })
                  : t("packagesDiscovery.meta.noFilters")
              }
              tone="coral"
            />
          </View>
        </View>
      </AppCard>

      {headerAddon}

      {renderRail(t("packagesDiscovery.sections.featured"), featuredPackages)}
      {renderRail(t("packagesDiscovery.sections.bestSeller"), bestSellerPackages)}
      {renderRail(t("packagesDiscovery.sections.ai"), aiPackages)}

      <AppCard>
        <SectionHeader
          actionLabel={
            showFilters
              ? t("packagesDiscovery.actions.hideFilters")
              : t("packagesDiscovery.actions.showFilters")
          }
          onPress={() => setShowFilters((value) => !value)}
          title={t("packagesDiscovery.filtersTitle")}
        />

        <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="label">{t("packagesDiscovery.sortTitle")}</AppText>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                flexWrap: "wrap",
                gap: spacing.xs,
              }}
            >
              {sortOptions.map((sortOption) => (
                <Chip
                  key={sortOption}
                  label={t(`packagesDiscovery.sort.${sortOption}`)}
                  onPress={() => setSortBy(sortOption)}
                  selected={sortBy === sortOption}
                  tone="navy"
                />
              ))}
            </View>
          </View>

          {showFilters ? (
            <>
              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.price")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  {priceRanges.map((range) => (
                    <Chip
                      key={range.id}
                      label={t(`packagesDiscovery.priceRanges.${range.id}`)}
                      onPress={() =>
                        setFilters((currentFilters) => {
                          const { maxPrice, minPrice, ...nextFilters } =
                            currentFilters;

                          return {
                            ...nextFilters,
                            ...(range.maxPrice
                              ? { maxPrice: range.maxPrice }
                              : {}),
                            ...(range.minPrice
                              ? { minPrice: range.minPrice }
                              : {}),
                          };
                        })
                      }
                      selected={
                        filters.minPrice === range.minPrice &&
                        filters.maxPrice === range.maxPrice
                      }
                      tone="primary"
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.duration")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  {durationRanges.map((range) => (
                    <Chip
                      key={range.id}
                      label={t(`packagesDiscovery.durationRanges.${range.id}`)}
                      onPress={() =>
                        setFilters((currentFilters) => {
                          const {
                            maxDurationDays,
                            minDurationDays,
                            ...nextFilters
                          } = currentFilters;

                          return {
                            ...nextFilters,
                            ...(range.maxDurationDays
                              ? { maxDurationDays: range.maxDurationDays }
                              : {}),
                            ...(range.minDurationDays
                              ? { minDurationDays: range.minDurationDays }
                              : {}),
                          };
                        })
                      }
                      selected={
                        filters.minDurationDays === range.minDurationDays &&
                        filters.maxDurationDays === range.maxDurationDays
                      }
                      tone="coral"
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.category")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  {categoryOptions.map((category) => (
                    <Chip
                      key={category}
                      label={t(`packagesDiscovery.categories.${category}`)}
                      onPress={() => updateFilter("category", category)}
                      selected={filters.category === category}
                      tone="navy"
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.tripType")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  {tripTypeOptions.map((tripType) => (
                    <Chip
                      key={tripType}
                      label={t(`packagesDiscovery.tripTypes.${tripType}`)}
                      onPress={() => updateFilter("tripType", tripType)}
                      selected={filters.tripType === tripType}
                      tone="primary"
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.luxuryLevel")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  {luxuryLevelOptions.map((luxuryLevel) => (
                    <Chip
                      key={luxuryLevel}
                      label={t(`packagesDiscovery.luxuryLevels.${luxuryLevel}`)}
                      onPress={() => updateFilter("luxuryLevel", luxuryLevel)}
                      selected={filters.luxuryLevel === luxuryLevel}
                      tone="coral"
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.hotelClass")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  {hotelClassOptions.map((hotelClass) => (
                    <Chip
                      key={hotelClass}
                      label={t("packagesDiscovery.meta.hotelClass", {
                        count: hotelClass,
                      })}
                      onPress={() => updateFilter("hotelClass", hotelClass)}
                      selected={filters.hotelClass === hotelClass}
                      tone="primary"
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">
                  {t("packagesDiscovery.filterGroups.flags")}
                </AppText>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
                  <Chip
                    label={t("packagesDiscovery.filters.flightIncluded")}
                    onPress={() => updateFilter("flightIncluded", true)}
                    selected={filters.flightIncluded === true}
                    tone="success"
                  />
                  <Chip
                    label={t("packagesDiscovery.filters.visaFriendly")}
                    onPress={() => updateFilter("visaFriendly", true)}
                    selected={filters.visaFriendly === true}
                    tone="success"
                  />
                  <Chip
                    label={t("packagesDiscovery.filters.featured")}
                    onPress={() => updateFilter("isFeatured", true)}
                    selected={filters.isFeatured === true}
                    tone="navy"
                  />
                  <Chip
                    label={t("packagesDiscovery.filters.bestSeller")}
                    onPress={() => updateFilter("isBestSeller", true)}
                    selected={filters.isBestSeller === true}
                    tone="coral"
                  />
                </View>
              </View>
            </>
          ) : null}

          {activeFilterCount > 0 || searchText ? (
            <Chip
              label={t("packagesDiscovery.actions.clear")}
              onPress={resetFilters}
              tone="warning"
            />
          ) : null}
        </View>
      </AppCard>

      <SectionHeader title={t("packagesDiscovery.sections.all")} />
    </View>
  ), [
    activeFilterCount,
    aiPackages,
    bestSellerPackages,
    featuredPackages,
    filteredPackages.length,
    filters,
    headerAddon,
    isRTL,
    packages.length,
    renderRail,
    resetFilters,
    searchText,
    showFilters,
    sortBy,
    t,
    updateFilter,
  ]);

  return (
    <FlatList
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: spacing.section,
      }}
      data={filteredPackages}
      initialNumToRender={6}
      ItemSeparatorComponent={PackageListSeparator}
      keyExtractor={keyExtractor}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        packagesQuery.isLoading ? (
          <LoadingState label={t("packagesDiscovery.loading")} />
        ) : (
          <EmptyState
            actionLabel={t("packagesDiscovery.actions.clear")}
            description={t("packagesDiscovery.emptyBody")}
            icon="sparkles-outline"
            onPress={resetFilters}
            title={t("packagesDiscovery.emptyTitle")}
            tone="premium"
          />
        )
      }
      ListHeaderComponent={header}
      maxToRenderPerBatch={6}
      removeClippedSubviews={false}
      renderItem={renderPackage}
      showsVerticalScrollIndicator={false}
      updateCellsBatchingPeriod={16}
      windowSize={9}
    />
  );
};
