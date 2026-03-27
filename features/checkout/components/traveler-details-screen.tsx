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
import { spacing } from "../../../theme";
import { bookingRecordsById } from "../../booking/data/booking.mock";

const travelerFirstNames = ["Lina", "Omar", "Sophia", "Adam"] as const;
const travelerMeals = [
  "Standard",
  "Vegetarian",
  "Chef selection",
  "Light dining",
] as const;

export const TravelerDetailsScreen = () => {
  const { bookingId } = useLocalSearchParams<{ bookingId?: BookingId }>();
  const { language, t } = useLocalization();
  const booking = bookingId ? bookingRecordsById[bookingId] : undefined;
  const copy =
    language === "ar"
      ? {
          contactTitle: "جهة الاتصال الرئيسية",
          cta: "طريقة الدفع",
          readinessTitle: "جاهزية الوصول",
          subtitle: "أسماء المسافرين، ملاحظات الخدمة، والبيانات التي يعتمد عليها الكونسيرج قبل التثبيت النهائي.",
          title: "بيانات المسافرين",
          travelerLabel: "المسافر",
          tripCta: "العودة إلى الدفع",
        }
      : {
          contactTitle: "Primary contact",
          cta: "Payment method",
          readinessTitle: "Arrival readiness",
          subtitle: "Traveler names, service notes, and the details concierge uses before final confirmation.",
          title: "Traveler details",
          travelerLabel: "Traveler",
          tripCta: "Back to checkout",
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

  const travelers = Array.from({ length: booking.travelerCount }, (_, index) => {
    const sequence = index + 1;
    const firstName = travelerFirstNames[index % travelerFirstNames.length];
    const lastName = booking.hotelName.split(" ")[0];

    return {
      id: `${booking.id}-${sequence}`,
      loyalty:
        language === "ar"
          ? `فئة مسافر ${sequence}`
          : `Traveler tier ${sequence}`,
      meal:
        language === "ar"
          ? "طلب خدمة خاص"
          : (travelerMeals[index % travelerMeals.length] ?? "Standard"),
      name: `${firstName} ${lastName}`,
      passport:
        language === "ar"
          ? `TG-${2048 + sequence} صالح حتى 2029`
          : `TG-${2048 + sequence} valid through 2029`,
      seat:
        language === "ar"
          ? `اختيار مقعد مميز ${sequence}`
          : `Priority seat ${sequence}`,
    };
  });

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
        badge={language === "ar" ? "ملف سفر جاهز" : "Ready-to-confirm manifest"}
        description={
          language === "ar"
            ? "البيانات أدناه تمثل طبقة الخدمة التي تظهر قبل تأكيد الحجز والدفع."
            : "The details below represent the service layer visible before booking and payment are finalized."
        }
        icon="people-outline"
        metrics={[
          {
            icon: "people-outline",
            label:
              language === "ar"
                ? `${booking.travelerCount} مسافرين`
                : `${booking.travelerCount} travelers`,
          },
          {
            icon: "business-outline",
            label: booking.hotelName,
          },
          {
            icon: "shield-checkmark-outline",
            label:
              language === "ar" ? "تحقق وثائق مبدئي" : "Docs pre-verified",
          },
        ]}
        title={booking.routeCode}
      />

      {travelers.map((traveler, index) => (
        <AppCard elevated={index === 0} key={traveler.id}>
          <AppText variant="title">{`${copy.travelerLabel} ${index + 1}`}</AppText>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            <DetailRow
              label={language === "ar" ? "الاسم" : "Name"}
              value={traveler.name}
            />
            <DetailRow
              label={language === "ar" ? "الجواز" : "Passport"}
              value={traveler.passport}
            />
            <DetailRow
              label={language === "ar" ? "المقعد" : "Seat preference"}
              value={traveler.seat}
            />
            <DetailRow
              label={language === "ar" ? "الوجبة" : "Service note"}
              value={traveler.meal}
            />
            <DetailRow
              label={language === "ar" ? "الفئة" : "Loyalty"}
              value={traveler.loyalty}
            />
          </View>
        </AppCard>
      ))}

      <AppCard>
        <AppText variant="title">{copy.contactTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={language === "ar" ? "الاسم" : "Lead traveler"}
            value={travelers[0]?.name ?? booking.paymentLabel}
          />
          <DetailRow
            label={language === "ar" ? "البريد" : "Email"}
            value="concierge@travelgenious.app"
          />
          <DetailRow
            label={language === "ar" ? "الهاتف" : "Phone"}
            value="+1 202 555 0148"
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.readinessTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <AppText variant="bodySmall">
            {language === "ar"
              ? "النقل من المطار، أولوية الفندق، وملاحظات الخدمة المرتبطة بالوصول محفوظة ضمن هذا الملف."
              : "Airport transfer, hotel priority notes, and arrival-service preferences are all held in this traveler file."}
          </AppText>
          <DetailRow
            label={language === "ar" ? "المسار" : "Route"}
            value={booking.routeCode}
          />
          <DetailRow
            label={language === "ar" ? "الفندق" : "Stay"}
            value={booking.hotelName}
          />
          <DetailRow
            label={language === "ar" ? "الدفع" : "Billing method"}
            value={booking.paymentLabel}
          />
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={copy.cta}
          onPress={() => router.push(appRoutes.paymentMethod(booking.id))}
        />
        <SecondaryButton
          label={copy.tripCta}
          onPress={() => router.push(appRoutes.checkout(booking.id))}
          tone="navy"
        />
      </View>
    </ScreenContainer>
  );
};
