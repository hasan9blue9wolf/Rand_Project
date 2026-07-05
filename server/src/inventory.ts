import flightsJson from "../../shared/catalog/flights.json" with { type: "json" };
import packagesJson from "../../shared/catalog/packages.json" with { type: "json" };

export type PackageSearch = {
  destinationCity?: string | null; destinationCountry?: string | null; departureCity?: string | null;
  budgetMax?: number | null; durationDays?: number | null; tripType?: string | null;
  category?: string | null; tags?: string[] | null; luxuryLevel?: string | null; travelers?: number | null;
};
export type FlightSearch = {
  fromCity?: string | null; toCity?: string | null; departureDate?: string | null; returnDate?: string | null;
  passengers?: number | null; budgetMax?: number | null; cabinClass?: string | null;
  maxStops?: number | null; refundable?: boolean | null;
};

type Localized = { en: string; ar: string; fr?: string };
export type CatalogPackage = {
  id: string; title: Localized; destinationCity: Localized; destinationCountry: Localized;
  region: string; category: string; tags: string[]; tripType: string; priceFrom: number; currency: string;
  durationDays: number; luxuryLevel: string; departureCities: string[]; rating: number;
  flightIncluded: boolean; hotelIncluded: boolean; maxTravelers: number;
};
export type CatalogFlight = {
  id: string; airline: string; fromCity: string; fromAirport: string; toCity: string; toAirport: string;
  departureDate: string; priceFrom: number; currency: string; cabin: string; stops: number;
  baggage: string; refundable: boolean; route: string;
};

export const packageCatalog = packagesJson as CatalogPackage[];
export const flightCatalog = flightsJson as CatalogFlight[];
const norm = (value: string) => value.trim().toLocaleLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه");
const localizedMatch = (value: Localized, query: string) => Object.values(value).some((part) => norm(part).includes(norm(query)) || norm(query).includes(norm(part)));

export function searchPackages(input: PackageSearch, catalog = packageCatalog) {
  const tags = input.tags?.map(norm) ?? [];
  return catalog.filter((item) =>
    (!input.destinationCity || localizedMatch(item.destinationCity, input.destinationCity)) &&
    (!input.destinationCountry || localizedMatch(item.destinationCountry, input.destinationCountry)) &&
    (!input.departureCity || item.departureCities.some((city) => norm(city) === norm(input.departureCity!))) &&
    (input.budgetMax == null || item.priceFrom <= input.budgetMax) &&
    (input.durationDays == null || Math.abs(item.durationDays - input.durationDays) <= 2) &&
    (!input.tripType || norm(item.tripType).includes(norm(input.tripType))) &&
    (!input.category || norm(item.category).includes(norm(input.category))) &&
    (!input.luxuryLevel || norm(item.luxuryLevel).includes(norm(input.luxuryLevel))) &&
    (input.travelers == null || item.maxTravelers >= input.travelers) &&
    (tags.length === 0 || tags.some((tag) => item.tags.map(norm).some((candidate) => candidate.includes(tag))))
  ).sort((a, b) => b.rating - a.rating || a.priceFrom - b.priceFrom).slice(0, 5).map((item) => ({
    id: item.id, title: item.title.en, destinationCity: item.destinationCity.en,
    price: item.priceFrom, currency: item.currency, durationDays: item.durationDays,
    category: item.category, tripType: item.tripType, luxuryLevel: item.luxuryLevel,
    rating: item.rating, flightIncluded: item.flightIncluded, hotelIncluded: item.hotelIncluded,
  }));
}

export function searchFlights(input: FlightSearch, catalog = flightCatalog) {
  return catalog.filter((item) =>
    (!input.fromCity || norm(item.fromCity) === norm(input.fromCity)) &&
    (!input.toCity || norm(item.toCity) === norm(input.toCity)) &&
    (!input.departureDate || item.departureDate === input.departureDate) &&
    (input.budgetMax == null || item.priceFrom <= input.budgetMax) &&
    (!input.cabinClass || norm(item.cabin) === norm(input.cabinClass)) &&
    (input.maxStops == null || item.stops <= input.maxStops) &&
    (input.refundable == null || item.refundable === input.refundable)
  ).sort((a, b) => a.priceFrom - b.priceFrom || a.stops - b.stops).slice(0, 5).map((item) => ({
    id: item.id, route: `${item.fromCity} (${item.fromAirport}) – ${item.toCity} (${item.toAirport})`,
    airline: item.airline, departureDate: item.departureDate, price: item.priceFrom,
    currency: item.currency, cabinClass: item.cabin, stops: item.stops,
    baggage: item.baggage, refundable: item.refundable,
  }));
}

export const isValidRecommendation = (type: "package" | "flight", id: string) =>
  type === "package" ? packageCatalog.some((item) => item.id === id) : flightCatalog.some((item) => item.id === id);

export function rankPackages(input: PackageSearch, limit = 4) {
  const tags = input.tags?.map(norm) ?? [];
  return packageCatalog.map((item) => {
    let score = 50;
    if (input.destinationCity && localizedMatch(item.destinationCity, input.destinationCity)) score += 30;
    if (input.tripType && (norm(item.tripType).includes(norm(input.tripType)) || item.tags.map(norm).some((tag) => tag.includes(norm(input.tripType!))))) score += 25;
    if (input.budgetMax != null) score += item.priceFrom <= input.budgetMax ? 20 : Math.max(-20, 10 - ((item.priceFrom - input.budgetMax) / Math.max(input.budgetMax, 1)) * 40);
    if (input.travelers != null) score += item.maxTravelers >= input.travelers ? 8 : -30;
    if (input.durationDays != null) score += Math.max(-8, 10 - Math.abs(item.durationDays - input.durationDays) * 3);
    if (input.departureCity) score += item.departureCities.some((city) => norm(city) === norm(input.departureCity!)) ? 8 : -4;
    if (tags.length && tags.some((tag) => item.tags.map(norm).some((candidate) => candidate.includes(tag)))) score += 10;
    return { item, score: Math.max(0, Math.min(100, Math.round(score))) };
  }).filter(({ item }) => input.travelers == null || item.maxTravelers >= input.travelers)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating || a.item.priceFrom - b.item.priceFrom)
    .slice(0, limit);
}

export function rankFlights(input: FlightSearch, limit = 3) {
  return flightCatalog.map((item) => {
    let score = 40;
    if (input.fromCity) score += norm(item.fromCity) === norm(input.fromCity) ? 25 : -30;
    if (input.toCity) score += norm(item.toCity) === norm(input.toCity) ? 25 : -30;
    if (input.budgetMax != null) score += item.priceFrom <= input.budgetMax ? 12 : -10;
    if (input.departureDate) score += item.departureDate === input.departureDate ? 10 : -3;
    if (input.cabinClass) score += norm(item.cabin) === norm(input.cabinClass) ? 8 : -4;
    return { item, score: Math.max(0, Math.min(100, score)) };
  }).filter(({ score }) => score >= 35).sort((a, b) => b.score - a.score || a.item.priceFrom - b.item.priceFrom).slice(0, limit);
}
