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
