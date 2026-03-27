import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Image, View } from "react-native";

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
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, spacing } from "../../../theme";
import { resolveLocalizedValue } from "../../../utils/localized";
import { catalogPackages, featuredOffersById } from "../data/catalog.mock";

const destinationStories = {
  bali: {
    badge: { ar: "دليل الجزر الهادئ", en: "Island arrival guide" },
    moments: {
      ar: [
        "جلسات صباحية هادئة في الفيلا مع إفطار خاص وإطلالات استوائية.",
        "تنسيق أيام الشاطئ والسبا والمطاعم بحيث تبقى الرحلة خفيفة ومريحة.",
        "وقت حر محسوب للتسوق أو النوادي الشاطئية أو العشاء عند الغروب.",
      ],
      en: [
        "Slow villa mornings with private breakfast and tropical light.",
        "Beach, spa, and dining moments sequenced to feel effortless.",
        "A final flexible day for shopping, clubs, or a polished sunset dinner.",
      ],
    },
    overview: {
      ar: "بالي هنا ليست مجرد وجهة شاطئية. هي إيقاع فاخر وهادئ يجمع بين الخصوصية والاسترخاء والطقوس اليومية المصممة بعناية.",
      en: "Bali here is more than a beach escape. It is a slower luxury rhythm shaped around privacy, restoration, and deliberate daily moments.",
    },
    rhythm: {
      ar: [
        {
          body: "الوصول والاستقبال الخاص وتجهيز الإقامة قبل أول أمسية.",
          title: "الوصول بسلاسة",
        },
        {
          body: "تنقل بين الساحل والسبا وتجارب الطعام من دون ازدحام جدول الرحلة.",
          title: "وسط الرحلة",
        },
        {
          body: "أمسية أخيرة مرنة تسمح لك باختيار أسلوب ختام الرحلة بطريقتك.",
          title: "الختام المثالي",
        },
      ],
      en: [
        {
          body: "Private arrival flow and villa readiness before your first evening lands.",
          title: "Arrive softly",
        },
        {
          body: "Coastline time, spa recovery, and dining all balanced without crowding the schedule.",
          title: "Middle rhythm",
        },
        {
          body: "A polished final day stays intentionally open so the trip can end your way.",
          title: "Finish well",
        },
      ],
    },
    title: { ar: "لماذا يختارها المسافرون", en: "Why travelers choose it" },
  },
  barcelona: {
    badge: { ar: "إيقاع مدينة راقٍ", en: "Refined city rhythm" },
    moments: {
      ar: [
        "فندق مركزي يسهل التنقل بين الثقافة والتسوق والمطاعم.",
        "تجارب عائلية محسوبة من دون التضحية بالإحساس الراقي.",
        "وقت مدروس للمتاحف والبحر والأحياء الحيوية في جدول مرن.",
      ],
      en: [
        "A central stay that keeps culture, shopping, and dining easy to balance.",
        "Family-friendly planning without losing the premium feel.",
        "Flexible time for museums, coastlines, and neighborhood wandering.",
      ],
    },
    overview: {
      ar: "برشلونة في ترافيل جينيوس تبدو مدينة أنيقة وسهلة. الثقافة قريبة، والإقامة مركزية، واليوم موزع بين النشاط والراحة.",
      en: "Barcelona in TravelGenious feels polished and easy. Culture stays close, the hotel stays central, and the day moves between energy and comfort.",
    },
    rhythm: {
      ar: [
        {
          body: "وصول سلس مع وقت خفيف للتعرف على الحي المحيط.",
          title: "بداية سهلة",
        },
        {
          body: "مزيج من الأنشطة العائلية والمطاعم والجولات الهادئة.",
          title: "وسط نابض",
        },
        {
          body: "فسحة أخيرة للشاطئ أو التسوق أو نزهة معمارية.",
          title: "نهاية مرنة",
        },
      ],
      en: [
        {
          body: "A smooth arrival leaves space to settle into the neighborhood.",
          title: "Easy opening",
        },
        {
          body: "Family moments, dining, and light cultural stops stay well balanced.",
          title: "Center of the stay",
        },
        {
          body: "A final window stays open for the beach, shopping, or architecture walks.",
          title: "Flexible finish",
        },
      ],
    },
    title: { ar: "إحساس برشلونة", en: "What Barcelona feels like" },
  },
  cappadocia: {
    badge: { ar: "مغامرة أنيقة", en: "Adventure with polish" },
    moments: {
      ar: [
        "إقامة كهفية مميزة تمنح الرحلة طابعاً بصرياً قوياً من اليوم الأول.",
        "تجارب الشروق والمناطيد والوديان ضمن إيقاع لا يشعر بالاستعجال.",
        "توازن واضح بين المغامرة والهدوء وخدمة الكونسيرج.",
      ],
      en: [
        "Cave-suite stays give the trip a strong visual identity from the first evening.",
        "Sunrise balloons and valley experiences are paced without feeling rushed.",
        "Adventure is balanced with quiet time and concierge-level support.",
      ],
    },
    overview: {
      ar: "كابادوكيا هنا مفعمة بالمشهدية ولكنها غير صاخبة. كل تفصيل يوحي بالمغامرة، لكن التجربة تظل مريحة ومضبوطة.",
      en: "Cappadocia here stays cinematic without turning noisy. Every detail points to adventure, while the overall experience still feels calm and controlled.",
    },
    rhythm: {
      ar: [
        {
          body: "الوصول إلى الإقامة وتجربة أول أمسية هادئة في المشهد الصخري.",
          title: "الوصول إلى المشهد",
        },
        {
          body: "أنشطة الشروق والجولات موزعة مع وقت استراحة كافٍ.",
          title: "نهار نشط",
        },
        {
          body: "ختام ناعم يترك مساحة للتصوير أو الاسترخاء أو العشاء الأخير.",
          title: "خاتمة متوازنة",
        },
      ],
      en: [
        {
          body: "Arrival into the landscape and a softer first evening in the stone setting.",
          title: "Enter the setting",
        },
        {
          body: "Sunrise and excursion blocks are spaced with room to recover.",
          title: "Active middle",
        },
        {
          body: "The finish leaves space for photography, recovery, or a last dinner.",
          title: "Balanced close",
        },
      ],
    },
    title: { ar: "جوهر التجربة", en: "The core appeal" },
  },
  maldives: {
    badge: { ar: "هدوء فوق الماء", en: "Overwater calm" },
    moments: {
      ar: [
        "إقامة فوق الماء تحوّل الإطلالة إلى جزء من التجربة اليومية.",
        "هدوء حقيقي في الإيقاع مع خدمة راقية وتجارب قليلة ولكن محسوبة.",
        "خصوصية عالية تجعل الرحلة مناسبة للهروب الرومانسي أو الاستجمام الكامل.",
      ],
      en: [
        "Overwater stays turn the view into part of the daily ritual.",
        "The tempo stays genuinely quiet, with a few well-selected premium experiences.",
        "High privacy makes the trip ideal for romantic escapes or total reset time.",
      ],
    },
    overview: {
      ar: "المالديف هنا مصممة كملاذ كامل: هدوء، ماء، مساحات خاصة، وخدمة تبقي كل شيء بسيطاً وناعماً.",
      en: "The Maldives here is built as a full retreat: water, quiet, private space, and service that keeps everything simple and smooth.",
    },
    rhythm: {
      ar: [
        {
          body: "الوصول إلى المنتجع والدخول في إيقاع بطيء من أول ساعة.",
          title: "التحول إلى الراحة",
        },
        {
          body: "أيام موزعة بين البحيرة والسبا والطعام الهادئ والرحلات القصيرة.",
          title: "منتصف الإقامة",
        },
        {
          body: "أيام ختامية مخصصة للهدوء التام قبل العودة.",
          title: "خاتمة مريحة",
        },
      ],
      en: [
        {
          body: "Arrival into resort calm and a slower pace from the first hour.",
          title: "Shift into rest",
        },
        {
          body: "Lagoon time, spa blocks, quiet dining, and light excursions stay balanced.",
          title: "Middle of the stay",
        },
        {
          body: "The close is designed to remain calm right up to departure.",
          title: "Restful ending",
        },
      ],
    },
    title: { ar: "إحساس الإقامة", en: "How the stay lands" },
  },
  tokyo: {
    badge: { ar: "مدينة بتخطيط ذكي", en: "City intelligence" },
    moments: {
      ar: [
        "إقامة تصميمية تجعل العمل أو الاستكشاف أكثر أناقة وانسيابية.",
        "إمكانية الجمع بين اجتماعات، ثقافة، وتسوق في رحلة واحدة متوازنة.",
        "خدمة كونسيرج للمطاعم والأحياء تجعل المدينة أسهل وأكثر خصوصية.",
      ],
      en: [
        "Design-led stays make business or exploration feel sharper and more elevated.",
        "Meetings, culture, and shopping can coexist inside one balanced itinerary.",
        "Concierge guidance keeps restaurants and neighborhoods easy to unlock.",
      ],
    },
    overview: {
      ar: "طوكيو في هذا المسار ليست مرهقة كما قد تبدو. إنها مدينة دقيقة وسريعة، لكن الإقامة والمسار يعيدان لها الهدوء والتركيز.",
      en: "Tokyo in this flow is not overwhelming. The city stays precise and fast, while the hotel and itinerary bring back calm, clarity, and polish.",
    },
    rhythm: {
      ar: [
        {
          body: "الوصول إلى حي أنيق وبداية أولى خفيفة قريباً من الفندق.",
          title: "افتتاح محسوب",
        },
        {
          body: "أيام مقسمة بين الثقافة والتسوق والعمل والطعام الراقي.",
          title: "مدينة متعددة الإيقاع",
        },
        {
          body: "مساحة أخيرة للأحياء المخفية أو موعد عمل أو تجربة طعام مميزة.",
          title: "إيقاع أخير مرن",
        },
      ],
      en: [
        {
          body: "Arrival into a polished district with a lighter first evening close by.",
          title: "Measured opening",
        },
        {
          body: "Culture, shopping, work, and dining are split into manageable blocks.",
          title: "Multi-rhythm city days",
        },
        {
          body: "The close leaves room for hidden neighborhoods, work, or signature dining.",
          title: "Flexible last beat",
        },
      ],
    },
    title: { ar: "لماذا تعمل هذه الرحلة", en: "Why this city flow works" },
  },
  zermatt: {
    badge: { ar: "ملاذ جبلي فاخر", en: "Alpine private retreat" },
    moments: {
      ar: [
        "الإقامة الجبلية الفاخرة تمنحك خصوصية ومشهداً استثنائياً من دون تعقيد.",
        "يمكن الجمع بين المغامرة والسبا والطعام البانورامي بسلاسة.",
        "الرحلة قصيرة نسبياً لكنها تبدو مشبعة وكاملة بفضل دقة الإيقاع.",
      ],
      en: [
        "Luxury mountain stays deliver privacy and drama without complexity.",
        "Adventure, spa time, and panoramic dining can all live in one easy flow.",
        "The stay is relatively short, but it still feels full and memorable because the pacing is tight.",
      ],
    },
    overview: {
      ar: "زيرمات هنا وجهة جبال راقية ومريحة. المسارات واضحة، الخدمة عالية، والرحلة تشعرك بأن كل ساعة محسوبة جيداً.",
      en: "Zermatt here is an alpine stay that feels elevated and comfortable. The flow stays clear, service stays high, and each day feels intentionally used.",
    },
    rhythm: {
      ar: [
        {
          body: "الوصول والاستقرار مع وقت للسبا والمنظر الجبلي.",
          title: "وصول دافئ",
        },
        {
          body: "أيام الجبل والقطارات البانورامية والعشاء الراقي تتبادل بهدوء.",
          title: "قلب الرحلة",
        },
        {
          body: "ختام بمرونة تسمح بالتزلج أو المشي أو الاسترخاء فقط.",
          title: "نهاية حسب المزاج",
        },
      ],
      en: [
        {
          body: "Arrival, mountain views, and spa reset all land early in the stay.",
          title: "Warm arrival",
        },
        {
          body: "Mountain rail, scenery, and premium dining rotate without crowding the day.",
          title: "Core alpine days",
        },
        {
          body: "The finish stays open for skiing, walking, or simply recovering in place.",
          title: "Mood-led ending",
        },
      ],
    },
    title: { ar: "ميزة الوجهة", en: "Where the destination shines" },
  },
} as const;

export const DestinationDetailsScreen = () => {
  const { destinationId } = useLocalSearchParams<{ destinationId?: string }>();
  const { formatCurrency, isRTL, language, t } = useLocalization();
  const packageDetails = catalogPackages.find(
    (item) => item.destinationId === destinationId,
  );
  const featuredOffer = packageDetails
    ? featuredOffersById[packageDetails.id]
    : undefined;
  const heroImageSource = useMemo(
    () => getRemoteImageSource(packageDetails?.heroImageUri),
    [packageDetails?.heroImageUri],
  );
  const copy =
    language === "ar"
      ? {
          askHeia: "اسأل هيا",
          cta: "عرض الباقة",
          routeTitle: "دليل الوجهة",
          stayTitle: "الإقامة والوصول",
          subtitle: "إيقاع الوجهة، أسلوب الإقامة، ولماذا يشعر هذا المسار بأنه فاخر منذ البداية.",
          timelineTitle: "إيقاع الرحلة",
        }
      : {
          askHeia: "Ask Heia",
          cta: "View package",
          routeTitle: "Destination details",
          stayTitle: "Stay and arrival",
          subtitle: "The destination rhythm, stay style, and why this route feels premium from the first touchpoint.",
          timelineTitle: "The trip rhythm",
        };

  if (!packageDetails || !featuredOffer) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.offers)}
          />
        }
        scrollable={false}
        title={copy.routeTitle}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("tabs.offers")}
          description={t("offers.emptyBody")}
          onPress={() => router.replace(appRoutes.offers)}
          title={copy.routeTitle}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const story = destinationStories[packageDetails.destinationId];
  const storyMoments =
    language === "ar" ? story.moments.ar : story.moments.en;
  const storyRhythm = language === "ar" ? story.rhythm.ar : story.rhythm.en;
  const localizedTitle = t(`content.offers.${packageDetails.id}.title`, {
    defaultValue: featuredOffer.title,
  });
  const localizedDestination = t(
    `content.offers.${packageDetails.id}.destination`,
    {
      defaultValue: featuredOffer.destination,
    },
  );

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() =>
            navigateBackOr(appRoutes.packageDetails(packageDetails.id))
          }
        />
      }
      subtitle={copy.subtitle}
      title={copy.routeTitle}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("common.notifications")}
          icon="notifications-outline"
          onPress={() => router.push(appRoutes.notifications)}
        />
      }
      withBottomTabSpacing={false}
    >
      {heroImageSource ? (
        <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
          <Image
            resizeMode="cover"
            source={heroImageSource}
            style={{ height: 248, width: "100%" }}
          />
        </View>
      ) : null}

      <PremiumHeroCard
        accent={featuredOffer.accent}
        badge={resolveLocalizedValue(language, story.badge)}
        description={resolveLocalizedValue(language, story.overview)}
        icon="earth-outline"
        metrics={[
          {
            icon: "location-outline",
            label: localizedDestination,
          },
          {
            icon: "calendar-outline",
            label: packageDetails.bestMonths,
          },
          {
            icon: "cash-outline",
            label: formatCurrency(featuredOffer.priceFrom),
          },
        ]}
        title={localizedTitle}
      />

      <AppCard elevated>
        <AppText variant="title">
          {resolveLocalizedValue(language, story.title)}
        </AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          {storyMoments.map((moment) => (
            <View
              key={moment}
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.md,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: colors.background.softBlue,
                  borderRadius: radius.round,
                  height: 40,
                  justifyContent: "center",
                  width: 40,
                }}
              >
                <AppText color={colors.primary[600]} variant="label">
                  •
                </AppText>
              </View>
              <AppText style={{ flex: 1 }}>{moment}</AppText>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.stayTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={t("packageDetails.hotelLabel")}
            value={packageDetails.hotelName}
          />
          <DetailRow
            label={t("packageDetails.routeLabel")}
            value={packageDetails.routeCode}
          />
          <DetailRow
            label={t("bookingDetails.durationLabel")}
            value={packageDetails.flightDurationLabel}
          />
          <DetailRow
            label={t("packageDetails.bestMonthsLabel")}
            value={packageDetails.bestMonths}
          />
          <DetailRow
            label={t("packageDetails.idealForLabel")}
            value={packageDetails.idealFor}
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.timelineTitle}</AppText>
        <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
          {storyRhythm.map((phase, index) => (
            <View
              key={phase.title}
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
                  height: 38,
                  justifyContent: "center",
                  width: 38,
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
                <AppText variant="label">{phase.title}</AppText>
                <AppText variant="bodySmall">{phase.body}</AppText>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={copy.cta}
          onPress={() => router.push(appRoutes.packageDetails(packageDetails.id))}
        />
        <SecondaryButton
          label={copy.askHeia}
          onPress={() => router.push(appRoutes.heia)}
          tone="coral"
        />
      </View>
    </ScreenContainer>
  );
};
