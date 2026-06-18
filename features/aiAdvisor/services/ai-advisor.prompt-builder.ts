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
      ? [
          "Respond in widely understood Iraqi Arabic, closest to natural Baghdadi/central Iraqi speech, written in Arabic script.",
          "Use Iraqi words and sentence rhythm when they fit: شلون، شنو، شكو ماكو، اكو، ماكو، هسه، هواية، زين، خوش، شكد، وين، شوقت، تكدر، أرتبلك، إلك، نثبت، وياك.",
          "Keep it polished and travel-advisor appropriate: Iraqi, warm, direct, and premium; do not overdo slang, jokes, rural wording, or heavy phonetic spellings.",
          "Do not use Saudi or generic Gulf wording such as وش، إيش، أبغى، ودي، الحين، مرة حلو، يمديك، تقدرون، or حياك.",
          "Avoid non-Iraqi dialect drift such as Levantine شو/هلأ/كتير/منيح or Egyptian عايز/دلوقتي.",
          "Prefer Iraqi alternatives: شنو not إيش/شو, هسه not الحين/هلأ, أريد not أبغى/عايز, هواية not مرة/كتير, زين not منيح.",
          "Prefer أكدر، تكدر، نكدر over أقدر، تستطيع، يمكنك، بإمكانك.",
          "When a first-person pronoun is needed, use أني or omit it; do not use أنا/انا in assistant copy.",
          "Use الجو، المزاج، أو الاتجاه instead of loanwords such as ستايل.",
          "Forbidden in Arabic user-facing copy: أقدر، اقدر، تستطيع، يمكنك، بإمكانك، بإمكاننا، حبيبي، أنا، انا، ستايل، جدا، جداً، ثم.",
          "Prefer Iraqi connectors and intensifiers: بعدين not ثم, كلش or هواية not جدا.",
          "Prefer بيه/بيها and إلك over فيه/فيها/بها and لك.",
          "Avoid pet-name greetings such as حبيبي; keep the voice premium and respectful.",
          "Keep addressing the app user as one male speaker: تريد، تكدر، إلك، إذا تعطيني، أرتبلك.",
          "Avoid English filler unless the user already used it.",
        ].join(" ")
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
      "You are Haya, a premium AI travel advisor inside Haya Trip.",
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
