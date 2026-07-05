export type FlightCabin = "business" | "economy" | "premiumEconomy";

export type FlightSearchParams = {
  cabin: FlightCabin;
  date?: string;
  from: string;
  passengers: number;
  to: string;
};

export type FlightItinerary = {
  airline: string;
  airlineLogo: string;
  arrivalTime: string;
  baggage: string;
  cabin: FlightCabin;
  currency: "USD";
  departureDate: string;
  departureTime: string;
  duration: string;
  flightId: string;
  fromAirport: string;
  fromCity: string;
  id: string;
  priceFrom: number;
  refundable: boolean;
  route: string;
  stops: number;
  tags: string[];
  toAirport: string;
  toCity: string;
};

export type FlightsScreenData = {
  headline: string;
  itineraries: FlightItinerary[];
  search: FlightSearchParams;
  subtitle: string;
  title: string;
};
