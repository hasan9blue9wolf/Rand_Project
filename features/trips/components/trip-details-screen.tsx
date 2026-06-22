import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { upcomingTrips } from "../../../constants/mock-data";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, radius, spacing } from "../../../theme";
import type { TripStatus } from "../../../types/travel";
import { resolveLocalizedValue } from "../../../utils/localized";
import { tripToBookingMap } from "../../booking/data/booking.mock";

const statusLabel = (
  language: "ar" | "en",
  status: TripStatus,
) =>
  ({
    confirmed: language === "ar" ? "مؤكدة" : "Confirmed",
    planning: language === "ar" ? "قيد التخطيط" : "Planning",
    wishlist: language === "ar" ? "قائمة أمنيات" : "Wishlist",
  })[status];

const tripNarratives = {
  "trip-1": {
    badge: { ar: "رحلة قريبة", en: "Departing soon" },
    checklist: {
      ar: ["تأكيد النقل من المطار", "تجهيز الوثائق", "مراجعة الوصول المبكر"],
      en: [
        "Airport transfer confirmed",
        "Documents prepared",
        "Early-arrival preferences reviewed",
      ],
    },
    flow: {
      ar: [
        {
          body: "الوصول إلى المدينة والاستقرار في الفندق مع أمسية خفيفة.",
          title: "الوصول",
        },
        {
          body: "جلسات مطلة وتجارب طعام ومواعيد مرنة على إيقاع عطلة قصيرة.",
          title: "المنتصف",
        },
        {
          body: "مغادرة مريحة مع ترتيبات صالة وانتقال منسق.",
          title: "العودة",
        },
      ],
      en: [
        {
          body: "Arrive into the city, settle into the hotel, and keep the first evening light.",
          title: "Arrival",
        },
        {
          body: "Views, dining, and flexible city plans are arranged around a short premium break.",
          title: "Middle stretch",
        },
        {
          body: "Departure stays easy with lounge access and coordinated transfers.",
          title: "Departure",
        },
      ],
    },
    mobility: {
      ar: "سيارة خاصة من وإلى المطار مع تسجيل دخول مبكر حسب التوفر.",
      en: "Private airport transfers with early check-in preference handling when available.",
    },
    note: {
      ar: "رحلة قصيرة ولكنها مصقولة بالكامل، مصممة للمسافر الذي يريد راحة عالية من دون إهدار الوقت.",
      en: "A short stay, but fully polished, designed for travelers who want high comfort without wasting time.",
    },
  },
  "trip-2": {
    badge: { ar: "قيد الضبط مع هيا", en: "Haya is refining it" },
    checklist: {
      ar: ["اعتماد الرحلات", "تأكيد الفندق", "إقفال جدول الاجتماعات"],
      en: [
        "Flight shortlist pending",
        "Hotel hold in place",
        "Meeting blocks being finalized",
      ],
    },
    flow: {
      ar: [
        {
          body: "الوصول إلى مدينة التصميم مع مساء أول قصير بالقرب من الفندق.",
          title: "الوصول",
        },
        {
          body: "أيام مزيج بين الاجتماعات والمعارض والعشاءات المحجوزة.",
          title: "أيام المدينة",
        },
        {
          body: "وقت أخير مفتوح لاختيار الأحياء أو المتاحف أو المواعيد الإضافية.",
          title: "الختام",
        },
      ],
      en: [
        {
          body: "Arrive into the design district with a short first evening close to the hotel.",
          title: "Landing",
        },
        {
          body: "Meetings, exhibitions, and reserved dining are balanced across the core days.",
          title: "City days",
        },
        {
          body: "The close stays open for neighborhoods, museums, or additional meetings.",
          title: "Final window",
        },
      ],
    },
    mobility: {
      ar: "النقل الداخلي مرن، والكونسيرج يضبط التوقيتات حول جدول العمل.",
      en: "In-city mobility stays flexible, with concierge timing built around the business schedule.",
    },
    note: {
      ar: "هذه الرحلة ما زالت في طور التشكيل، لكن الإطار العام مضبوط والقرارات الكبرى باتت شبه محسومة.",
      en: "This trip is still taking shape, but the framework is already strong and the big decisions are nearly locked.",
    },
  },
  "trip-3": {
    badge: { ar: "محفوظة للموسم المناسب", en: "Held for the right season" },
    checklist: {
      ar: ["تأكيد مواعيد الخريف", "تنسيق الأحياء الهادئة", "إقفال اختيارات الإقامة"],
      en: [
        "Autumn travel window tracked",
        "Quiet neighborhood shortlist ready",
        "Stay options saved",
      ],
    },
    flow: {
      ar: [
        {
          body: "الوصول إلى رحلة بطابع موسمي يركز على الهدوء واللون والمشي.",
          title: "المشهد الأول",
        },
        {
          body: "أيام موزعة بين المعابد والحدائق والمقاهي والأحياء التقليدية.",
          title: "قلب التجربة",
        },
        {
          body: "ختام خفيف يسمح بإبقاء الرحلة مفتوحة حتى اقتراب الموسم.",
          title: "نهاية مرنة",
        },
      ],
      en: [
        {
          body: "Arrival into a seasonal trip built around calm, color, and walkable days.",
          title: "First frame",
        },
        {
          body: "Temples, gardens, cafes, and traditional districts sit at the center of the stay.",
          title: "Core experience",
        },
        {
          body: "The finish stays intentionally open while the season comes closer.",
          title: "Flexible close",
        },
      ],
    },
    mobility: {
      ar: "الرحلة تعتمد على سير هادئ وتنقلات قصيرة ومدروسة بين الأحياء.",
      en: "The trip leans on soft walking flows and short, deliberate in-city transfers.",
    },
    note: {
      ar: "رحلة ملهمة أكثر من كونها جاهزة للدفع الآن، لكنها محفوظة بإحساس واضح ومحدد.",
      en: "This one is more inspirational than checkout-ready, but it is held with a strong and specific point of view.",
    },
  },
} as const;

const isKnownTripId = (
  tripId: string,
): tripId is keyof typeof tripNarratives => tripId in tripNarratives;

const hasBookingRoute = (
  tripId: string,
): tripId is keyof typeof tripToBookingMap => tripId in tripToBookingMap;

export const TripDetailsScreen = () => {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { formatDateRange, isRTL, language, t } = useLocalization();
  const trip = upcomingTrips.find((item) => item.id === tripId);
  const copy =
    language === "ar"
      ? {
          bookingCta: "مراجعة الحجز",
          checkoutCta: "الدفع والمتابعة",
          checklistTitle: "قائمة الجاهزية",
          detailsTitle: "الحركة والإقامة",
          subtitle: "المشهد الكامل للرحلة، ما تم تثبيته، وما الذي لا يزال ينتظر القرار النهائي.",
          title: "تفاصيل الرحلة",
          timelineTitle: "تدفق الرحلة",
        }
      : {
          bookingCta: "Review booking",
          checkoutCta: "Checkout and confirm",
          checklistTitle: "Readiness checklist",
          detailsTitle: "Stay and mobility",
          subtitle: "The full travel picture, what is locked, and what still waits for the final decision.",
          title: "Trip details",
          timelineTitle: "Trip flow",
        };

  if (!tripId || !trip || !isKnownTripId(trip.id)) {
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

  const narrative = tripNarratives[trip.id];
  const tripFlow = language === "ar" ? narrative.flow.ar : narrative.flow.en;
  const tripChecklist =
    language === "ar" ? narrative.checklist.ar : narrative.checklist.en;
  const bookingId = hasBookingRoute(trip.id) ? tripToBookingMap[trip.id] : null;

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
      subtitle={copy.subtitle}
      title={copy.title}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("common.notifications")}
          icon="notifications-outline"
          onPress={() => router.push(appRoutes.notifications)}
        />
      }
      withBottomTabSpacing={false}
    >
      <PremiumHeroCard
        accent={colors.gradients.navy}
        badge={resolveLocalizedValue(language, narrative.badge)}
        description={resolveLocalizedValue(language, narrative.note)}
        icon="airplane-outline"
        metrics={[
          {
            icon: "calendar-outline",
            label: formatDateRange(trip.startDate, trip.endDate),
          },
          {
            icon: "people-outline",
            label:
              language === "ar"
                ? `${trip.travelers} مسافرين`
                : `${trip.travelers} travelers`,
          },
          {
            icon: "sparkles-outline",
            label: statusLabel(language, trip.status),
          },
        ]}
        title={trip.title}
      >
        <AppText color="rgba(255,255,255,0.82)" variant="bodySmall">
          {trip.destination}
        </AppText>
      </PremiumHeroCard>

      <AppCard>
        <AppText variant="title">{copy.timelineTitle}</AppText>
        <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
          {tripFlow.map((step, index) => (
            <View
              key={step.title}
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.md,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  backgroundColor:
                    index === 1 ? colors.coral[50] : colors.background.softBlue,
                  borderRadius: radius.round,
                  height: 42,
                  justifyContent: "center",
                  width: 42,
                }}
              >
                <AppText
                  color={
                    index === 1 ? colors.coral[600] : colors.primary[600]
                  }
                  variant="label"
                >
                  {String(index + 1)}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: spacing.xxs }}>
                <AppText variant="label">{step.title}</AppText>
                <AppText variant="bodySmall">{step.body}</AppText>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard elevated>
        <AppText variant="title">{copy.detailsTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <AppText>{resolveLocalizedValue(language, narrative.mobility)}</AppText>
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.xs,
            }}
          >
            <Chip
              icon="briefcase-outline"
              label={trip.progressLabel}
              tone="primary"
            />
            <Chip
              icon="location-outline"
              label={trip.destination}
              tone="navy"
            />
            <Chip
              icon="time-outline"
              label={statusLabel(language, trip.status)}
              tone="coral"
            />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.checklistTitle}</AppText>
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginTop: spacing.md,
          }}
        >
          {tripChecklist.map((item) => (
            <Chip icon="checkmark-circle-outline" key={item} label={item} tone="success" />
          ))}
        </View>
      </AppCard>

      {bookingId ? (
        <View style={{ gap: spacing.md }}>
          <PrimaryButton
            label={copy.bookingCta}
            onPress={() => router.push(appRoutes.flightBookingDetails(bookingId))}
          />
          <SecondaryButton
            label={copy.checkoutCta}
            onPress={() => router.push(appRoutes.checkout(bookingId))}
            tone="coral"
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
};
