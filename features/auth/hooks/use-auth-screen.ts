import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { useAuthStore } from "../../../store/auth-store";
import { useTravelPreferencesStore } from "../../../store/travel-preferences-store";
import type { AppLocale } from "../../../types/i18n";
import type {
  AiAdvisorBudgetLevel,
  AiAdvisorLuxuryLevel,
  AiAdvisorTripType,
} from "../../aiAdvisor/types";
import {
  getCurrentTravelPreferences,
  getCurrentUserProfile,
  upsertCurrentTravelPreferences,
  upsertCurrentUserProfile,
} from "../../profile/services/profile.service";
import type { TravelPreferences, UserProfile } from "../../profile/types";
import { saveDestination } from "../../saved/services/saved-destinations.service";
import { authScreenMock } from "../data/auth.mock";
import {
  getCurrentAuthSession,
  requestPasswordReset,
  signInWithEmailPassword,
  signInWithSocialProvider,
  signOutCurrentUser,
  signUpWithEmailPassword,
} from "../services/auth.service";
import type {
  AuthFlowStage,
  AuthFormValues,
  AuthOnboardingPayload,
  AuthOnboardingStep,
  AuthOnboardingValues,
  AuthProvider,
  AuthSession,
  AuthTravelerProfile,
} from "../types";

type AuthBusyAction =
  | "forgotPassword"
  | "guest"
  | "onboarding"
  | "signIn"
  | "signOut"
  | "signUp"
  | null;

const travelerProfiles = [
  "business",
  "couples",
  "family",
  "solo",
] as const satisfies readonly AuthTravelerProfile[];

const onboardingTripTypes = [
  "adventure",
  "business",
  "couples",
  "family",
  "friends",
  "luxury",
  "solo",
  "wellness",
] as const satisfies readonly AiAdvisorTripType[];

const MAX_DEPARTURE_LOCATION_LENGTH = 80;
const MAX_FAVORITE_DESTINATIONS = 10;
const MAX_FAVORITE_DESTINATION_LENGTH = 80;
const authEmailSchema = z.string().trim().min(1).max(160).email();
const NETWORK_ERROR_PATTERNS = [
  /network/i,
  /offline/i,
  /timed out/i,
  /timeout/i,
  /fetch/i,
  /load failed/i,
] as const;

const toOptionalNumber = (value: string) => {
  const digitsOnly = value.replace(/[^\d.]/g, "");
  const parsed = Number(digitsOnly);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDestinationSlug = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `destination-${Date.now()}`;
};

const parseFavoriteDestinations = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((entry) => entry.trim().replace(/\s+/g, " "))
        .filter(
          (entry) =>
            Boolean(entry) &&
            entry.length <= MAX_FAVORITE_DESTINATION_LENGTH,
        ),
    ),
  ).slice(0, MAX_FAVORITE_DESTINATIONS);

const createDefaultOnboardingValues = (
  language: AppLocale,
  preferences: AuthOnboardingPayload | null,
): AuthOnboardingValues => {
  const nextValues: AuthOnboardingValues = {
    budgetMax:
      typeof preferences?.budgetMax === "number"
        ? String(preferences.budgetMax)
        : "",
    budgetMin:
      typeof preferences?.budgetMin === "number"
        ? String(preferences.budgetMin)
        : "",
    departureLocation: preferences?.departureLocation ?? "",
    favoriteDestinations: preferences?.favoriteDestinations.join(", ") ?? "",
    preferredLanguage: preferences?.preferredLanguage ?? language,
  };

  if (preferences?.budgetLevel) {
    nextValues.budgetLevel = preferences.budgetLevel;
  }

  if (preferences?.luxuryLevel) {
    nextValues.luxuryLevel = preferences.luxuryLevel;
  }

  if (preferences?.travelerProfile) {
    nextValues.travelerProfile = preferences.travelerProfile;
  }

  if (preferences?.tripType) {
    nextValues.tripType = preferences.tripType;
  }

  return nextValues;
};

const pickTravelerProfile = (
  preferredTripTypes: TravelPreferences["preferredTripTypes"] | undefined,
  preferences: AuthOnboardingPayload | null,
) =>
  preferences?.travelerProfile ??
  preferredTripTypes?.find((tripType): tripType is AuthTravelerProfile =>
    travelerProfiles.includes(tripType as AuthTravelerProfile),
  );

const pickTripType = (
  preferredTripTypes: TravelPreferences["preferredTripTypes"] | undefined,
  preferences: AuthOnboardingPayload | null,
) =>
  preferences?.tripType ??
  preferredTripTypes?.find((tripType) =>
    onboardingTripTypes.includes(tripType),
  );

const createOnboardingValuesFromProfile = ({
  language,
  preferences,
  profile,
  travelPreferences,
}: {
  language: AppLocale;
  preferences: AuthOnboardingPayload | null;
  profile: UserProfile | null;
  travelPreferences: TravelPreferences | null;
}): AuthOnboardingValues => {
  const nextValues: AuthOnboardingValues = {
    budgetMax:
      typeof preferences?.budgetMax === "number"
        ? String(preferences.budgetMax)
        : typeof travelPreferences?.budgetMax === "number"
          ? String(travelPreferences.budgetMax)
          : "",
    budgetMin:
      typeof preferences?.budgetMin === "number"
        ? String(preferences.budgetMin)
        : typeof travelPreferences?.budgetMin === "number"
          ? String(travelPreferences.budgetMin)
          : "",
    departureLocation:
      preferences?.departureLocation ??
      profile?.homeAirport ??
      profile?.departureCity ??
      "",
    favoriteDestinations: preferences?.favoriteDestinations.join(", ") ?? "",
    preferredLanguage:
      preferences?.preferredLanguage ?? profile?.preferredLocale ?? language,
  };

  const budgetLevel =
    preferences?.budgetLevel ?? travelPreferences?.budgetLevel;
  const luxuryLevel =
    preferences?.luxuryLevel ?? travelPreferences?.luxuryLevel;
  const travelerProfile = pickTravelerProfile(
    travelPreferences?.preferredTripTypes,
    preferences,
  );
  const tripType = pickTripType(
    travelPreferences?.preferredTripTypes,
    preferences,
  );

  if (budgetLevel) {
    nextValues.budgetLevel = budgetLevel;
  }

  if (luxuryLevel) {
    nextValues.luxuryLevel = luxuryLevel;
  }

  if (travelerProfile) {
    nextValues.travelerProfile = travelerProfile;
  }

  if (tripType) {
    nextValues.tripType = tripType;
  }

  return nextValues;
};

const isRemoteOnboardingComplete = ({
  preferences,
  profile,
  travelPreferences,
}: {
  preferences: AuthOnboardingPayload | null;
  profile: UserProfile | null;
  travelPreferences: TravelPreferences | null;
}) => {
  if (preferences) {
    return Boolean(
      preferences.preferredLanguage &&
      preferences.departureLocation &&
      preferences.travelerProfile &&
      preferences.tripType &&
      preferences.budgetLevel &&
      typeof preferences.budgetMin === "number" &&
      typeof preferences.budgetMax === "number" &&
      preferences.luxuryLevel &&
      preferences.favoriteDestinations.length,
    );
  }

  return Boolean(
    profile?.preferredLocale &&
    (profile.homeAirport || profile.departureCity) &&
    travelPreferences?.preferredTripTypes.length &&
    travelPreferences.budgetLevel &&
    typeof travelPreferences.budgetMin === "number" &&
    typeof travelPreferences.budgetMax === "number" &&
    travelPreferences.luxuryLevel,
  );
};

const normalizeOnboardingPayload = (
  values: AuthOnboardingValues,
): AuthOnboardingPayload => {
  const payload: AuthOnboardingPayload = {
    favoriteDestinations: parseFavoriteDestinations(
      values.favoriteDestinations,
    ),
    preferredLanguage: values.preferredLanguage,
  };

  const budgetMax = toOptionalNumber(values.budgetMax);
  const budgetMin = toOptionalNumber(values.budgetMin);
  const departureLocation = values.departureLocation.trim();

  if (values.budgetLevel) {
    payload.budgetLevel = values.budgetLevel;
  }

  if (typeof budgetMax === "number") {
    payload.budgetMax = budgetMax;
  }

  if (typeof budgetMin === "number") {
    payload.budgetMin = budgetMin;
  }

  if (departureLocation) {
    payload.departureLocation = departureLocation;
  }

  if (values.luxuryLevel) {
    payload.luxuryLevel = values.luxuryLevel;
  }

  if (values.travelerProfile) {
    payload.travelerProfile = values.travelerProfile;
  }

  if (values.tripType) {
    payload.tripType = values.tripType;
  }

  return payload;
};

const createFriendlyErrorMessage = (
  error: unknown,
  {
    authUnavailableMessage,
    emailNotConfirmedMessage,
    fallbackMessage,
    invalidCredentialsMessage,
    networkMessage,
  }: {
    authUnavailableMessage: string;
    emailNotConfirmedMessage: string;
    fallbackMessage: string;
    invalidCredentialsMessage: string;
    networkMessage: string;
  },
) => {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login") ||
    normalized.includes("invalid credentials")
  ) {
    return invalidCredentialsMessage;
  }

  if (normalized.includes("email not confirmed")) {
    return emailNotConfirmedMessage;
  }

  if (
    normalized.includes("temporarily unavailable") ||
    normalized.includes("not configured")
  ) {
    return authUnavailableMessage;
  }

  if (NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return networkMessage;
  }

  return fallbackMessage;
};

export const useAuthScreen = () => {
  const { changeLanguage, isRTL, language, t } = useLocalization();
  const storeDemoSession = useAuthStore((state) => state.demoSession);
  const storeSession = useAuthStore((state) => state.session);
  const guestModeEnabled = useTravelPreferencesStore(
    (state) => state.guestModeEnabled,
  );
  const onboardingCompleted = useTravelPreferencesStore(
    (state) => state.onboardingCompleted,
  );
  const persistedPreferences = useTravelPreferencesStore(
    (state) => state.preferences,
  );
  const resetPreferences = useTravelPreferencesStore(
    (state) => state.resetPreferences,
  );
  const setGuestModeEnabled = useTravelPreferencesStore(
    (state) => state.setGuestModeEnabled,
  );
  const setOnboardingPreferences = useTravelPreferencesStore(
    (state) => state.setOnboardingPreferences,
  );
  const [travelPreferencesHydrated, setTravelPreferencesHydrated] = useState(
    useTravelPreferencesStore.persist.hasHydrated(),
  );
  const languageRef = useRef(language);
  const persistedPreferencesRef = useRef(persistedPreferences);
  const [stage, setStage] = useState<AuthFlowStage>("welcome");
  const [busyAction, setBusyAction] = useState<AuthBusyAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [formValues, setFormValues] = useState<AuthFormValues>({
    email: "",
    firstName: "",
    password: "",
  });
  const [onboardingValues, setOnboardingValues] =
    useState<AuthOnboardingValues>(
      createDefaultOnboardingValues(language, persistedPreferences),
    );
  const defaultAuthErrorMessages = {
    authUnavailableMessage: t("authFlow.errors.authUnavailable"),
    emailNotConfirmedMessage: t("authFlow.errors.emailNotConfirmed"),
    invalidCredentialsMessage: t("authFlow.errors.invalidCredentials"),
    networkMessage: t("authFlow.errors.network"),
  };

  useEffect(() => {
    languageRef.current = language;
    persistedPreferencesRef.current = persistedPreferences;
  }, [language, persistedPreferences]);

  useEffect(() => {
    const unsubscribe = useTravelPreferencesStore.persist.onFinishHydration(
      () => setTravelPreferencesHydrated(true),
    );

    setTravelPreferencesHydrated(
      useTravelPreferencesStore.persist.hasHydrated(),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!travelPreferencesHydrated) {
      return;
    }

    let mounted = true;

    const syncState = async () => {
      setIsInitializing(true);

      try {
        const currentLanguage = languageRef.current;
        const currentPersistedPreferences = persistedPreferencesRef.current;
        const currentSession = await getCurrentAuthSession();

        if (!mounted) {
          return;
        }

        setSession(currentSession);

        if (!currentSession) {
          setOnboardingValues(
            createDefaultOnboardingValues(
              currentLanguage,
              currentPersistedPreferences,
            ),
          );
          setStage("welcome");
          return;
        }

        const [profile, travelPreferences] = await Promise.all([
          getCurrentUserProfile().catch(() => null),
          getCurrentTravelPreferences().catch(() => null),
        ]);

        if (!mounted) {
          return;
        }

        setOnboardingValues(
          createOnboardingValuesFromProfile({
            language: currentLanguage,
            preferences: currentPersistedPreferences,
            profile,
            travelPreferences,
          }),
        );
        setStage(
          isRemoteOnboardingComplete({
            preferences: currentPersistedPreferences,
            profile,
            travelPreferences,
          })
            ? "welcome"
            : "onboarding",
        );
      } catch {
        if (!mounted) {
          return;
        }

        setSession(null);
        setStage("welcome");
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    void syncState();

    return () => {
      mounted = false;
    };
  }, [storeDemoSession, storeSession, travelPreferencesHydrated]);

  const onboardingSteps: AuthOnboardingStep[] = [
    {
      description: t("authFlow.onboarding.steps.language.description"),
      id: "language",
      title: t("authFlow.onboarding.steps.language.title"),
    },
    {
      description: t("authFlow.onboarding.steps.traveler.description"),
      id: "traveler",
      title: t("authFlow.onboarding.steps.traveler.title"),
    },
    {
      description: t("authFlow.onboarding.steps.travelStyle.description"),
      id: "travelStyle",
      title: t("authFlow.onboarding.steps.travelStyle.title"),
    },
    {
      description: t("authFlow.onboarding.steps.destinations.description"),
      id: "destinations",
      title: t("authFlow.onboarding.steps.destinations.title"),
    },
  ];

  const currentOnboardingStep = onboardingSteps[onboardingStepIndex];

  const setFormValue = (field: keyof AuthFormValues, value: string) => {
    setErrorMessage(null);
    setNoticeMessage(null);
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const setOnboardingValue = <Field extends keyof AuthOnboardingValues>(
    field: Field,
    value: AuthOnboardingValues[Field],
  ) => {
    setErrorMessage(null);
    setNoticeMessage(null);
    setOnboardingValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handlePreferredLanguageChange = async (nextLanguage: AppLocale) => {
    setOnboardingValue("preferredLanguage", nextLanguage);
    await changeLanguage(nextLanguage);
  };

  const validateAuthForm = (
    nextStage: Extract<AuthFlowStage, "forgotPassword" | "signIn" | "signUp">,
  ) => {
    const trimmedEmail = formValues.email.trim();

    if (!trimmedEmail) {
      return t("authFlow.errors.emailRequired");
    }

    if (!authEmailSchema.safeParse(trimmedEmail).success) {
      return t("authFlow.errors.emailInvalid");
    }

    if (nextStage === "forgotPassword") {
      return null;
    }

    if (nextStage === "signUp" && !formValues.firstName.trim()) {
      return t("authFlow.errors.firstNameRequired");
    }

    if (!formValues.password.trim()) {
      return t("authFlow.errors.passwordRequired");
    }

    if (formValues.password.trim().length < 8) {
      return t("authFlow.errors.passwordTooShort");
    }

    return null;
  };

  const validateCurrentOnboardingStep = () => {
    if (!currentOnboardingStep) {
      return null;
    }

    if (currentOnboardingStep.id === "language") {
      if (!onboardingValues.preferredLanguage) {
        return t("authFlow.errors.languageRequired");
      }

      return null;
    }

    if (currentOnboardingStep.id === "traveler") {
      if (!onboardingValues.travelerProfile) {
        return t("authFlow.errors.travelerProfileRequired");
      }

      if (!onboardingValues.tripType) {
        return t("authFlow.errors.tripTypeRequired");
      }

      return null;
    }

    if (currentOnboardingStep.id === "travelStyle") {
      if (!onboardingValues.budgetLevel) {
        return t("authFlow.errors.budgetLevelRequired");
      }

      if (!onboardingValues.luxuryLevel) {
        return t("authFlow.errors.luxuryLevelRequired");
      }

      const minimumBudget = toOptionalNumber(onboardingValues.budgetMin);
      const maximumBudget = toOptionalNumber(onboardingValues.budgetMax);

      if (
        typeof minimumBudget !== "number" ||
        typeof maximumBudget !== "number"
      ) {
        return t("authFlow.errors.budgetRangeRequired");
      }

      if (minimumBudget > maximumBudget) {
        return t("authFlow.errors.budgetRangeOrder");
      }

      return null;
    }

    if (
      !parseFavoriteDestinations(onboardingValues.favoriteDestinations).length
    ) {
      return t("authFlow.errors.favoriteDestinationsRequired");
    }

    if (!onboardingValues.departureLocation.trim()) {
      return t("authFlow.errors.departureLocationRequired");
    }

    if (
      onboardingValues.departureLocation.trim().length >
      MAX_DEPARTURE_LOCATION_LENGTH
    ) {
      return t("authFlow.errors.departureLocationTooLong");
    }

    return null;
  };

  const openStage = (nextStage: AuthFlowStage) => {
    setErrorMessage(null);
    setNoticeMessage(null);
    setStage(nextStage);
  };

  const handleGuestMode = async () => {
    setBusyAction("guest");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      setGuestModeEnabled(true);
      setStage("onboarding");
      setOnboardingStepIndex(0);
    } finally {
      setBusyAction(null);
    }
  };

  const hydrateAuthenticatedEntry = async (nextSession: AuthSession | null) => {
    setSession(nextSession);
    setGuestModeEnabled(false);

    const [profile, travelPreferences] = nextSession
      ? await Promise.all([
          getCurrentUserProfile().catch(() => null),
          getCurrentTravelPreferences().catch(() => null),
        ])
      : [null, null];

    setOnboardingValues(
      createOnboardingValuesFromProfile({
        language,
        preferences: persistedPreferences,
        profile,
        travelPreferences,
      }),
    );

    if (
      isRemoteOnboardingComplete({
        preferences: persistedPreferences,
        profile,
        travelPreferences,
      })
    ) {
      router.replace(appRoutes.home);
      return;
    }

    setStage("onboarding");
    setOnboardingStepIndex(0);
  };

  const handleSocialPlaceholderPress = async (
    provider: Exclude<AuthProvider, "email">,
  ) => {
    setBusyAction("signIn");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const nextSession = await signInWithSocialProvider(provider);

      await hydrateAuthenticatedEntry(nextSession);
    } catch (error) {
      setErrorMessage(
        createFriendlyErrorMessage(
          error,
          {
            ...defaultAuthErrorMessages,
            fallbackMessage: t("authFlow.errors.generic"),
          },
        ),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const persistOnboarding = async (payload: AuthOnboardingPayload) => {
    setOnboardingPreferences(payload);

    if (!session) {
      return;
    }

    const departureLocation = payload.departureLocation?.trim();
    const profileInput: {
      departureCity?: string;
      firstName: string;
      homeAirport?: string;
      preferredLocale: AppLocale;
    } = {
      firstName: formValues.firstName.trim() || session.firstName,
      preferredLocale: payload.preferredLanguage,
    };

    if (/^[A-Za-z]{3,4}$/.test(departureLocation ?? "")) {
      if (departureLocation) {
        profileInput.homeAirport = departureLocation.toUpperCase();
      }
    } else if (departureLocation) {
      profileInput.departureCity = departureLocation;
    }

    const preferredTripTypes = Array.from(
      new Set(
        [payload.travelerProfile, payload.tripType].filter(
          (value): value is AiAdvisorTripType => Boolean(value),
        ),
      ),
    );

    const travelPreferencesInput: {
      budgetLevel?: AiAdvisorBudgetLevel;
      budgetMax?: number;
      budgetMin?: number;
      luxuryLevel?: AiAdvisorLuxuryLevel;
      preferredTripTypes: AiAdvisorTripType[];
    } = {
      preferredTripTypes,
    };

    if (payload.budgetLevel) {
      travelPreferencesInput.budgetLevel = payload.budgetLevel;
    }

    if (typeof payload.budgetMax === "number") {
      travelPreferencesInput.budgetMax = payload.budgetMax;
    }

    if (typeof payload.budgetMin === "number") {
      travelPreferencesInput.budgetMin = payload.budgetMin;
    }

    if (payload.luxuryLevel) {
      travelPreferencesInput.luxuryLevel = payload.luxuryLevel;
    }

    await Promise.all([
      upsertCurrentUserProfile(profileInput),
      upsertCurrentTravelPreferences(travelPreferencesInput),
    ]);

    await Promise.allSettled(
      payload.favoriteDestinations.map((destinationName) =>
        saveDestination({
          destinationName,
          destinationSlug: toDestinationSlug(destinationName),
          source: "auth-onboarding",
          summary: destinationName,
        }),
      ),
    );
  };

  const submitSignIn = async () => {
    const validationError = validateAuthForm("signIn");

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setBusyAction("signIn");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const nextSession = await signInWithEmailPassword({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      await hydrateAuthenticatedEntry(nextSession);
    } catch (error) {
      setErrorMessage(
        createFriendlyErrorMessage(
          error,
          {
            ...defaultAuthErrorMessages,
            fallbackMessage: t("authFlow.errors.generic"),
          },
        ),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const submitSignUp = async () => {
    const validationError = validateAuthForm("signUp");

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setBusyAction("signUp");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const nextSession = await signUpWithEmailPassword({
        email: formValues.email.trim(),
        firstName: formValues.firstName.trim(),
        password: formValues.password,
      });

      setSession(nextSession);
      setGuestModeEnabled(false);
      setStage("onboarding");
      setOnboardingStepIndex(0);

      if (!nextSession) {
        setNoticeMessage(t("authFlow.messages.emailVerification"));
      }
    } catch (error) {
      setErrorMessage(
        createFriendlyErrorMessage(
          error,
          {
            ...defaultAuthErrorMessages,
            fallbackMessage: t("authFlow.errors.generic"),
          },
        ),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const submitForgotPassword = async () => {
    const validationError = validateAuthForm("forgotPassword");

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setBusyAction("forgotPassword");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      await requestPasswordReset(formValues.email.trim());
      setNoticeMessage(t("authFlow.messages.passwordResetSent"));
    } catch (error) {
      setErrorMessage(
        createFriendlyErrorMessage(
          error,
          {
            ...defaultAuthErrorMessages,
            fallbackMessage: t("authFlow.errors.passwordResetFailed"),
          },
        ),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const goToNextOnboardingStep = async () => {
    const validationError = validateCurrentOnboardingStep();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (onboardingStepIndex < onboardingSteps.length - 1) {
      setOnboardingStepIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setBusyAction("onboarding");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const payload = normalizeOnboardingPayload(onboardingValues);
      await changeLanguage(payload.preferredLanguage);
      await persistOnboarding(payload);
      router.replace(appRoutes.home);
    } catch (error) {
      setErrorMessage(
        createFriendlyErrorMessage(
          error,
          {
            ...defaultAuthErrorMessages,
            fallbackMessage: t("authFlow.errors.onboardingSaveFailed"),
          },
        ),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const goToPreviousOnboardingStep = () => {
    setErrorMessage(null);
    setNoticeMessage(null);

    if (onboardingStepIndex === 0) {
      setStage(session ? "welcome" : "signUp");
      return;
    }

    setOnboardingStepIndex((currentIndex) => currentIndex - 1);
  };

  const handleSignOut = async () => {
    setBusyAction("signOut");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      await signOutCurrentUser();
      setSession(null);
      setStage("welcome");
      setFormValues((currentValues) => ({
        ...currentValues,
        password: "",
      }));
    } catch (error) {
      setErrorMessage(
        createFriendlyErrorMessage(
          error,
          {
            ...defaultAuthErrorMessages,
            fallbackMessage: t("authFlow.errors.signOutFailed"),
          },
        ),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const continueToApp = () => {
    router.replace(appRoutes.home);
  };

  return {
    authProviders: authScreenMock.providers,
    busyAction,
    continueToApp,
    currentOnboardingStep,
    errorMessage,
    formValues,
    guestModeEnabled,
    handleGuestMode,
    handlePreferredLanguageChange,
    handleSignOut,
    handleSocialPlaceholderPress,
    hasCompletedOnboarding: onboardingCompleted,
    hasSession: Boolean(session),
    isInitializing,
    isRTL,
    noticeMessage,
    onboardingStepIndex,
    onboardingSteps,
    onboardingValues,
    openStage,
    persistedPreferences,
    resetPreferences,
    session,
    setFormValue,
    setOnboardingValue,
    stage,
    submitForgotPassword,
    submitSignIn,
    submitSignUp,
    goToNextOnboardingStep,
    goToPreviousOnboardingStep,
  };
};
