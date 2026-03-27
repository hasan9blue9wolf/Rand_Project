import { featuredOffers } from "../../../constants/mock-data";
import type { HomeTrendingPackageId } from "../../home/types";
import type {
  TravelDateOption,
  TravelDepartureOption,
  TravelDestinationOption,
  TravelDiscoveryFilters,
  TravelDiscoveryPackage,
  TravelDiscoveryRangeOption,
  TravelDiscoverySearchRequest,
  TravelPassengerOption,
  TravelSearchDurationRangeId,
  TravelSearchPriceRangeId,
} from "../types";

export const travelDepartureOptions: TravelDepartureOption[] = [
  { airportCode: "JFK", cityId: "newYork" },
  { airportCode: "LAX", cityId: "losAngeles" },
  { airportCode: "LHR", cityId: "london" },
  { airportCode: "DXB", cityId: "dubai" },
];

export const travelDestinationOptions: TravelDestinationOption[] = [
  { id: "bali" },
  { id: "zermatt" },
  { id: "tokyo" },
  { id: "maldives" },
  { id: "barcelona" },
  { id: "cappadocia" },
];

export const travelDateOptions: TravelDateOption[] = [
  {
    endDate: "2026-10-19",
    id: "tropicalOctober",
    startDate: "2026-10-12",
  },
  {
    endDate: "2026-12-29",
    id: "holidayBreak",
    startDate: "2026-12-22",
  },
  {
    endDate: "2027-03-18",
    id: "springReset",
    startDate: "2027-03-12",
  },
];

export const travelPassengerOptions: TravelPassengerOption[] = [
  {
    id: "twoAdults",
    passengerCount: 2,
    profile: "couple",
  },
  {
    id: "familyFour",
    passengerCount: 4,
    profile: "family",
  },
  {
    id: "soloExplorer",
    passengerCount: 1,
    profile: "solo",
  },
  {
    id: "businessDuo",
    passengerCount: 2,
    profile: "business",
  },
];

export const travelDateOptionsById = Object.fromEntries(
  travelDateOptions.map((option) => [option.id, option]),
) as Record<TravelDateOption["id"], TravelDateOption>;

export const travelPassengerOptionsById = Object.fromEntries(
  travelPassengerOptions.map((option) => [option.id, option]),
) as Record<TravelPassengerOption["id"], TravelPassengerOption>;

export const defaultTravelSearchRequest: TravelDiscoverySearchRequest = {
  endDate: travelDateOptionsById.tropicalOctober.endDate,
  fromId: "newYork",
  mode: "flights",
  passengerOptionId: "twoAdults",
  source: "home",
  startDate: travelDateOptionsById.tropicalOctober.startDate,
  toId: "bali",
};

export const travelPriceRangeOptions: TravelDiscoveryRangeOption<TravelSearchPriceRangeId>[] = [
  {
    id: "all",
    range: {},
  },
  {
    id: "value",
    range: {
      max: 1999,
    },
  },
  {
    id: "premium",
    range: {
      max: 2599,
      min: 2000,
    },
  },
  {
    id: "signature",
    range: {
      min: 2600,
    },
  },
];

export const travelDurationRangeOptions: TravelDiscoveryRangeOption<TravelSearchDurationRangeId>[] =
  [
    {
      id: "all",
      range: {},
    },
    {
      id: "short",
      range: {
        max: 4,
      },
    },
    {
      id: "week",
      range: {
        max: 7,
        min: 5,
      },
    },
    {
      id: "long",
      range: {
        min: 8,
      },
    },
  ];

export const defaultTravelDiscoveryFilters: TravelDiscoveryFilters = {
  directFlightsOnly: false,
  durationRange: {},
  durationRangeId: "all",
  hotelClasses: [],
  priceRange: {},
  priceRangeId: "all",
  refundableOnly: false,
  themes: [],
  visaFriendlyOnly: false,
};

export const catalogPackages: TravelDiscoveryPackage[] = [
  {
    bestMonths: "April - October",
    bookingId: "booking-bali-signature",
    cabinLabel: "Business",
    country: "Indonesia",
    departureLocationId: "newYork",
    description:
      "A refined Bali stay with private villas, curated beach time, and a flight-and-stay rhythm designed for ease.",
    destinationId: "bali",
    directFlight: false,
    durationDays: 7,
    flightDurationLabel: "19h 45m",
    heroImageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDFoYc541JvZwQiIVTqjjeeuSAWMkXPNOJ2-6X3xJLyOGWyb2o5G7p8SQVv8nGLGF8OjBzHkJLbuVbSfCwDK9f2Z-uqVbOTcq1_Ki-2U5Gyvfnt_GL8QVhHpxTvKelTjKUHCFuqdNp6SnblhBlBGh_IdHLPFAsN-B9hJtW_hWZcOQ-zJ1k-P9RUB8QnTqiPNQPX8lK1Ir5_Z8I2piUb2UxWaQiv2d4PB4Um5hKgVy5rS4SkR3qS0JgX8vf6-aDgrgiExmDPT9WJGE",
    hotelClass: 5,
    hotelName: "Kayana Private Villas",
    id: "bali-signature",
    idealFor: "Couples, beach lovers, premium downtime",
    inclusions: ["Private airport transfers", "Daily breakfast", "Sunset dining credit"],
    itineraryHighlights: [
      "Arrival day with private villa check-in and spa recovery.",
      "Two curated island days split between coastlines and cultural stops.",
      "A free final day for beach clubs, shopping, or slow dining.",
    ],
    refundable: true,
    routeCode: "JFK -> DPS",
    seatsLeft: 4,
    summary:
      "Tropical villas, thoughtful downtime, and a polished island flow for premium travelers.",
    themes: ["beach", "luxury"],
    visaFriendly: true,
  },
  {
    bestMonths: "December - March",
    bookingId: "booking-alps-private",
    cabinLabel: "Business",
    country: "Switzerland",
    departureLocationId: "newYork",
    description:
      "A polished alpine escape with a luxury mountain base, spa access, and room for scenic adventure without sacrificing comfort.",
    destinationId: "zermatt",
    directFlight: true,
    durationDays: 5,
    flightDurationLabel: "11h 50m",
    heroImageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDs3YV4WbhnJ3SC2lehzvCXuchyDNBeV-sLWdReXrDvt9UURq4ZnoXKr1-A5oSzSd5788Xfi0-W6AZ8p2au6ZTLvLNAEg1ML4RckeBrUBqnbqhM0Xkwj-lD_tNxfdAvQXAb9IsGCs6dUFzWgeXQeB593Kco-KMZ5rMg-6Z6iN5p6tiA2UQNr0fz_uBsAlXMX3Q45nYldTGzjMUvZL_zndps6T6iKn5qXmpnA8KKjBS0aTUvwYWgvd81a5S8_CJwXm32TyYMhuUAXpk",
    hotelClass: 5,
    hotelName: "The Omnia Zermatt",
    id: "alps-private",
    idealFor: "Mountain seekers, luxury adventurers, winter getaways",
    inclusions: ["Mountain-view suite", "Private station transfer", "Spa access"],
    itineraryHighlights: [
      "Arrival evening with a slow alpine spa reset.",
      "A full day reserved for mountain rail and panoramic dining.",
      "Flexible activity day for skiing, hiking, or village time.",
    ],
    refundable: true,
    routeCode: "JFK -> ZRH",
    seatsLeft: 2,
    summary:
      "A high-comfort alpine stay balanced between scenery, spa time, and private service.",
    themes: ["mountain", "luxury", "adventure"],
    visaFriendly: false,
  },
  {
    bestMonths: "March - May",
    bookingId: "booking-tokyo-curated",
    cabinLabel: "Premium Economy",
    country: "Japan",
    departureLocationId: "losAngeles",
    description:
      "A curated city stay combining sharp flight value, design-led hotels, and enough flexibility for both work and exploration.",
    destinationId: "tokyo",
    directFlight: true,
    durationDays: 6,
    flightDurationLabel: "13h 55m",
    heroImageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5YYZkCQh9sCjf1EalvTwST_-k7_eUzGNs5joktm7kU41A9MQqUnKPauOyonmmn3Y4qwpU0yUn813zuo9nn44w23Q-VwPTs14xkA7ZcV-6Dytq2DA1UBJm8Apa965NWnPQ9S4Lk333_gUPNd4CPiAXtLinFPIv4Tw-8rR68jldcJgoJdKBMMEZ4ZNT3aTEXD4vuRCb9YfirsvwWtkA0QDz41GxogHVbkyhwX4v1ShKiHkHPFQPhkandy4wN45dykvr788pKJ8cp4o",
    hotelClass: 5,
    hotelName: "Aoyama Grand Hotel",
    id: "tokyo-curated",
    idealFor: "City explorers, premium business trips, cultural weekends",
    inclusions: ["Airport transfer", "Priority restaurant concierge", "Neighborhood guide"],
    itineraryHighlights: [
      "Design-district check-in with a slow first evening nearby.",
      "Two city days split across culture, shopping, and skyline dining.",
      "One flexible block reserved for business meetings or hidden neighborhoods.",
    ],
    refundable: false,
    routeCode: "LAX -> HND",
    seatsLeft: 5,
    summary:
      "A polished city package built for fast-moving travelers who still want a premium stay.",
    themes: ["city", "business", "luxury"],
    visaFriendly: true,
  },
  {
    bestMonths: "November - April",
    bookingId: "booking-maldives-cove",
    cabinLabel: "Business",
    country: "Maldives",
    departureLocationId: "dubai",
    description:
      "A full resort escape with overwater stays, lagoon downtime, and the kind of quiet luxury that feels deliberately unhurried.",
    destinationId: "maldives",
    directFlight: true,
    durationDays: 6,
    flightDurationLabel: "4h 25m",
    heroImageUri:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80",
    hotelClass: 5,
    hotelName: "Siyam World Maldives",
    id: "maldives-cove",
    idealFor: "Luxury beach breaks, anniversaries, quiet resets",
    inclusions: ["Overwater villa", "Half board dining", "Lagoon spa credit"],
    itineraryHighlights: [
      "Seaplane arrival and private villa settling with sunset dinner.",
      "Dedicated island days for reef time, spa, and private dining.",
      "A final relaxed day with late checkout pacing.",
    ],
    refundable: true,
    routeCode: "DXB -> MLE",
    seatsLeft: 3,
    summary:
      "High-touch island luxury with easy flight timing and a calm premium pace.",
    themes: ["beach", "luxury"],
    visaFriendly: true,
  },
  {
    bestMonths: "April - June",
    bookingId: "booking-barcelona-family",
    cabinLabel: "Premium Economy",
    country: "Spain",
    departureLocationId: "newYork",
    description:
      "A city package tuned for families with direct flights, strong value, and enough structure to keep the trip smooth without feeling rigid.",
    destinationId: "barcelona",
    directFlight: true,
    durationDays: 8,
    flightDurationLabel: "7h 50m",
    heroImageUri:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1400&q=80",
    hotelClass: 4,
    hotelName: "Majestic Hotel & Spa Barcelona",
    id: "barcelona-family",
    idealFor: "Families, first-time Europe trips, city-and-beach balance",
    inclusions: ["Family room category", "Museum passes", "Airport transfer"],
    itineraryHighlights: [
      "Old City arrival day with an easy walking radius from the hotel.",
      "Two family-focused activity days with culture and lighter pacing.",
      "One open day for beach time, shopping, or a day trip.",
    ],
    refundable: true,
    routeCode: "JFK -> BCN",
    seatsLeft: 6,
    summary:
      "A family-friendly city week with direct flights, comfortable pacing, and premium touches where they matter.",
    themes: ["city", "family"],
    visaFriendly: false,
  },
  {
    bestMonths: "May - September",
    bookingId: "booking-cappadocia-adventure",
    cabinLabel: "Premium Economy",
    country: "Turkey",
    departureLocationId: "london",
    description:
      "A short premium adventure with cave-suite stays, sunrise landscapes, and just enough structure to feel elevated without losing spontaneity.",
    destinationId: "cappadocia",
    directFlight: false,
    durationDays: 4,
    flightDurationLabel: "8h 10m",
    heroImageUri:
      "https://images.unsplash.com/photo-1544737151-6e4b788c565d?auto=format&fit=crop&w=1400&q=80",
    hotelClass: 4,
    hotelName: "Argos in Cappadocia",
    id: "cappadocia-adventure",
    idealFor: "Adventure weekends, mountain views, premium short trips",
    inclusions: ["Cave suite stay", "Guided valley day", "Sunrise balloon priority"],
    itineraryHighlights: [
      "Arrival into a cave-suite stay with a slow first evening.",
      "One full day of valley touring, food stops, and viewpoint pacing.",
      "A sunrise balloon window before departure day.",
    ],
    refundable: false,
    routeCode: "LHR -> NAV",
    seatsLeft: 4,
    summary:
      "A shorter adventure package that still feels premium, scenic, and memorable.",
    themes: ["adventure", "mountain"],
    visaFriendly: true,
  },
];

export const catalogPackagesById = Object.fromEntries(
  catalogPackages.map((item) => [item.id, item]),
) as Record<TravelDiscoveryPackage["id"], TravelDiscoveryPackage>;

export const catalogPackagesByBookingId = Object.fromEntries(
  catalogPackages.map((item) => [item.bookingId, item]),
) as Record<TravelDiscoveryPackage["bookingId"], TravelDiscoveryPackage>;

export const featuredOffersById = Object.fromEntries(
  featuredOffers.map((offer) => [offer.id, offer]),
) as Record<(typeof featuredOffers)[number]["id"], (typeof featuredOffers)[number]>;

export const searchResultOfferIds = featuredOffers.map((offer) => offer.id);

export const savedDestinationIds: TravelDiscoveryPackage["id"][] = [
  "bali-signature",
  "tokyo-curated",
  "maldives-cove",
];

export const homeTrendingRouteMap: Record<HomeTrendingPackageId, TravelDiscoveryPackage["id"]> =
  {
    baliTropical: "bali-signature",
    modernTokyo: "tokyo-curated",
    swissAlps: "alps-private",
  };
