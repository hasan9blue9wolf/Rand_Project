import { QueryClient } from "@tanstack/react-query";

import {
  getApiRetryDelayMs,
  isRetryableApiRequestError,
  isWeakNetworkError,
} from "../api/request";

const MAX_QUERY_RETRIES = 2;

const shouldRetry = (failureCount: number, error: unknown) => {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false;
  }

  return (
    isRetryableApiRequestError(error) ||
    isWeakNetworkError(error)
  );
};

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        networkMode: "offlineFirst",
        retry: shouldRetry,
        retryDelay: (attemptIndex, error) =>
          getApiRetryDelayMs(error, Math.max(0, attemptIndex - 1)),
      },
      queries: {
        gcTime: 1000 * 60 * 30,
        networkMode: "offlineFirst",
        placeholderData: <T,>(previousData: T | undefined) => previousData,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        retryDelay: (attemptIndex, error) =>
          getApiRetryDelayMs(error, Math.max(0, attemptIndex - 1)),
        staleTime: 1000 * 60 * 5,
      },
    },
  });
