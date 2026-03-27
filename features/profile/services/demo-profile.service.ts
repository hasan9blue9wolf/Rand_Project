import { useAuthStore } from "../../../store/auth-store";
import { useDemoModeStore } from "../../../store/demo-mode-store";
import type { AppLocale } from "../../../types/i18n";
import { authSessionMock } from "../../auth/data/auth.mock";
import type {
  TravelPreferences,
  UpsertTravelPreferencesInput,
  UpsertUserProfileInput,
  UserProfile,
} from "../types";

const DEMO_MEMBER_SINCE = "2025-06-01T09:00:00.000Z";

const getActiveDemoSession = () =>
  useDemoModeStore.getState().authSession ??
  useAuthStore.getState().demoSession;

const buildFallbackProfile = (locale: AppLocale): UserProfile => ({
  createdAt: DEMO_MEMBER_SINCE,
  email: authSessionMock.email,
  firstName: authSessionMock.firstName,
  fullName: authSessionMock.displayName,
  id: authSessionMock.userId,
  preferredLocale: locale,
  updatedAt: new Date().toISOString(),
});

const ensureDemoProfile = (): UserProfile | null => {
  const store = useDemoModeStore.getState();
  const existingProfile = store.profile;
  const session = getActiveDemoSession();

  if (existingProfile) {
    return existingProfile;
  }

  if (!session) {
    return null;
  }

  const nextProfile: UserProfile = {
    createdAt: DEMO_MEMBER_SINCE,
    email: session.email,
    firstName: session.firstName,
    fullName: session.displayName,
    id: session.userId,
    preferredLocale: "en",
    updatedAt: new Date().toISOString(),
  };

  store.setProfile(nextProfile);
  return nextProfile;
};

export const getCurrentDemoUserProfile =
  async (): Promise<UserProfile | null> => {
    const session = getActiveDemoSession();

    if (!session) {
      return null;
    }

    return ensureDemoProfile();
  };

export const getCurrentDemoTravelPreferences =
  async (): Promise<TravelPreferences | null> =>
    useDemoModeStore.getState().travelPreferences;

export const upsertDemoUserProfile = async (
  input: UpsertUserProfileInput,
): Promise<UserProfile> => {
  const store = useDemoModeStore.getState();
  const existingProfile =
    ensureDemoProfile() ?? buildFallbackProfile(input.preferredLocale ?? "en");
  const fullName = [
    input.firstName ?? existingProfile.firstName,
    input.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const nextProfile: UserProfile = {
    ...existingProfile,
    ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
    ...(input.departureCity ? { departureCity: input.departureCity } : {}),
    ...(input.firstName ? { firstName: input.firstName } : {}),
    ...(fullName ? { fullName } : {}),
    ...(input.homeAirport ? { homeAirport: input.homeAirport } : {}),
    ...(input.lastName ? { lastName: input.lastName } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    preferredLocale: input.preferredLocale ?? existingProfile.preferredLocale,
    updatedAt: new Date().toISOString(),
  };

  store.setProfile(nextProfile);
  return nextProfile;
};

export const upsertDemoTravelPreferences = async (
  input: UpsertTravelPreferencesInput,
): Promise<TravelPreferences> => {
  const store = useDemoModeStore.getState();
  const session = getActiveDemoSession() ?? authSessionMock;
  const existingPreferences = store.travelPreferences;
  const nextPreferences: TravelPreferences = {
    createdAt: existingPreferences?.createdAt ?? new Date().toISOString(),
    id: existingPreferences?.id ?? `demo-preferences-${session.userId}`,
    preferredTripTypes:
      input.preferredTripTypes ?? existingPreferences?.preferredTripTypes ?? [],
    preferredVibes:
      input.preferredVibes ?? existingPreferences?.preferredVibes ?? [],
    updatedAt: new Date().toISOString(),
    userId: existingPreferences?.userId ?? session.userId,
    ...(typeof input.adults === "number"
      ? { adults: input.adults }
      : typeof existingPreferences?.adults === "number"
        ? { adults: existingPreferences.adults }
        : {}),
    ...(input.budgetLevel
      ? { budgetLevel: input.budgetLevel }
      : existingPreferences?.budgetLevel
        ? { budgetLevel: existingPreferences.budgetLevel }
        : {}),
    ...(typeof input.budgetMax === "number"
      ? { budgetMax: input.budgetMax }
      : typeof existingPreferences?.budgetMax === "number"
        ? { budgetMax: existingPreferences.budgetMax }
        : {}),
    ...(typeof input.budgetMin === "number"
      ? { budgetMin: input.budgetMin }
      : typeof existingPreferences?.budgetMin === "number"
        ? { budgetMin: existingPreferences.budgetMin }
        : {}),
    ...(typeof input.children === "number"
      ? { children: input.children }
      : typeof existingPreferences?.children === "number"
        ? { children: existingPreferences.children }
        : {}),
    ...(typeof input.infants === "number"
      ? { infants: input.infants }
      : typeof existingPreferences?.infants === "number"
        ? { infants: existingPreferences.infants }
        : {}),
    ...(input.luxuryLevel
      ? { luxuryLevel: input.luxuryLevel }
      : existingPreferences?.luxuryLevel
        ? { luxuryLevel: existingPreferences.luxuryLevel }
        : {}),
    ...(input.notes
      ? { notes: input.notes }
      : existingPreferences?.notes
        ? { notes: existingPreferences.notes }
        : {}),
    ...(input.seatClass
      ? { seatClass: input.seatClass }
      : existingPreferences?.seatClass
        ? { seatClass: existingPreferences.seatClass }
        : {}),
    ...(input.visaPreference
      ? { visaPreference: input.visaPreference }
      : existingPreferences?.visaPreference
        ? { visaPreference: existingPreferences.visaPreference }
        : {}),
    ...(input.weatherPreference
      ? { weatherPreference: input.weatherPreference }
      : existingPreferences?.weatherPreference
        ? { weatherPreference: existingPreferences.weatherPreference }
        : {}),
  };

  store.setTravelPreferences(nextPreferences);
  return nextPreferences;
};
