import { simulateRequest } from "../../../services/api/client";
import { demoFlights, flightsScreenMock } from "../data/flights.mock";
import type { FlightCabin } from "../types";

export const getFlightsScreenData = () => simulateRequest(flightsScreenMock, 260);

export const getFlightById = async (flightId: string) =>
  simulateRequest(
    demoFlights.find((flight) => flight.flightId === flightId) ?? null,
    120,
  );

export const searchFlights = async ({
  cabin,
  from,
  to,
}: {
  cabin?: FlightCabin;
  date?: string;
  from?: string;
  passengers?: number;
  to?: string;
}) => {
  const fromQuery = from?.trim().toLowerCase() ?? "";
  const toQuery = to?.trim().toLowerCase() ?? "";

  return simulateRequest(
    demoFlights.filter((flight) => {
      const matchesFrom =
        !fromQuery ||
        flight.fromCity.toLowerCase().includes(fromQuery) ||
        flight.fromAirport.toLowerCase().includes(fromQuery);
      const matchesTo =
        !toQuery ||
        flight.toCity.toLowerCase().includes(toQuery) ||
        flight.toAirport.toLowerCase().includes(toQuery);
      const matchesCabin = !cabin || flight.cabin === cabin;

      return matchesFrom && matchesTo && matchesCabin;
    }),
    180,
  );
};
