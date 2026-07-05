import flightCatalog from "../../../shared/catalog/flights.json";
import type { FlightItinerary, FlightsScreenData } from "../types";

/** The shared JSON catalog is the canonical flight inventory for mobile and server. */
export const demoFlights = flightCatalog as FlightItinerary[];

export const flightsScreenMock: FlightsScreenData = {
  headline: "Curated demo flight options for premium booking flows.",
  itineraries: demoFlights,
  search: {
    cabin: "business",
    date: "2026-10-12",
    from: "Baghdad",
    passengers: 2,
    to: "Dubai",
  },
  subtitle: "Search realistic local flight inventory and book a demo itinerary.",
  title: "Flights",
};
