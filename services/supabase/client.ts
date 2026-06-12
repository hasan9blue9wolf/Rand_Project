import "react-native-url-polyfill/auto";

import {
  createClient,
  processLock,
} from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { secureStoreStorage } from "../storage/secure-store";
import { getSupabaseRuntimeConfig, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

const { supabasePublishableKey, supabaseUrl } = getSupabaseRuntimeConfig();
const supabaseEnabled = isSupabaseConfigured();

const fallbackSupabaseKey =
  "sb_publishable_placeholder_key_for_hayatrip_bootstrap";
const fallbackSupabaseUrl = "https://hayatrip.invalid";

export const supabase = createClient<Database>(
  supabaseUrl || fallbackSupabaseUrl,
  supabasePublishableKey || fallbackSupabaseKey,
  {
    auth: {
      ...(Platform.OS !== "web" ? { storage: secureStoreStorage } : {}),
      autoRefreshToken: supabaseEnabled,
      detectSessionInUrl: false,
      lock: processLock,
      persistSession: supabaseEnabled,
    },
  },
);

let appStateListenerRegistered = false;

export const registerSupabaseAppStateListener = () => {
  if (
    appStateListenerRegistered ||
    Platform.OS === "web" ||
    !isSupabaseConfigured()
  ) {
    return;
  }

  AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "active") {
      void supabase.auth.startAutoRefresh();
      return;
    }

    void supabase.auth.stopAutoRefresh();
  });

  appStateListenerRegistered = true;
};
