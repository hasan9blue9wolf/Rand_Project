import type { AppLocale } from "../../types/i18n";
import type {
  AiAdvisorBudgetLevel,
  AiAdvisorLuxuryLevel,
  AiAdvisorTripType,
} from "../aiAdvisor/types";

export type AuthProvider = "apple" | "email" | "google";

export type AuthMode = "signIn" | "signUp";

export type AuthFieldId = "email" | "firstName" | "password";

export type AuthFlowStage =
  | "forgotPassword"
  | "onboarding"
  | "signIn"
  | "signUp"
  | "welcome";

export type AuthTravelerProfile =
  | "business"
  | "couples"
  | "family"
  | "solo";

export type AuthOnboardingStepId =
  | "destinations"
  | "language"
  | "traveler"
  | "travelStyle";

export type AuthField = {
  id: AuthFieldId;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
};

export type AuthSession = {
  displayName: string;
  email: string;
  firstName: string;
  userId: string;
};

export type AuthFormValues = {
  email: string;
  firstName: string;
  password: string;
};

export type AuthOnboardingValues = {
  budgetLevel?: AiAdvisorBudgetLevel;
  budgetMax: string;
  budgetMin: string;
  departureLocation: string;
  favoriteDestinations: string;
  luxuryLevel?: AiAdvisorLuxuryLevel;
  preferredLanguage: AppLocale;
  travelerProfile?: AuthTravelerProfile;
  tripType?: AiAdvisorTripType;
};

export type AuthOnboardingPayload = {
  budgetLevel?: AiAdvisorBudgetLevel;
  budgetMax?: number;
  budgetMin?: number;
  departureLocation?: string;
  favoriteDestinations: string[];
  luxuryLevel?: AiAdvisorLuxuryLevel;
  preferredLanguage: AppLocale;
  travelerProfile?: AuthTravelerProfile;
  tripType?: AiAdvisorTripType;
};

export type AuthOnboardingStep = {
  description: string;
  id: AuthOnboardingStepId;
  title: string;
};

export type AuthScreenData = {
  fields: AuthField[];
  mode: AuthMode;
  primaryActionLabel: string;
  providers: AuthProvider[];
  secondaryActionLabel: string;
  subtitle: string;
  title: string;
};
