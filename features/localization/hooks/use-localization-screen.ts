import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { localizationScreenMock } from "../data/localization.mock";
import { getLocalizationScreenData } from "../services/localization.service";

export const useLocalizationScreen = () => {
  const localizationQuery = useQuery({
    queryKey: queryKeys.localization,
    queryFn: getLocalizationScreenData,
  });

  return {
    localizationQuery,
    screenData: localizationQuery.data ?? localizationScreenMock,
  };
};
