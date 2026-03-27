import type { AiAdvisorPromptTemplateId, AiAdvisorStructuredContext } from "../types";

type AiAdvisorPromptTemplate = {
  focus: string;
  label: string;
  objective: string;
};

const luxurySignal = (structuredContext: AiAdvisorStructuredContext) =>
  structuredContext.luxuryPreference === "luxury" ||
  structuredContext.luxuryPreference === "ultraLuxury" ||
  structuredContext.tripType === "luxury";

const familySignal = (structuredContext: AiAdvisorStructuredContext) =>
  structuredContext.tripType === "family" ||
  (typeof structuredContext.partyComposition.children === "number" &&
    structuredContext.partyComposition.children > 0);

export const getAiAdvisorPromptTemplate = ({
  locale,
  structuredContext,
  templateId,
}: {
  locale: AiAdvisorStructuredContext["language"];
  structuredContext: AiAdvisorStructuredContext;
  templateId: AiAdvisorPromptTemplateId;
}): AiAdvisorPromptTemplate => {
  const luxuryHint = luxurySignal(structuredContext)
    ? locale === "ar"
      ? "وازن بين الخصوصية العالية والخدمة الراقية والتجربة المتماسكة."
      : "Balance privacy, elevated service, and a cohesive premium experience."
    : locale === "ar"
      ? "اجعل النبرة راقية ولكن عملية وليست مبالغاً فيها."
      : "Keep the tone premium but grounded rather than flashy.";
  const familyHint = familySignal(structuredContext)
    ? locale === "ar"
      ? "انتبه لسهولة التنقل، راحة الأطفال، وتوزيع الإيقاع على العائلة."
      : "Prioritize easy transfers, child-friendly pacing, and family comfort."
    : locale === "ar"
      ? "ارفع التوصية على أساس أسلوب السفر والميزانية أكثر من اللوجستيات العائلية."
      : "Weight the recommendation more toward travel style and budget than family logistics.";

  const templates: Record<AiAdvisorPromptTemplateId, AiAdvisorPromptTemplate> = {
    destination_discovery: {
      focus:
        locale === "ar"
          ? `اكتشف وجهة أو وجهتين بحد أقصى مع سبب واضح لكل اختيار. ${luxuryHint}`
          : `Discover at most two destinations with a crisp reason for each fit. ${luxuryHint}`,
      label: locale === "ar" ? "اكتشاف الوجهات" : "Destination Discovery",
      objective:
        locale === "ar"
          ? "قدّم shortlist أنيقة، واسأل أسئلة متابعة فقط إذا بقيت فجوات مؤثرة."
          : "Produce a polished shortlist and only ask follow-ups where uncertainty materially changes the recommendation.",
    },
    family_travel_recommendation: {
      focus:
        locale === "ar"
          ? `ابنِ التوصية حول الراحة العائلية، سهولة التنقل، وخيارات الإقامة المناسبة للأطفال. ${familyHint}`
          : `Anchor the recommendation around family comfort, smooth logistics, and child-friendly stays. ${familyHint}`,
      label: locale === "ar" ? "سفر عائلي" : "Family Travel",
      objective:
        locale === "ar"
          ? "أظهر كيف تناسب الوجهة العائلة والميزانية والمدة من دون تعقيد."
          : "Show clearly how the destination fits the family, budget, and trip length without unnecessary complexity.",
    },
    itinerary_generation: {
      focus:
        locale === "ar"
          ? "أنشئ itinerary يومياً بإيقاع منطقي وقابل للتنفيذ، مع عدم حشو الأيام."
          : "Create a day-by-day itinerary with realistic pacing and no overloaded calendar.",
      label: locale === "ar" ? "بناء itinerary" : "Itinerary Generation",
      objective:
        locale === "ar"
          ? "اربط كل يوم بهدف واضح، ووازن بين النشاط والراحة والتكلفة."
          : "Give each day a clear purpose while balancing activity, rest, and spend.",
    },
    luxury_travel_recommendation: {
      focus:
        locale === "ar"
          ? "قدّم تجربة luxury راقية تركز على الخصوصية والخدمة والتميّز من دون إسراف فارغ."
          : "Recommend a refined luxury experience centered on privacy, service, and distinction without empty extravagance.",
      label: locale === "ar" ? "سفر فاخر" : "Luxury Travel",
      objective:
        locale === "ar"
          ? "اجعل التوصية دقيقة ومقنعة، مع إبراز سبب استحقاقها للسعر."
          : "Make the recommendation precise and persuasive, showing why the experience earns its price point.",
    },
    travel_tips: {
      focus:
        locale === "ar"
          ? "قدّم نصائح سفر عملية وعالية القيمة ترتبط بالطقس والفيزا والإيقاع والميزانية."
          : "Provide practical, high-value travel tips tied to weather, visa friction, pacing, and budget.",
      label: locale === "ar" ? "نصائح السفر" : "Travel Tips",
      objective:
        locale === "ar"
          ? "ركّز على ما يحتاجه المسافر لاتخاذ قرار أفضل أو لتفادي الأخطاء الشائعة."
          : "Focus on what the traveler needs to decide well or avoid common mistakes.",
    },
  };

  return templates[templateId];
};
