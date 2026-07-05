import { rankFlights, rankPackages } from "./inventory.js";
import { extractPreferences } from "./preferences.js";
import type { ChatRequest, ChatResponse, Preferences } from "./schemas.js";

export const NORMAL_CLARIFICATION_MAX = 3;
export const HARD_CLARIFICATION_MAX = 4;

const words = {
  en: { confirm: "Here are the strongest available matches. Final availability and booking are confirmed in the app.", compromise: "These are the closest available alternatives; you can refine the details later.", reasons: "A strong match for your travel preferences.", questions: { destination: "What destination or travel experience would you prefer?", budget: "What approximate total budget should I use?", travelers: "How many people are traveling?", timing: "What dates or trip duration would you prefer?" }, assumptions: { budget: "A broad budget range was used.", travelers: "Assumed 1 traveler.", timing: "Dates are flexible.", destination: "The best inventory matches were used." } },
  ar: { confirm: "هذه أفضل الخيارات المتاحة المطابقة لطلبك. يتم تأكيد التوفر والحجز النهائي عبر التطبيق.", compromise: "هذه أقرب البدائل المتاحة، ويمكنك تحسين التفاصيل لاحقاً.", reasons: "خيار مناسب بقوة لتفضيلات سفرك.", questions: { destination: "ما الوجهة أو نوع تجربة السفر التي تفضلها؟", budget: "ما الميزانية الإجمالية التقريبية التي تفضلها؟", travelers: "كم عدد المسافرين؟", timing: "ما تواريخ السفر أو مدة الرحلة المفضلة؟" }, assumptions: { budget: "تم استخدام نطاق ميزانية واسع.", travelers: "تم افتراض مسافر واحد.", timing: "تم اعتبار التواريخ مرنة.", destination: "تم اختيار أفضل الخيارات المتاحة في المخزون." } },
  fr: { confirm: "Voici les meilleures options disponibles. La disponibilité et la réservation finale sont confirmées dans l’application.", compromise: "Voici les alternatives disponibles les plus proches ; vous pourrez préciser les détails plus tard.", reasons: "Une option bien adaptée à vos préférences de voyage.", questions: { destination: "Quelle destination ou expérience de voyage préférez-vous ?", budget: "Quel budget total approximatif souhaitez-vous prévoir ?", travelers: "Combien de personnes voyagent ?", timing: "Quelles dates ou quelle durée préférez-vous ?" }, assumptions: { budget: "Une large fourchette de budget a été utilisée.", travelers: "Un voyageur a été supposé.", timing: "Les dates ont été considérées comme flexibles.", destination: "Les meilleures options du catalogue ont été utilisées." } },
} as const;

const missingEssential = (p: Preferences) => {
  if (!p.destinationInterests.length && !p.tripType && !p.luxuryLevel) return "destination" as const;
  if (p.budgetMax == null) return "budget" as const;
  if (!p.travelers) return "travelers" as const;
  if (!p.departureDate && !p.durationDays) return "timing" as const;
  return null;
};

const collectedAnswerCount = (p: Preferences) => [p.departureCity, p.destinationInterests.length ? p.destinationInterests : null, p.budgetMax, p.travelers, p.departureDate ?? p.durationDays, p.tripType, p.luxuryLevel, p.cabinClass, p.specialPreferences.length ? p.specialPreferences : null].filter((value) => value != null).length;

export function deterministicTurn(request: ChatRequest): ChatResponse {
  const preferences = extractPreferences(request.message, request.preferences);
  const priorCount = request.conversationState?.clarificationCount ?? request.history.filter((item) => item.role === "assistant" && /\?|؟/.test(item.content)).length;
  const missing = missingEssential(preferences);
  const shouldRecommend = !missing || priorCount >= NORMAL_CLARIFICATION_MAX;
  if (!shouldRecommend) {
    const question = words[request.locale].questions[missing];
    const count = Math.min(HARD_CLARIFICATION_MAX, priorCount + 1);
    return { assistantMessage: question, locale: request.locale, language: request.locale, intent: "collect_preferences", updatedPreferences: preferences, needsMoreInformation: true, followUpQuestions: [question], followUpQuestion: question, recommendations: [], conversationState: { language: request.locale, clarificationCount: count, collectedAnswerCount: collectedAnswerCount(preferences), readyToRecommend: false, collectedPreferences: preferences, assumptions: [], recommendationsShown: false } };
  }
  const assumptions: string[] = [];
  if (!preferences.budgetMax) assumptions.push(words[request.locale].assumptions.budget);
  if (!preferences.travelers) { preferences.travelers = 1; assumptions.push(words[request.locale].assumptions.travelers); }
  if (!preferences.departureDate && !preferences.durationDays) assumptions.push(words[request.locale].assumptions.timing);
  if (!preferences.destinationInterests.length && !preferences.tripType) assumptions.push(words[request.locale].assumptions.destination);
  const flightIntent = /\bflights?\b|طيران|رحل(?:ه|ة) جوي|\bvols?\b/i.test(request.message);
  const packages = rankPackages({ destinationCity: preferences.destinationInterests[0], departureCity: preferences.departureCity, budgetMax: preferences.budgetMax, durationDays: preferences.durationDays, tripType: preferences.tripType, luxuryLevel: preferences.luxuryLevel, travelers: preferences.travelers }, flightIntent ? 2 : 4);
  const flights = (flightIntent || (preferences.departureCity && preferences.destinationInterests[0])) ? rankFlights({ fromCity: preferences.departureCity, toCity: preferences.destinationInterests[0], departureDate: preferences.departureDate, passengers: preferences.travelers, budgetMax: preferences.budgetMax, cabinClass: preferences.cabinClass }, flightIntent ? 3 : 1) : [];
  const recommendations = [...packages.map(({ item, score }) => ({ type: "package" as const, id: item.id, reason: words[request.locale].reasons, matchScore: score })), ...flights.map(({ item, score }) => ({ type: "flight" as const, id: item.id, reason: words[request.locale].reasons, matchScore: score }))].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  return { assistantMessage: assumptions.length ? words[request.locale].compromise : words[request.locale].confirm, locale: request.locale, language: request.locale, intent: flightIntent ? "recommend_flights" : "recommend_packages", updatedPreferences: preferences, needsMoreInformation: false, followUpQuestions: [], followUpQuestion: null, recommendations, conversationState: { language: request.locale, clarificationCount: Math.min(priorCount, HARD_CLARIFICATION_MAX), collectedAnswerCount: collectedAnswerCount(preferences), readyToRecommend: true, collectedPreferences: preferences, assumptions, recommendationsShown: recommendations.length > 0 } };
}
