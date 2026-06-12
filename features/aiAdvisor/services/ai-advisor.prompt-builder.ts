import type { AppLocale } from "../../../types/i18n";
import type {
  AiAdvisorChatMessage,
  AiAdvisorPromptBundle,
  AiAdvisorPromptTemplateId,
  AiAdvisorStructuredContext,
} from "../types";
import { getAiAdvisorPromptTemplate } from "./ai-advisor.prompt-templates";

const stringifyHistoryForPrompt = (history: AiAdvisorChatMessage[]) =>
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
    .slice(-8)
    .join("\n");

export const buildAiAdvisorPromptBundle = ({
  history,
  latestUserMessage,
  locale,
  recentConversation,
  structuredContext,
  templateId,
}: {
  history?: AiAdvisorChatMessage[];
  latestUserMessage: string;
  locale: AppLocale;
  recentConversation?: string[];
  structuredContext: AiAdvisorStructuredContext;
  templateId: AiAdvisorPromptTemplateId;
}): AiAdvisorPromptBundle => {
  const template = getAiAdvisorPromptTemplate({
    locale,
    structuredContext,
    templateId,
  });
  const localeInstruction =
    locale === "ar"
      ? "Respond in Arabic with natural Gulf-friendly travel phrasing and avoid English filler unless the user already used it."
      : "Respond in English with premium, grounded travel-advisor language.";
  const resolvedRecentConversation =
    recentConversation ??
    stringifyHistoryForPrompt(history ?? [])
      .split("\n")
      .filter(Boolean);

  const responseSchemaHint = `
Return JSON only with this shape:
{
  "responses": [
    { "type": "plain_text_guidance", "id": "string", "text": "string", "tone": "guidance|fallback|safety" },
    { "type": "destination_recommendation", "id": "string", "destination": "string", "country": "string", "summary": "string", "imageUri": "string", "budgetRange": { "min": 0, "max": 0 }, "reasons": ["string"], "bestForLabel": "string", "weatherLabel": "string", "visaLabel": "string", "luxuryLabel": "string", "ctaLabel": "string" },
    { "type": "itinerary_suggestion", "id": "string", "title": "string", "summary": "string", "destination": "string", "durationDays": 0, "estimatedBudget": 0, "days": [{ "dayLabel": "string", "title": "string", "summary": "string" }] },
    { "type": "package_recommendation", "id": "string", "packageId": "bali-signature|alps-private|tokyo-curated", "title": "string", "summary": "string", "imageUri": "string", "priceFrom": 0, "durationLabel": "string", "highlights": ["string"], "ctaLabel": "string" },
    { "type": "follow_up_question_set", "id": "string", "intro": "string", "questions": [{ "id": "string", "question": "string", "helpText": "string", "quickReplies": ["string"] }] }
  ]
}`.trim();

  return {
    recentConversation: resolvedRecentConversation,
    responseSchemaHint,
    system: [
      "You are Heia, a premium AI travel advisor inside Haya Trip.",
      localeInstruction,
      `Prompt template: ${template.label}.`,
      template.objective,
      template.focus,
      "Ask sharp follow-up questions when key details are missing.",
      "Adapt recommendations to departure city, destination preferences, budget, travel dates, party composition, language, luxury preference, trip type, visa ease, weather, and duration.",
      "Prefer concise, high-signal recommendations and keep the response modular for UI rendering.",
      "Never help with illegal travel behavior, forged documents, or evading border controls.",
    ].join(" "),
    templateId,
    templateLabel: template.label,
    user: [
      `Structured context:\n${JSON.stringify(structuredContext, null, 2)}`,
      `Recent conversation:\n${resolvedRecentConversation.join("\n")}`,
      `Latest user message: ${latestUserMessage}`,
      responseSchemaHint,
    ].join("\n\n"),
  };
};
