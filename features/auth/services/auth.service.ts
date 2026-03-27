import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import {
  getSupabaseSession,
  sendPasswordResetEmail,
  signInWithEmail,
  signOutSupabaseSession,
  signUpWithEmail,
} from "../../../services/supabase/auth";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import { useAuthStore } from "../../../store/auth-store";
import { authScreenMock, authSessionMock } from "../data/auth.mock";
import type { AuthSession } from "../types";
import {
  getCurrentDemoAuthSession,
  requestDemoPasswordReset,
  signInWithDemoEmailPassword,
  signInWithDemoSocialProvider,
  signOutDemoUser,
  signUpWithDemoEmailPassword,
} from "./demo-auth.service";

const toFirstName = (email: string, displayName?: string | null) => {
  if (displayName?.trim()) {
    return displayName.trim().split(/\s+/)[0] ?? displayName.trim();
  }

  return email.split("@")[0] ?? "Traveler";
};

const mapSession = (
  session: Awaited<ReturnType<typeof getSupabaseSession>>,
): AuthSession | null => {
  if (!session) {
    return null;
  }

  const displayName =
    typeof session.user.user_metadata?.["first_name"] === "string" &&
    session.user.user_metadata["first_name"].trim()
      ? session.user.user_metadata["first_name"].trim()
      : typeof session.user.user_metadata?.["full_name"] === "string" &&
          session.user.user_metadata["full_name"].trim()
        ? session.user.user_metadata["full_name"].trim()
        : (session.user.email?.split("@")[0] ?? "Traveler");

  return {
    displayName,
    email: session.user.email ?? authSessionMock.email,
    firstName: toFirstName(
      session.user.email ?? authSessionMock.email,
      displayName,
    ),
    userId: session.user.id,
  };
};

export const getAuthScreenData = async () => authScreenMock;

export const getCurrentAuthSession = async () => {
  const demoSession = useAuthStore.getState().demoSession;
  const storeSession = useAuthStore.getState().session;

  if (demoSession) {
    return demoSession;
  }

  if (storeSession) {
    return mapSession(storeSession);
  }

  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return getCurrentDemoAuthSession();
  }

  const session = await getSupabaseSession();

  return mapSession(session);
};

export const signInWithEmailPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return signInWithDemoEmailPassword({
      email,
      password,
    });
  }

  const data = await signInWithEmail({
    email,
    password,
  });

  return mapSession(data.session);
};

export const signUpWithEmailPassword = async ({
  email,
  firstName,
  password,
}: {
  email: string;
  firstName: string;
  password: string;
}) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return signUpWithDemoEmailPassword({
      email,
      firstName,
      password,
    });
  }

  const data = await signUpWithEmail({
    email,
    password,
    ...(firstName.trim() ? { metadata: { first_name: firstName.trim() } } : {}),
  });

  return mapSession(data.session);
};

export const signInWithSocialProvider = (provider: "apple" | "google") =>
  signInWithDemoSocialProvider(provider);

export const signOutCurrentUser = () =>
  isDemoModeEnabled() || !isSupabaseConfigured()
    ? signOutDemoUser()
    : signOutSupabaseSession();

export const requestPasswordReset = async (email: string) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    await requestDemoPasswordReset(email);
    return;
  }

  await sendPasswordResetEmail(email);
};
