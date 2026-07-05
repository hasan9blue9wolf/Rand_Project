import { z } from "zod";

export const localeSchema = z.enum(["en", "ar", "fr"]);
const nullableString = z.string().trim().max(160).nullable().default(null);
const nullableNumber = z.number().finite().nonnegative().nullable().default(null);

export const preferencesSchema = z.object({
  departureCity: nullableString,
  destinationInterests: z.array(z.string().trim().min(1).max(100)).max(12).default([]),
  budgetMin: nullableNumber,
  budgetMax: nullableNumber,
  currency: nullableString,
  durationDays: nullableNumber,
  departureDate: nullableString,
  returnDate: nullableString,
  dateFlexibility: nullableString,
  travelers: nullableNumber,
  adults: nullableNumber,
  children: nullableNumber,
  tripType: nullableString,
  luxuryLevel: nullableString,
  cabinClass: nullableString,
  directFlightPreferred: z.boolean().nullable().default(null),
  visaPreference: nullableString,
  specialPreferences: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
}).strict();

export const conversationStateInputSchema = z.object({
  clarificationCount: z.number().int().min(0).max(4).default(0),
  recommendationsShown: z.boolean().default(false),
}).strict();

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  locale: localeSchema,
  conversationId: z.string().trim().min(1).max(128),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(1500),
  }).strict()).max(30).transform((items) => items.slice(-12)),
  preferences: preferencesSchema,
  conversationState: conversationStateInputSchema.optional(),
}).strict();

export const intentSchema = z.enum([
  "general_chat", "collect_preferences", "recommend_packages", "recommend_flights",
  "package_question", "flight_question", "booking_help",
]);

export const recommendationSchema = z.object({
  type: z.enum(["package", "flight"]),
  id: z.string().min(1),
  reason: z.string().min(1).max(400),
  matchScore: z.number().min(0).max(100),
}).strict();

export const chatResponseSchema = z.object({
  assistantMessage: z.string().min(1).max(2000),
  locale: localeSchema,
  intent: intentSchema,
  updatedPreferences: preferencesSchema,
  needsMoreInformation: z.boolean(),
  followUpQuestions: z.array(z.string().min(1).max(300)).max(2),
  recommendations: z.array(recommendationSchema).max(5),
  language: localeSchema,
  conversationState: z.object({
    language: localeSchema,
    clarificationCount: z.number().int().min(0).max(4),
    collectedAnswerCount: z.number().int().nonnegative(),
    readyToRecommend: z.boolean(),
    collectedPreferences: preferencesSchema,
    assumptions: z.array(z.string().max(240)).max(8),
    recommendationsShown: z.boolean(),
  }).strict(),
  followUpQuestion: z.string().max(300).nullable(),
}).strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
