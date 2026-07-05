import { simulateRequest } from "../../../services/api/client";
import type { AppLocale } from "../../../types/i18n";
import {
  aiAdvisorDestinationCatalog,
  getAiAdvisorPackageCatalogItem,
} from "../data/ai-advisor.mock";
import type {
  AiAdvisorBudgetLevel,
  AiAdvisorCatalogDestination,
  AiAdvisorDestinationRecommendationResponse,
  AiAdvisorFollowUpQuestion,
  AiAdvisorFollowUpQuestionSetResponse,
  AiAdvisorLuxuryLevel,
  AiAdvisorPackageRecommendationResponse,
  AiAdvisorPlainTextGuidanceResponse,
  AiAdvisorPreferenceFieldId,
  AiAdvisorProvider,
  AiAdvisorProviderRequest,
  AiAdvisorStructuredResponseEnvelope,
  AiAdvisorVibe,
  AiAdvisorVisaPreference,
  AiAdvisorWeatherPreference,
} from "../types";
import { countKnownPreferences } from "./ai-advisor.memory";

const getLocalizedText = <T extends string | string[]>(
  localizedValue: Record<"ar" | "en", T> & Partial<Record<AppLocale, T>>,
  locale: AppLocale,
) => localizedValue[locale] ?? localizedValue.en;

const buildGuidanceText = ({
  destination,
  locale,
  missingCount,
  summary,
}: {
  destination: AiAdvisorCatalogDestination | undefined;
  locale: AppLocale;
  missingCount: number;
  summary: string;
}): AiAdvisorPlainTextGuidanceResponse => {
  if (!destination) {
    return {
      id: "guidance-need-more-detail",
      text:
        locale === "ar"
          ? `${summary} سأبدأ بتضييق الخيارات بمجرد تثبيت الميزانية أو مدة الرحلة أو مدينة المغادرة.`
          : `${summary} I can tighten the shortlist as soon as we lock budget, trip length, or departure city.`,
      tone: "guidance",
      type: "plain_text_guidance",
    } as const;
  }

  return {
    id: "guidance-shortlist",
    text:
      locale === "ar"
        ? `بناءً على ما أعرفه حتى الآن، أضع ${getLocalizedText(destination.destination, locale)} في صدارة shortlist. ${missingCount > 0 ? "ما زال لدي سؤالان صغيران لتحسين الدقة." : "الصورة الآن واضحة بما يكفي لبناء اقتراح متماسك."}`
        : `Based on what I know so far, ${getLocalizedText(destination.destination, locale)} is leading the shortlist. ${missingCount > 0 ? "I still have a couple of questions to sharpen the fit." : "I have enough signal now to build a cohesive recommendation."}`,
    tone: "guidance",
    type: "plain_text_guidance",
  } as const;
};

const getBudgetMatchScore = (
  destination: AiAdvisorCatalogDestination,
  budgetLevel?: AiAdvisorBudgetLevel,
  budgetMax?: number,
) => {
  let score = 0;

  if (typeof budgetMax === "number") {
    if (budgetMax >= destination.budgetRange.min && budgetMax <= destination.budgetRange.max) {
      score += 3;
    } else if (budgetMax > destination.budgetRange.max) {
      score += 1;
    }
  }

  if (budgetLevel === "smart" && destination.budgetRange.min <= 2200) {
    score += 2;
  } else if (budgetLevel === "premium" && destination.budgetRange.min <= 4200) {
    score += 2;
  } else if (budgetLevel === "luxury" && destination.budgetRange.max >= 4200) {
    score += 2;
  }

  return score;
};

const getDurationMatchScore = (
  destination: AiAdvisorCatalogDestination,
  durationDays?: number,
) => {
  if (typeof durationDays !== "number") {
    return 0;
  }

  const [minimumDays, maximumDays] = destination.idealDurationDays;

  if (durationDays >= minimumDays && durationDays <= maximumDays) {
    return 2;
  }

  return durationDays >= minimumDays - 1 && durationDays <= maximumDays + 1 ? 1 : 0;
};

const getDepartureMatchScore = (
  destination: AiAdvisorCatalogDestination,
  departureLocation?: string,
) => {
  if (!departureLocation) {
    return 0;
  }

  const normalizedDeparture = departureLocation.toLowerCase();
  return destination.departureBiases.some((bias) => normalizedDeparture.includes(bias)) ? 2 : 0;
};

const getPreferenceMatchScore = ({
  destination,
  familySize,
  luxuryLevel,
  vibe,
  visaPreference,
  weatherPreference,
}: {
  destination: AiAdvisorCatalogDestination;
  familySize: number | undefined;
  luxuryLevel: AiAdvisorLuxuryLevel | undefined;
  vibe: AiAdvisorVibe | undefined;
  visaPreference: AiAdvisorVisaPreference | undefined;
  weatherPreference: AiAdvisorWeatherPreference | undefined;
}) => {
  let score = 0;

  if (vibe && destination.vibeTags.includes(vibe)) {
    score += 4;
  }

  if (weatherPreference && destination.weatherOptions.includes(weatherPreference)) {
    score += 3;
  }

  if (visaPreference && destination.visaOptions.includes(visaPreference)) {
    score += 2;
  }

  if (luxuryLevel && destination.luxuryLevels.includes(luxuryLevel)) {
    score += 2;
  }

  if (typeof familySize === "number" && familySize >= 3 && destination.familyFriendly) {
    score += 2;
  }

  return score;
};

const rankDestinations = (request: AiAdvisorProviderRequest) =>
  [...aiAdvisorDestinationCatalog].sort((leftDestination, rightDestination) => {
    const {
      budgetLevel,
      budgetMax,
      departureLocation,
      familySize,
      luxuryLevel,
      tripDurationDays,
      vibe,
      visaPreference,
      weatherPreference,
    } = request.memory.preferenceProfile;

    const scoreDestination = (destination: AiAdvisorCatalogDestination) =>
      getBudgetMatchScore(destination, budgetLevel, budgetMax) +
      getDurationMatchScore(destination, tripDurationDays) +
      getDepartureMatchScore(destination, departureLocation) +
      getPreferenceMatchScore({
        destination,
        familySize,
        luxuryLevel,
        vibe,
        visaPreference,
        weatherPreference,
      });

    return scoreDestination(rightDestination) - scoreDestination(leftDestination);
  });

const questionBank = {
  budget: {
    ar: {
      helpText: "يعطيني هذا السقف المالي مساحة أدق لاقتراح الطيران والإقامة.",
      question: "ما السقف الذي يبدو مناسباً لكل الرحلة؟",
      quickReplies: ["حتى 2500 دولار", "2500 - 4500 دولار", "4500+ دولار"],
    },
    en: {
      helpText: "This helps me balance flight value and hotel level cleanly.",
      question: "What budget ceiling feels comfortable for the whole trip?",
      quickReplies: ["Up to $2,500", "$2,500-$4,500", "$4,500+"],
    },
  },
  departureLocation: {
    ar: {
      helpText: "مدينة المغادرة تغيّر زمن الرحلة وأفضل مسار طيران.",
      question: "من أين ستكون المغادرة؟",
      quickReplies: ["بغداد", "دبي", "نيويورك"],
    },
    en: {
      helpText: "Departure city changes routing, timing, and value.",
      question: "Where will you depart from?",
      quickReplies: ["Baghdad", "Dubai", "New York"],
    },
  },
  familySize: {
    ar: {
      helpText: "عدد المسافرين يحدد نوع الإقامة والإيقاع المناسب.",
      question: "كم عدد المسافرين تقريباً؟",
      quickReplies: ["شخصان", "4 مسافرين", "عائلة مع أطفال"],
    },
    en: {
      helpText: "Traveler count affects room setup and overall pace.",
      question: "How many travelers should I plan for?",
      quickReplies: ["2 travelers", "4 travelers", "Family with kids"],
    },
  },
  luxuryLevel: {
    ar: {
      helpText: "هذا يساعدني في موازنة الراحة مقابل السعر.",
      question: "ما مستوى الفخامة الذي يناسبك؟",
      quickReplies: ["راحة أنيقة", "Premium", "Luxury"],
    },
    en: {
      helpText: "This helps me balance polish against spend.",
      question: "What luxury level feels right?",
      quickReplies: ["Comfortable and polished", "Premium", "Luxury"],
    },
  },
  tripDurationDays: {
    ar: {
      helpText: "عدد الأيام يغيّر الوجهة الأفضل بشكل مباشر.",
      question: "كم يوماً تريد أن تستغرق الرحلة؟",
      quickReplies: ["4 أيام", "7 أيام", "10 أيام"],
    },
    en: {
      helpText: "Trip length strongly changes which destination wins.",
      question: "How long should the trip be?",
      quickReplies: ["4 days", "7 days", "10 days"],
    },
  },
  vibe: {
    ar: {
      helpText: "الطابع أهم عامل لاختيار mood الرحلة.",
      question: "أي vibe تريد أكثر؟",
      quickReplies: ["شاطئي هادئ", "مدينة وثقافة", "جبال واسترخاء"],
    },
    en: {
      helpText: "Vibe is the strongest signal for the trip mood.",
      question: "Which vibe matters most?",
      quickReplies: ["Relaxed beach", "City and culture", "Mountains and calm"],
    },
  },
  visaPreference: {
    ar: {
      helpText: "أفضل أن أعرف حساسيتك تجاه الفيزا قبل تثبيت الوجهة.",
      question: "ما مدى أهمية سهولة الفيزا؟",
      quickReplies: ["بدون فيزا", "فيزا سهلة فقط", "مرن"],
    },
    en: {
      helpText: "Visa friction can reshape the shortlist quickly.",
      question: "How strict should I be on visa ease?",
      quickReplies: ["Visa-free only", "Easy visa only", "Flexible"],
    },
  },
  weatherPreference: {
    ar: {
      helpText: "الطقس المطلوب يغيّر الوجهة المثالية مباشرة.",
      question: "أي طقس تفضله؟",
      quickReplies: ["دافئ ومشمس", "معتدل", "بارد أو ثلجي"],
    },
    en: {
      helpText: "Weather preference can reorder the shortlist immediately.",
      question: "What weather do you want most?",
      quickReplies: ["Warm and sunny", "Mild", "Cool or snowy"],
    },
  },
} as const;

const buildFollowUpQuestionSet = ({
  locale,
  missingPreferenceIds,
}: {
  locale: AppLocale;
  missingPreferenceIds: AiAdvisorPreferenceFieldId[];
}): AiAdvisorFollowUpQuestionSetResponse => {
  const questions = missingPreferenceIds.slice(0, 3).map((fieldId, index) => {
    const localizedQuestion = questionBank[fieldId][locale === "ar" ? "ar" : "en"];

    return {
      helpText: localizedQuestion.helpText,
      id: `follow-up-${fieldId}-${index}`,
      question: localizedQuestion.question,
      quickReplies: [...localizedQuestion.quickReplies],
    } satisfies AiAdvisorFollowUpQuestion;
  });

  return {
    id: "follow-up-set",
    intro:
      locale === "ar"
        ? "أجب عن هذه النقاط السريعة وسأرفع دقة التوصية فوراً."
        : "Answer these quick prompts and I can sharpen the shortlist immediately.",
    questions,
    type: "follow_up_question_set",
  } satisfies AiAdvisorFollowUpQuestionSetResponse;
};

const buildDestinationRecommendation = ({
  destination,
  locale,
}: {
  destination: AiAdvisorCatalogDestination;
  locale: AppLocale;
}): AiAdvisorDestinationRecommendationResponse => ({
  bestForLabel: getLocalizedText(destination.bestFor, locale),
  budgetRange: destination.budgetRange,
  country: getLocalizedText(destination.country, locale),
  ctaLabel:
    locale === "ar"
      ? destination.packageId
        ? "افتح الباقة"
        : "احفظ هذه الوجهة"
      : destination.packageId
        ? "Open package"
        : "Save this destination",
  destination: getLocalizedText(destination.destination, locale),
  id: `destination-${destination.id}`,
  imageUri: destination.iconImageUri,
  ...(destination.packageId ? { packageId: destination.packageId } : {}),
  luxuryLabel:
    locale === "ar"
      ? `الفخامة: ${destination.luxuryLevels.join(" / ")}`
      : `Luxury: ${destination.luxuryLevels.join(" / ")}`,
  reasons: getLocalizedText(destination.highlightLabels, locale),
  summary: getLocalizedText(destination.summary, locale),
  type: "destination_recommendation",
  visaLabel:
    locale === "ar"
      ? `الفيزا: ${destination.visaOptions.join(" / ")}`
      : `Visa: ${destination.visaOptions.join(" / ")}`,
  weatherLabel: getLocalizedText(destination.weatherDescriptor, locale),
}) as const;

const buildItinerarySuggestion = ({
  destination,
  durationDays,
  locale,
}: {
  destination: AiAdvisorCatalogDestination;
  durationDays: number;
  locale: AppLocale;
}) => ({
  days: destination.itineraryStops.map((stop, index) => ({
    dayLabel: locale === "ar" ? `اليوم ${index + 1}` : `Day ${index + 1}`,
    summary: getLocalizedText(stop.summary, locale),
    title: getLocalizedText(stop.title, locale),
  })),
  destination: getLocalizedText(destination.destination, locale),
  durationDays,
  estimatedBudget:
    Math.round((destination.budgetRange.min + destination.budgetRange.max) / 2 / 100) * 100,
  id: `itinerary-${destination.id}`,
  summary:
    locale === "ar"
      ? `هذا الإيقاع مناسب لرحلة ${durationDays} أيام من دون ضغط زائد.`
      : `This pace works well for a ${durationDays}-day trip without overloading the calendar.`,
  title:
    locale === "ar"
      ? `اقتراح itinerary لـ ${getLocalizedText(destination.destination, locale)}`
      : `${getLocalizedText(destination.destination, locale)} itinerary concept`,
  type: "itinerary_suggestion",
}) as const;

const buildPackageRecommendation = ({
  destination,
  locale,
}: {
  destination: AiAdvisorCatalogDestination;
  locale: AppLocale;
}): AiAdvisorPackageRecommendationResponse | undefined => {
  if (!destination.packageId) {
    return undefined;
  }

  const packageCatalogItem = getAiAdvisorPackageCatalogItem(destination.packageId);

  return {
    ctaLabel: locale === "ar" ? "عرض تفاصيل الباقة" : "View package details",
    durationLabel:
      locale === "ar"
        ? packageCatalogItem.offer.id === "alps-private"
          ? "5 ليالٍ"
          : packageCatalogItem.offer.id === "tokyo-curated"
            ? "6 ليالٍ"
            : "7 ليالٍ"
        : packageCatalogItem.offer.duration,
    highlights: getLocalizedText(destination.highlightLabels, locale),
    id: `package-${destination.packageId}`,
    imageUri: packageCatalogItem.imageUri,
    packageId: destination.packageId,
    priceFrom: packageCatalogItem.offer.priceFrom,
    summary:
      locale === "ar"
        ? `هذه الباقة أقرب match لما ذكرته من حيث الطابع والإقامة والتكلفة.`
        : "This package is the closest fit to what you described across vibe, stay style, and spend.",
    title:
      locale === "ar"
        ? `باقة ${getLocalizedText(destination.destination, locale)} الموصى بها`
        : `${getLocalizedText(destination.destination, locale)} package match`,
    type: "package_recommendation",
  } as const;
};

const buildMockResponseEnvelope = (
  request: AiAdvisorProviderRequest,
): AiAdvisorStructuredResponseEnvelope => {
  const rankedDestinations = rankDestinations(request);
  const leadingDestination = rankedDestinations[0];
  const missingPreferenceIds = request.memory.missingPreferenceIds;
  const knownPreferenceCount = countKnownPreferences(request.memory.preferenceProfile);
  const guidance = buildGuidanceText({
    destination: leadingDestination,
    locale: request.locale,
    missingCount: missingPreferenceIds.length,
    summary: request.memory.userIntentSummary,
  });
  const responses: AiAdvisorStructuredResponseEnvelope["responses"] = [guidance];

  if (knownPreferenceCount >= 3 && leadingDestination) {
    responses.push(
      buildDestinationRecommendation({
        destination: leadingDestination,
        locale: request.locale,
      }),
    );
  }

  if (
    leadingDestination &&
    typeof request.memory.preferenceProfile.tripDurationDays === "number" &&
    knownPreferenceCount >= 4
  ) {
    responses.push(
      buildItinerarySuggestion({
        destination: leadingDestination,
        durationDays: request.memory.preferenceProfile.tripDurationDays,
        locale: request.locale,
      }),
    );
  }

  if (leadingDestination && knownPreferenceCount >= 5) {
    const packageRecommendation = buildPackageRecommendation({
      destination: leadingDestination,
      locale: request.locale,
    });

    if (packageRecommendation) {
      responses.push(packageRecommendation);
    }
  }

  if (missingPreferenceIds.length > 0) {
    responses.push(
      buildFollowUpQuestionSet({
        locale: request.locale,
        missingPreferenceIds,
      }),
    );
  }

  return {
    responses,
  };
};

export const createMockAiAdvisorProvider = (): AiAdvisorProvider => ({
  generateResponse: async (request) =>
    simulateRequest(JSON.stringify(buildMockResponseEnvelope(request)), 520),
  mode: "mock",
  name: "mock-premium-advisor",
});
