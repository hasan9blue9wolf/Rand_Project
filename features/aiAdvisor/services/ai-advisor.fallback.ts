import packageCatalog from "../../../shared/catalog/packages.json";
import type { AiAdvisorStructuredResponse, AiAdvisorTurnRequest } from "../types";

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
  memorySummary: _memorySummary,
}: {
  locale: AiAdvisorTurnRequest["locale"];
  memorySummary: string;
}): AiAdvisorStructuredResponse[] => {
  const message = locale === "ar"
    ? "تعذر الاتصال بالمساعد حاليًا. عرضت لك بعض الخيارات المتاحة ويمكنك المحاولة مرة أخرى."
    : locale === "fr"
      ? "Haya est temporairement indisponible. Voici quelques options disponibles, et vous pouvez réessayer."
      : "Haya is temporarily unavailable. Here are some available options, and you can try again.";
  const recommendations: AiAdvisorStructuredResponse[] = packageCatalog.slice(0, 2).map((item) => {
    const title = item.title as { ar: string; en: string; fr?: string };
    return ({
    ctaLabel: locale === "ar" ? "عرض الباقة" : locale === "fr" ? "Voir le forfait" : "View package",
    durationLabel: `${item.durationDays} ${locale === "ar" ? "أيام" : locale === "fr" ? "jours" : "days"}`,
    highlights: [item.category],
    id: `fallback-package-${item.id}`,
    imageUri: item.imageUrl,
    packageId: item.id,
    priceFrom: item.priceFrom,
    summary: message,
    title: title[locale] ?? title.en,
    type: "package_recommendation" as const,
  });
  });
  return [{
    id: "fallback-guidance",
    text: message,
    tone: "fallback",
    type: "plain_text_guidance",
  }, ...recommendations];
};
