import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { requireSupabaseUser } from "../../../services/supabase/auth";
import { supabase } from "../../../services/supabase/client";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import type {
  TableInsert,
  TableRow,
} from "../../../services/supabase/database.types";
import type { SavedDestination, SaveDestinationInput } from "../types";
import {
  getDemoSavedDestinations,
  removeDemoSavedDestination,
  saveDemoDestination,
  toggleDemoSavedDestination,
} from "./demo-saved-destinations.service";

const mapSavedDestinationRow = (
  row: TableRow<"saved_destinations">,
): SavedDestination => ({
  ...(row.country_name ? { countryName: row.country_name } : {}),
  destinationName: row.destination_name,
  destinationSlug: row.destination_slug,
  id: row.id,
  ...(row.image_url ? { imageUrl: row.image_url } : {}),
  ...(row.package_id ? { packageId: row.package_id } : {}),
  ...(typeof row.price_from === "number" ? { priceFrom: row.price_from } : {}),
  savedAt: row.created_at,
  ...(row.source ? { source: row.source } : {}),
  ...(row.summary ? { summary: row.summary } : {}),
});

export const getSavedDestinations = async () => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return getDemoSavedDestinations();
  }

  const user = await requireSupabaseUser().catch(() => null);

  if (!user) {
    return [] as SavedDestination[];
  }

  const { data, error } = await supabase
    .from("saved_destinations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapSavedDestinationRow);
};

export const saveDestination = async (input: SaveDestinationInput) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return saveDemoDestination(input);
  }

  const user = await requireSupabaseUser();
  const payload: TableInsert<"saved_destinations"> = {
    ...(input.countryName ? { country_name: input.countryName } : {}),
    destination_name: input.destinationName,
    destination_slug: input.destinationSlug,
    ...(input.imageUrl ? { image_url: input.imageUrl } : {}),
    ...(input.packageId ? { package_id: input.packageId } : {}),
    ...(typeof input.priceFrom === "number"
      ? { price_from: input.priceFrom }
      : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.summary ? { summary: input.summary } : {}),
    user_id: user.id,
  };
  const { data, error } = await supabase
    .from("saved_destinations")
    .upsert(payload, { onConflict: "user_id,destination_slug" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapSavedDestinationRow(data);
};

export const removeSavedDestination = async (destinationSlug: string) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    await removeDemoSavedDestination(destinationSlug);
    return;
  }

  const user = await requireSupabaseUser();
  const { error } = await supabase
    .from("saved_destinations")
    .delete()
    .eq("destination_slug", destinationSlug)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
};

export const toggleSavedDestination = async (input: SaveDestinationInput) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return toggleDemoSavedDestination(input);
  }

  const user = await requireSupabaseUser();
  const { data, error } = await supabase
    .from("saved_destinations")
    .select("id")
    .eq("destination_slug", input.destinationSlug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    await removeSavedDestination(input.destinationSlug);
    return null;
  }

  return saveDestination(input);
};
