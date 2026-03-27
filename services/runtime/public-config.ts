import Constants from "expo-constants";

import type { AppConfig } from "../../types/env";
import { buildPublicRuntimeConfig } from "./public-config.shared";

const {
  EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_APP_MODE,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
} = process.env as Record<string, string | undefined>;

const expoExtra = (Constants.expoConfig?.extra ?? {}) as Partial<AppConfig>;

export const getPublicRuntimeConfig = (): AppConfig =>
  buildPublicRuntimeConfig({
    apiBaseUrl: EXPO_PUBLIC_API_BASE_URL ?? expoExtra.apiBaseUrl,
    appEnv: expoExtra.appEnv,
    appMode: EXPO_PUBLIC_APP_MODE ?? expoExtra.appMode,
    appVariant:
      process.env["APP_VARIANT"] ??
      (expoExtra as Partial<Record<keyof AppConfig, string | undefined>>)
        .appVariant,
    supabasePublishableKey:
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      expoExtra.supabasePublishableKey,
    supabaseUrl: EXPO_PUBLIC_SUPABASE_URL ?? expoExtra.supabaseUrl,
  });
