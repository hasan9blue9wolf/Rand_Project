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

const normalizeEmail = (email: string) =>
  email.trim().toLowerCase() || authSessionMock.email;

const createPasswordSalt = (email: string) =>
  `${email}:${Date.now().toString(36)}`;

const hashDemoPassword = (password: string, salt: string) => {
  const input = `${salt}:${password}`;
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16);
};

const createDemoSession = ({
  email,
  firstName,
}: {
  email: string;
  firstName?: string;
}): AuthSession => {
  const normalizedEmail = normalizeEmail(email);
  const resolvedFirstName = toFirstName(normalizedEmail, firstName);
  const account = useDemoModeStore
    .getState()
    .accounts.find((item) => item.email === normalizedEmail);

  return {
    displayName: resolvedFirstName,
    email: normalizedEmail,
    firstName: resolvedFirstName,
    ...(account?.phone
      ? {
          phone: account.phone,
        }
      : {}),
    ...(account?.preferredLanguage
      ? {
          preferredLanguage: account.preferredLanguage,
        }
      : {}),
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
  password,
}: {
  email: string;
  password: string;
}) => {
  await waitForDemoLatency();

  const normalizedEmail = normalizeEmail(email);
  const account = useDemoModeStore
    .getState()
    .accounts.find((item) => item.email === normalizedEmail);

  if (
    account &&
    account.passwordHash !== hashDemoPassword(password, account.passwordSalt)
  ) {
    throw new Error("Invalid credentials");
  }

  const session = createDemoSession(
    account?.firstName
      ? {
          email: normalizedEmail,
          firstName: account.firstName,
        }
      : { email: normalizedEmail },
  );

  syncDemoSession(session);
  return session;
};

export const signUpWithDemoEmailPassword = async ({
  email,
  firstName,
  password,
  phone,
  preferredLanguage,
}: {
  email: string;
  firstName: string;
  password: string;
  phone: string;
  preferredLanguage: AuthSession["preferredLanguage"];
}) => {
  await waitForDemoLatency(260);

  const normalizedEmail = normalizeEmail(email);
  const passwordSalt = createPasswordSalt(normalizedEmail);
  const session = createDemoSession({ email: normalizedEmail, firstName });
  const store = useDemoModeStore.getState();
  const nextAccount = {
    createdAt: new Date().toISOString(),
    email: normalizedEmail,
    firstName: firstName.trim(),
    passwordHash: hashDemoPassword(password, passwordSalt),
    passwordSalt,
    phone: phone.trim(),
    preferredLanguage,
    userId: session.userId,
  };

  store.setAccounts([
    nextAccount,
    ...store.accounts.filter((account) => account.email !== normalizedEmail),
  ]);

  syncDemoSession(session);
  return session;
};

export const signInWithDemoSocialProvider = async (
  provider: Exclude<AuthProvider, "email">,
) => {
  await waitForDemoLatency(260);

  const providerLabel = provider === "apple" ? "apple" : "google";
  const session = createDemoSession({
    email: `${providerLabel}.traveler@hayatrips.demo`,
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
