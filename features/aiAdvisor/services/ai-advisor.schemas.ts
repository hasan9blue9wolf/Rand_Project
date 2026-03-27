import { z } from "zod";

const trimmedString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength);

export const aiAdvisorPackageIdSchema = z.enum([
  "alps-private",
  "bali-signature",
  "tokyo-curated",
]);

export const aiAdvisorLocaleSchema = z.enum(["ar", "en"]);

export const aiAdvisorPromptTemplateIdSchema = z.enum([
  "destination_discovery",
  "family_travel_recommendation",
  "itinerary_generation",
  "luxury_travel_recommendation",
  "travel_tips",
]);

export const aiAdvisorBudgetContextSchema = z.object({
  currency: z.literal("USD"),
  level: z.enum(["luxury", "premium", "smart"]).optional(),
  max: z.number().positive().optional(),
  min: z.number().positive().optional(),
}).strict();

export const aiAdvisorTravelDatesContextSchema = z.object({
  flexibility: z.enum(["exact", "flexible"]).optional(),
  notes: trimmedString(240).optional(),
  returnDate: trimmedString(40).optional(),
  startDate: trimmedString(40).optional(),
}).strict();

export const aiAdvisorPartyCompositionSchema = z.object({
  adults: z.number().int().positive().optional(),
  children: z.number().int().nonnegative().optional(),
  infants: z.number().int().nonnegative().optional(),
  notes: trimmedString(160).optional(),
  totalTravelers: z.number().int().positive().optional(),
}).strict();

export const aiAdvisorStructuredContextSchema = z.object({
  budget: aiAdvisorBudgetContextSchema,
  departureCity: trimmedString(80).optional(),
  destinationPreferences: z.array(trimmedString(80)).max(10),
  durationDays: z.number().int().positive().max(30).optional(),
  language: aiAdvisorLocaleSchema,
  luxuryPreference: z.enum(["comfort", "luxury", "premium", "ultraLuxury"]).optional(),
  partyComposition: aiAdvisorPartyCompositionSchema,
  salientFacts: z.array(trimmedString(160)).max(12),
  travelDates: aiAdvisorTravelDatesContextSchema,
  tripType: z
    .enum(["adventure", "business", "couples", "family", "friends", "luxury", "solo", "wellness"])
    .optional(),
  userIntentSummary: trimmedString(600),
  visaPreference: z.enum(["easyVisa", "flexible", "visaFreeOnly"]).optional(),
  vibe: z
    .enum(["adventure", "beach", "city", "culture", "family", "nature", "romantic", "wellness"])
    .optional(),
  weatherPreference: z.enum(["cool", "mild", "snow", "warm"]).optional(),
}).strict();

export const plainTextGuidanceSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  tone: z.enum(["fallback", "guidance", "safety"]),
  type: z.literal("plain_text_guidance"),
});

export const destinationRecommendationSchema = z.object({
  bestForLabel: z.string().min(1),
  budgetRange: z.object({
    max: z.number(),
    min: z.number(),
  }),
  country: z.string().min(1),
  ctaLabel: z.string().min(1),
  destination: z.string().min(1),
  id: z.string(),
  imageUri: z.string().min(1),
  luxuryLabel: z.string().min(1),
  packageId: aiAdvisorPackageIdSchema.optional(),
  reasons: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
  type: z.literal("destination_recommendation"),
  visaLabel: z.string().min(1),
  weatherLabel: z.string().min(1),
});

export const itinerarySuggestionSchema = z.object({
  days: z
    .array(
      z.object({
        dayLabel: z.string().min(1),
        summary: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .min(1),
  destination: z.string().min(1),
  durationDays: z.number().int().positive(),
  estimatedBudget: z.number().positive(),
  id: z.string(),
  summary: z.string().min(1),
  title: z.string().min(1),
  type: z.literal("itinerary_suggestion"),
});

export const packageRecommendationSchema = z.object({
  ctaLabel: z.string().min(1),
  durationLabel: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  id: z.string(),
  imageUri: z.string().min(1),
  packageId: aiAdvisorPackageIdSchema,
  priceFrom: z.number().positive(),
  summary: z.string().min(1),
  title: z.string().min(1),
  type: z.literal("package_recommendation"),
});

export const followUpQuestionSetSchema = z.object({
  id: z.string(),
  intro: z.string().min(1),
  questions: z
    .array(
      z.object({
        helpText: z.string().optional(),
        id: z.string(),
        question: z.string().min(1),
        quickReplies: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  type: z.literal("follow_up_question_set"),
});

export const aiAdvisorStructuredResponseSchema = z.discriminatedUnion("type", [
  destinationRecommendationSchema,
  followUpQuestionSetSchema,
  itinerarySuggestionSchema,
  packageRecommendationSchema,
  plainTextGuidanceSchema,
]);

export const aiAdvisorStructuredResponseEnvelopeSchema = z.object({
  responses: z.array(aiAdvisorStructuredResponseSchema).min(1),
});

export const aiAdvisorBackendRequestSchema = z.object({
  latestUserMessage: trimmedString(2000),
  locale: aiAdvisorLocaleSchema,
  recentConversation: z.array(trimmedString(400)).max(12),
  structuredContext: aiAdvisorStructuredContextSchema,
  templateId: aiAdvisorPromptTemplateIdSchema,
}).strict();

export const aiAdvisorBackendSuccessResponseSchema = z.object({
  ok: z.literal(true),
  providerName: z.string().min(1),
  requestId: z.string().optional(),
  responses: z.array(aiAdvisorStructuredResponseSchema).min(1),
  templateId: aiAdvisorPromptTemplateIdSchema,
});

export const aiAdvisorBackendErrorResponseSchema = z.object({
  code: z.enum([
    "bad_request",
    "misconfigured",
    "rate_limited",
    "service_unavailable",
    "timeout",
    "upstream_error",
  ]),
  fallbackResponses: z.array(aiAdvisorStructuredResponseSchema).min(1).optional(),
  message: z.string().min(1),
  ok: z.literal(false),
  providerName: z.string().min(1),
  retryAfterSeconds: z.number().int().positive().optional(),
});

export const aiAdvisorBackendResponseSchema = z.discriminatedUnion("ok", [
  aiAdvisorBackendErrorResponseSchema,
  aiAdvisorBackendSuccessResponseSchema,
]);
