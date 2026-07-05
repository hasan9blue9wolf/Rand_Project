import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { paymentsScreenMock } from "../data/payments.mock";
import { getPaymentsScreenData } from "../services/payments.service";

export const usePaymentsScreen = () => {
  const paymentsQuery = useQuery({
    queryKey: queryKeys.payments,
    queryFn: getPaymentsScreenData,
  });

  return {
    paymentsQuery,
    screenData: paymentsQuery.data ?? paymentsScreenMock,
  };
};
