import { useAuthStore } from "../../../store/auth-store";
import { useDemoModeStore } from "../../../store/demo-mode-store";
import { authSessionMock } from "../data/auth.mock";
import type { AuthProvider, AuthSession } from "../types";

const waitForDemoLatency = (durationMs = 220) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const toFirstName = (email: string, firstName?: string) => {
  const trimmedFirstName = firstName?.trim();

  if (trimmedFirstName) {
    return trimmedFirstName;
  }

  return email.split("@")[0] ?? authSessionMock.firstName;
};

const createDemoSession = ({
  email,
  firstName,
}: {
  email: string;
  firstName?: string;
}): AuthSession => {
  const normalizedEmail = email.trim().toLowerCase() || authSessionMock.email;
  const resolvedFirstName = toFirstName(normalizedEmail, firstName);

  return {
    displayName: resolvedFirstName,
    email: normalizedEmail,
    firstName: resolvedFirstName,
    userId: `demo-${normalizedEmail.replace(/[^a-z0-9]+/g, "-")}`,
  };
};

const syncDemoSession = (session: AuthSession | null) => {
  const demoModeStore = useDemoModeStore.getState();

  if (
    session &&
    demoModeStore.profile?.id &&
    demoModeStore.profile.id !== session.userId
  ) {
    demoModeStore.setProfile(null);
    demoModeStore.setSavedDestinations([]);
    demoModeStore.setTravelPreferences(null);
  }

  demoModeStore.setAuthSession(session);
  useAuthStore.getState().setDemoSession(session);
};

export const bootstrapDemoAuthSession = async () => {
  const authSession = useDemoModeStore.getState().authSession;

  useAuthStore.getState().setDemoSession(authSession);
  return authSession;
};

export const getCurrentDemoAuthSession = async () => {
  const authSession = useDemoModeStore.getState().authSession;

  syncDemoSession(authSession);
  return authSession;
};

export const signInWithDemoEmailPassword = async ({
  email,
  password: _password,
}: {
  email: string;
  password: string;
}) => {
  await waitForDemoLatency();

  const session = createDemoSession({ email });

  syncDemoSession(session);
  return session;
};

export const signUpWithDemoEmailPassword = async ({
  email,
  firstName,
  password: _password,
}: {
  email: string;
  firstName: string;
  password: string;
}) => {
  await waitForDemoLatency(260);

  const session = createDemoSession({ email, firstName });

  syncDemoSession(session);
  return session;
};

export const signInWithDemoSocialProvider = async (
  provider: Exclude<AuthProvider, "email">,
) => {
  await waitForDemoLatency(260);

  const providerLabel = provider === "apple" ? "apple" : "google";
  const session = createDemoSession({
    email: `${providerLabel}.traveler@travelgenious.demo`,
    firstName: provider === "apple" ? "Nora" : "Layla",
  });

  syncDemoSession(session);
  return session;
};

export const signOutDemoUser = async () => {
  await waitForDemoLatency(120);
  syncDemoSession(null);
};

export const requestDemoPasswordReset = async (_email: string) => {
  await waitForDemoLatency(180);
};
