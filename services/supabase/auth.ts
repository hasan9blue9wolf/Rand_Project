import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { useAuthStore } from "../../store/auth-store";
import { registerSupabaseAppStateListener, supabase } from "./client";
import { isSupabaseConfigured } from "./config";

let authSubscriptionBound = false;
let authBootstrapPromise: Promise<void> | null = null;

const AUTH_REQUIRED_ERROR_MESSAGE = "Sign in to continue.";
const AUTH_UNAVAILABLE_ERROR_MESSAGE =
  "Authentication is temporarily unavailable.";

const syncSession = (session: Session | null) => {
  useAuthStore.getState().setSession(session);
};

const markInitialized = () => {
  useAuthStore.getState().setInitialized(true);
};

const bindAuthSubscription = () => {
  if (authSubscriptionBound || !isSupabaseConfigured()) {
    return;
  }

  supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      syncSession(session);
    },
  );

  authSubscriptionBound = true;
};

export const bootstrapSupabaseAuth = async () => {
  if (authBootstrapPromise) {
    return authBootstrapPromise;
  }

  authBootstrapPromise = (async () => {
    if (!isSupabaseConfigured()) {
      syncSession(null);
      markInitialized();
      return;
    }

    registerSupabaseAppStateListener();
    bindAuthSubscription();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      syncSession(session);
    } catch {
      syncSession(null);
    } finally {
      markInitialized();
    }
  })();

  return authBootstrapPromise;
};

export const getSupabaseSession = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const storeSession = useAuthStore.getState().session;

  if (storeSession) {
    return storeSession;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

export const getSupabaseUser = async () => {
  const session = await getSupabaseSession();

  return session?.user ?? null;
};

export const requireSupabaseUser = async () => {
  const user = await getSupabaseUser();

  if (!user) {
    throw new Error(AUTH_REQUIRED_ERROR_MESSAGE);
  }

  return user;
};

export const signInWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (!isSupabaseConfigured()) {
    throw new Error(AUTH_UNAVAILABLE_ERROR_MESSAGE);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  syncSession(data.session);

  return data;
};

export const signUpWithEmail = async ({
  email,
  metadata,
  password,
}: {
  email: string;
  metadata?: Record<string, string | undefined>;
  password: string;
}) => {
  if (!isSupabaseConfigured()) {
    throw new Error(AUTH_UNAVAILABLE_ERROR_MESSAGE);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    ...(metadata ? { options: { data: metadata } } : {}),
  });

  if (error) {
    throw error;
  }

  syncSession(data.session);

  return data;
};

export const signOutSupabaseSession = async () => {
  if (!isSupabaseConfigured()) {
    syncSession(null);
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  syncSession(null);
};

export const sendPasswordResetEmail = async (email: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error(AUTH_UNAVAILABLE_ERROR_MESSAGE);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw error;
  }
};
