import type { AppConfig } from "../../types/env";
import {
  getPublicRuntimeConfig,
} from "../runtime/public-config";
import { isSupabaseRuntimeConfigComplete } from "../runtime/public-config.shared";

type SupabaseRuntimeConfig = Pick<
  AppConfig,
  "supabasePublishableKey" | "supabaseUrl"
>;

export const getSupabaseRuntimeConfig = (): SupabaseRuntimeConfig => {
  const { supabasePublishableKey, supabaseUrl } = getPublicRuntimeConfig();

  return {
    supabasePublishableKey,
    supabaseUrl,
  };
};

export const isSupabaseConfigured = () => {
  return isSupabaseRuntimeConfigComplete(getSupabaseRuntimeConfig());
};
