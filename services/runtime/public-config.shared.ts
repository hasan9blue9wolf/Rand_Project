import type {
  AppConfig,
  AppEnvironment,
  AppMode,
  AppVariant,
} from "../../types/env";

const DEFAULT_API_BASE_URL = "https://api.hayatrips.app";
const DEFAULT_APP_ENV: AppEnvironment = "development";
const DEFAULT_APP_MODE: AppMode = "demo";

const trimValue = (value?: string | null) => value?.trim() ?? "";

const PRIVATE_IPV4_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
] as const;

const isDevelopmentHostname = (hostname: string) => {
  const normalizedHostname = hostname.trim().toLowerCase();

  return (
    normalizedHostname === "localhost" ||
    normalizedHostname === "0.0.0.0" ||
    normalizedHostname === "::1" ||
    normalizedHostname.endsWith(".local") ||
    PRIVATE_IPV4_PATTERNS.some((pattern) =>
      pattern.test(normalizedHostname),
    )
  );
};

const parseUrl = (value?: string | null) => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
};

const toNormalizedUrlString = (url: URL) => url.href.replace(/\/$/, "");

const containsSecretMarker = (value: string) =>
  /(service[_-]?role|secret|private|server[_-]?key|api[_-]?key|sk-)/i.test(
    value,
  );

export const normalizeAppEnvironment = (
  value?: string | null,
): AppEnvironment => {
  const normalized = trimValue(value).toLowerCase();

  if (
    normalized === "development" ||
    normalized === "staging" ||
    normalized === "production"
  ) {
    return normalized;
  }

  return DEFAULT_APP_ENV;
};

export const normalizeAppMode = (value?: string | null): AppMode => {
  const normalized = trimValue(value).toLowerCase();

  return normalized === "live" ? "live" : DEFAULT_APP_MODE;
};

export const normalizeAppVariant = (value?: string | null): AppVariant =>
  normalizeAppEnvironment(value);

export const getReleaseChannelForVariant = (variant: AppVariant) => variant;

export const sanitizeApiBaseUrl = ({
  appEnv,
  value,
}: {
  appEnv: AppEnvironment;
  value: string | null | undefined;
}) => {
  const parsedUrl = parseUrl(value);

  if (!parsedUrl) {
    return DEFAULT_API_BASE_URL;
  }

  if (parsedUrl.protocol === "https:") {
    return toNormalizedUrlString(parsedUrl);
  }

  if (
    parsedUrl.protocol === "http:" &&
    appEnv !== "production" &&
    isDevelopmentHostname(parsedUrl.hostname)
  ) {
    return toNormalizedUrlString(parsedUrl);
  }

  return DEFAULT_API_BASE_URL;
};

export const sanitizeSupabaseUrl = ({
  appEnv,
  value,
}: {
  appEnv: AppEnvironment;
  value: string | null | undefined;
}) => {
  const parsedUrl = parseUrl(value);

  if (!parsedUrl || parsedUrl.protocol !== "https:") {
    return "";
  }

  if (appEnv === "production" && isDevelopmentHostname(parsedUrl.hostname)) {
    return "";
  }

  return toNormalizedUrlString(parsedUrl);
};

export const sanitizeSupabasePublishableKey = (value?: string | null) => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return "";
  }

  if (
    containsSecretMarker(trimmed) &&
    !trimmed.startsWith("sb_publishable_")
  ) {
    return "";
  }

  return trimmed;
};

export const buildPublicRuntimeConfig = (
  input: Partial<Record<keyof AppConfig, string | undefined>>,
): AppConfig => {
  const appVariant = normalizeAppVariant(input.appVariant ?? input.appEnv);
  const appEnv = normalizeAppEnvironment(input.appEnv);

  return {
    apiBaseUrl: sanitizeApiBaseUrl({
      appEnv,
      value: input.apiBaseUrl,
    }),
    appEnv,
    appMode: normalizeAppMode(input.appMode),
    appVariant,
    releaseChannel: getReleaseChannelForVariant(appVariant),
    supabasePublishableKey: sanitizeSupabasePublishableKey(
      input.supabasePublishableKey,
    ),
    supabaseUrl: sanitizeSupabaseUrl({
      appEnv,
      value: input.supabaseUrl,
    }),
  };
};

export const isSupabaseRuntimeConfigComplete = (
  config: Pick<AppConfig, "supabasePublishableKey" | "supabaseUrl">,
) => Boolean(config.supabasePublishableKey && config.supabaseUrl);
