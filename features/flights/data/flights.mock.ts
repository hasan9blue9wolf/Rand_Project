import type { FlightsScreenData } from "../types";

export const flightsScreenMock: FlightsScreenData = {
  headline: "Curated flight options for premium booking flows.",
  itineraries: [
    {
      arrivalTime: "22:15",
      cabin: "business",
      departureTime: "18:30",
      id: "flight-bali-001",
      price: 3890,
      route: "JFK -> DPS",
      tags: ["Best timing", "Lounge", "Flexible fare"],
    },
    {
      arrivalTime: "16:05",
      cabin: "premiumEconomy",
      departureTime: "09:10",
      id: "flight-tokyo-001",
      price: 2440,
      route: "LAX -> HND",
      tags: ["Haya match", "High value"],
    },
  ],
  search: {
    cabin: "business",
    from: "New York",
    passengers: 2,
    to: "Bali",
  },
  subtitle: "Search primitives, itinerary results, and pricing are isolated inside the flights module.",
  title: "Flights",
};
