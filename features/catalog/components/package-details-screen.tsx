import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Image, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { MetricChip } from "../../../components/ui/metric-chip";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { SectionHeader } from "../../../components/ui/section-header";
import { queryKeys } from "../../../constants/query-keys";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes, type PackageId } from "../../../navigation/routes";
import { triggerFeedback } from "../../../services/feedback";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { colors, radius, spacing } from "../../../theme";
import {
  getSavedDestinations,
  toggleSavedDestination,
} from "../../saved/services/saved-destinations.service";
import { travelPassengerOptionsById } from "../data/catalog.mock";
import { usePackageDetailsScreen } from "../hooks/use-package-details-screen";

export const PackageDetailsScreen = () => {
  const { packageId } = useLocalSearchParams<{ packageId: PackageId }>();
  const { formatCurrency, formatDateRange, isRTL, language, t } = useLocalization();
  const userId = useAuthStore(selectActiveUserId);
  const queryClient = useQueryClient();
  const { packageDetails, packageQuery, submittedSearch } =
    usePackageDetailsScreen(packageId ?? null);
  const savedDestinationsQuery = useQuery({
    queryFn: getSavedDestinations,
    queryKey: queryKeys.savedDestinations(userId),
  });
  const heroImageSource = useMemo(
    () => getRemoteImageSource(packageDetails?.heroImageUri),
    [packageDetails?.heroImageUri],
  );
  const saveDestinationMutation = useMutation({
    mutationFn: async () => {
      if (!packageDetails) {
        return null;
      }

      return toggleSavedDestination({
        destinationName: t(`content.offers.${packageDetails.id}.destination`, {
          defaultValue: packageDetails.destination,
        }),
        destinationSlug: packageDetails.id,
        imageUrl: packageDetails.heroImageUri,
        packageId: packageDetails.id,
        priceFrom: packageDetails.priceFrom,
        source: "package-details",
        summary: t(`content.offers.${packageDetails.id}.title`, {
          defaultValue: packageDetails.title,
        }),
      });
    },
    onSuccess: async () => {
      if (!packageDetails) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.savedDestinations(userId),
      });
      await triggerFeedback("success");
    },
  });

  if (packageQuery.isLoading) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.searchResults())}
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

  if (!packageId || !packageDetails) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.home)}
          />
        }
        scrollable={false}
        title={t("packageDetails.title")}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("tabs.offers")}
          description={t("offers.emptyBody")}
          onPress={() => router.replace(appRoutes.offers)}
          title={t("offers.emptyTitle")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const localizedTitle = t(`content.offers.${packageDetails.id}.title`, {
    defaultValue: packageDetails.title,
  });
  const localizedDestination = t(
    `content.offers.${packageDetails.id}.destination`,
    {
      defaultValue: packageDetails.destination,
    },
  );
  const localizedDuration = t(`content.offers.${packageDetails.id}.duration`, {
    defaultValue: packageDetails.duration,
  });
  const localizedSummary = t(`content.offers.${packageDetails.id}.summary`, {
    defaultValue: packageDetails.summary,
  });
  const localizedHighlights = t(
    `content.offers.${packageDetails.id}.highlights`,
    {
      defaultValue: packageDetails.highlights,
      returnObjects: true,
    },
  ) as string[];
  const selectedPassengers =
    travelPassengerOptionsById[submittedSearch.passengerOptionId];
  const isSavedDestination =
    savedDestinationsQuery.data?.some(
      (destination) => destination.destinationSlug === packageDetails.id,
    ) ?? false;
  const launchCopy =
    language === "ar"
      ? {
          destinationGuide: "دليل الوجهة",
        }
      : {
          destinationGuide: "Destination guide",
        };

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.searchResults())}
        />
      }
      subtitle={t("packageDetails.subtitle")}
      title={t("packageDetails.title")}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("common.notifications")}
          icon="notifications-outline"
          onPress={() => router.push(appRoutes.notifications)}
        />
      }
      withBottomTabSpacing={false}
    >
      <View
        style={{
          borderRadius: radius.lg,
          overflow: "hidden",
        }}
      >
        <Image
          resizeMode="cover"
          source={heroImageSource}
          style={{ height: 244, width: "100%" }}
        />
      </View>

      <AppCard elevated>
        <View style={{ gap: spacing.sm }}>
          <MetricChip icon="sparkles" label={t("packageDetails.heroTag")} />
          <AppText variant="headline">{localizedTitle}</AppText>
          <AppText>{localizedDestination}</AppText>
          <AppText>{localizedSummary}</AppText>
        </View>

        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          <Chip icon="moon" label={localizedDuration} tone="primary" />
          <Chip
            icon="star-outline"
            label={t("searchResults.hotelClassValue", {
              count: packageDetails.hotelClass,
            })}
            tone="navy"
          />
          {packageDetails.directFlight ? (
            <Chip
              icon="airplane-outline"
              label={t("searchResults.directFlight")}
              tone="success"
            />
          ) : null}
          {packageDetails.refundable ? (
            <Chip
              icon="refresh-outline"
              label={t("searchResults.refundable")}
              tone="warning"
            />
          ) : null}
          {packageDetails.visaFriendly ? (
            <Chip
              icon="document-text-outline"
              label={t("searchResults.visaFriendly")}
              tone="primary"
            />
          ) : null}
          {localizedHighlights.map((highlight) => (
            <Chip
              icon="sparkles"
              key={highlight}
              label={highlight}
              tone="coral"
            />
          ))}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <AppText color={colors.text.muted} variant="eyebrow">
            {t("packageDetails.priceFrom")}
          </AppText>
          <AppText color={colors.primary[600]} variant="headline">
            {formatCurrency(packageDetails.priceFrom)}
          </AppText>
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.searchContextTitle")} />
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={t("searchResults.criteria.from")}
            value={t(`searchDiscovery.locations.${submittedSearch.fromId}`)}
          />
          <DetailRow
            label={t("searchResults.criteria.to")}
            value={t(`searchDiscovery.locations.${submittedSearch.toId}`)}
          />
          <DetailRow
            label={t("searchResults.criteria.dates")}
            value={formatDateRange(
              submittedSearch.startDate,
              submittedSearch.endDate,
            )}
          />
          <DetailRow
            label={t("searchResults.criteria.passengers")}
            value={t(`searchDiscovery.passengers.${selectedPassengers.id}`)}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.snapshotTitle")} />
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={t("packageDetails.routeLabel")}
            value={packageDetails.routeCode}
          />
          <DetailRow
            label={t("packageDetails.cabinLabel")}
            value={packageDetails.cabinLabel}
          />
          <DetailRow
            label={t("packageDetails.hotelLabel")}
            value={packageDetails.hotelName}
          />
          <DetailRow
            label={t("packageDetails.stayLabel")}
            value={localizedDuration}
          />
          <DetailRow
            label={t("packageDetails.seatsLeftLabel")}
            value={t("packageDetails.seatsLeftValue", {
              count: packageDetails.seatsLeft,
            })}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.includedTitle")} />
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          {localizedHighlights.map((highlight) => (
            <Chip
              icon="checkmark-circle-outline"
              key={highlight}
              label={highlight}
              tone="primary"
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.itineraryTitle")} />
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          {packageDetails.themes.map((theme) => (
            <Chip
              icon="compass-outline"
              key={theme}
              label={t(`searchResults.themes.${theme}`)}
              tone="navy"
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("packageDetails.flexibleTitle")} />
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <AppText>{t("packageDetails.flexibleBody")}</AppText>
          <AppText color={colors.text.primary} variant="label">
            {`${t("packageDetails.idealForLabel")}: ${packageDetails.themes
              .map((theme) => t(`searchResults.themes.${theme}`))
              .join(" · ")}`}
          </AppText>
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={t("packageDetails.reserveFlights")}
          onPress={() =>
            router.push(
              appRoutes.flightBookingDetails(packageDetails.bookingId),
            )
          }
        />
        <SecondaryButton
          label={
            isSavedDestination
              ? t("packageDetails.savedDestinationCta")
              : t("packageDetails.saveDestinationCta")
          }
          loading={saveDestinationMutation.isPending}
          onPress={() => saveDestinationMutation.mutate()}
          tone="primary"
        />
        <SecondaryButton
          label={launchCopy.destinationGuide}
          onPress={() =>
            router.push(appRoutes.destinationDetails(packageDetails.destinationId))
          }
          tone="navy"
        />
        <SecondaryButton
          label={t("packageDetails.askHeia")}
          onPress={() => router.push(appRoutes.heia)}
          tone="coral"
        />
      </View>
    </ScreenContainer>
  );
};
