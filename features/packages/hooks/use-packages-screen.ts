import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { packagesScreenMock } from "../data/packages.mock";
import { getPackagesScreenData } from "../services/packages.service";

export const usePackagesScreen = () => {
  const packagesQuery = useQuery({
    queryKey: queryKeys.packages,
    queryFn: getPackagesScreenData,
  });

  return {
    packagesQuery,
    screenData: packagesQuery.data ?? packagesScreenMock,
  };
};
