import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { requireSupabaseUser } from "../../../services/supabase/auth";
import { supabase } from "../../../services/supabase/client";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import type {
  TableInsert,
  TableRow,
} from "../../../services/supabase/database.types";
import { useAuthStore } from "../../../store/auth-store";
import { profileScreenMock } from "../data/profile.mock";
import type {
  TravelPreferences,
  UpsertTravelPreferencesInput,
  UpsertUserProfileInput,
  UserProfile,
} from "../types";
import {
  getCurrentDemoTravelPreferences,
  getCurrentDemoUserProfile,
  upsertDemoTravelPreferences,
  upsertDemoUserProfile,
} from "./demo-profile.service";

const mapProfileRow = (row: TableRow<"profiles">): UserProfile => {
  const firstName = row.first_name ?? undefined;
  const lastName = row.last_name ?? undefined;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    ...(row.avatar_url ? { avatarUrl: row.avatar_url } : {}),
    createdAt: row.created_at,
    ...(row.departure_city ? { departureCity: row.departure_city } : {}),
    email: row.email,
    ...(firstName ? { firstName } : {}),
    fullName: fullName || row.email.split("@")[0] || "Traveler",
    ...(row.home_airport ? { homeAirport: row.home_airport } : {}),
    id: row.id,
    ...(lastName ? { lastName } : {}),
    ...(row.phone ? { phone: row.phone } : {}),
    preferredLocale: row.preferred_locale,
    updatedAt: row.updated_at,
  };
};

const mapTravelPreferencesRow = (
  row: TableRow<"travel_preferences">,
): TravelPreferences => ({
  ...(typeof row.adults === "number" ? { adults: row.adults } : {}),
  ...(row.budget_level ? { budgetLevel: row.budget_level } : {}),
  ...(typeof row.budget_max === "number" ? { budgetMax: row.budget_max } : {}),
  ...(typeof row.budget_min === "number" ? { budgetMin: row.budget_min } : {}),
  ...(typeof row.children === "number" ? { children: row.children } : {}),
  createdAt: row.created_at,
  id: row.id,
  ...(typeof row.infants === "number" ? { infants: row.infants } : {}),
  ...(row.luxury_level ? { luxuryLevel: row.luxury_level } : {}),
  ...(row.notes ? { notes: row.notes } : {}),
  preferredTripTypes: row.preferred_trip_types,
  preferredVibes: row.preferred_vibes as TravelPreferences["preferredVibes"],
  ...(row.seat_class ? { seatClass: row.seat_class } : {}),
  updatedAt: row.updated_at,
  userId: row.user_id,
  ...(row.visa_preference ? { visaPreference: row.visa_preference } : {}),
  ...(row.weather_preference
    ? { weatherPreference: row.weather_preference }
    : {}),
});

const buildProfileUpsert = async (
  input: UpsertUserProfileInput,
): Promise<TableInsert<"profiles">> => {
  const user = await requireSupabaseUser();

  return {
    ...(input.avatarUrl ? { avatar_url: input.avatarUrl } : {}),
    ...(input.departureCity ? { departure_city: input.departureCity } : {}),
    email: user.email ?? `${user.id}@travelgenious.local`,
    ...(input.firstName ? { first_name: input.firstName } : {}),
    ...(input.homeAirport ? { home_airport: input.homeAirport } : {}),
    id: user.id,
    ...(input.lastName ? { last_name: input.lastName } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.preferredLocale
      ? { preferred_locale: input.preferredLocale }
      : {}),
  };
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return getCurrentDemoUserProfile();
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const user = await requireSupabaseUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfileRow(data) : null;
};

export const getCurrentTravelPreferences =
  async (): Promise<TravelPreferences | null> => {
    if (isDemoModeEnabled() || !isSupabaseConfigured()) {
      return getCurrentDemoTravelPreferences();
    }

    if (!isSupabaseConfigured()) {
      return null;
    }

    const user = await requireSupabaseUser();
    const { data, error } = await supabase
      .from("travel_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapTravelPreferencesRow(data) : null;
  };

export const upsertCurrentUserProfile = async (
  input: UpsertUserProfileInput,
) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return upsertDemoUserProfile(input);
  }

  const payload = await buildProfileUpsert(input);
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRow(data);
};

export const upsertCurrentTravelPreferences = async (
  input: UpsertTravelPreferencesInput,
) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return upsertDemoTravelPreferences(input);
  }

  const user = await requireSupabaseUser();
  const payload: TableInsert<"travel_preferences"> = {
    ...(typeof input.adults === "number" ? { adults: input.adults } : {}),
    ...(input.budgetLevel ? { budget_level: input.budgetLevel } : {}),
    ...(typeof input.budgetMax === "number"
      ? { budget_max: input.budgetMax }
      : {}),
    ...(typeof input.budgetMin === "number"
      ? { budget_min: input.budgetMin }
      : {}),
    ...(typeof input.children === "number" ? { children: input.children } : {}),
    ...(typeof input.infants === "number" ? { infants: input.infants } : {}),
    ...(input.luxuryLevel ? { luxury_level: input.luxuryLevel } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.preferredTripTypes
      ? { preferred_trip_types: input.preferredTripTypes }
      : {}),
    ...(input.preferredVibes ? { preferred_vibes: input.preferredVibes } : {}),
    ...(input.seatClass ? { seat_class: input.seatClass } : {}),
    user_id: user.id,
    ...(input.visaPreference ? { visa_preference: input.visaPreference } : {}),
    ...(input.weatherPreference
      ? { weather_preference: input.weatherPreference }
      : {}),
  };
  const { data, error } = await supabase
    .from("travel_preferences")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapTravelPreferencesRow(data);
};

export const getProfileScreenData = async () => {
  const userId =
    useAuthStore.getState().user?.id ??
    useAuthStore.getState().demoSession?.userId;

  if (!userId) {
    return profileScreenMock;
  }

  const [profile, travelPreferences] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentTravelPreferences(),
  ]);

  return {
    ...profileScreenMock,
    ...(profile ? { memberSince: profile.createdAt, profile } : {}),
    ...(travelPreferences ? { travelPreferences } : {}),
  };
};
