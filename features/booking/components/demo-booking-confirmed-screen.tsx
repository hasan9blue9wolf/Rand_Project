import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { useDemoBookingsStore } from "../../../store/demo-bookings-store";
import { spacing } from "../../../theme";
import { formatCurrency } from "../../../utils/format";

export const DemoBookingConfirmedScreen = () => {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const { language, t } = useLocalization();
  const booking = useDemoBookingsStore((state) =>
    bookingId ? state.bookings.find((item) => item.bookingId === bookingId) : undefined,
  );

  if (!booking) {
    return (
      <ScreenContainer title={t("demoBooking.confirmedTitle")}>
        <EmptyState
          actionLabel={t("tabs.trips")}
          description={t("trips.emptyBody")}
          onPress={() => router.replace(appRoutes.trips)}
          title={t("demoBooking.notFound")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

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
      title={t("demoBooking.confirmedTitle")}
      withBottomTabSpacing={false}
    >
      <PremiumHeroCard
        badge={t("demoBooking.status")}
        description={t("demoBooking.confirmedBody")}
        icon="checkmark-circle-outline"
        metrics={[
          { icon: "receipt-outline", label: booking.bookingId },
          { icon: "people-outline", label: `${booking.travelerDetails.travelersCount}` },
          {
            icon: "cash-outline",
            label: formatCurrency(booking.totalEstimatedPrice, language),
          },
        ]}
        title={t("demoBooking.confirmedHero")}
      />

      <AppCard elevated>
        <View style={{ gap: spacing.md }}>
          <AppText variant="title">{booking.packageTitle}</AppText>
          <DetailRow label={t("demoBooking.summary.destination")} value={booking.destination} />
          <DetailRow label={t("demoBooking.fields.fullName")} value={booking.travelerDetails.fullName} />
          <DetailRow label={t("demoBooking.summary.date")} value={booking.travelerDetails.preferredTravelDate} />
          <DetailRow label={t("demoBooking.summary.total")} value={formatCurrency(booking.totalEstimatedPrice, language)} />
          <DetailRow label={t("demoBooking.summary.status")} value={booking.status} />
        </View>
      </AppCard>

      <AppCard>
        <AppText>{t("demoBooking.demoNotice")}</AppText>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={t("demoBooking.viewTripsCta")}
          onPress={() => router.replace(appRoutes.trips)}
        />
        <SecondaryButton
          label={t("packagesDiscovery.title")}
          onPress={() => router.replace(appRoutes.packages)}
          tone="navy"
        />
      </View>
    </ScreenContainer>
  );
};
