import type { ChatRequest, Preferences } from "./schemas.js";

const cityAliases: Record<string, string> = {
  baghdad: "Baghdad", بغداد: "Baghdad", dubai: "Dubai", دبي: "Dubai", paris: "Paris", باريس: "Paris",
  bali: "Bali", بالي: "Bali", tokyo: "Tokyo", طوكيو: "Tokyo", istanbul: "Istanbul", اسطنبول: "Istanbul",
  doha: "Doha", الدوحه: "Doha", beirut: "Beirut", بيروت: "Beirut",
};
const normalized = (value: string) => value.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه");

export function extractPreferences(message: string, current: Preferences): Preferences {
  const text = normalized(message);
  const next: Preferences = { ...current, destinationInterests: [...current.destinationInterests], specialPreferences: [...current.specialPreferences] };
  const budget = text.match(/(?:budget|ميزاني(?:ه|تي)|budget de)\D{0,12}(\d[\d,]*)/i) ?? text.match(/(\d[\d,]*)\s*(?:usd|\$|دولار|dollars?)/i);
  if (budget?.[1]) { next.budgetMax = Number(budget[1].replace(/,/g, "")); next.currency = "USD"; }
  const travelers = text.match(/(\d+)\s*(?:travelers?|people|persons?|مسافر|اشخاص|أشخاص|personnes?|voyageurs?)/i);
  if (travelers?.[1]) next.travelers = Number(travelers[1]);
  const duration = text.match(/(\d+)\s*(?:days?|ايام|أيام|jours?)/i);
  if (duration?.[1]) next.durationDays = Number(duration[1]);
  if (/family|عائل|famille/i.test(text)) next.tripType = "family";
  if (/luxury|فاخر|فخم|luxe/i.test(text)) next.luxuryLevel = "luxury";
  if (/business class|درجه رجال الاعمال|classe affaires/i.test(text)) next.cabinClass = "business";
  if (/direct|nonstop|مباشر|sans escale/i.test(text)) next.directFlightPreferred = true;
  const fromMatch = text.match(/(?:from|من|depuis|au depart de)\s+([\p{L} ]{2,30}?)(?=\s+(?:to|الى|إلى|vers)(?:\s|[,،])|[,،]|$)/iu);
  const toMatch = text.match(/(?:to|الى|إلى|vers)\s+([\p{L} ]{2,30}?)(?=[,،]|\s+\d|$)/iu);
  for (const [alias, city] of Object.entries(cityAliases)) {
    if (fromMatch && normalized(fromMatch[1] ?? "").includes(alias)) next.departureCity = city;
    if (toMatch && normalized(toMatch[1] ?? "").includes(alias) && !next.destinationInterests.includes(city)) next.destinationInterests.push(city);
  }
  return next;
}

export function hasMinimumPreferences(request: ChatRequest, preferences: Preferences, flightIntent: boolean) {
  const destination = flightIntent ? preferences.destinationInterests.length > 0 : preferences.destinationInterests.length > 0;
  const style = preferences.budgetMax != null || preferences.tripType != null || preferences.luxuryLevel != null || preferences.cabinClass != null;
  const timing = preferences.departureDate != null || preferences.durationDays != null;
  return Boolean(preferences.departureCity && destination && style && preferences.travelers && timing);
}
