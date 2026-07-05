import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Image, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { triggerFeedback } from "../../../services/feedback";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { useDemoBookingsStore } from "../../../store/demo-bookings-store";
import { colors, radius, shadows, spacing } from "../../../theme";
import { formatCurrency, formatDate } from "../../../utils/format";
import { demoTravelPackages } from "../../packages/data/demo-travel-packages.seed";
import {
  resolvePackageImageUrl,
  resolvePackageText,
} from "../../packages/helpers/package-helpers";

const statusOrder = [
  "Pending Confirmation",
  "Confirmed Demo",
  "Completed",
  "Cancelled",
] as const;

export const TripDetailsScreen = () => {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { isRTL, language, t } = useLocalization();
  const booking = useDemoBookingsStore((state) =>
    tripId ? state.bookings.find((item) => item.bookingId === tripId) : undefined,
  );
  const cancelBooking = useDemoBookingsStore((state) => state.cancelBooking);
  const packageItem = useMemo(
    () =>
      booking
        ? demoTravelPackages.find((item) => item.id === booking.packageId)
        : undefined,
    [booking],
  );

  if (!booking) {
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
        title={t("tripDetails.title")}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("trips.exploreCta")}
          description={t("trips.emptyBody")}
          onPress={() => router.replace(appRoutes.packages)}
          title={t("tripDetails.notFoundTitle")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const imageUrl = packageItem?.imageUrl ?? booking.imageUrl;
  const packageSummary = packageItem
    ? resolvePackageText(packageItem.longDescription, language)
    : booking.packageTitle;
  const itinerary = packageItem?.itinerary ?? [];
  const handleCancel = async () => {
    cancelBooking(booking.bookingId);
    await triggerFeedback("success");
  };

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
      subtitle={t("tripDetails.subtitle")}
      title={t("tripDetails.title")}
      withBottomTabSpacing={false}
    >
      <View
        style={[
          shadows.premium,
          {
            borderRadius: radius.xl,
            overflow: "hidden",
          },
        ]}
      >
        <Image
          resizeMode="cover"
          source={getRemoteImageSource(resolvePackageImageUrl(imageUrl))}
          style={{ backgroundColor: colors.surface.muted, height: 250, width: "100%" }}
        />
      </View>

      <AppCard elevated>
        <View style={{ gap: spacing.md }}>
          <View
            style={{
              alignItems: "flex-start",
              flexDirection: isRTL ? "row-reverse" : "row",
              gap: spacing.md,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, gap: spacing.xs }}>
              <AppText color={colors.navy[800]} variant="headline">
                {booking.packageTitle}
              </AppText>
              <AppText color={colors.text.secondary}>
                {booking.destination}
              </AppText>
            </View>
            <Chip
              label={t(`trips.bookingStatuses.${booking.status}`)}
              tone={booking.status === "Cancelled" ? "warning" : "primary"}
            />
          </View>
          <View style={{ gap: spacing.md }}>
            <DetailRow label={t("trips.bookingId")} value={booking.bookingId} />
            <DetailRow
              label={t("demoBooking.summary.date")}
              value={formatDate(
                booking.travelerDetails.preferredTravelDate,
                language,
              )}
            />
            <DetailRow
              label={t("demoBooking.summary.travelers")}
              value={`${booking.travelerDetails.travelersCount}`}
            />
            <DetailRow
              label={t("demoBooking.summary.total")}
              value={formatCurrency(booking.totalEstimatedPrice, language)}
            />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("tripDetails.packageSummaryTitle")}</AppText>
        <AppText style={{ marginTop: spacing.md }}>{packageSummary}</AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {booking.includedServices.slice(0, 6).map((item) => (
            <Chip
              icon="checkmark-circle-outline"
              key={item}
              label={item}
              tone="success"
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("tripDetails.travelerDetailsTitle")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={t("demoBooking.fields.fullName")}
            value={booking.travelerDetails.fullName}
          />
          <DetailRow
            label={t("demoBooking.fields.phoneNumber")}
            value={booking.travelerDetails.phoneNumber}
          />
          <DetailRow
            label={t("demoBooking.fields.email")}
            value={booking.travelerDetails.email}
          />
          <DetailRow
            label={t("demoBooking.fields.departureCity")}
            value={booking.travelerDetails.departureCity}
          />
          <DetailRow
            label={t("demoBooking.fields.specialRequests")}
            value={
              booking.travelerDetails.specialRequests ||
              t("tripDetails.noSpecialRequests")
            }
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("tripDetails.itineraryTitle")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {itinerary.map((day) => (
            <View
              key={day.day}
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
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("tripDetails.timelineTitle")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {statusOrder.map((status, index) => {
            const isActive = status === booking.status;
            const isCancelled = booking.status === "Cancelled";

            return (
              <View
                key={status}
                style={{
                  alignItems: "center",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: isActive
                      ? colors.primary[50]
                      : colors.surface.muted,
                    borderColor: isActive
                      ? colors.primary[500]
                      : colors.border.soft,
                    borderRadius: radius.round,
                    borderWidth: 1,
                    height: 36,
                    justifyContent: "center",
                    width: 36,
                  }}
                >
                  <AppText
                    color={isActive ? colors.primary[600] : colors.text.muted}
                    variant="label"
                  >
                    {index + 1}
                  </AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText
                    color={isActive ? colors.navy[800] : colors.text.secondary}
                    variant="label"
                  >
                    {t(`trips.bookingStatuses.${status}`)}
                  </AppText>
                  {isActive ? (
                    <AppText variant="bodySmall">
                      {isCancelled
                        ? t("tripDetails.cancelledTimelineNote")
                        : t("tripDetails.activeTimelineNote")}
                    </AppText>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("tripDetails.supportTitle")}</AppText>
        <AppText style={{ marginTop: spacing.sm }}>
          {t("tripDetails.supportBody")}
        </AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow label={t("tripDetails.supportEmail")} value="support@hayatrips.app" />
          <DetailRow label={t("tripDetails.supportPhone")} value="+964 780 000 0000" />
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        {booking.status !== "Cancelled" ? (
          <SecondaryButton
            icon="close-circle-outline"
            label={t("tripDetails.cancelCta")}
            onPress={() => void handleCancel()}
            tone="coral"
          />
        ) : null}
        <PrimaryButton
          label={t("trips.exploreCta")}
          onPress={() => router.push(appRoutes.packages)}
        />
      </View>
    </ScreenContainer>
  );
};
