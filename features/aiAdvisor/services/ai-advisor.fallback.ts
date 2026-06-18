import type {
  AiAdvisorFollowUpQuestionSetResponse,
  AiAdvisorPlainTextGuidanceResponse,
  AiAdvisorStructuredResponse,
  AiAdvisorTurnRequest,
} from "../types";

export const buildAiAdvisorSafetyResponses = ({
  locale,
}: {
  locale: AiAdvisorTurnRequest["locale"];
}): AiAdvisorStructuredResponse[] => [
  {
    id: "safety-guidance",
    text:
      locale === "ar"
        ? "ما أكدر أساعد بأي طلب يرتبط بتجاوز القوانين أو الوثائق المزورة. إذا تريد، أكدر أساعدك بتخطيط سفر نظامي وآمن ومناسب لميزانيتك."
        : "I can’t help with illegal travel activity or forged documents. I can help you plan a legitimate, safe trip that fits your budget and priorities instead.",
    tone: "safety",
    type: "plain_text_guidance",
  },
  {
    id: "safety-follow-up",
    intro:
      locale === "ar"
        ? "إذا تريد نكمل تخطيط قانوني، جاوب على نقطة وحدة:"
        : "If you want to continue with legitimate planning, answer one of these quick prompts:",
    questions: [
      {
        id: "safety-budget",
        question:
          locale === "ar"
            ? "ما الميزانية التقريبية؟"
            : "What budget range are you considering?",
        quickReplies:
          locale === "ar"
            ? ["حتى 2500 دولار", "2500 - 4500 دولار", "4500+ دولار"]
            : ["Up to $2,500", "$2,500-$4,500", "$4,500+"],
      },
      {
        id: "safety-vibe",
        question:
          locale === "ar" ? "شنو الجو اللي تريده؟" : "What vibe are you after?",
        quickReplies:
          locale === "ar"
            ? ["شاطئي هادئ", "مدينة وثقافة", "جبال واسترخاء"]
            : ["Relaxed beach", "City and culture", "Mountains and calm"],
      },
    ],
    type: "follow_up_question_set",
  },
];

export const buildAiAdvisorFallbackResponses = ({
  locale,
  memorySummary,
}: {
  locale: AiAdvisorTurnRequest["locale"];
  memorySummary: string;
}): [AiAdvisorPlainTextGuidanceResponse, AiAdvisorFollowUpQuestionSetResponse] => [
  {
    id: "fallback-guidance",
    text:
      locale === "ar"
        ? `صار خلل مؤقت وأنا أرتب التوصية. ${memorySummary}`
        : `I hit a temporary snag while building the recommendation. ${memorySummary}`,
    tone: "fallback",
    type: "plain_text_guidance",
  },
  {
    id: "fallback-follow-up",
    intro:
      locale === "ar"
        ? "أعد الإرسال أو اختار جواب سريع وأرتبلك الخيارات بشكل أوضح."
        : "Retry the request or tap one quick answer and I’ll rebuild the shortlist more cleanly.",
    questions: [
      {
        helpText:
          locale === "ar"
            ? "أحتاج بس إشارة أوضح حتى أكمل."
            : "I just need one sharper signal to continue.",
        id: "fallback-vibe",
        question:
          locale === "ar"
            ? "شنو الجو اللي تريد أركز عليه؟"
            : "Which trip mood should I focus on?",
        quickReplies:
          locale === "ar"
            ? ["شاطئي", "مدينة وثقافة", "طبيعة هادئة"]
            : ["Beach", "City and culture", "Quiet nature"],
      },
    ],
    type: "follow_up_question_set",
  },
];
