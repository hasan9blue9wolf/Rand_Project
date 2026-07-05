import { simulateRequest } from "../../../services/api/client";
import type { AppLocale } from "../../../types/i18n";
import { demoTravelPackages } from "../../packages/data/demo-travel-packages.seed";
import {
  matchesPackageFilters,
  resolvePackageImageUrl,
  resolvePackageText,
} from "../../packages/helpers/package-helpers";
import type {
  TravelPackage,
  TravelPackageCategory,
  TravelPackageFilters,
  TravelPackageTripType,
} from "../../packages/types";
import type {
  AiAdvisorDestinationRecommendationResponse,
  AiAdvisorFollowUpQuestionSetResponse,
  AiAdvisorPackageRecommendationResponse,
  AiAdvisorPlainTextGuidanceResponse,
  AiAdvisorProvider,
  AiAdvisorProviderRequest,
  AiAdvisorStructuredResponseEnvelope,
} from "../types";

type InventoryIntent = {
  category?: TravelPackageCategory;
  maxPrice?: number;
  minPrice?: number;
  tripType?: TravelPackageTripType;
  luxuryLevel?: TravelPackageFilters["luxuryLevel"];
  tags: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();

const textIncludes = (message: string, terms: string[]) =>
  terms.some((term) => message.includes(term));

const detectIntent = (message: string): InventoryIntent => {
  const normalized = normalize(message);
  const intent: InventoryIntent = { tags: [] };

  if (textIncludes(normalized, ["beach", "شاط", "بحر", "phuket", "maldives", "bali"])) {
    intent.category = "beach";
    intent.tripType = "beach";
    intent.tags.push("beach");
  }

  if (textIncludes(normalized, ["luxury", "vip", "premium", "فاخر", "فاخرة", "راقي"])) {
    intent.category = "luxury";
    intent.luxuryLevel = ["luxury", "ultraLuxury", "premium"];
    intent.minPrice = 1200;
  }

  if (textIncludes(normalized, ["honeymoon", "romantic", "couple", "شهر عسل", "رومانسي"])) {
    intent.category = "honeymoon";
    intent.tripType = "honeymoon";
  }

  if (textIncludes(normalized, ["family", "kids", "children", "عائلة", "عائلي", "أطفال"])) {
    intent.category = "family";
    intent.tripType = "family";
  }

  if (textIncludes(normalized, ["student", "budget", "cheap", "affordable", "طلاب", "اقتصادي", "ميزانية"])) {
    intent.category = textIncludes(normalized, ["student", "طلاب"]) ? "student" : "budget";
    intent.maxPrice = 1200;
  }

  if (textIncludes(normalized, ["adventure", "safari", "hike", "مغامرة", "سفاري"])) {
    intent.category = "adventure";
    intent.tripType = "adventure";
  }

  if (textIncludes(normalized, ["city break", "city", "weekend", "مدينة", "ويكند"])) {
    intent.category = "city break";
    intent.tripType = "city";
  }

  if (textIncludes(normalized, ["culture", "history", "museum", "ثقافة", "تاريخ", "متاحف"])) {
    intent.category = "culture";
    intent.tripType = "cultural";
  }

  if (textIncludes(normalized, ["business", "work", "meeting", "أعمال", "عمل", "اجتماعات"])) {
    intent.category = "business";
    intent.tripType = "business";
  }

  if (textIncludes(normalized, ["mountain", "alps", "swiss", "جبل", "جبال"])) {
    intent.category = "mountain";
    intent.tripType = "mountain";
  }

  for (const packageItem of demoTravelPackages) {
    const city = resolvePackageText(packageItem.destinationCity).toLowerCase();
    const country = resolvePackageText(packageItem.destinationCountry).toLowerCase();

    if (normalized.includes(city) || normalized.includes(country)) {
      intent.tags.push(city, country);
    }
  }

  return intent;
};

const getPackageIdFromMessage = (message: string) => {
  const match = message.match(/Package ID:\s*([a-z0-9-]+)/i);

  return match?.[1];
};

const rankPackages = (message: string, intent: InventoryIntent) => {
  const normalized = normalize(message);
  const filters: TravelPackageFilters = {
    ...(intent.category ? { category: intent.category } : {}),
    ...(intent.tripType ? { tripType: intent.tripType } : {}),
    ...(intent.luxuryLevel ? { luxuryLevel: intent.luxuryLevel } : {}),
    ...(intent.maxPrice ? { maxPrice: intent.maxPrice } : {}),
    ...(intent.minPrice ? { minPrice: intent.minPrice } : {}),
  };
  const filtered = demoTravelPackages.filter((packageItem) =>
    matchesPackageFilters(packageItem, filters),
  );
  const candidates = filtered.length > 0 ? filtered : demoTravelPackages;

  return [...candidates]
    .sort((left, right) => {
      const score = (packageItem: TravelPackage) => {
        const city = resolvePackageText(packageItem.destinationCity).toLowerCase();
        const country = resolvePackageText(packageItem.destinationCountry).toLowerCase();
        const title = resolvePackageText(packageItem.title).toLowerCase();

        return (
          Number(packageItem.isAIRecommended) * 8 +
          Number(packageItem.isFeatured) * 5 +
          Number(packageItem.isBestSeller) * 4 +
          packageItem.rating +
          (normalized.includes(city) ? 12 : 0) +
          (normalized.includes(country) ? 8 : 0) +
          (normalized.includes(title.split(" ")[0] ?? "") ? 3 : 0)
        );
      };

      return score(right) - score(left);
    })
    .slice(0, 5);
};

const packageToRecommendation = (
  packageItem: TravelPackage,
  locale: AppLocale,
  index: number,
): AiAdvisorPackageRecommendationResponse => ({
  ctaLabel: locale === "ar" ? "عرض الباقة" : "View package",
  durationLabel:
    locale === "ar"
      ? `${packageItem.durationDays} أيام`
      : `${packageItem.durationDays} days`,
  highlights: [
    resolvePackageText(packageItem.bestSeason, locale),
    locale === "ar"
      ? `فندق ${packageItem.hotelClass} نجوم`
      : `${packageItem.hotelClass}-star hotel`,
    packageItem.flightIncluded
      ? locale === "ar"
        ? "يشمل الطيران"
        : "Flight included"
      : locale === "ar"
        ? "إقامة مختارة"
        : "Curated stay",
  ],
  id: `inventory-package-${packageItem.id}-${index}`,
  imageUri: resolvePackageImageUrl(packageItem.imageUrl),
  packageId: packageItem.id,
  priceFrom: packageItem.priceFrom,
  summary: resolvePackageText(packageItem.shortDescription, locale),
  title: resolvePackageText(packageItem.title, locale),
  type: "package_recommendation",
});

const packageToDestination = (
  packageItem: TravelPackage,
  locale: AppLocale,
  index: number,
): AiAdvisorDestinationRecommendationResponse => ({
  bestForLabel:
    locale === "ar"
      ? `مثالية لـ ${packageItem.category}`
      : `Best for ${packageItem.category}`,
  budgetRange: {
    max: Math.round(packageItem.priceFrom * 1.25),
    min: packageItem.priceFrom,
  },
  country: resolvePackageText(packageItem.destinationCountry, locale),
  ctaLabel: locale === "ar" ? "فتح التفاصيل" : "Open details",
  destination: resolvePackageText(packageItem.destinationCity, locale),
  id: `inventory-destination-${packageItem.id}-${index}`,
  imageUri: resolvePackageImageUrl(packageItem.imageUrl),
  luxuryLabel:
    locale === "ar"
      ? `مستوى ${packageItem.luxuryLevel}`
      : `${packageItem.luxuryLevel} level`,
  packageId: packageItem.id,
  reasons: packageItem.tags.slice(0, 3),
  summary: resolvePackageText(packageItem.shortDescription, locale),
  type: "destination_recommendation",
  visaLabel: resolvePackageText(packageItem.visaNote, locale),
  weatherLabel: resolvePackageText(packageItem.bestSeason, locale),
});

const buildGuidance = ({
  locale,
  packages,
}: {
  locale: AppLocale;
  packages: TravelPackage[];
}): AiAdvisorPlainTextGuidanceResponse => ({
  id: `inventory-guidance-${Date.now()}`,
  text:
    locale === "ar"
      ? `وجدت ${packages.length} باقات حقيقية من مخزون هيا تريبس تناسب طلبك. رتبتها حسب الملاءمة، التقييم، والقيمة التجريبية.`
      : `I found ${packages.length} real Haya Trips packages that match your request. I ranked them by fit, rating, and demo-ready value.`,
  tone: "guidance",
  type: "plain_text_guidance",
});

const buildPackageContextGuidance = ({
  locale,
  packageItem,
}: {
  locale: AppLocale;
  packageItem: TravelPackage;
}): AiAdvisorPlainTextGuidanceResponse => ({
  id: `package-context-${packageItem.id}`,
  text:
    locale === "ar"
      ? `هذه الباقة مناسبة لأنها تجمع ${packageItem.category} مع مستوى ${packageItem.luxuryLevel} وفندق ${packageItem.hotelClass} نجوم. هي الأفضل لمن يريد ${resolvePackageText(packageItem.shortDescription, locale)} من ناحية الميزانية، السعر يبدأ من ${packageItem.priceFrom} دولار للشخص تقريباً، ويمكن رفع الإجمالي حسب عدد المسافرين. أبرز البرنامج: ${packageItem.itinerary
          .slice(0, 3)
          .map((day) => resolvePackageText(day.title, locale))
          .join("، ")}.`
      : `This package is a strong fit because it combines ${packageItem.category} travel with a ${packageItem.luxuryLevel} feel and a ${packageItem.hotelClass}-star hotel. It is best for travelers who want ${resolvePackageText(packageItem.shortDescription, locale)} Budget note: pricing starts from about $${packageItem.priceFrom} per person, so the total scales with traveler count. Itinerary highlights include ${packageItem.itinerary
          .slice(0, 3)
          .map((day) => resolvePackageText(day.title, locale))
          .join(", ")}.`,
  tone: "guidance",
  type: "plain_text_guidance",
});

const buildFollowUps = (locale: AppLocale): AiAdvisorFollowUpQuestionSetResponse => ({
  id: `inventory-followups-${Date.now()}`,
  intro:
    locale === "ar"
      ? "يمكنني تضييق القائمة أكثر إذا اخترت أحد هذه الاتجاهات."
      : "I can tighten the shortlist further if you pick one of these signals.",
  questions: [
    {
      id: "inventory-intent",
      question: locale === "ar" ? "ما النمط الأقرب؟" : "Which style is closest?",
      quickReplies:
        locale === "ar"
          ? ["شاطئ فاخر", "عائلة", "شهر عسل", "ميزانية طلاب"]
          : ["Luxury beach", "Family", "Honeymoon", "Student budget"],
    },
    {
      id: "inventory-pace",
      question: locale === "ar" ? "ما مدة الرحلة؟" : "How long should it feel?",
      quickReplies:
        locale === "ar" ? ["4 أيام", "6-7 أيام", "10 أيام"] : ["4 days", "6-7 days", "10 days"],
    },
  ],
  type: "follow_up_question_set",
});

export const createInventoryDemoAiAdvisorProvider = (): AiAdvisorProvider => ({
  generateResponse: async (
    request: AiAdvisorProviderRequest,
  ): Promise<AiAdvisorStructuredResponseEnvelope> => {
    const packageId = getPackageIdFromMessage(request.latestUserMessage);
    const packageContextItem = packageId
      ? demoTravelPackages.find((packageItem) => packageItem.id === packageId)
      : undefined;

    if (packageContextItem) {
      return simulateRequest(
        {
          responses: [
            buildPackageContextGuidance({
              locale: request.locale,
              packageItem: packageContextItem,
            }),
            packageToRecommendation(packageContextItem, request.locale, 0),
            buildFollowUps(request.locale),
          ],
        },
        450,
      );
    }

    const packages = rankPackages(
      request.latestUserMessage,
      detectIntent(request.latestUserMessage),
    );
    const topPackages = packages.slice(0, Math.min(5, Math.max(2, packages.length)));

    return simulateRequest(
      {
        responses: [
          buildGuidance({ locale: request.locale, packages: topPackages }),
          ...topPackages.slice(0, 2).map((packageItem, index) =>
            packageToDestination(packageItem, request.locale, index),
          ),
          ...topPackages.map((packageItem, index) =>
            packageToRecommendation(packageItem, request.locale, index),
          ),
          buildFollowUps(request.locale),
        ],
      },
      520,
    );
  },
  mode: "mock",
  name: "hayatrips-inventory-demo-advisor",
});
