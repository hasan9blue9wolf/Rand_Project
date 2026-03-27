import { simulateRequest } from "../../../services/api/client";
import { flightsScreenMock } from "../data/flights.mock";

export const getFlightsScreenData = () => simulateRequest(flightsScreenMock, 260);
