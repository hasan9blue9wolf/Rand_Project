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
import { appRoutes, type BookingId } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";
import { bookingRecordsById } from "../../booking/data/booking.mock";

const departureCityByCode: Record<string, string> = {
  DXB: "Dubai",
  JFK: "New York",
  LAX: "Los Angeles",
  LHR: "London",
};

export const PaymentMethodScreen = () => {
  const { bookingId } = useLocalSearchParams<{ bookingId?: BookingId }>();
  const { formatCurrency, language, t } = useLocalization();
  const booking = bookingId ? bookingRecordsById[bookingId] : undefined;
  const copy =
    language === "ar"
      ? {
          backToCheckout: "العودة إلى الدفع",
          billingTitle: "بيانات البطاقة",
          cta: "تأكيد عبر شاشة الدفع",
          securityTitle: "حماية ومعالجة آمنة",
          subtitle: "طبقة الدفع الراقية مع تفاصيل البطاقة، توزيع الرسوم، وكيفية حماية العملية.",
          summaryTitle: "ملخص الرسوم",
          title: "طريقة الدفع",
        }
      : {
          backToCheckout: "Back to checkout",
          billingTitle: "Payment credentials",
          cta: "Confirm in checkout",
          securityTitle: "Protection and processing",
          subtitle: "The premium payment layer, including card details, charge structure, and how the flow stays protected.",
          summaryTitle: "Charge summary",
          title: "Payment method",
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
        title={copy.title}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("tabs.trips")}
          description={t("trips.emptyBody")}
          onPress={() => router.replace(appRoutes.trips)}
          title={copy.title}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const total = booking.baseFare + booking.taxes + booking.serviceFee;
  const departureCode = booking.routeCode.split(" -> ")[0] ?? "";
  const billingCity = departureCityByCode[departureCode] ?? "Haya Trip";

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.checkout(booking.id))}
        />
      }
      subtitle={copy.subtitle}
      title={copy.title}
      withBottomTabSpacing={false}
    >
      <PremiumHeroCard
        accent={colors.gradients.primary}
        badge={language === "ar" ? "معالجة مشفرة" : "Encrypted authorization"}
        description={
          language === "ar"
            ? "طريقة الدفع المعروضة هنا مهيأة لتأكيد سريع، مع مراجعة بشرية من الكونسيرج عند الحاجة."
            : "The payment method shown here is set up for fast confirmation, with concierge review available when needed."
        }
        icon="card-outline"
        metrics={[
          {
            icon: "card-outline",
            label: booking.paymentLabel,
          },
          {
            icon: "cash-outline",
            label: formatCurrency(total),
          },
          {
            icon: "shield-checkmark-outline",
            label:
              language === "ar" ? "3D Secure جاهزة" : "3D Secure ready",
          },
        ]}
        title={booking.routeCode}
      />

      <AppCard elevated>
        <AppText variant="title">{copy.summaryTitle}</AppText>
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
        <AppText variant="title">{copy.billingTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={language === "ar" ? "البطاقة" : "Card"}
            value={booking.paymentLabel}
          />
          <DetailRow
            label={language === "ar" ? "مدينة الفوترة" : "Billing city"}
            value={billingCity}
          />
          <DetailRow
            label={language === "ar" ? "حالة التحقق" : "Verification"}
            value={language === "ar" ? "مراجعة صالحة لمدة 15 دقيقة" : "Authorization valid for 15 minutes"}
          />
          <DetailRow
            label={language === "ar" ? "عدد المسافرين" : "Travelers"}
            value={String(booking.travelerCount)}
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.securityTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <AppText variant="bodySmall">
            {language === "ar"
              ? "العملية تعتمد على تفويض مشفر، حماية من التكرار، ومتابعة يدوية عند تغييرات السعر أو التوفر."
              : "The flow uses encrypted authorization, duplicate protection, and manual review if price or availability changes during confirmation."}
          </AppText>
          <DetailRow
            label={language === "ar" ? "التشفير" : "Encryption"}
            value="TLS + secure request IDs"
          />
          <DetailRow
            label={language === "ar" ? "المصادقة" : "Authentication"}
            value="3D Secure / device session"
          />
          <DetailRow
            label={language === "ar" ? "المتابعة" : "Follow-up"}
            value={
              language === "ar"
                ? "الكونسيرج يرسل التأكيد بعد الدفع"
                : "Concierge sends final confirmation after payment"
            }
          />
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={copy.cta}
          onPress={() => router.push(appRoutes.checkout(booking.id))}
        />
        <SecondaryButton
          label={copy.backToCheckout}
          onPress={() => router.push(appRoutes.checkout(booking.id))}
          tone="navy"
        />
      </View>
    </ScreenContainer>
  );
};
