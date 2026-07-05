import { searchFlights, searchPackages } from "./inventory.js";
import { extractPreferences, hasMinimumPreferences } from "./preferences.js";
import type { ChatRequest, ChatResponse } from "./schemas.js";

const copy: Record<ChatRequest["locale"], { ask: string; confirm: string; questions: string[] }> = {
  en: { ask: "I can curate this for you. A little more detail will sharpen the match.", confirm: "These options match your preferences. Final availability and booking confirmation happen in the app.", questions: ["What city will you depart from?", "What are your dates or preferred trip duration?"] },
  ar: { ask: "أستطيع تنسيق خيارات مناسبة لك. أحتاج تفاصيل بسيطة لتحسين الترشيح.", confirm: "هذه الخيارات تناسب تفضيلاتك. يتم تأكيد التوفر والحجز النهائي من خلال التطبيق.", questions: ["من أي مدينة سيكون الانطلاق؟", "ما التواريخ أو مدة الرحلة المفضلة؟"] },
  fr: { ask: "Je peux affiner cette sélection pour vous. Quelques précisions amélioreront le résultat.", confirm: "Ces options correspondent à vos préférences. La disponibilité et la confirmation finale se font dans l’application.", questions: ["De quelle ville partez-vous ?", "Quelles sont vos dates ou la durée souhaitée ?"] },
};

export function buildFallback(request: ChatRequest): ChatResponse {
  const preferences = extractPreferences(request.message, request.preferences);
  const flightIntent = /\bflight|vols?\b|طيران|رحل(?:ه|ة) جوي/i.test(request.message);
  const enough = hasMinimumPreferences(request, preferences, flightIntent);
  const questions: string[] = [];
  if (!preferences.departureCity) questions.push(copy[request.locale].questions[0]!);
  if (!preferences.departureDate && !preferences.durationDays) questions.push(copy[request.locale].questions[1]!);
  const results = enough ? (flightIntent ? searchFlights({
    fromCity: preferences.departureCity, toCity: preferences.destinationInterests[0], departureDate: preferences.departureDate,
    passengers: preferences.travelers, budgetMax: preferences.budgetMax, cabinClass: preferences.cabinClass,
    maxStops: preferences.directFlightPreferred ? 0 : null,
  }) : searchPackages({
    destinationCity: preferences.destinationInterests[0], departureCity: preferences.departureCity,
    budgetMax: preferences.budgetMax, durationDays: preferences.durationDays, tripType: preferences.tripType,
    luxuryLevel: preferences.luxuryLevel, travelers: preferences.travelers,
  })) : [];
  return {
    assistantMessage: results.length ? copy[request.locale].confirm : copy[request.locale].ask,
    locale: request.locale,
    intent: results.length ? (flightIntent ? "recommend_flights" : "recommend_packages") : "collect_preferences",
    updatedPreferences: preferences,
    needsMoreInformation: results.length === 0,
    followUpQuestions: results.length ? [] : questions.slice(0, 2),
    recommendations: results.map((item, index) => ({ type: flightIntent ? "flight" as const : "package" as const, id: item.id, reason: request.locale === "ar" ? "يتوافق مع تفضيلاتك وميزانيتك." : request.locale === "fr" ? "Correspond à vos préférences et à votre budget." : "Matches your stated preferences and budget.", matchScore: Math.max(70, 95 - index * 5) })),
  };
}
