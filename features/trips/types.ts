import type { Trip } from "../../types/travel";
import type { AiAdvisorTripType } from "../aiAdvisor/types";

export type TripListItem = Trip & {
  budgetMax?: number;
  budgetMin?: number;
  departureCity?: string;
  notes?: string;
  tripType?: AiAdvisorTripType;
};

export type CreateSavedTripInput = {
  budgetMax?: number;
  budgetMin?: number;
  departureCity?: string;
  destination: string;
  endDate: string;
  notes?: string;
  progressLabel?: string;
  startDate: string;
  status?: TripListItem["status"];
  title: string;
  travelers?: number;
  tripType?: AiAdvisorTripType;
};

export type UpdateSavedTripInput = Partial<CreateSavedTripInput> & {
  id: string;
};

export type TripsScreenData = {
  subtitle: string;
  title: string;
  trips: TripListItem[];
};
