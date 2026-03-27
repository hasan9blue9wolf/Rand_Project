import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { getSavedDestinations } from "../services/saved-destinations.service";

export const useSavedDestinationsScreen = () => {
  const userId = useAuthStore(selectActiveUserId);
  const savedDestinationsQuery = useQuery({
    queryKey: queryKeys.savedDestinations(userId),
    queryFn: getSavedDestinations,
  });
  const destinations = savedDestinationsQuery.data ?? [];

  return {
    destinations,
    hasDestinations: destinations.length > 0,
    savedDestinationsQuery,
  };
};
