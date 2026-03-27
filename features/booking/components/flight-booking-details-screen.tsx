import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SectionHeader } from "../../../components/ui/section-header";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes, type BookingId } from "../../../navigation/routes";
import { spacing } from "../../../theme";
import { travelPassengerOptionsById } from "../../catalog/data/catalog.mock";
import { useFlightBookingDetailsScreen } from "../hooks/use-flight-booking-details-screen";

export const FlightBookingDetailsScreen = () => {
  const { bookingId } = useLocalSearchParams<{ bookingId: BookingId }>();
  const { formatCurrency, formatDateRange, isRTL, t } = useLocalization();
  const { bookingQuery, bookingSummary, submittedSearch } =
    useFlightBookingDetailsScreen(bookingId ?? null);

  if (bookingQuery.isLoading) {
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
        title={t("bookingDetails.title")}
        withBottomTabSpacing={false}
      >
        <LoadingState label={t("bookingDetails.title")} />
      </ScreenContainer>
    );
  }

  if (!bookingId || !bookingSummary) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.trips)}
          />
        }
        scrollable={false}
        title={t("bookingDetails.title")}
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

  const { booking, packageDetails, total } = bookingSummary;
  const selectedPassengers =
    travelPassengerOptionsById[submittedSearch.passengerOptionId];

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() =>
            navigateBackOr(
              appRoutes.packageDetails(packageDetails?.id ?? "bali-signature"),
            )
          }
        />
      }
      subtitle={t("bookingDetails.subtitle")}
      title={t("bookingDetails.title")}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("common.notifications")}
          icon="notifications-outline"
          onPress={() => router.push(appRoutes.notifications)}
        />
      }
      withBottomTabSpacing={false}
    >
      <AppCard elevated>
        <AppText variant="title">{t("bookingDetails.summaryTitle")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {packageDetails ? (
            <DetailRow
              label={t("bookingDetails.packageLabel")}
              value={t(`content.offers.${packageDetails.id}.title`, {
                defaultValue: packageDetails.title,
              })}
            />
          ) : null}
          <DetailRow
            label={t("bookingDetails.routeLabel")}
            value={booking.routeCode}
          />
          <DetailRow
            label={t("bookingDetails.scheduleLabel")}
            value={`${booking.departureLabel} · ${booking.arrivalLabel}`}
          />
          <DetailRow
            label={t("bookingDetails.durationLabel")}
            value={booking.durationLabel}
          />
          <DetailRow
            label={t("bookingDetails.cabinLabel")}
            value={booking.cabinLabel}
          />
          <DetailRow
            label={t("bookingDetails.hotelLabel")}
            value={booking.hotelName}
          />
          <DetailRow
            label={t("bookingDetails.travelersLabel")}
            value={t("bookingDetails.travelersValue", {
              count: booking.travelerCount,
            })}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("bookingDetails.policyTitle")} />
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          {packageDetails?.directFlight ? (
            <Chip
              icon="airplane-outline"
              label={t("searchResults.directFlight")}
              tone="success"
            />
          ) : null}
          {packageDetails?.refundable ? (
            <Chip
              icon="refresh-outline"
              label={t("searchResults.refundable")}
              tone="warning"
            />
          ) : null}
          {packageDetails?.visaFriendly ? (
            <Chip
              icon="document-text-outline"
              label={t("searchResults.visaFriendly")}
              tone="primary"
            />
          ) : null}
          {packageDetails ? (
            <Chip
              icon="star-outline"
              label={t("searchResults.hotelClassValue", {
                count: packageDetails.hotelClass,
              })}
              tone="navy"
            />
          ) : null}
        </View>
      </AppCard>

      <AppCard>
        <SectionHeader title={t("bookingDetails.searchContextTitle")} />
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
        <AppText variant="title">{t("bookingDetails.fareTitle")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={t("bookingDetails.baseFare")}
            value={formatCurrency(booking.baseFare)}
          />
          <DetailRow
            label={t("bookingDetails.taxes")}
            value={formatCurrency(booking.taxes)}
          />
          <DetailRow
            label={t("bookingDetails.serviceFee")}
            value={formatCurrency(booking.serviceFee)}
          />
          <DetailRow
            label={t("bookingDetails.total")}
            value={formatCurrency(total)}
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("bookingDetails.includedTitle")}</AppText>
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          {booking.services.map((serviceId) => (
            <Chip
              icon="checkmark-circle-outline"
              key={serviceId}
              label={t(`bookingDetails.services.${serviceId}`)}
              tone="primary"
            />
          ))}
        </View>
      </AppCard>

      <PrimaryButton
        label={t("bookingDetails.continueCta")}
        onPress={() => router.push(appRoutes.checkout(booking.id))}
      />
    </ScreenContainer>
  );
};
