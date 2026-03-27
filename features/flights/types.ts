export type FlightCabin = "business" | "economy" | "premiumEconomy";

export type FlightSearchParams = {
  cabin: FlightCabin;
  from: string;
  passengers: number;
  to: string;
};

export type FlightItinerary = {
  arrivalTime: string;
  cabin: FlightCabin;
  departureTime: string;
  id: string;
  price: number;
  route: string;
  tags: string[];
};

export type FlightsScreenData = {
  headline: string;
  itineraries: FlightItinerary[];
  search: FlightSearchParams;
  subtitle: string;
  title: string;
};
