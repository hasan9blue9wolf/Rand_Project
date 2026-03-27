import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes, type BookingId } from "../../../navigation/routes";
import { triggerFeedback } from "../../../services/feedback";
import { colors, spacing } from "../../../theme";
import { bookingRecordsById } from "../../booking/data/booking.mock";
import {
  confirmDemoCheckout,
  type DemoCheckoutConfirmation,
} from "../services/demo-checkout.service";

export const CheckoutScreen = () => {
  const { bookingId } = useLocalSearchParams<{ bookingId: BookingId }>();
  const { formatCurrency, language, t } = useLocalization();
  const booking = bookingId ? bookingRecordsById[bookingId] : undefined;
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmation, setConfirmation] =
    useState<DemoCheckoutConfirmation | null>(null);
  const launchCopy =
    language === "ar"
      ? {
          paymentMethod: "طريقة الدفع",
          prepBody: "راجع طبقة الدفع وبيانات المسافرين قبل تثبيت الحجز النهائي.",
          prepTitle: "الجاهزية قبل التأكيد",
          travelerDetails: "بيانات المسافرين",
        }
      : {
          paymentMethod: "Payment method",
          prepBody: "Review the payment layer and traveler manifest before locking the final booking.",
          prepTitle: "Pre-confirmation readiness",
          travelerDetails: "Traveler details",
        };

  if (!bookingId || !booking) {
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
        title={t("checkout.title")}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("tabs.trips")}
          description={t("trips.emptyBody")}
          onPress={() => router.replace(appRoutes.trips)}
          title={t("checkout.title")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const total = booking.baseFare + booking.taxes + booking.serviceFee;

  const handleConfirmBooking = async () => {
    if (isConfirming) {
      return;
    }

    setIsConfirming(true);

    try {
      const nextConfirmation = await confirmDemoCheckout(booking.id);

      setConfirmation(nextConfirmation);
      await triggerFeedback("success");
    } finally {
      setIsConfirming(false);
    }
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
      subtitle={t("checkout.subtitle")}
      title={t("checkout.title")}
      withBottomTabSpacing={false}
    >
      {confirmation ? (
        <>
          <AppCard elevated>
            <View style={{ gap: spacing.sm }}>
              <AppText color={colors.status.success} variant="eyebrow">
                {t("checkout.successEyebrow")}
              </AppText>
              <AppText variant="headline">{t("checkout.successTitle")}</AppText>
              <AppText>{t("checkout.successBody")}</AppText>
            </View>

            <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
              <DetailRow
                label={t("checkout.bookingReference")}
                value={confirmation.bookingReference}
              />
              <DetailRow
                label={t("checkout.totalDue")}
                value={formatCurrency(total)}
              />
              <DetailRow
                label={t("checkout.deliveryEta")}
                value={t("checkout.deliveryEtaValue")}
              />
            </View>
          </AppCard>

          <AppCard>
            <AppText variant="title">{t("checkout.conciergeTitle")}</AppText>
            <View style={{ marginTop: spacing.md }}>
              <AppText>{t("checkout.conciergeBody")}</AppText>
            </View>
          </AppCard>

          <View style={{ gap: spacing.md }}>
            <PrimaryButton
              label={t("checkout.tripsCta")}
              onPress={() => router.replace(appRoutes.trips)}
            />
            <SecondaryButton
              label={t("checkout.heiaCta")}
              onPress={() => router.push(appRoutes.heia)}
              tone="coral"
            />
          </View>
        </>
      ) : (
        <>
          <AppCard elevated>
            <AppText variant="title">{t("checkout.summaryTitle")}</AppText>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              <DetailRow
                label={t("bookingDetails.routeLabel")}
                value={booking.routeCode}
              />
              <DetailRow
                label={t("bookingDetails.cabinLabel")}
                value={booking.cabinLabel}
              />
              <DetailRow
                label={t("checkout.travelersTitle")}
                value={t("bookingDetails.travelersValue", {
                  count: booking.travelerCount,
                })}
              />
              <DetailRow
                label={t("checkout.totalDue")}
                value={formatCurrency(total)}
              />
            </View>
          </AppCard>

          <AppCard>
            <AppText variant="title">{t("checkout.paymentTitle")}</AppText>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              <DetailRow
                label={t("checkout.billedTo")}
                value={booking.paymentLabel}
              />
              <DetailRow
                label={t("checkout.securePaymentLabel")}
                value={t("checkout.securePaymentValue")}
              />
            </View>
          </AppCard>

          <AppCard>
            <AppText variant="title">{launchCopy.prepTitle}</AppText>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              <AppText variant="bodySmall">{launchCopy.prepBody}</AppText>
              <SecondaryButton
                label={launchCopy.travelerDetails}
                onPress={() => router.push(appRoutes.travelerDetails(booking.id))}
                tone="primary"
              />
              <SecondaryButton
                label={launchCopy.paymentMethod}
                onPress={() => router.push(appRoutes.paymentMethod(booking.id))}
                tone="navy"
              />
            </View>
          </AppCard>

          <AppCard>
            <AppText variant="title">{t("checkout.confirmationTitle")}</AppText>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              <AppText>{t("checkout.confirmationHint")}</AppText>
              <AppText color={colors.text.blue} variant="bodySmall">
                {t("checkout.secureNote")}
              </AppText>
            </View>
          </AppCard>

          <View style={{ gap: spacing.md }}>
            <PrimaryButton
              label={t("checkout.confirmCta")}
              loading={isConfirming}
              onPress={handleConfirmBooking}
            />
            <SecondaryButton
              label={t("checkout.heiaCta")}
              onPress={() => router.push(appRoutes.heia)}
              tone="navy"
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
};
