import type { AppLocale } from "../../types/i18n";
import type {
  AiAdvisorBudgetLevel,
  AiAdvisorLuxuryLevel,
  AiAdvisorTripType,
  AiAdvisorVibe,
  AiAdvisorVisaPreference,
  AiAdvisorWeatherPreference,
} from "../aiAdvisor/types";

export type ProfileQuickActionId = "notifications" | "savedDestinations" | "settings";

export type UserProfile = {
  avatarUrl?: string;
  createdAt: string;
  departureCity?: string;
  email: string;
  firstName?: string;
  fullName: string;
  homeAirport?: string;
  id: string;
  lastName?: string;
  phone?: string;
  preferredLocale: AppLocale;
  updatedAt: string;
};

export type UpsertUserProfileInput = {
  avatarUrl?: string;
  departureCity?: string;
  firstName?: string;
  homeAirport?: string;
  lastName?: string;
  phone?: string;
  preferredLocale?: AppLocale;
};

export type TravelPreferences = {
  adults?: number;
  budgetLevel?: AiAdvisorBudgetLevel;
  budgetMax?: number;
  budgetMin?: number;
  children?: number;
  createdAt: string;
  id: string;
  infants?: number;
  luxuryLevel?: AiAdvisorLuxuryLevel;
  notes?: string;
  preferredTripTypes: AiAdvisorTripType[];
  preferredVibes: AiAdvisorVibe[];
  seatClass?: string;
  updatedAt: string;
  userId: string;
  visaPreference?: AiAdvisorVisaPreference;
  weatherPreference?: AiAdvisorWeatherPreference;
};

export type UpsertTravelPreferencesInput = {
  adults?: number;
  budgetLevel?: AiAdvisorBudgetLevel;
  budgetMax?: number;
  budgetMin?: number;
  children?: number;
  infants?: number;
  luxuryLevel?: AiAdvisorLuxuryLevel;
  notes?: string;
  preferredTripTypes?: AiAdvisorTripType[];
  preferredVibes?: AiAdvisorVibe[];
  seatClass?: string;
  visaPreference?: AiAdvisorVisaPreference;
  weatherPreference?: AiAdvisorWeatherPreference;
};

export type ProfileScreenData = {
  availableLanguages: AppLocale[];
  memberSince: string;
  profile?: UserProfile;
  quickActionIds: ProfileQuickActionId[];
  travelPreferences?: TravelPreferences;
};
