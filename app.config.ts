import type { ConfigContext, ExpoConfig } from "expo/config";

import type {
  AppConfig,
  AppEnvironment,
  AppMode,
  AppVariant,
} from "./types/env";

const packageJson = require("./package.json") as {
  version?: string;
};

const APP_NAME = "Haya Trip";
const APP_SLUG = "hayatrip";
const APP_SCHEME = "hayatrip";
const APP_BUNDLE_IDENTIFIER = "com.hayatrip.app";
const APP_PACKAGE_NAME = "com.hayatrip.app";
const BRAND_BACKGROUND_COLOR = "#071528";
const APP_BACKGROUND_COLOR = "#F6F9FC";
const EAS_UPDATE_URL = process.env["EXPO_PUBLIC_EAS_UPDATE_URL"]?.trim();
const DEFAULT_API_BASE_URL = "https://api.hayatrip.app";
const DEFAULT_APP_ENV: AppEnvironment = "development";
const DEFAULT_APP_MODE: AppMode = "demo";
const DIRECT_PREVIEW_ENABLED =
  process.env["HEIA_DIRECT_PREVIEW_ENABLED"] === "1";

const trimValue = (value?: string | null) => value?.trim() ?? "";

const PRIVATE_IPV4_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
] as const;

const isValidHttpsUrl = (value?: string | null) => {
  if (!value?.trim()) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

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

const normalizeAppEnvironment = (
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

const normalizeAppMode = (value?: string | null): AppMode => {
  const normalized = trimValue(value).toLowerCase();

  return normalized === "live" ? "live" : DEFAULT_APP_MODE;
};

const normalizeAppVariant = (value?: string | null): AppVariant =>
  normalizeAppEnvironment(value);

const sanitizeApiBaseUrl = ({
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

const sanitizeSupabaseUrl = ({
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

const sanitizeSupabasePublishableKey = (value?: string | null) => {
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

const buildExpoPublicRuntimeConfig = ({
  apiBaseUrl,
  appEnv,
  appMode,
  appVariant,
  supabasePublishableKey,
  supabaseUrl,
}: {
  apiBaseUrl?: string | null | undefined;
  appEnv?: string | null | undefined;
  appMode?: string | null | undefined;
  appVariant?: string | null | undefined;
  supabasePublishableKey?: string | null | undefined;
  supabaseUrl?: string | null | undefined;
}): AppConfig => {
  const normalizedAppEnv = normalizeAppEnvironment(appEnv);
  const normalizedAppVariant = normalizeAppVariant(appVariant ?? appEnv);

  return {
    apiBaseUrl: sanitizeApiBaseUrl({
      appEnv: normalizedAppEnv,
      value: apiBaseUrl,
    }),
    appEnv: normalizedAppEnv,
    appMode: normalizeAppMode(appMode),
    appVariant: normalizedAppVariant,
    releaseChannel: normalizedAppVariant,
    supabasePublishableKey:
      sanitizeSupabasePublishableKey(supabasePublishableKey),
    supabaseUrl: sanitizeSupabaseUrl({
      appEnv: normalizedAppEnv,
      value: supabaseUrl,
    }),
  };
};

const sanitizeVersion = (value?: string | null) => {
  const trimmed = value?.trim();

  if (trimmed && /^\d+\.\d+\.\d+$/.test(trimmed)) {
    return trimmed;
  }

  return packageJson.version ?? "1.0.0";
};

const sanitizeBuildNumber = (value?: string | null) => {
  const trimmed = value?.trim();

  if (trimmed && /^\d+(\.\d+){0,2}$/.test(trimmed)) {
    return trimmed;
  }

  return "1";
};

const sanitizeVersionCode = (value?: string | null) => {
  const parsed = Number(value ?? "");

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return 1;
};

const sanitizeTimeoutMs = (value?: string | null) => {
  const parsed = Number(value ?? "");

  if (!Number.isFinite(parsed)) {
    return 30_000;
  }

  return Math.min(30_000, Math.max(3_000, Math.trunc(parsed)));
};

const createVariantDisplayName = (variant: AppVariant) => {
  if (variant === "production") {
    return APP_NAME;
  }

  return variant === "staging" ? `${APP_NAME} Staging` : `${APP_NAME} Dev`;
};

const createVariantBundleIdentifier = (variant: AppVariant) =>
  variant === "production"
    ? APP_BUNDLE_IDENTIFIER
    : `${APP_BUNDLE_IDENTIFIER}.${variant}`;

const createVariantPackageName = (variant: AppVariant) =>
  variant === "production"
    ? APP_PACKAGE_NAME
    : `${APP_PACKAGE_NAME}.${variant}`;

const createVariantScheme = (variant: AppVariant) =>
  variant === "production" ? APP_SCHEME : `${APP_SCHEME}-${variant}`;

export default ({ config }: ConfigContext): ExpoConfig => {
  const validatedEasUpdateUrl = isValidHttpsUrl(EAS_UPDATE_URL)
    ? EAS_UPDATE_URL
    : "";
  const publicRuntimeConfig = buildExpoPublicRuntimeConfig({
    apiBaseUrl: process.env["EXPO_PUBLIC_API_BASE_URL"],
    appEnv: process.env["APP_ENV"],
    appMode: process.env["EXPO_PUBLIC_APP_MODE"],
    appVariant: process.env["APP_VARIANT"],
    supabasePublishableKey:
      process.env["EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"],
    supabaseUrl: process.env["EXPO_PUBLIC_SUPABASE_URL"],
  });
  const appVariant = publicRuntimeConfig.appVariant;
  const displayName = createVariantDisplayName(appVariant);
  const appVersion = sanitizeVersion(process.env["APP_VERSION"]);
  const iosBuildNumber = sanitizeBuildNumber(process.env["IOS_BUILD_NUMBER"]);
  const androidVersionCode = sanitizeVersionCode(
    process.env["ANDROID_VERSION_CODE"],
  );
  const directPreviewOpenAiApiKey = DIRECT_PREVIEW_ENABLED
    ? trimValue(process.env["OPENAI_API_KEY"])
    : "";
  const expoConfig: ExpoConfig = {
    ...config,
    name: displayName,
    slug: APP_SLUG,
    version: appVersion,
    scheme: createVariantScheme(appVariant),
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    runtimeVersion: {
      policy: "appVersion",
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: BRAND_BACKGROUND_COLOR,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: createVariantBundleIdentifier(appVariant),
      buildNumber: iosBuildNumber,
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        CFBundleDisplayName: displayName,
      },
    },
    android: {
      package: createVariantPackageName(appVariant),
      permissions: ["POST_NOTIFICATIONS", "RECEIVE_BOOT_COMPLETED", "VIBRATE"],
      softwareKeyboardLayoutMode: "resize",
      versionCode: androidVersionCode,
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
        backgroundColor: BRAND_BACKGROUND_COLOR,
      },
    },
    androidNavigationBar: {
      backgroundColor: APP_BACKGROUND_COLOR,
      barStyle: "dark-content",
    },
    androidStatusBar: {
      barStyle: "dark-content",
    },
    plugins: [
      "expo-router",
      "expo-localization",
      [
        "expo-notifications",
        {
          color: "#0F49BD",
          defaultChannel: "travel-updates",
          icon: "./assets/android-icon-monochrome.png",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: BRAND_BACKGROUND_COLOR,
          image: "./assets/splash-icon.png",
          imageWidth: 220,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png",
    },
    extra: {
      ...publicRuntimeConfig,
      ...(directPreviewOpenAiApiKey
        ? {
            heiaDirectPreviewModel:
              trimValue(process.env["OPENAI_HEIA_MODEL"]) ||
              "gpt-5.4-mini-2026-03-17",
            heiaDirectPreviewOpenAiApiKey: directPreviewOpenAiApiKey,
            heiaDirectPreviewTimeoutMs: sanitizeTimeoutMs(
              process.env["OPENAI_HEIA_TIMEOUT_MS"],
            ),
          }
        : {}),
    },
  };

  if (validatedEasUpdateUrl) {
    expoConfig.updates = {
      url: validatedEasUpdateUrl,
    };
  }

  return expoConfig;
};
