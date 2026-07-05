import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { MotionView } from "../../../components/ui/motion-view";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { SectionHeader } from "../../../components/ui/section-header";
import { queryKeys } from "../../../constants/query-keys";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { triggerFeedback } from "../../../services/feedback";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, shadows, spacing } from "../../../theme";
import {
  FALLBACK_PACKAGE_IMAGE_URL,
  formatPackagePrice,
  getPackageGalleryImages,
  resolvePackageText,
} from "../../packages/helpers/package-helpers";
import { usePackageFavoriteToggle } from "../../packages/hooks/use-package-favorite-toggle";
import { getPackageById } from "../../packages/services/demo-travel-packages.service";

const packageGalleryHeight = 292;

type PackageGalleryImageProps = {
  height: number;
  uri: string;
  width: number;
};

const PackageGalleryImage = memo(function PackageGalleryImage({
  height,
  uri,
  width,
}: PackageGalleryImageProps) {
  const [sourceUri, setSourceUri] = useState(uri);

  return (
    <Image
      fadeDuration={120}
      resizeMethod="resize"
      resizeMode="cover"
      source={getRemoteImageSource(sourceUri)}
      onError={() => {
        if (sourceUri !== FALLBACK_PACKAGE_IMAGE_URL) {
          setSourceUri(FALLBACK_PACKAGE_IMAGE_URL);
        }
      }}
      style={{
        backgroundColor: colors.surface.muted,
        height,
        width,
      }}
    />
  );
});

export const PackageDetailsScreen = () => {
  const { packageId } = useLocalSearchParams<{ packageId?: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const {
    formatDateRange,
    isRTL,
    language,
    t,
  } = useLocalization();
  const packageQuery = useQuery({
    enabled: Boolean(packageId),
    queryKey: queryKeys.catalogPackageDetails(packageId ?? "unknown", "demoInventory"),
    queryFn: () => getPackageById(packageId ?? ""),
  });
  const packageDetails = packageQuery.data ?? null;
  const favoriteAction = usePackageFavoriteToggle(packageDetails);
  const galleryImages = useMemo(
    () => (packageDetails ? getPackageGalleryImages(packageDetails) : []),
    [packageDetails],
  );
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const galleryWidth = Math.max(windowWidth - spacing.lg * 2, 280);
  const galleryListRef = useRef<FlatList<string>>(null);
  const handleGalleryMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / galleryWidth,
      );

      setActiveGalleryIndex(
        Math.min(Math.max(nextIndex, 0), Math.max(galleryImages.length - 1, 0)),
      );
    },
    [galleryImages.length, galleryWidth],
  );
  const renderGalleryImage = useCallback(
    ({ item }: { item: string }) => (
      <PackageGalleryImage
        height={packageGalleryHeight}
        uri={item}
        width={galleryWidth}
      />
    ),
    [galleryWidth],
  );
  const getGalleryItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      index,
      length: galleryWidth,
      offset: galleryWidth * index,
    }),
    [galleryWidth],
  );

  if (packageQuery.isLoading) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.packages)}
          />
        }
        scrollable={false}
        title={t("packageDetails.title")}
        withBottomTabSpacing={false}
      >
        <LoadingState label={t("packageDetails.title")} />
      </ScreenContainer>
    );
  }

  if (!packageDetails) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.packages)}
          />
        }
        scrollable={false}
        title={t("packageDetails.title")}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("packagesDiscovery.title")}
          description={t("packageDetails.notFoundBody")}
          onPress={() => router.replace(appRoutes.packages)}
          title={t("packageDetails.notFoundTitle")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const title = resolvePackageText(packageDetails.title, language);
  const city = resolvePackageText(packageDetails.destinationCity, language);
  const country = resolvePackageText(
    packageDetails.destinationCountry,
    language,
  );
  const shortDescription = resolvePackageText(
    packageDetails.shortDescription,
    language,
  );
  const longDescription = resolvePackageText(
    packageDetails.longDescription,
    language,
  );
  const bestSeason = resolvePackageText(packageDetails.bestSeason, language);
  const visaNote = resolvePackageText(packageDetails.visaNote, language);
  const packageContext =
    language === "ar"
      ? `أخبرني عن باقة ${title} في ${city}, ${country}. السعر يبدأ من ${formatPackagePrice(
          packageDetails,
          language,
        )} لمدة ${packageDetails.durationDays} أيام.`
      : `Tell me about the ${title} package in ${city}, ${country}. It starts from ${formatPackagePrice(
          packageDetails,
          language,
        )} for ${packageDetails.durationDays} days.`;

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.packages)}
        />
      }
      subtitle={t("packageDetails.subtitle")}
      title={t("packageDetails.title")}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("packageDetails.shareCta")}
          icon="share-outline"
          onPress={() => void triggerFeedback("selection")}
        />
      }
      withBottomTabSpacing={false}
    >
      <MotionView>
        <View
          style={[
            shadows.premium,
            {
              borderRadius: radius.xl,
              overflow: "hidden",
            },
          ]}
        >
          <FlatList
            data={galleryImages}
            decelerationRate="fast"
            disableIntervalMomentum
            getItemLayout={getGalleryItemLayout}
            horizontal
            initialNumToRender={1}
            keyExtractor={(item, index) => `${item}-${index}`}
            maxToRenderPerBatch={2}
            nestedScrollEnabled
            onMomentumScrollEnd={handleGalleryMomentumEnd}
            pagingEnabled
            ref={galleryListRef}
            removeClippedSubviews
            renderItem={renderGalleryImage}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={galleryWidth}
            windowSize={3}
          />
          {galleryImages.length > 1 ? (
            <View
              pointerEvents="none"
              style={{
                alignItems: "center",
                bottom: spacing.md,
                flexDirection: "row",
                gap: spacing.xs,
                justifyContent: "center",
                left: 0,
                position: "absolute",
                right: 0,
              }}
            >
              {galleryImages.map((item, index) => (
                <View
                  key={`${item}-dot-${index}`}
                  style={{
                    backgroundColor:
                      index === activeGalleryIndex
                        ? colors.surface.base
                        : "rgba(255,255,255,0.55)",
                    borderRadius: radius.round,
                    height: 8,
                    width: index === activeGalleryIndex ? 20 : 8,
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
      </MotionView>

      <FlatList
        data={galleryImages}
        horizontal
        inverted={isRTL}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        keyExtractor={(item, index) => `${item}-thumb-${index}`}
        renderItem={({ index, item }) => (
          <Image
            fadeDuration={120}
            resizeMethod="resize"
            resizeMode="cover"
            source={getRemoteImageSource(item)}
            onError={() => {
              galleryListRef.current?.scrollToIndex({
                animated: true,
                index: 0,
              });
            }}
            style={{
              backgroundColor: colors.surface.muted,
              borderColor:
                index === activeGalleryIndex
                  ? colors.primary[500]
                  : colors.border.soft,
              borderRadius: radius.md,
              borderWidth: 1,
              height: 86,
              width: 124,
            }}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />

      <AppCard elevated>
        <View style={{ gap: spacing.sm }}>
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.xs,
            }}
          >
            {packageDetails.isFeatured ? (
              <Chip label={t("packagesDiscovery.badges.featured")} tone="navy" />
            ) : null}
            {packageDetails.isBestSeller ? (
              <Chip
                label={t("packagesDiscovery.badges.bestSeller")}
                tone="coral"
              />
            ) : null}
            {packageDetails.isAIRecommended ? (
              <Chip label={t("packagesDiscovery.badges.ai")} tone="primary" />
            ) : null}
          </View>

          <AppText color={colors.navy[800]} variant="headline">
            {title}
          </AppText>
          <AppText color={colors.text.secondary} variant="bodySmall">
            {`${city}, ${country}`}
          </AppText>
          <AppText>{shortDescription}</AppText>
        </View>

        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          <Chip
            icon="star"
            label={`${packageDetails.rating.toFixed(1)} (${packageDetails.reviewCount})`}
            tone="warning"
          />
          <Chip
            icon="time-outline"
            label={t("packagesDiscovery.meta.duration", {
              count: packageDetails.durationDays,
            })}
            tone="primary"
          />
          <Chip
            icon="business-outline"
            label={t("packagesDiscovery.meta.hotelClass", {
              count: packageDetails.hotelClass,
            })}
            tone="navy"
          />
          {packageDetails.tags.slice(0, 6).map((tag) => (
            <Chip icon="pricetag-outline" key={tag} label={tag} tone="coral" />
          ))}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <AppText color={colors.text.muted} variant="eyebrow">
            {t("packageDetails.priceFrom")}
          </AppText>
          <AppText color={colors.primary[600]} variant="headline">
            {formatPackagePrice(packageDetails, language)}
          </AppText>
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.overviewTitle")} />
        <AppText style={{ marginTop: spacing.md }}>{longDescription}</AppText>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.snapshotTitle")} />
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={t("packageDetails.stayLabel")}
            value={t("packageDetails.durationValue", {
              days: packageDetails.durationDays,
              nights: packageDetails.durationNights,
            })}
          />
          <DetailRow
            label={t("packageDetails.hotelLabel")}
            value={t("packagesDiscovery.meta.hotelClass", {
              count: packageDetails.hotelClass,
            })}
          />
          <DetailRow
            label={t("packageDetails.flightIncludedLabel")}
            value={
              packageDetails.flightIncluded
                ? t("common.enabled")
                : t("common.disabled")
            }
          />
          <DetailRow
            label={t("packageDetails.hotelIncludedLabel")}
            value={
              packageDetails.hotelIncluded
                ? t("common.enabled")
                : t("common.disabled")
            }
          />
          <DetailRow
            label={t("packageDetails.travelersLabel")}
            value={t("packageDetails.travelersIncluded", {
              count: packageDetails.maxTravelers,
            })}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.includedTitle")} />
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {packageDetails.includes.map((item) => (
            <Chip
              icon="checkmark-circle-outline"
              key={item.en}
              label={resolvePackageText(item, language)}
              tone="success"
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.excludedTitle")} />
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {packageDetails.excludes.map((item) => (
            <Chip
              icon="remove-circle-outline"
              key={item.en}
              label={resolvePackageText(item, language)}
              tone="warning"
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.itineraryTitle")} />
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {packageDetails.itinerary.map((day, index) => (
            <MotionView index={index} key={day.day}>
              <View
                style={{
                  borderColor: colors.border.soft,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  padding: spacing.md,
                }}
              >
                <AppText color={colors.primary[600]} variant="caption">
                  {t("packageDetails.dayLabel", { count: day.day })}
                </AppText>
                <AppText variant="label">
                  {resolvePackageText(day.title, language)}
                </AppText>
                <AppText variant="bodySmall">
                  {resolvePackageText(day.description, language)}
                </AppText>
              </View>
            </MotionView>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.planningTitle")} />
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow label={t("packageDetails.bestMonthsLabel")} value={bestSeason} />
          <DetailRow label={t("packageDetails.visaNoteLabel")} value={visaNote} />
          <DetailRow
            label={t("packageDetails.departureCitiesLabel")}
            value={packageDetails.departureCities.join(" · ")}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.availableDatesTitle")} />
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {packageDetails.availableDates.map((dateOption) => (
            <Chip
              icon="calendar-outline"
              key={dateOption.id}
              label={`${formatDateRange(dateOption.startDate, dateOption.endDate)} · ${t(
                "packageDetails.seatsLeftValue",
                { count: dateOption.seatsLeft },
              )}`}
              tone="primary"
            />
          ))}
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          icon="briefcase-outline"
          label={t("packageDetails.bookTripCta")}
          onPress={() => router.push(appRoutes.demoBooking(packageDetails.id))}
        />
        <SecondaryButton
          icon={favoriteAction.iconName}
          label={favoriteAction.label}
          onPress={() => void favoriteAction.toggleFavorite()}
          tone="primary"
        />
        <SecondaryButton
          icon="share-outline"
          label={t("packageDetails.shareCta")}
          onPress={() => void triggerFeedback("selection")}
          tone="navy"
        />
        <SecondaryButton
          icon="sparkles-outline"
          label={t("packageDetails.askHayaTripCta")}
          onPress={() =>
            router.push(
              appRoutes.heiaWithPackageContext({
                packageContext,
                packageId: packageDetails.id,
              }),
            )
          }
          tone="coral"
        />
      </View>
    </ScreenContainer>
  );
};
