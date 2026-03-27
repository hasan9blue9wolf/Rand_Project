import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { flightsScreenMock } from "../data/flights.mock";
import { getFlightsScreenData } from "../services/flights.service";

export const useFlightsScreen = () => {
  const flightsQuery = useQuery({
    queryKey: queryKeys.flights,
    queryFn: getFlightsScreenData,
  });

  return {
    flightsQuery,
    screenData: flightsQuery.data ?? flightsScreenMock,
  };
};
