import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  type RenderOptions,
} from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

import i18n from "../../services/i18n";

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  queryClient?: QueryClient;
};

const TEST_SAFE_AREA_METRICS = {
  frame: {
    height: 844,
    width: 390,
    x: 0,
    y: 0,
  },
  insets: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
} as const;

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: 0,
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) =>
  function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  };

export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
) => {
  const { queryClient = createTestQueryClient(), ...restOptions } = options;

  return render(ui, {
    wrapper: createWrapper(queryClient),
    ...restOptions,
  });
};
