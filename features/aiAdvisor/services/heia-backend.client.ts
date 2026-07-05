import { z } from "zod";

import {
  ApiRequestError,
  requestJsonWithSchema,
} from "../../../services/api/request";
import { getHayaApiUrl } from "../../../services/runtime/haya-api-config";
import flightCatalog from "../../../shared/catalog/flights.json";
import packageCatalog from "../../../shared/catalog/packages.json";
import {
  emptyHayaPreferences,
  mergeHayaPreferences,
  useHayaConversationStore,
} from "../../../store/haya-conversation-store";
import type {
  AiAdvisorBackendRequest,
  AiAdvisorBackendSuccessResponse,
  AiAdvisorStructuredResponse,
} from "../types";

const HEIA_API_PATH = "/api/haya/chat";
let activeController: AbortController | null = null;
export const cancelActiveHayaRequest = () => activeController?.abort();
const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();
const preferencesSchema = z.object({
  departureCity: nullableString,
  destinationInterests: z.array(z.string()),
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
  directFlightPreferred: z.boolean().nullable(),
  visaPreference: nullableString,
  specialPreferences: z.array(z.string()),
});
const responseSchema = z.object({
  assistantMessage: z.string(),
  locale: z.enum(["en", "ar", "fr"]),
  intent: z.string(),
  updatedPreferences: preferencesSchema,
  needsMoreInformation: z.boolean(),
  followUpQuestions: z.array(z.string()),
  recommendations: z.array(z.object({
    type: z.enum(["package", "flight"]), id: z.string(), reason: z.string(), matchScore: z.number(),
  })),
  requestId: z.string().optional(),
});

const localized = (value: { ar: string; en: string; fr?: string }, locale: "en" | "ar" | "fr") =>
  value[locale] ?? value.en;

export const mapHayaResponseToChatResponses = (
  data: z.infer<typeof responseSchema>,
): AiAdvisorStructuredResponse[] => {
  const responses: AiAdvisorStructuredResponse[] = [{
    id: `haya-${data.requestId ?? Date.now()}`,
    text: data.assistantMessage,
    tone: "guidance",
    type: "plain_text_guidance",
  }];
  for (const recommendation of data.recommendations) {
    if (recommendation.type === "flight") {
      const flight = flightCatalog.find((candidate) => candidate.id === recommendation.id);
      if (flight) responses.push({ flightId: flight.id, id: `haya-flight-${flight.id}`, reason: recommendation.reason, type: "flight_recommendation" });
      continue;
    }
    const item = packageCatalog.find((candidate) => candidate.id === recommendation.id);
    if (!item) continue;
    responses.push({
      ctaLabel: data.locale === "ar" ? "عرض الباقة" : data.locale === "fr" ? "Voir le forfait" : "View package",
      durationLabel: `${item.durationDays} ${data.locale === "ar" ? "أيام" : data.locale === "fr" ? "jours" : "days"}`,
      highlights: [recommendation.reason, item.category, item.flightIncluded ? "Flight included" : "Hotel included"],
      id: `haya-package-${item.id}`,
      imageUri: item.imageUrl,
      packageId: item.id,
      priceFrom: item.priceFrom,
      summary: recommendation.reason,
      title: localized(item.title, data.locale),
      type: "package_recommendation",
    });
  }
  if (data.followUpQuestions.length) {
    responses.push({
      id: `haya-follow-up-${data.requestId ?? Date.now()}`,
      intro: data.assistantMessage,
      questions: data.followUpQuestions.slice(0, 2).map((question, index) => ({
        id: `question-${index + 1}`, question, quickReplies: ["Flexible", "Help me choose"],
      })),
      type: "follow_up_question_set",
    });
  }
  return responses;
};

export const requestHeiaBackend = async ({ body, language }: { body: AiAdvisorBackendRequest; language: AiAdvisorBackendRequest["locale"] }): Promise<AiAdvisorBackendSuccessResponse> => {
  const apiUrl = getHayaApiUrl();
  if (!apiUrl) throw new ApiRequestError({ code: "not_configured", message: "Haya backend is not configured." });
  if (activeController) throw new ApiRequestError({ code: "duplicate_send", message: "A Haya request is already active." });
  activeController = new AbortController();
  const context = body.structuredContext;
  const conversation = useHayaConversationStore.getState();
  const requestPreferences = mergeHayaPreferences(conversation.preferences, {
    ...emptyHayaPreferences(), departureCity: context.departureCity ?? null, destinationInterests: context.destinationPreferences,
    budgetMin: context.budget.min ?? null, budgetMax: context.budget.max ?? null, currency: context.budget.currency ?? null,
    durationDays: context.durationDays ?? null, departureDate: context.travelDates.startDate ?? null, returnDate: context.travelDates.returnDate ?? null,
    dateFlexibility: context.travelDates.flexibility ?? null, travelers: context.partyComposition.totalTravelers ?? null,
    adults: context.partyComposition.adults ?? null, children: context.partyComposition.children ?? null, tripType: context.tripType ?? null,
    luxuryLevel: context.luxuryPreference ?? null, visaPreference: context.visaPreference ?? null, specialPreferences: context.salientFacts,
  });
  try {
    conversation.setApiStatus("loading");
    const response = await requestJsonWithSchema({
      baseUrl: apiUrl,
      body: {
        message: body.latestUserMessage,
        locale: language,
        conversationId: conversation.conversationId,
        history: (body.history ?? []).filter((item) => item.kind === "user_text" || item.kind === "assistant_text").slice(-12).map((item) => ({ role: item.role, content: "text" in item ? item.text : "" })).filter((item) => item.content),
        preferences: requestPreferences,
      },
      headers: { "Accept-Language": language },
      path: HEIA_API_PATH,
      responseSchema,
      retryCount: 1,
      signal: activeController.signal,
      timeoutMs: 20_000,
    });
    const nextStore = useHayaConversationStore.getState();
    nextStore.mergePreferences(response.updatedPreferences);
    nextStore.setRecommendationIds(response.recommendations.map((item) => item.id));
    nextStore.setApiStatus("online");
    return { ok: true, providerName: "hayatrips-haya-backend", ...(response.requestId ? { requestId: response.requestId } : {}), responses: mapHayaResponseToChatResponses(response), templateId: body.templateId };
  } catch (error) {
    useHayaConversationStore.getState().setApiStatus("error");
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError({ code: "service_unavailable", message: "Haya backend is unavailable." });
  } finally {
    activeController = null;
  }
};
