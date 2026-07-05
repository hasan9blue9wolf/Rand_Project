import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { getHomeScreen } from "../api/get-home-screen";
import { homeScreenMock } from "../data/home.mock";

export const useHomeData = () =>
  useQuery({
    placeholderData: homeScreenMock,
    queryKey: queryKeys.homeScreen,
    queryFn: getHomeScreen,
  });
