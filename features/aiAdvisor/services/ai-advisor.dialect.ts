import type { AppLocale } from "../../../types/i18n";
import type { AiAdvisorStructuredResponse } from "../types";

const normalizeIraqiArabicText = (value: string) => {
  const replacements: [RegExp, string][] = [
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
  ];

  return replacements
    .reduce(
      (result, [pattern, replacement]) => result.replace(pattern, replacement),
      value,
    )
    .replace(/\s+،/g, "،")
    .replace(/،\s*،/g, "،")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const normalizeText = (value: string, locale: AppLocale) =>
  locale === "ar" ? normalizeIraqiArabicText(value) : value;

export const normalizeAiAdvisorResponsesForLocale = (
  responses: AiAdvisorStructuredResponse[],
  locale: AppLocale,
): AiAdvisorStructuredResponse[] =>
  responses.map((response) => {
    switch (response.type) {
      case "plain_text_guidance":
        return {
          ...response,
          text: normalizeText(response.text, locale),
        };
      case "package_recommendation":
        return {
          ...response,
          ctaLabel: normalizeText(response.ctaLabel, locale),
          durationLabel: normalizeText(response.durationLabel, locale),
          highlights: response.highlights.map((highlight) =>
            normalizeText(highlight, locale),
          ),
          summary: normalizeText(response.summary, locale),
          title: normalizeText(response.title, locale),
        };
      case "follow_up_question_set":
        return {
          ...response,
          intro: normalizeText(response.intro, locale),
          questions: response.questions.map((question) => ({
            ...question,
            ...(question.helpText
              ? { helpText: normalizeText(question.helpText, locale) }
              : {}),
            question: normalizeText(question.question, locale),
            quickReplies: question.quickReplies.map((reply) =>
              normalizeText(reply, locale),
            ),
          })),
        };
      case "destination_recommendation":
        return {
          ...response,
          bestForLabel: normalizeText(response.bestForLabel, locale),
          country: normalizeText(response.country, locale),
          ctaLabel: normalizeText(response.ctaLabel, locale),
          destination: normalizeText(response.destination, locale),
          luxuryLabel: normalizeText(response.luxuryLabel, locale),
          reasons: response.reasons.map((reason) =>
            normalizeText(reason, locale),
          ),
          summary: normalizeText(response.summary, locale),
          visaLabel: normalizeText(response.visaLabel, locale),
          weatherLabel: normalizeText(response.weatherLabel, locale),
        };
      case "itinerary_suggestion":
        return {
          ...response,
          days: response.days.map((day) => ({
            ...day,
            dayLabel: normalizeText(day.dayLabel, locale),
            summary: normalizeText(day.summary, locale),
            title: normalizeText(day.title, locale),
          })),
          destination: normalizeText(response.destination, locale),
          summary: normalizeText(response.summary, locale),
          title: normalizeText(response.title, locale),
        };
      default:
        return response;
    }
  });
