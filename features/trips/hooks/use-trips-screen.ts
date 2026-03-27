import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { tripsScreenMock } from "../data/trips.mock";
import { getTrips } from "../services/trips.service";

export const useTripsScreen = () => {
  const userId = useAuthStore(selectActiveUserId);
  const tripsQuery = useQuery({
    placeholderData: tripsScreenMock.trips,
    queryKey: [queryKeys.trips[0], userId ?? "anonymous"],
    queryFn: getTrips,
  });
  const trips = tripsQuery.data ?? tripsScreenMock.trips;

  return {
    hasTrips: trips.length > 0,
    trips,
    tripsQuery,
  };
};
