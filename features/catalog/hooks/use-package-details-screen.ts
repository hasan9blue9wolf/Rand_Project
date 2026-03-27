import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { useTravelDiscoveryStore } from "../../../store/travel-discovery-store";
import { getCatalogPackageDetails } from "../services/catalog.service";
import type { TravelDiscoveryPackage } from "../types";

const serialize = (value: unknown) => JSON.stringify(value);

export const usePackageDetailsScreen = (
  packageId: TravelDiscoveryPackage["id"] | null,
) => {
  const submittedSearch = useTravelDiscoveryStore((state) => state.submittedSearch);
  const searchKey = serialize(submittedSearch);
  const packageQuery = useQuery({
    enabled: Boolean(packageId),
    queryKey: queryKeys.catalogPackageDetails(packageId ?? "unknown", searchKey),
    queryFn: () =>
      getCatalogPackageDetails({
        packageId: packageId ?? "bali-signature",
        search: submittedSearch,
      }),
  });

  return {
    packageDetails: packageQuery.data ?? null,
    packageQuery,
    submittedSearch,
  };
};
