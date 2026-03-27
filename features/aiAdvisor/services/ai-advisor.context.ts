import type {
  AiAdvisorChatMessage,
  AiAdvisorConversationMemory,
  AiAdvisorPartyComposition,
  AiAdvisorPromptTemplateId,
  AiAdvisorStructuredContext,
  AiAdvisorTravelDatesContext,
  AiAdvisorTripType,
} from "../types";

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

const normalizeText = (value: string) =>
  ARABIC_INDIC_DIGITS.reduce(
    (result, digit, index) => result.replaceAll(digit, String(index)),
    value.toLowerCase(),
  );

const stringifyHistoryForContext = (history: AiAdvisorChatMessage[]) =>
  history
    .map((message) => {
      switch (message.kind) {
        case "assistant_response":
          return `[assistant_response] ${message.response.type}`;
        case "assistant_text":
          return `[assistant] ${message.text}`;
        case "status":
          return `[system_${message.status}] ${message.title}: ${message.description}`;
        case "user_text":
          return `[user] ${message.text}`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .slice(-8);

const extractTravelDatesContext = (input: string): AiAdvisorTravelDatesContext => {
  const normalizedInput = normalizeText(input);
  const isoRangeMatch = normalizedInput.match(
    /(\d{4}-\d{1,2}-\d{1,2})\s*(?:to|-|until|through|الى|إلى|حتى)\s*(\d{4}-\d{1,2}-\d{1,2})/,
  );

  if (isoRangeMatch?.[1] && isoRangeMatch[2]) {
    return {
      flexibility: "exact",
      returnDate: isoRangeMatch[2],
      startDate: isoRangeMatch[1],
    };
  }

  const slashRangeMatch = normalizedInput.match(
    /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*(?:to|-|until|through)\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/,
  );

  if (slashRangeMatch?.[1] && slashRangeMatch[2]) {
    return {
      flexibility: "exact",
      returnDate: slashRangeMatch[2],
      startDate: slashRangeMatch[1],
    };
  }

  const looseDateHintMatch = normalizedInput.match(
    /(next month|this month|this summer|next summer|this winter|next winter|weekend|long weekend|school break|eid|العيد|الصيف|الشتاء|نهاية أسبوع|الأسبوع القادم|الشهر القادم)/,
  );

  if (looseDateHintMatch?.[1]) {
    return {
      flexibility: "flexible",
      notes: looseDateHintMatch[1],
    };
  }

  return {};
};

const extractPartyComposition = ({
  familySize,
  input,
}: {
  familySize: number | undefined;
  input: string;
}): AiAdvisorPartyComposition => {
  const normalizedInput = normalizeText(input);
  const adultsMatch =
    normalizedInput.match(/(\d+)\s*adults?/) ??
    normalizedInput.match(/(\d+)\s*(?:بالغ|بالغين|بالغان)/);
  const childrenMatch =
    normalizedInput.match(/(\d+)\s*(?:children|kids?)/) ??
    normalizedInput.match(/(\d+)\s*(?:طفل|اطفال|أطفال)/);
  const infantsMatch =
    normalizedInput.match(/(\d+)\s*(?:infants?|bab(?:y|ies))/) ??
    normalizedInput.match(/(\d+)\s*(?:رضيع|رضع)/);

  const adults = adultsMatch?.[1] ? Number(adultsMatch[1]) : undefined;
  const children = childrenMatch?.[1] ? Number(childrenMatch[1]) : undefined;
  const infants = infantsMatch?.[1] ? Number(infantsMatch[1]) : undefined;
  const inferredTotal =
    [adults, children, infants].reduce<number>(
      (sum, value) => sum + (typeof value === "number" ? value : 0),
      0,
    ) || familySize;

  return {
    ...(adults ? { adults } : {}),
    ...(children || children === 0 ? { children } : {}),
    ...(familySize && !adults && !children && !infants
      ? {
          notes:
            familySize >= 3
              ? "Party size inferred from conversation."
              : "Traveler count inferred from conversation.",
        }
      : {}),
    ...(infants || infants === 0 ? { infants } : {}),
    ...(inferredTotal ? { totalTravelers: inferredTotal } : {}),
  };
};

const deriveTripType = ({
  input,
  luxuryPreference,
  partyComposition,
  vibe,
}: {
  input: string;
  luxuryPreference: AiAdvisorStructuredContext["luxuryPreference"];
  partyComposition: AiAdvisorPartyComposition;
  vibe: AiAdvisorStructuredContext["vibe"];
}): AiAdvisorTripType | undefined => {
  const normalizedInput = normalizeText(input);

  if (
    (typeof partyComposition.children === "number" && partyComposition.children > 0) ||
    /family|kids|children|عائلة|أطفال/.test(normalizedInput)
  ) {
    return "family";
  }

  if (/honeymoon|couple|romantic|شهر عسل|زوجين|رومانسي/.test(normalizedInput)) {
    return "couples";
  }

  if (/solo|alone|by myself|لوحدي|منفرد/.test(normalizedInput)) {
    return "solo";
  }

  if (/friends|group trip|اصدقاء|أصدقاء/.test(normalizedInput)) {
    return "friends";
  }

  if (/business|conference|work trip|عمل|مؤتمر/.test(normalizedInput)) {
    return "business";
  }

  if (
    luxuryPreference === "luxury" ||
    luxuryPreference === "ultraLuxury" ||
    /luxury|vip|فاخر|فخامة/.test(normalizedInput)
  ) {
    return "luxury";
  }

  if (vibe === "wellness" || /wellness|spa|استرخ|سبا/.test(normalizedInput)) {
    return "wellness";
  }

  if (vibe === "adventure" || /adventure|hiking|ski|مغامر|تزلج/.test(normalizedInput)) {
    return "adventure";
  }

  return undefined;
};

const buildDestinationPreferences = ({
  input,
  vibe,
  weatherPreference,
}: {
  input: string;
  vibe: AiAdvisorStructuredContext["vibe"];
  weatherPreference: AiAdvisorStructuredContext["weatherPreference"];
}) => {
  const normalizedInput = normalizeText(input);
  const preferences = new Set<string>();

  if (vibe) {
    preferences.add(vibe);
  }

  if (weatherPreference) {
    preferences.add(weatherPreference);
  }

  [
    "beach",
    "culture",
    "city",
    "mountain",
    "island",
    "wellness",
    "luxury",
    "family",
  ].forEach((keyword) => {
    if (normalizedInput.includes(keyword)) {
      preferences.add(keyword);
    }
  });

  [
    "شاطئ",
    "ثقافة",
    "مدينة",
    "جبال",
    "جزيرة",
    "استرخاء",
    "فاخر",
    "عائلة",
  ].forEach((keyword) => {
    if (normalizedInput.includes(keyword)) {
      preferences.add(keyword);
    }
  });

  return [...preferences].slice(0, 6);
};

export const buildAiAdvisorStructuredContext = ({
  history,
  locale,
  memory,
}: {
  history: AiAdvisorChatMessage[];
  locale: AiAdvisorConversationMemory["locale"];
  memory: AiAdvisorConversationMemory;
}): AiAdvisorStructuredContext => {
  const userInputs = history
    .filter((message) => message.kind === "user_text")
    .map((message) => message.text)
    .concat(memory.latestUserMessage)
    .join(" \n ");
  const partyComposition = extractPartyComposition({
    familySize: memory.preferenceProfile.familySize,
    input: userInputs,
  });
  const travelDates = extractTravelDatesContext(userInputs);
  const tripType = deriveTripType({
    input: userInputs,
    luxuryPreference: memory.preferenceProfile.luxuryLevel,
    partyComposition,
    vibe: memory.preferenceProfile.vibe,
  });

  return {
    budget: {
      currency: "USD",
      ...(memory.preferenceProfile.budgetLevel
        ? { level: memory.preferenceProfile.budgetLevel }
        : {}),
      ...(typeof memory.preferenceProfile.budgetMax === "number"
        ? { max: memory.preferenceProfile.budgetMax }
        : {}),
      ...(typeof memory.preferenceProfile.budgetMin === "number"
        ? { min: memory.preferenceProfile.budgetMin }
        : {}),
    },
    ...(memory.preferenceProfile.departureLocation
      ? { departureCity: memory.preferenceProfile.departureLocation }
      : {}),
    destinationPreferences: buildDestinationPreferences({
      input: userInputs,
      vibe: memory.preferenceProfile.vibe,
      weatherPreference: memory.preferenceProfile.weatherPreference,
    }),
    ...(typeof memory.preferenceProfile.tripDurationDays === "number"
      ? { durationDays: memory.preferenceProfile.tripDurationDays }
      : {}),
    language: locale,
    ...(memory.preferenceProfile.luxuryLevel
      ? { luxuryPreference: memory.preferenceProfile.luxuryLevel }
      : {}),
    partyComposition,
    salientFacts: memory.salientFacts,
    travelDates,
    ...(tripType ? { tripType } : {}),
    userIntentSummary: memory.userIntentSummary,
    ...(memory.preferenceProfile.visaPreference
      ? { visaPreference: memory.preferenceProfile.visaPreference }
      : {}),
    ...(memory.preferenceProfile.vibe ? { vibe: memory.preferenceProfile.vibe } : {}),
    ...(memory.preferenceProfile.weatherPreference
      ? { weatherPreference: memory.preferenceProfile.weatherPreference }
      : {}),
  };
};

export const selectAiAdvisorPromptTemplate = ({
  latestUserMessage,
  structuredContext,
}: {
  latestUserMessage: string;
  structuredContext: AiAdvisorStructuredContext;
}): AiAdvisorPromptTemplateId => {
  const normalizedInput = normalizeText(latestUserMessage);

  if (
    /itinerary|day by day|day-by-day|plan the days|schedule|برنامج|جدول|مسار/.test(
      normalizedInput,
    )
  ) {
    return "itinerary_generation";
  }

  if (
    /tips|what should i know|packing|visa|safety|weather|currency|نصائح|ماذا اعرف|شنو اعرف|الفيزا/.test(
      normalizedInput,
    )
  ) {
    return "travel_tips";
  }

  if (
    structuredContext.tripType === "family" ||
    (typeof structuredContext.partyComposition.children === "number" &&
      structuredContext.partyComposition.children > 0)
  ) {
    return "family_travel_recommendation";
  }

  if (
    structuredContext.tripType === "luxury" ||
    structuredContext.luxuryPreference === "luxury" ||
    structuredContext.luxuryPreference === "ultraLuxury"
  ) {
    return "luxury_travel_recommendation";
  }

  return "destination_discovery";
};

export const buildAiAdvisorRecentConversation = (history: AiAdvisorChatMessage[]) =>
  stringifyHistoryForContext(history);
