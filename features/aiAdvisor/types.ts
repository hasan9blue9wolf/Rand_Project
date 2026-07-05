import type { PackageId } from "../../navigation/routes";
import type { AppLocale } from "../../types/i18n";
import type { FeaturedOffer } from "../../types/travel";

export type AiAdvisorSuggestionId = "beach" | "budget" | "family" | "surprise";

export type AiAdvisorBudgetLevel = "luxury" | "premium" | "smart";

export type AiAdvisorWeatherPreference = "cool" | "mild" | "snow" | "warm";

export type AiAdvisorLuxuryLevel = "comfort" | "luxury" | "premium" | "ultraLuxury";

export type AiAdvisorVisaPreference = "easyVisa" | "flexible" | "visaFreeOnly";

export type AiAdvisorVibe =
  | "adventure"
  | "beach"
  | "city"
  | "culture"
  | "family"
  | "nature"
  | "romantic"
  | "wellness";

export type AiAdvisorPreferenceFieldId =
  | "budget"
  | "departureLocation"
  | "familySize"
  | "luxuryLevel"
  | "tripDurationDays"
  | "vibe"
  | "visaPreference"
  | "weatherPreference";

export type AiAdvisorLocalizedText = Record<"ar" | "en", string> &
  Partial<Record<AppLocale, string>>;

export type AiAdvisorLocalizedTextList = Record<"ar" | "en", string[]> &
  Partial<Record<AppLocale, string[]>>;

export type AiAdvisorItineraryStopTemplate = {
  summary: AiAdvisorLocalizedText;
  title: AiAdvisorLocalizedText;
};

export type AiAdvisorPreferenceProfile = {
  budgetLevel?: AiAdvisorBudgetLevel;
  budgetMax?: number;
  budgetMin?: number;
  departureLocation?: string;
  familySize?: number;
  luxuryLevel?: AiAdvisorLuxuryLevel;
  tripDurationDays?: number;
  vibe?: AiAdvisorVibe;
  visaPreference?: AiAdvisorVisaPreference;
  weatherPreference?: AiAdvisorWeatherPreference;
};

export type AiAdvisorTripType =
  | "adventure"
  | "business"
  | "couples"
  | "family"
  | "friends"
  | "luxury"
  | "solo"
  | "wellness";

export type AiAdvisorPromptTemplateId =
  | "destination_discovery"
  | "family_travel_recommendation"
  | "itinerary_generation"
  | "luxury_travel_recommendation"
  | "travel_tips";

export type AiAdvisorBudgetContext = {
  currency: "USD";
  level?: AiAdvisorBudgetLevel;
  max?: number;
  min?: number;
};

export type AiAdvisorTravelDatesContext = {
  flexibility?: "exact" | "flexible";
  notes?: string;
  returnDate?: string;
  startDate?: string;
};

export type AiAdvisorPartyComposition = {
  adults?: number;
  children?: number;
  infants?: number;
  notes?: string;
  totalTravelers?: number;
};

export type AiAdvisorStructuredContext = {
  budget: AiAdvisorBudgetContext;
  departureCity?: string;
  destinationPreferences: string[];
  durationDays?: number;
  language: AppLocale;
  luxuryPreference?: AiAdvisorLuxuryLevel;
  partyComposition: AiAdvisorPartyComposition;
  salientFacts: string[];
  travelDates: AiAdvisorTravelDatesContext;
  tripType?: AiAdvisorTripType;
  userIntentSummary: string;
  visaPreference?: AiAdvisorVisaPreference;
  vibe?: AiAdvisorVibe;
  weatherPreference?: AiAdvisorWeatherPreference;
};

export type AiAdvisorConversationMemory = {
  latestUserMessage: string;
  locale: AppLocale;
  missingPreferenceIds: AiAdvisorPreferenceFieldId[];
  preferenceProfile: AiAdvisorPreferenceProfile;
  salientFacts: string[];
  turnCount: number;
  userIntentSummary: string;
};

export type AiAdvisorGuidanceTone = "fallback" | "guidance" | "safety";

export type AiAdvisorPlainTextGuidanceResponse = {
  id: string;
  text: string;
  tone: AiAdvisorGuidanceTone;
  type: "plain_text_guidance";
};

export type AiAdvisorDestinationRecommendationResponse = {
  bestForLabel: string;
  budgetRange: {
    max: number;
    min: number;
  };
  country: string;
  ctaLabel: string;
  destination: string;
  id: string;
  imageUri: string;
  luxuryLabel: string;
  packageId?: PackageId;
  reasons: string[];
  summary: string;
  type: "destination_recommendation";
  visaLabel: string;
  weatherLabel: string;
};

export type AiAdvisorItineraryDay = {
  dayLabel: string;
  summary: string;
  title: string;
};

export type AiAdvisorItinerarySuggestionResponse = {
  destination: string;
  durationDays: number;
  estimatedBudget: number;
  id: string;
  summary: string;
  title: string;
  type: "itinerary_suggestion";
  days: AiAdvisorItineraryDay[];
};

export type AiAdvisorPackageRecommendationResponse = {
  ctaLabel: string;
  durationLabel: string;
  highlights: string[];
  id: string;
  imageUri: string;
  packageId: PackageId;
  priceFrom: number;
  summary: string;
  title: string;
  type: "package_recommendation";
};

export type AiAdvisorFlightRecommendationResponse = {
  flightId: string;
  id: string;
  reason: string;
  type: "flight_recommendation";
};

export type AiAdvisorFollowUpQuestion = {
  helpText?: string;
  id: string;
  question: string;
  quickReplies: string[];
};

export type AiAdvisorFollowUpQuestionSetResponse = {
  id: string;
  intro: string;
  questions: AiAdvisorFollowUpQuestion[];
  type: "follow_up_question_set";
};

export type AiAdvisorStructuredResponse =
  | AiAdvisorDestinationRecommendationResponse
  | AiAdvisorFollowUpQuestionSetResponse
  | AiAdvisorItinerarySuggestionResponse
  | AiAdvisorPackageRecommendationResponse
  | AiAdvisorFlightRecommendationResponse
  | AiAdvisorPlainTextGuidanceResponse;

export type AiAdvisorStructuredResponseEnvelope = {
  responses: AiAdvisorStructuredResponse[];
};

export type AiAdvisorTextChatMessage =
  | AiAdvisorAssistantTextChatMessage
  | AiAdvisorUserTextChatMessage;

export type AiAdvisorAssistantTextChatMessage = {
  id: string;
  kind: "assistant_text";
  role: "assistant";
  showAvatar?: boolean;
  suggestionIds?: AiAdvisorSuggestionId[];
  text: string;
  tone?: AiAdvisorGuidanceTone;
  language?: AppLocale;
  recommendationIds?: string[];
  recommendationTypes?: ("package" | "flight")[];
  conversationState?: { clarificationCount: number; readyToRecommend: boolean; assumptions?: string[] };
};

export type AiAdvisorUserTextChatMessage = {
  id: string;
  kind: "user_text";
  role: "user";
  text: string;
};

export type AiAdvisorRenderableStructuredResponse = Exclude<
  AiAdvisorStructuredResponse,
  AiAdvisorPlainTextGuidanceResponse
>;

export type AiAdvisorAssistantStructuredChatMessage = {
  id: string;
  inset?: boolean;
  kind: "assistant_response";
  response: AiAdvisorRenderableStructuredResponse;
  role: "assistant";
  language?: AppLocale;
  recommendationIds?: string[];
  recommendationTypes?: ("package" | "flight")[];
  conversationState?: { clarificationCount: number; readyToRecommend: boolean; assumptions?: string[] };
};

export type AiAdvisorStatusState = "error" | "loading";

export type AiAdvisorStatusChatMessage = {
  description: string;
  id: string;
  kind: "status";
  retryable?: boolean;
  role: "system";
  status: AiAdvisorStatusState;
  title: string;
};

export type AiAdvisorChatMessage =
  | AiAdvisorAssistantStructuredChatMessage
  | AiAdvisorStatusChatMessage
  | AiAdvisorTextChatMessage;

export type AiAdvisorScreenData = {
  assistantAvatarUri: string;
  subtitle: string;
  title: string;
};

export type AiAdvisorPromptBundle = {
  recentConversation: string[];
  responseSchemaHint: string;
  system: string;
  templateId: AiAdvisorPromptTemplateId;
  templateLabel: string;
  user: string;
};

export type AiAdvisorProviderMode = "mock" | "real";

export type AiAdvisorProviderRequest = {
  history: AiAdvisorChatMessage[];
  latestUserMessage: string;
  locale: AppLocale;
  memory: AiAdvisorConversationMemory;
  prompt: AiAdvisorPromptBundle;
  structuredContext: AiAdvisorStructuredContext;
  templateId: AiAdvisorPromptTemplateId;
};

export type AiAdvisorProviderOutput =
  | AiAdvisorStructuredResponseEnvelope
  | string;

export type AiAdvisorProvider = {
  generateResponse: (request: AiAdvisorProviderRequest) => Promise<AiAdvisorProviderOutput>;
  mode: AiAdvisorProviderMode;
  name: string;
};

export type AiAdvisorTurnRequest = {
  history: AiAdvisorChatMessage[];
  latestUserMessage: string;
  locale: AppLocale;
  previousMemory?: AiAdvisorConversationMemory;
  providerMode?: AiAdvisorProviderMode;
};

export type AiAdvisorTurnResult = {
  memory: AiAdvisorConversationMemory;
  providerName: string;
  responses: AiAdvisorStructuredResponse[];
  usedFallback: boolean;
};

export type AiAdvisorChatHistoryThread = {
  createdAt: string;
  id: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  locale: AppLocale;
  title: string;
  updatedAt: string;
  userId: string;
};

export type AiAdvisorChatHistoryMessage = {
  createdAt: string;
  id: string;
  messageKind: AiAdvisorChatMessage["kind"];
  payload: AiAdvisorChatMessage;
  role: AiAdvisorChatMessage["role"];
  threadId: string;
  userId: string;
};

export type AiAdvisorBackendRequest = {
  history?: AiAdvisorChatMessage[];
  latestUserMessage: string;
  locale: AppLocale;
  recentConversation: string[];
  structuredContext: AiAdvisorStructuredContext;
  templateId: AiAdvisorPromptTemplateId;
};

export type AiAdvisorBackendSuccessResponse = {
  ok: true;
  providerName: string;
  requestId?: string;
  responses: AiAdvisorStructuredResponse[];
  templateId: AiAdvisorPromptTemplateId;
};

export type AiAdvisorBackendErrorCode =
  | "bad_request"
  | "misconfigured"
  | "rate_limited"
  | "service_unavailable"
  | "timeout"
  | "upstream_error";

export type AiAdvisorBackendErrorResponse = {
  code: AiAdvisorBackendErrorCode;
  fallbackResponses?: AiAdvisorStructuredResponse[];
  message: string;
  ok: false;
  providerName: string;
  retryAfterSeconds?: number;
};

export type AiAdvisorBackendResponse =
  | AiAdvisorBackendErrorResponse
  | AiAdvisorBackendSuccessResponse;

export type AiAdvisorCatalogDestination = {
  bestFor: AiAdvisorLocalizedText;
  budgetRange: {
    max: number;
    min: number;
  };
  country: AiAdvisorLocalizedText;
  departureBiases: string[];
  destination: AiAdvisorLocalizedText;
  familyFriendly: boolean;
  highlightLabels: AiAdvisorLocalizedTextList;
  iconImageUri: string;
  id: PackageId | "dubai-curated";
  idealDurationDays: [number, number];
  itineraryStops: AiAdvisorItineraryStopTemplate[];
  luxuryLevels: AiAdvisorLuxuryLevel[];
  packageId?: PackageId;
  summary: AiAdvisorLocalizedText;
  vibeTags: AiAdvisorVibe[];
  visaOptions: AiAdvisorVisaPreference[];
  weatherDescriptor: AiAdvisorLocalizedText;
  weatherOptions: AiAdvisorWeatherPreference[];
};

export type AiAdvisorPackageCatalogItem = {
  imageUri: string;
  offer: FeaturedOffer;
};
