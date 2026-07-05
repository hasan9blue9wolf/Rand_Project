import { createServer } from "node:http";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const PORT = Number(process.env.PORT ?? process.env.HEIA_DEV_PORT ?? 8787);
const DEFAULT_MODEL = "gpt-5.4-mini-2026-03-17";

const packageCatalog = {
  "alps-private": {
    arabicBestFor: "الجبال، السبا، الثلج، الهدوء، الفخامة، الأزواج",
    arabicDurationLabel: "5 ليالي",
    arabicHighlights: ["أجنحة جبلية", "سبا", "قطار ومناظر"],
    arabicTitle: "سويسرا والجبال الخاصة",
    bestFor: "mountains, spa, scenery, quiet luxury, winter, couples",
    destinationLabel: "Swiss Alps",
    durationLabel: "5 nights",
    highlights: ["Mountain suites", "Spa access", "Scenic rail"],
    imageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDs3YV4WbhnJ3SC2lehzvCXuchyDNBeV-sLWdReXrDvt9UURq4ZnoXKr1-A5oSzSd5788Xfi0-W6AZ8p2au6ZTLvLNAEg1ML4RckeBrUBqnbqhM0Xkwj-lD_tNxfdAvQXAb9IsGCs6dUFzWgeXQeB593Kco-KMZ5rMg-6Z6iN5p6tiA2UQNr0fz_uBsAlXMX3Q45nYldTGzjMUvZL_zndps6T6iKn5qXmpnA8KKjBS0aTUvwYWgvd81a5S8_CJwXm32TyYMhuUAXpk",
    priceFrom: 2640,
    title: "Swiss Alps Private Retreat",
  },
  "bali-signature": {
    arabicBestFor: "البحر، الفلل، الاسترخاء، شهر العسل، العوائل",
    arabicDurationLabel: "7 ليالي",
    arabicHighlights: ["فلل شاطئية", "تنقل خاص", "عشاء وقت الغروب"],
    arabicTitle: "بالي والبحر الراقية",
    bestFor: "beach, villas, relaxation, honeymoon, family-friendly premium breaks",
    destinationLabel: "Bali",
    durationLabel: "7 nights",
    highlights: ["Beach villas", "Private transfers", "Sunset dining"],
    imageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDFoYc541JvZwQiIVTqjjeeuSAWMkXPNOJ2-6X3xJLyOGWyb2o5G7p8SQVv8nGLGF8OjBzHkJLbuVbSfCwDK9f2Z-uqVbOTcq1_Ki-2U5Gyvfnt_GL8QVhHpxTvKelTjKUHCFuqdNp6SnblhBlBGh_IdHLPFAsN-B9hJtW_hWZcOQ-zJ1k-P9RUB8QnTqiPNQPX8lK1Ir5_Z8I2piUb2UxWaQiv2d4PB4Um5hKgVy5rS4SkR3qS0JgX8vf6-aDgrgiExmDPT9WJGE",
    priceFrom: 1890,
    title: "Bali Signature Escape",
  },
  "tokyo-curated": {
    arabicBestFor: "المدينة، الثقافة، المطاعم، التسوق، الفنادق الراقية",
    arabicDurationLabel: "6 ليالي",
    arabicHighlights: ["فنادق بوتيك", "دليل مدينة", "أولوية بالحجز"],
    arabicTitle: "طوكيو والمدينة الراقية",
    bestFor: "city culture, food, shopping, design hotels, premium city breaks",
    destinationLabel: "Tokyo",
    durationLabel: "6 nights",
    highlights: ["Boutique stays", "City guide", "Priority booking"],
    imageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5YYZkCQh9sCjf1EalvTwST_-k7_eUzGNs5joktm7kU41A9MQqUnKPauOyonmmn3Y4qwpU0yUn813zuo9nn44w23Q-VwPTs14xkA7ZcV-6Dytq2DA1UBJm8Apa965NWnPQ9S4Lk333_gUPNd4CPiAXtLinFPIv4Tw-8rR68jldcJgoJdKBMMEZ4ZNT3aTEXD4vuRCb9YfirsvwWtkA0QDz41GxogHVbkyhwX4v1ShKiHkHPFQPhkandy4wN45dykvr788pKJ8cp4o",
    priceFrom: 2240,
    title: "Tokyo Curated Discovery",
  },
};

const trimValue = (value) => value?.trim() ?? "";
const containsArabicText = (value) => /[\u0600-\u06FF]/.test(value);

const loadDotEnv = () => {
  try {
    const envFile = readFileSync(".env", "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional; process env still works for deployed or shell-provided values.
  }
};

loadDotEnv();

const openAiApiKey = trimValue(process.env.OPENAI_API_KEY);
const model = trimValue(process.env.OPENAI_HEIA_MODEL) || DEFAULT_MODEL;
const timeoutMs = Number(process.env.OPENAI_HEIA_TIMEOUT_MS ?? 30_000);
const client = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;

const trimmedString = (maxLength) => z.string().trim().min(1).max(maxLength);
const packageIdSchema = z.enum([
  "alps-private",
  "bali-signature",
  "tokyo-curated",
]);

const requestSchema = z.object({
  latestUserMessage: trimmedString(2000),
  locale: z.enum(["ar", "en"]),
  recentConversation: z.array(trimmedString(400)).max(12),
  structuredContext: z.record(z.string(), z.unknown()),
  templateId: z.enum([
    "destination_discovery",
    "family_travel_recommendation",
    "itinerary_generation",
    "luxury_travel_recommendation",
    "travel_tips",
  ]),
});

const modelQuestionSchema = z.object({
  helpText: trimmedString(220),
  id: trimmedString(60),
  question: trimmedString(220),
  quickReplies: z.array(trimmedString(80)).min(2).max(3),
});

const modelResponseEnvelopeSchema = z.object({
  followUpIntro: trimmedString(300),
  followUpQuestions: z.array(modelQuestionSchema).min(1).max(3),
  guidanceText: trimmedString(700),
  includePackageRecommendation: z.boolean(),
  packageId: packageIdSchema,
  packageSummary: z.string().trim().max(500),
  responseFocus: z.enum([
    "booking_process",
    "itinerary_help",
    "package_match",
    "travel_tips",
    "trip_discovery",
  ]),
});

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "Accept-Language, Content-Type, X-Client-Request-Id, X-Requested-With",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const sendJson = (response, status, body, extraHeaders = {}) => {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...corsHeaders,
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
};

const readJsonBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const resolveRequestLocale = (requestData) =>
  containsArabicText(requestData.latestUserMessage) ? "ar" : requestData.locale;

const normalizeArabicText = (value) =>
  value
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();

const hasPackageSignal = (requestData) => {
  const normalizedInput = normalizeArabicText(requestData.latestUserMessage);
  const context = requestData.structuredContext;
  const destinationPreferences = Array.isArray(context.destinationPreferences)
    ? context.destinationPreferences
    : [];

  return (
    /bali|بالي|tokyo|طوكيو|japan|يابان|swiss|سويسرا|alps|الالب|جبال|mountain|beach|شاط|city|مدينه|ثقاف|spa|سبا|honeymoon|شهر عسل/i.test(
      normalizedInput,
    ) ||
    destinationPreferences.length > 0 ||
    typeof context.durationDays === "number" ||
    typeof context.departureCity === "string" ||
    Boolean(context.vibe) ||
    Boolean(context.tripType)
  );
};

const isPureBookingProcessQuestion = (requestData) => {
  const normalizedInput = normalizeArabicText(requestData.latestUserMessage);
  const asksAboutBooking =
    /(شلون|كيف|طريقه|طريقة|اريد اعرف|ممكن توضح).*(اطلب|طلب|احجز|حجز|ادفع|دفع|استخدم|استعمل|اكمل)|^(اطلب|احجز|ادفع|شلون ادفع|شلون احجز|شلون اطلب)/i.test(
      normalizedInput,
    ) ||
    /\b(how|where|can).*(book|order|reserve|pay|checkout|use)\b/i.test(
      requestData.latestUserMessage,
    );

  return asksAboutBooking && !hasPackageSignal(requestData);
};

const normalizeRequestData = (requestData) => {
  const locale = resolveRequestLocale(requestData);

  if (locale === requestData.locale) {
    return requestData;
  }

  return {
    ...requestData,
    locale,
    structuredContext: {
      ...requestData.structuredContext,
      language: locale,
    },
  };
};

const buildFallbackResponse = (requestData) => ({
  responses: [
    {
      id: "local-fallback",
      text:
        requestData.locale === "ar"
          ? "أحتاج لحظة إضافية للوصول إلى نموذج الذكاء الاصطناعي. يمكنني متابعة التخطيط بالبيانات المتاحة الآن."
          : "I need another moment to reach the AI model. I can still continue planning from the details already provided.",
      tone: "fallback",
      type: "plain_text_guidance",
    },
  ],
});

const fallbackFollowUpQuestions = {
  ar: [
    {
      helpText: "الطابع يحدد الوجهة والفندق والإيقاع.",
      id: "trip-vibe",
      question: "شنو مود الرحلة اللي تريده؟",
      quickReplies: ["شاطئ وراحة", "مدينة ومطاعم", "جبال وهدوء"],
    },
    {
      helpText: "الميزانية تضبط مستوى الفندق والطيران.",
      id: "trip-budget",
      question: "شنو الميزانية التقريبية؟",
      quickReplies: ["حتى 2500 دولار", "2500-4500 دولار", "4500+ دولار"],
    },
    {
      helpText: "مدينة المغادرة تغير المسار والتوقيت.",
      id: "trip-departure",
      question: "منين تكون المغادرة؟",
      quickReplies: ["بغداد", "دبي", "نيويورك"],
    },
  ],
  en: [
    {
      helpText: "The vibe drives the destination, hotel style, and pace.",
      id: "trip-vibe",
      question: "Which trip mood should I prioritize?",
      quickReplies: ["Beach reset", "City and culture", "Quiet nature"],
    },
    {
      helpText: "Budget keeps the hotel and routing realistic.",
      id: "trip-budget",
      question: "What budget range should I stay within?",
      quickReplies: ["Under $2,500", "$2,500-$4,500", "$4,500+"],
    },
    {
      helpText: "Departure city changes flight timing and value.",
      id: "trip-departure",
      question: "Where will you depart from?",
      quickReplies: ["Baghdad", "Dubai", "New York"],
    },
  ],
};

const hasNoisyTokenPattern = (value) =>
  /(?:[23]D){3,}/i.test(value) || /[A-Za-z0-9_]{28,}/.test(value);

const normalizeIraqiArabicText = (value) =>
  [
    [/أقدر/g, "أكدر"],
    [/اقدر/g, "اكدر"],
    [/تستطيعون/g, "تكدر"],
    [/تستطيع/g, "تكدر"],
    [/يمكنك/g, "تكدر"],
    [/يمكننا/g, "نكدر"],
    [/بإمكانك/g, "تكدر"],
    [/بإمكاننا/g, "نكدر"],
    [/وش/g, "شنو"],
    [/إيش/g, "شنو"],
    [/ايش/g, "شنو"],
    [/(^|[\s،.؟!])شو(?=$|[\s،.؟!])/g, "$1شنو"],
    [/أبغى/g, "أريد"],
    [/ابغى/g, "أريد"],
    [/عايز/g, "أريد"],
    [/ودي/g, "أريد"],
    [/الحين/g, "هسه"],
    [/هلأ/g, "هسه"],
    [/دلوقتي/g, "هسه"],
    [/كتير/g, "هواية"],
    [/منيح/g, "زين"],
    [/يمديك/g, "تكدر"],
    [/حياك/g, "هلا بيك"],
    [/تقدرون/g, "تكدر"],
    [/تكدرون/g, "تكدر"],
    [/تريدون/g, "تريد"],
    [/تحبون/g, "تحب"],
    [/تعطوني/g, "تعطيني"],
    [/أرتبلكم/g, "أرتبلك"],
    [/ارتبلكم/g, "أرتبلك"],
    [/إلكم/g, "إلك"],
    [/لكم/g, "إلك"],
    [/(^|[\s،.؟!])لك(?=$|[\s،.؟!])/g, "$1إلك"],
    [/(^|[\s،.؟!])فيه(?=$|[\s،.؟!])/g, "$1بيه"],
    [/(^|[\s،.؟!])فيها(?=$|[\s،.؟!])/g, "$1بيها"],
    [/(^|[\s،.؟!])بها(?=$|[\s،.؟!])/g, "$1بيها"],
    [/حسب طلبكم/g, "حسب طلبك"],
    [/حسب رغبتكم/g, "حسب طلبك"],
    [/حسب وصفكم/g, "حسب وصفك"],
    [/(^|[\s،.؟!])أنا(?=$|[\s،.؟!])/g, "$1أني"],
    [/(^|[\s،.؟!])انا(?=$|[\s،.؟!])/g, "$1أني"],
    [/حبيبي/g, ""],
    [/ستايل/g, "جو"],
    [/جداً/g, "كلش"],
    [/جدا/g, "كلش"],
    [/(^|[\s،.؟!])ثم(?=$|[\s،.؟!])/g, "$1بعدين"],
    [/إذا تعطيني إذا تفضل/g, "إذا تحدد"],
    [/إذا تعطيني إذا/g, "إذا تعطيني"],
  ]
    .reduce(
      (result, [pattern, replacement]) => result.replace(pattern, replacement),
      value,
    )
    .replace(/\s+،/g, "،")
    .replace(/،\s*،/g, "،")
    .replace(/\s{2,}/g, " ")
    .trim();

const normalizeTextForLocale = (value, locale) =>
  locale === "ar" ? normalizeIraqiArabicText(value) : value;

const cleanText = (value, fallback, maxLength, options = {}) => {
  const { locale, minLength = 1 } = options;
  const trimmed = trimValue(value);

  if (
    !trimmed ||
    trimmed.length < minLength ||
    trimmed.length > maxLength ||
    hasNoisyTokenPattern(trimmed)
  ) {
    return normalizeTextForLocale(fallback, locale);
  }

  return normalizeTextForLocale(trimmed, locale);
};

const cleanQuickReplies = (quickReplies, fallbackReplies, locale) => {
  const cleanedReplies = quickReplies
    .map((reply) => cleanText(reply, "", 36, { locale }))
    .filter(Boolean);

  if (cleanedReplies.length < 2) {
    return fallbackReplies;
  }

  return cleanedReplies.slice(0, 3);
};

const buildDefaultModelOutput = (requestData) => ({
  followUpIntro:
    requestData.locale === "ar"
      ? "جاوبني على نقطة وحدة وأرتبلك خيارات أدق."
      : "Answer one quick point and I can tighten the shortlist.",
  followUpQuestions: [fallbackFollowUpQuestions[requestData.locale][0]],
  guidanceText:
    requestData.locale === "ar"
      ? "أني جاهزة أرتبلك توصية سفر مرتبة. أحتاج بس توضحلي الميزانية أو عدد المسافرين أو الجو اللي تريده."
      : "I’m ready to build a polished travel recommendation. I just need one clearer signal on budget, traveler count, or trip vibe.",
  includePackageRecommendation: false,
  packageId: "bali-signature",
  packageSummary:
    requestData.locale === "ar"
      ? "خيار شاطئي راق ومريح كبداية."
      : "A refined beach-forward option as a starting point.",
  responseFocus: "trip_discovery",
});

const buildGuidanceFallback = (requestData, modelOutput, selectedPackage) => {
  if (requestData.locale === "ar") {
    if (modelOutput.responseFocus === "package_match") {
      return `حسب طلبك، أنسب خيار هو ${selectedPackage.arabicTitle}: ${selectedPackage.arabicHighlights.join("، ")}. إذا تعطيني التواريخ وعدد المسافرين، أرتبلك ملخص الحجز والخطوة الجاية حتى نثبت التفاصيل.`;
    }

    if (modelOutput.responseFocus === "booking_process") {
      return "أكيد. تكدر تحجز بهالطريقة: تختار الباقة، تراجع ملخص الحجز، تضيف بيانات المسافرين، بعدها المستشار يثبت التفاصيل ونكمل الدفع أو التأكيد النهائي.";
    }
  }

  if (modelOutput.responseFocus === "package_match") {
    return `Based on what you shared, ${selectedPackage.title} is the best fit: ${selectedPackage.highlights.join(", ")}. Share dates and traveler count and I’ll prepare the booking summary.`;
  }

  return buildDefaultModelOutput(requestData).guidanceText;
};

const buildPackageSummaryFallback = (requestData, selectedPackage) =>
  requestData.locale === "ar"
    ? `هذا الخيار مناسب لأن ${selectedPackage.arabicHighlights.join("، ")} يطابقون ذوق الرحلة. أرتبلك ملخص الحجز بعد ما نثبت التواريخ وعدد المسافرين.`
    : `This option fits because ${selectedPackage.highlights.join(", ")} match the trip priorities. I’ll prepare the booking summary once dates and traveler count are confirmed.`;

const buildResponseEnvelope = (requestData, modelOutput) => {
  const selectedPackage = packageCatalog[modelOutput.packageId];
  const fallbackQuestions = fallbackFollowUpQuestions[requestData.locale];
  const isArabic = requestData.locale === "ar";
  const guidanceFallback = buildGuidanceFallback(
    requestData,
    modelOutput,
    selectedPackage,
  );
  const includePackageRecommendation =
    modelOutput.includePackageRecommendation &&
    modelOutput.responseFocus === "package_match" &&
    !isPureBookingProcessQuestion(requestData);
  const responses = [
    {
      id: "live-guidance",
      text: cleanText(
        modelOutput.guidanceText,
        guidanceFallback,
        700,
        {
          locale: requestData.locale,
          minLength: 48,
        },
      ),
      tone: "guidance",
      type: "plain_text_guidance",
    },
  ];

  if (includePackageRecommendation) {
    responses.push({
      ctaLabel:
        requestData.locale === "ar" ? "عرض تفاصيل الباقة" : "View package details",
      durationLabel: isArabic
        ? selectedPackage.arabicDurationLabel
        : selectedPackage.durationLabel,
      highlights: isArabic ? selectedPackage.arabicHighlights : selectedPackage.highlights,
      id: `live-package-${modelOutput.packageId}`,
      imageUri: selectedPackage.imageUri,
      packageId: modelOutput.packageId,
      priceFrom: selectedPackage.priceFrom,
      summary: cleanText(
        modelOutput.packageSummary,
        buildPackageSummaryFallback(requestData, selectedPackage),
        500,
        {
          locale: requestData.locale,
          minLength: 40,
        },
      ),
      title: isArabic ? selectedPackage.arabicTitle : selectedPackage.title,
      type: "package_recommendation",
    });
  }

  responses.push({
    id: "live-follow-up",
    intro: cleanText(
      modelOutput.followUpIntro,
      buildDefaultModelOutput(requestData).followUpIntro,
      300,
      {
        locale: requestData.locale,
        minLength: 20,
      },
    ),
    questions: modelOutput.followUpQuestions.map((question, index) => ({
      helpText: cleanText(
        question.helpText,
        fallbackQuestions[index]?.helpText ?? fallbackQuestions[0].helpText,
        220,
        {
          locale: requestData.locale,
        },
      ),
      id: cleanText(
        question.id,
        fallbackQuestions[index]?.id ?? `live-question-${index + 1}`,
        60,
      ),
      question: cleanText(
        question.question,
        fallbackQuestions[index]?.question ?? fallbackQuestions[0].question,
        220,
        {
          locale: requestData.locale,
          minLength: 8,
        },
      ),
      quickReplies: cleanQuickReplies(
        question.quickReplies,
        fallbackQuestions[index]?.quickReplies ?? fallbackQuestions[0].quickReplies,
        requestData.locale,
      ),
    })),
    type: "follow_up_question_set",
  });

  return {
    responses: responses.slice(0, 3),
  };
};

const buildPromptInput = (requestData) => {
  const packageSummary = Object.entries(packageCatalog)
    .map(([packageId, item]) => {
      if (requestData.locale === "ar") {
        return `${packageId}: ${item.arabicTitle}, ${item.arabicDurationLabel}, من $${item.priceFrom}, يناسب ${item.arabicBestFor}, المميزات: ${item.arabicHighlights.join("، ")}`;
      }

      return `${packageId}: ${item.title}, ${item.destinationLabel}, ${item.durationLabel}, from $${item.priceFrom}, best for ${item.bestFor}, highlights: ${item.highlights.join(", ")}`;
    })
    .join("\n");

  return JSON.stringify(
    {
      availablePackages: packageSummary,
      latestUserMessage: requestData.latestUserMessage,
      locale: requestData.locale,
      recentConversation: requestData.recentConversation,
      structuredContext: requestData.structuredContext,
      templateId: requestData.templateId,
    },
    null,
    2,
  );
};

const instructions = `
You are Haya, the travel concierge and sales advisor inside Haya Trips.
Return only structured data that matches the provided schema.
Use the request locale: English for "en", Arabic for "ar". If the user writes Arabic, respond in Arabic.
For English requests, every user-facing field must be English only. Do not include Arabic script or Iraqi phrases in English responses.
Your business goal is to move the user from vague intent to a bookable trip: understand needs, recommend a package only when justified, and guide them to booking.
Keep copy polished, concise, investor-demo ready, and travel-specific. Do not sound like a generic chatbot.
Use only these packageId values when recommending a package: alps-private, bali-signature, tokyo-curated.
Arabic display names: alps-private = "سويسرا والجبال", bali-signature = "بالي والبحر", tokyo-curated = "طوكيو والمدينة".
Arabic highlight translations: Mountain suites = "أجنحة جبلية", Spa access = "سبا", Scenic rail = "قطار ومناظر"; Beach villas = "فلل شاطئية", Private transfers = "تنقل خاص", Sunset dining = "عشاء وقت الغروب"; Boutique stays = "فنادق بوتيك", City guide = "دليل مدينة", Priority booking = "أولوية بالحجز".
Return a flat planning object, not UI component objects.
Always fill every schema field.

Arabic voice:
- These Arabic voice rules apply only when the request locale is "ar".
- Hard product rule: the Arabic assistant is always speaking to one male app user. Never infer that the app user is plural or female from "احنا", honeymoon, family, kids, couples, partyComposition, or traveler count.
- Use widely understood Iraqi Arabic, closest to natural Baghdadi/central Iraqi speech, written in Arabic script: warm, clear, and premium.
- Use Iraqi words and sentence rhythm when they fit: "شلون", "شنو", "شكو ماكو", "اكو", "ماكو", "هسه", "هواية", "زين", "خوش", "شكد", "وين", "شوقت", "تكدر", "أرتبلك", "إلك", "نثبت", "وياك".
- Keep it polished and travel-advisor appropriate. Do not overdo slang, jokes, rural wording, or heavy phonetic spellings.
- Do not use Saudi or generic Gulf wording such as "وش", "إيش", "أبغى", "ودي", "الحين", "مرة حلو", "يمديك", "تقدرون", or "حياك".
- Avoid non-Iraqi dialect drift such as Levantine "شو", "هلأ", "كتير", "منيح" or Egyptian "عايز", "دلوقتي".
- Prefer Iraqi alternatives: "شنو" not "إيش/شو", "هسه" not "الحين/هلأ", "أريد" not "أبغى/عايز", "هواية" not "مرة/كتير", "زين" not "منيح".
- Prefer "أكدر", "تقدر", "تكدر", and "نكدر" over formal or non-Iraqi wording such as "أقدر", "تستطيع", "يمكنك", "بإمكانك", or "بإمكاننا".
- When a first-person pronoun is needed, use "أني" or omit it. Do not use "أنا" or "انا" in assistant copy.
- Use "الجو", "المزاج", or "الاتجاه" instead of loanwords such as "ستايل".
- Hard forbidden Arabic user-facing terms: "أقدر", "اقدر", "تستطيع", "يمكنك", "بإمكانك", "بإمكاننا", "حبيبي", "أنا", "انا", "ستايل", "جدا", "جداً", "ثم".
- Prefer Iraqi connectors and intensifiers: "بعدين" not "ثم", "كلش" or "هواية" not "جدا/جداً".
- Prefer "بيه/بيها" and "إلك" over "فيه/فيها/بها" and "لك".
- Avoid pet-name greetings such as "حبيبي"; keep the voice premium, respectful, and app-like.
- Natural phrases are welcome when they fit: "تكدر", "شلون", "شنو", "تريد", "أرتبلك", "حتى", "إذا تحب", "هسه".
- Every Arabic guidanceText must include at least one natural Iraqi action phrase such as "تكدر", "أرتبلك", "إذا تعطيني", "هسه", or "نكدر نثبت".
- For Arabic package recommendations, end with a clear next step in this style: "إذا تعطيني التواريخ وعدد المسافرين، أرتبلك ملخص الحجز والخطوة الجاية."
- Always address the app user as one male speaker in Arabic: "حسب طلبك", "إلك", "تريد", "تكدر", "إذا تعطيني", "أرتبلك".
- Do not address the app user as plural or feminine. Avoid "حسب طلبكم", "رغبتكم", "وصفكم", "إلكم", "أنتوا", "تكدرون", "تقدرون", "تريدون", "تحبون", "تثبتون", "أرتبلكم", or "تعطوني".
- If the trip includes a couple, family, kids, or group, describe the travel party separately while keeping the user address masculine singular: "حسب طلبك، هذا مناسب للعائلة" and "إذا تعطيني عدد المسافرين".
- This masculine-singular addressing rule applies to every Arabic user-facing field: guidanceText, packageSummary, followUpIntro, follow-up questions, helpText, and quickReplies.
- Rewrite plural/group phrasing before output: say "بما إن الرحلة من أربيل" instead of "بما إنكم من أربيل", "عدد المسافرين 2" instead of "أنتوا 2", and "الجو اللي ذكرته" instead of "الجو اللي ذكرتوه".
- Before returning structured data, scan every Arabic string and rewrite any plural/feminine user address to masculine singular. Use neutral nouns for group facts: "العائلة", "عدد المسافرين", "تاريخ السفر", "الميزانية", "الرحلة".
- Do not overdo slang, jokes, or pet names. Avoid Gulf-only phrasing and avoid formal MSA that feels like a government form.
- Avoid English filler such as "quick start", "reply with", "shortlist", "package" unless it is a package title or USD.
- In Arabic guidanceText and packageSummary, do not use English package titles; use the Arabic display names instead.
- In Arabic guidanceText, translate package highlights instead of copying English catalog labels.
- If the user mixes English into Arabic, translate it in your Arabic response: "7 nights" -> "7 ليالي", "Premium" -> "راقي", "Priority booking" -> "أولوية بالحجز".
- Never output "Premium", "Priority booking", or "nights" in Arabic responses.
- Use clean Iraqi grammar. Avoid malformed endings such as "نكملون" or typo-like blends such as "أنرتبلك"; say "نكمل الحجز", "أرتبلك", "نرتبلك", or "نثبت التفاصيل".
- Keep phrases natural and literal. Avoid awkward expressions like "الهوس الغذائي", "يكّتب تأكيد", "يكّدر", "جوّه", "السببا", "للويكند" for long trips, or exaggerated sales language.
- Avoid duplicate conditional phrasing such as "إذا تعطيني إذا تفضل"; ask the question directly instead.
- Use plain text only. Do not use Markdown, asterisks, bold markers, bullet symbols, or decorative formatting.
- packageSummary may be empty only when includePackageRecommendation=false. If includePackageRecommendation=true, write a real summary in the response locale.

Response focus rules:
- responseFocus="booking_process" for pure questions about how to order/book/pay/use the app. For this focus, set includePackageRecommendation=false unless the user already named a destination/package or gave trip details.
- If a booking/process question names a catalog destination or package, such as "احجز بالي", "book Tokyo", or "سويسرا الخطوة الجاية", set responseFocus="package_match", includePackageRecommendation=true, and use the matching packageId while still explaining the booking next step in guidanceText.
- responseFocus="trip_discovery" for greetings or vague planning requests. Ask for the single next most useful detail first.
- responseFocus="package_match" only when there is enough signal from destination, vibe, duration, budget, travelers, or departure city. Then include one package recommendation.
- responseFocus="itinerary_help" for day-by-day planning after a package/destination is clear.
- responseFocus="travel_tips" for general travel advice that is not yet bookable.

Greeting opener:
- If the latest user message is only a greeting or light opener, such as "هلو", "مرحبا", "السلام عليكم", "hi", or "hello", do not ask only "what destination?".
- For Arabic pure greetings, respond like a travel advisor by offering three concrete moods from the catalog: "بحر وراحة"، "مدينة ومطاعم"، "جبال وهدوء". Ask which one feels closer and set includePackageRecommendation=false.
- Keep the greeting answer short and active: welcome them, present the three directions, and say you can arrange the closest option.

Booking process answer:
- If the latest user asks "شلون اكدر اطلب", "شلون احجز", "شلون ادفع", or similar, answer directly in Iraqi Arabic.
- Explain the flow in 3-5 short steps: choose the package, review booking summary, add traveler details, advisor confirmation, payment/final confirmation.
- Then ask only booking-relevant follow-ups: package choice, travelers, dates.
- Do not invent a package recommendation for a pure process question.

Recommendation rules:
- alps-private fits mountains, spa, snow/winter, quiet luxury, couples.
- bali-signature fits beach, relaxation, villas, honeymoon, warm family-friendly premium trips.
- tokyo-curated fits city, culture, food, shopping, design hotels, premium city breaks.
- If unsure, do not force a recommendation. Ask a concise follow-up.
- Use package cards only for packages in the catalog and keep price/duration/title consistent with catalog.

Follow-up rules:
- Ask 1-3 questions maximum.
- Each question should feel useful for booking, not like a survey.
- Quick replies must be short, natural, and button-friendly: 2-4 words, under 28 characters when possible.
- In Arabic follow-up questions and quick replies, address the user as masculine singular only: "تريد", "تحب", "تعطيني". Do not use "تريدون", "تحبون", "تعطوني", or "أرتبلكم".
- Do not include raw package IDs in user-facing quick replies. Use "بالي", "سويسرا", "طوكيو" or English display names.
- Do not ask for information already present in the structured context or recent conversation.

Good Arabic example for a pure booking question:
guidanceText: "أكيد. تكدر تطلب الرحلة بهالطريقة: تختار الباقة، تراجع ملخص الحجز، تضيف بيانات المسافرين، بعدها المستشار يأكد التفاصيل ونكمل الدفع أو التأكيد النهائي."
followUpIntro: "حتى أبدي وياك بالحجز، أحتاج هالثلاث شغلات:"
questions: "أي باقة عجبتك؟", "كم مسافر؟", "متى تريد السفر؟"

Good Arabic example for a package match:
guidanceText: "حسب كلامك، أنسب خيار هو بالي والبحر: فلل شاطئية، تنقل خاص، وجو هادي مناسب لشهر عسل. إذا التواريخ مناسبة، أرتبلك ملخص الحجز والخطوة الجاية."

Good Arabic example for a pure greeting:
guidanceText: "هلو، نكدر نبدأ بسرعة: تريد بحر وراحة، مدينة ومطاعم، لو جبال وهدوء؟ اختار الأقرب وأرتبلك الخيار المناسب."
`;

const handleHeiaRequest = async (request, response) => {
  if (!client) {
    sendJson(response, 503, {
      code: "misconfigured",
      fallbackResponses: buildFallbackResponse({ locale: "en" }).responses,
      message: "OPENAI_API_KEY is not configured.",
      ok: false,
      providerName: "local-heia-dev",
    });
    return;
  }

  let requestData;

  try {
    requestData = normalizeRequestData(requestSchema.parse(await readJsonBody(request)));
  } catch {
    sendJson(response, 400, {
      code: "bad_request",
      message: "Invalid Haya request body.",
      ok: false,
      providerName: "local-heia-dev",
    });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const openAIResponse = await client.responses.parse(
      {
        input: buildPromptInput(requestData),
        instructions,
        model,
        text: {
          format: zodTextFormat(
            modelResponseEnvelopeSchema,
            "heia_model_envelope",
          ),
        },
      },
      {
        signal: controller.signal,
      },
    );
    const parsedOutput = buildResponseEnvelope(
      requestData,
      openAIResponse.output_parsed ?? buildDefaultModelOutput(requestData),
    );

    sendJson(response, 200, {
      ok: true,
      providerName: "local-heia-dev",
      requestId: openAIResponse.id,
      responses: parsedOutput.responses,
      templateId: requestData.templateId,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    sendJson(response, 503, {
      code: "upstream_error",
      fallbackResponses: buildFallbackResponse(requestData).responses,
      message: "The OpenAI request failed.",
      ok: false,
      providerName: "local-heia-dev",
    });
  } finally {
    clearTimeout(timeout);
  }
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

  if (request.method === "OPTIONS") {
    sendJson(response, 204, null);
    return;
  }

  if (pathname === "/health" && request.method === "GET") {
    sendJson(response, 200, {
      model,
      ok: true,
      providerName: "local-heia-dev",
    });
    return;
  }

  if (pathname !== "/api/heia" || request.method !== "POST") {
    sendJson(response, 404, {
      message: "Not found.",
      ok: false,
    });
    return;
  }

  void handleHeiaRequest(request, response);
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Local Haya API listening on http://localhost:${PORT}/api/heia`);
  console.log(`Using OpenAI model: ${model}`);
});
