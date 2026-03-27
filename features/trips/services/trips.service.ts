import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { requireSupabaseUser } from "../../../services/supabase/auth";
import { supabase } from "../../../services/supabase/client";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import type {
  TableInsert,
  TableRow,
} from "../../../services/supabase/database.types";
import { tripsScreenMock } from "../data/trips.mock";
import type {
  CreateSavedTripInput,
  TripListItem,
  UpdateSavedTripInput,
} from "../types";

const defaultProgressLabel = (status: TripListItem["status"]) => {
  switch (status) {
    case "confirmed":
      return "Ready for departure";
    case "wishlist":
      return "Saved for later";
    case "planning":
    default:
      return "Heia is shaping the plan";
  }
};

const mapSavedTripRow = (row: TableRow<"saved_trips">): TripListItem => ({
  ...(typeof row.budget_max === "number" ? { budgetMax: row.budget_max } : {}),
  ...(typeof row.budget_min === "number" ? { budgetMin: row.budget_min } : {}),
  ...(row.departure_city ? { departureCity: row.departure_city } : {}),
  destination: row.destination,
  endDate: row.end_date,
  id: row.id,
  ...(row.notes ? { notes: row.notes } : {}),
  progressLabel: row.progress_label ?? defaultProgressLabel(row.status),
  startDate: row.start_date,
  status: row.status,
  title: row.title,
  travelers: row.travelers,
  ...(row.trip_type ? { tripType: row.trip_type } : {}),
});

const buildSavedTripInsert = async (
  input: CreateSavedTripInput,
): Promise<TableInsert<"saved_trips">> => {
  const user = await requireSupabaseUser();
  const resolvedStatus = input.status ?? "planning";

  return {
    ...(typeof input.budgetMax === "number" ? { budget_max: input.budgetMax } : {}),
    ...(typeof input.budgetMin === "number" ? { budget_min: input.budgetMin } : {}),
    ...(input.departureCity ? { departure_city: input.departureCity } : {}),
    destination: input.destination,
    end_date: input.endDate,
    ...(input.notes ? { notes: input.notes } : {}),
    progress_label: input.progressLabel ?? defaultProgressLabel(resolvedStatus),
    start_date: input.startDate,
    status: resolvedStatus,
    title: input.title,
    travelers: input.travelers ?? 1,
    ...(input.tripType ? { trip_type: input.tripType } : {}),
    user_id: user.id,
  };
};

export const getTrips = async () => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return tripsScreenMock.trips;
  }

  const user = await requireSupabaseUser().catch(() => null);

  if (!user) {
    return tripsScreenMock.trips;
  }

  const { data, error } = await supabase
    .from("saved_trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapSavedTripRow);
};

export const getTripsScreenData = async () => ({
  ...tripsScreenMock,
  trips: await getTrips(),
});

export const createSavedTrip = async (input: CreateSavedTripInput) => {
  const payload = await buildSavedTripInsert(input);
  const { data, error } = await supabase
    .from("saved_trips")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapSavedTripRow(data);
};

export const updateSavedTrip = async (input: UpdateSavedTripInput) => {
  const user = await requireSupabaseUser();
  const resolvedStatus = input.status;
  const payload = {
    ...(typeof input.budgetMax === "number" ? { budget_max: input.budgetMax } : {}),
    ...(typeof input.budgetMin === "number" ? { budget_min: input.budgetMin } : {}),
    ...(input.departureCity ? { departure_city: input.departureCity } : {}),
    ...(input.destination ? { destination: input.destination } : {}),
    ...(input.endDate ? { end_date: input.endDate } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.progressLabel
      ? { progress_label: input.progressLabel }
      : resolvedStatus
        ? { progress_label: defaultProgressLabel(resolvedStatus) }
        : {}),
    ...(input.startDate ? { start_date: input.startDate } : {}),
    ...(resolvedStatus ? { status: resolvedStatus } : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(typeof input.travelers === "number" ? { travelers: input.travelers } : {}),
    ...(input.tripType ? { trip_type: input.tripType } : {}),
  };
  const { data, error } = await supabase
    .from("saved_trips")
    .update(payload)
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapSavedTripRow(data);
};

export const deleteSavedTrip = async (tripId: string) => {
  const user = await requireSupabaseUser();
  const { error } = await supabase
    .from("saved_trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
};
