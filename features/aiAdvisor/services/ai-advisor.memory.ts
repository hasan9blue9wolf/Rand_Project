import type { AppLocale } from "../../../types/i18n";
import type {
  AiAdvisorBudgetLevel,
  AiAdvisorChatMessage,
  AiAdvisorConversationMemory,
  AiAdvisorLuxuryLevel,
  AiAdvisorPreferenceFieldId,
  AiAdvisorPreferenceProfile,
  AiAdvisorVibe,
  AiAdvisorVisaPreference,
  AiAdvisorWeatherPreference,
} from "../types";

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

const preferencePriority: AiAdvisorPreferenceFieldId[] = [
  "departureLocation",
  "budget",
  "tripDurationDays",
  "familySize",
  "vibe",
  "weatherPreference",
  "visaPreference",
  "luxuryLevel",
];

const normalizeText = (value: string) =>
  ARABIC_INDIC_DIGITS.reduce(
    (result, digit, index) => result.replaceAll(digit, String(index)),
    value.toLowerCase(),
  );

const cleanLocationValue = (value: string) =>
  value
    .replace(/[.,]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^from\s+/i, "")
    .replace(/^من\s+/i, "");

const toNumber = (value: string) => Number(value.replaceAll(",", ""));

const resolveBudgetLevel = (
  profile: AiAdvisorPreferenceProfile,
): AiAdvisorBudgetLevel | undefined => {
  if (profile.budgetLevel) {
    return profile.budgetLevel;
  }

  if (typeof profile.budgetMax !== "number") {
    return undefined;
  }

  if (profile.budgetMax <= 2200) {
    return "smart";
  }

  if (profile.budgetMax <= 4500) {
    return "premium";
  }

  return "luxury";
};

const maybeSetBudget = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const rangeMatch =
    input.match(/(\d[\d,]{2,5})\s*(?:-|to)\s*(\d[\d,]{2,5})/) ??
    input.match(/(\d[\d,]{2,5})\s*(?:الى|إلى)\s*(\d[\d,]{2,5})/);

  if (rangeMatch?.[1] && rangeMatch[2]) {
    profile.budgetMin = toNumber(rangeMatch[1]);
    profile.budgetMax = toNumber(rangeMatch[2]);
  } else {
    const budgetMaxMatch =
      input.match(/(?:under|below|less than|max|around|budget)\s*\$?\s*(\d[\d,]{2,5})/) ??
      input.match(/(?:اقل من|تحت|حوالي|ميزانية)\s*(\d[\d,]{2,5})/);

    if (budgetMaxMatch?.[1]) {
      profile.budgetMax = toNumber(budgetMaxMatch[1]);
    }
  }

  if (
    /budget-friendly|smart budget|economical|affordable|اقتصادي|اقتصادية|ميزانية/.test(input)
  ) {
    profile.budgetLevel = "smart";
  } else if (/luxury|ultra luxury|vip|فاخر|فخامة/.test(input)) {
    profile.budgetLevel = "luxury";
  } else if (/premium|upscale|راقي|مميز/.test(input)) {
    profile.budgetLevel = "premium";
  }
};

const maybeSetFamilySize = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const familyMatch =
    input.match(/family of\s+(\d+)/) ??
    input.match(/(\d+)\s*(?:travelers|travellers|traveler|people|adults?)/) ??
    input.match(/(?:عائلة من|لـ)\s*(\d+)\s*(?:اشخاص|أشخاص|مسافرين|بالغين)/);

  if (familyMatch?.[1]) {
    profile.familySize = Number(familyMatch[1]);
    return;
  }

  if (/family|kids|children|عائلة|أطفال/.test(input) && typeof profile.familySize !== "number") {
    profile.familySize = 4;
  }
};

const maybeSetTripDuration = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const durationMatch =
    input.match(/(\d+)\s*(?:days?|nights?)/) ??
    input.match(/(\d+)\s*(?:يوم|أيام|ليلة|ليال|ليالٍ)/);

  if (durationMatch?.[1]) {
    profile.tripDurationDays = Number(durationMatch[1]);
    return;
  }

  if (/week/.test(input)) {
    profile.tripDurationDays = 7;
  } else if (/long weekend/.test(input)) {
    profile.tripDurationDays = 4;
  } else if (/أسبوع/.test(input)) {
    profile.tripDurationDays = 7;
  } else if (/نهاية أسبوع طويلة/.test(input)) {
    profile.tripDurationDays = 4;
  }
};

const maybeSetDepartureLocation = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const departureMatch =
    input.match(/(?:from|departing from|leaving from)\s+([a-z\s]{2,32})/) ??
    input.match(/(?:من|المغادرة من)\s+([\u0600-\u06ffa-z\s]{2,32})/u);

  if (departureMatch?.[1]) {
    profile.departureLocation = cleanLocationValue(departureMatch[1]);
  }
};

const maybeSetVibe = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const vibeMatchers: [AiAdvisorVibe, RegExp][] = [
    ["beach", /beach|island|shore|شاطئ|بحر/],
    ["family", /family|kids|children|عائلة|أطفال/],
    ["city", /city|urban|downtown|مدينة/],
    ["culture", /culture|museum|history|cultural|ثقاف|تاريخ/],
    ["nature", /nature|mountain|alps|forest|طبيعة|جبال/],
    ["adventure", /adventure|hiking|ski|trek|مغامر|تزلج/],
    ["wellness", /wellness|spa|relax|slow pace|سبا|استرخ/],
    ["romantic", /romantic|honeymoon|couple|شهر عسل|رومانسي/],
  ];

  const matchedVibe = vibeMatchers.find(([, pattern]) => pattern.test(input));

  if (matchedVibe) {
    profile.vibe = matchedVibe[0];
  }
};

const maybeSetWeatherPreference = (
  profile: AiAdvisorPreferenceProfile,
  input: string,
) => {
  const weatherMatchers: [AiAdvisorWeatherPreference, RegExp][] = [
    ["warm", /warm|sunny|hot|tropical|داف|مشمس|استوائي/],
    ["mild", /mild|pleasant|spring|معتدل|لطيف/],
    ["cool", /cool|crisp|fresh|بارد|منعش/],
    ["snow", /snow|ski|winter|ثلج|شتوي/],
  ];

  const matchedWeather = weatherMatchers.find(([, pattern]) => pattern.test(input));

  if (matchedWeather) {
    profile.weatherPreference = matchedWeather[0];
  }
};

const maybeSetVisaPreference = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const visaMatchers: [AiAdvisorVisaPreference, RegExp][] = [
    ["visaFreeOnly", /visa[- ]free|no visa|without visa|بدون فيزا|من دون فيزا/],
    ["easyVisa", /easy visa|simple visa|visa on arrival|فيزا سهلة|تأشيرة سهلة/],
    ["flexible", /flexible on visa|any visa|مرن.*فيزا|الفيزا ليست مشكلة/],
  ];

  const matchedVisa = visaMatchers.find(([, pattern]) => pattern.test(input));

  if (matchedVisa) {
    profile.visaPreference = matchedVisa[0];
  }
};

const maybeSetLuxuryLevel = (profile: AiAdvisorPreferenceProfile, input: string) => {
  const luxuryMatchers: [AiAdvisorLuxuryLevel, RegExp][] = [
    ["ultraLuxury", /ultra luxury|ultra-luxury|ultra vip|فخامة عالية جداً/],
    ["luxury", /luxury|five star|5 star|فاخر|خمس نجوم/],
    ["premium", /premium|upscale|refined|راقي|مميز/],
    ["comfort", /comfort|comfortable|easy going|مريح|راحة/],
  ];

  const matchedLuxury = luxuryMatchers.find(([, pattern]) => pattern.test(input));

  if (matchedLuxury) {
    profile.luxuryLevel = matchedLuxury[0];
  }
};

const buildProfileFromHistory = (
  history: AiAdvisorChatMessage[],
  previousMemory?: AiAdvisorConversationMemory,
) => {
  const profile: AiAdvisorPreferenceProfile = {
    ...previousMemory?.preferenceProfile,
  };

  history.forEach((message) => {
    if (message.kind !== "user_text") {
      return;
    }

    const normalizedInput = normalizeText(message.text);

    maybeSetBudget(profile, normalizedInput);
    maybeSetFamilySize(profile, normalizedInput);
    maybeSetTripDuration(profile, normalizedInput);
    maybeSetDepartureLocation(profile, normalizedInput);
    maybeSetVibe(profile, normalizedInput);
    maybeSetWeatherPreference(profile, normalizedInput);
    maybeSetVisaPreference(profile, normalizedInput);
    maybeSetLuxuryLevel(profile, normalizedInput);
  });

  const resolvedBudgetLevel = resolveBudgetLevel(profile);

  if (resolvedBudgetLevel) {
    profile.budgetLevel = resolvedBudgetLevel;
  } else {
    delete profile.budgetLevel;
  }

  return profile;
};

const buildSalientFacts = (
  profile: AiAdvisorPreferenceProfile,
  locale: AppLocale,
) => {
  const facts: string[] = [];

  if (profile.departureLocation) {
    facts.push(
      locale === "ar"
        ? `المغادرة من ${profile.departureLocation}`
        : `Departing from ${profile.departureLocation}`,
    );
  }

  if (typeof profile.familySize === "number") {
    facts.push(
      locale === "ar"
        ? `${profile.familySize} مسافرين`
        : `${profile.familySize} travelers`,
    );
  }

  if (typeof profile.tripDurationDays === "number") {
    facts.push(
      locale === "ar"
        ? `${profile.tripDurationDays} أيام`
        : `${profile.tripDurationDays} days`,
    );
  }

  if (profile.vibe) {
    facts.push(locale === "ar" ? `الطابع ${profile.vibe}` : `Vibe: ${profile.vibe}`);
  }

  if (profile.weatherPreference) {
    facts.push(
      locale === "ar"
        ? `طقس ${profile.weatherPreference}`
        : `Weather: ${profile.weatherPreference}`,
    );
  }

  if (profile.visaPreference) {
    facts.push(
      locale === "ar"
        ? `تفضيل الفيزا ${profile.visaPreference}`
        : `Visa: ${profile.visaPreference}`,
    );
  }

  if (profile.luxuryLevel) {
    facts.push(
      locale === "ar"
        ? `مستوى الفخامة ${profile.luxuryLevel}`
        : `Luxury: ${profile.luxuryLevel}`,
    );
  }

  if (profile.budgetLevel || typeof profile.budgetMax === "number") {
    const budgetFact =
      typeof profile.budgetMin === "number" && typeof profile.budgetMax === "number"
        ? locale === "ar"
          ? `ميزانية بين ${profile.budgetMin} و ${profile.budgetMax} دولار`
          : `Budget around $${profile.budgetMin}-$${profile.budgetMax}`
        : typeof profile.budgetMax === "number"
          ? locale === "ar"
            ? `حد الميزانية ${profile.budgetMax} دولار`
            : `Budget cap $${profile.budgetMax}`
          : locale === "ar"
            ? `مستوى الميزانية ${profile.budgetLevel}`
            : `Budget level ${profile.budgetLevel}`;

    facts.push(budgetFact);
  }

  return facts;
};

const getMissingPreferenceIds = (profile: AiAdvisorPreferenceProfile) =>
  preferencePriority.filter((fieldId) => {
    switch (fieldId) {
      case "budget":
        return !profile.budgetLevel && typeof profile.budgetMax !== "number";
      case "departureLocation":
        return !profile.departureLocation;
      case "familySize":
        return typeof profile.familySize !== "number";
      case "luxuryLevel":
        return !profile.luxuryLevel;
      case "tripDurationDays":
        return typeof profile.tripDurationDays !== "number";
      case "vibe":
        return !profile.vibe;
      case "visaPreference":
        return !profile.visaPreference;
      case "weatherPreference":
        return !profile.weatherPreference;
      default:
        return false;
    }
  });

const buildIntentSummary = (
  profile: AiAdvisorPreferenceProfile,
  missingPreferenceIds: AiAdvisorPreferenceFieldId[],
  locale: AppLocale,
) => {
  const knownFragments = buildSalientFacts(profile, locale);

  if (knownFragments.length === 0) {
    return locale === "ar"
      ? "لم أحصل بعد على تفضيلات كافية لبناء توصية دقيقة."
      : "I do not have enough preferences yet to build a precise recommendation.";
  }

  const missingSummary = missingPreferenceIds.slice(0, 3).join(", ");

  return locale === "ar"
    ? `المعروف حتى الآن: ${knownFragments.join("، ")}. ما زلت أحتاج إلى ${missingSummary || "تفاصيل بسيطة إضافية"}.`
    : `Known so far: ${knownFragments.join(", ")}. I still need ${missingSummary || "a little more detail"}.`;
};

export const buildAiAdvisorConversationMemory = ({
  history,
  latestUserMessage,
  locale,
  previousMemory,
}: {
  history: AiAdvisorChatMessage[];
  latestUserMessage: string;
  locale: AppLocale;
  previousMemory?: AiAdvisorConversationMemory;
}) => {
  const profile = buildProfileFromHistory(history, previousMemory);
  const missingPreferenceIds = getMissingPreferenceIds(profile);
  const userTurnCount = history.filter((message) => message.kind === "user_text").length;

  return {
    latestUserMessage,
    locale,
    missingPreferenceIds,
    preferenceProfile: profile,
    salientFacts: buildSalientFacts(profile, locale),
    turnCount: userTurnCount,
    userIntentSummary: buildIntentSummary(profile, missingPreferenceIds, locale),
  } satisfies AiAdvisorConversationMemory;
};

export const countKnownPreferences = (profile: AiAdvisorPreferenceProfile) =>
  [
    profile.budgetLevel ?? profile.budgetMax,
    profile.departureLocation,
    profile.familySize,
    profile.luxuryLevel,
    profile.tripDurationDays,
    profile.vibe,
    profile.visaPreference,
    profile.weatherPreference,
  ].filter(Boolean).length;

export const isUnsafeTravelRequest = (input: string) =>
  /fake passport|forged visa|smuggle|illegal border|avoid border control|trafficking|تهريب|جواز مزور|فيزا مزورة/.test(
    normalizeText(input),
  );
