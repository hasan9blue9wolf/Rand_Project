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

const APP_NAME = "Haya Trips";
const APP_SLUG = "haya-trips";
const APP_SCHEME = "hayatrips";
const APP_PACKAGE_NAME = "com.hayatrips.app";
const BRAND_BACKGROUND_COLOR = "#071528";
const APP_BACKGROUND_COLOR = "#F6F9FC";
const EAS_UPDATE_URL = process.env["EXPO_PUBLIC_EAS_UPDATE_URL"]?.trim();
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

const sanitizeVersionCode = (value?: string | null) => {
  const parsed = Number(value ?? "");

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return 1;
};

const sanitizeHeiaProvider = (value?: string | null) => {
  const normalized = trimValue(value);

  return normalized === "mock" || normalized === "real"
    ? normalized
    : "mock";
};

const createVariantDisplayName = (variant: AppVariant) => {
  if (variant === "production") {
    return APP_NAME;
  }

  return variant === "staging" ? `${APP_NAME} Staging` : `${APP_NAME} Dev`;
};

const createVariantPackageName = (variant: AppVariant) =>
  variant === "production"
    ? APP_PACKAGE_NAME
    : `${APP_PACKAGE_NAME}.${variant}`;

const createVariantScheme = (variant: AppVariant) =>
  variant === "production" ? APP_SCHEME : `${APP_SCHEME}-${variant}`;

export default ({ config }: ConfigContext): ExpoConfig => {
  const isInvestorApk = process.env["EAS_BUILD_PROFILE"] === "investor-apk";
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
  const androidVersionCode = sanitizeVersionCode(
    process.env["ANDROID_VERSION_CODE"],
  );
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
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: BRAND_BACKGROUND_COLOR,
    },
    android: {
      package: createVariantPackageName(appVariant),
      permissions: [
        "POST_NOTIFICATIONS",
        "READ_MEDIA_IMAGES",
        "READ_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
      ],
      softwareKeyboardLayoutMode: "resize",
      versionCode: androidVersionCode,
      ...(isInvestorApk ? { usesCleartextTraffic: true } : {}),
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
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
        "expo-image-picker",
        {
          photosPermission:
            "Allow Haya Trips to let you choose a profile photo for your local demo account.",
        },
      ],
      [
        "expo-notifications",
        {
          color: "#0F49BD",
          defaultChannel: "travel-updates",
          icon: "./assets/android-icon-monochrome.png",
        },
      ],
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          backgroundColor: BRAND_BACKGROUND_COLOR,
          image: "./assets/splash.png",
          imageWidth: 220,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...publicRuntimeConfig,
      hayaApiUrl: process.env["EXPO_PUBLIC_HAYA_API_URL"]?.trim() ?? "",
      eas: {
        projectId: "8f598a19-ec39-47fb-977e-19595bd1c4c6",
      },
      heiaProvider: sanitizeHeiaProvider(
        process.env["EXPO_PUBLIC_HEIA_PROVIDER"],
      ),
    },
  };

  if (validatedEasUpdateUrl) {
    expoConfig.updates = {
      url: validatedEasUpdateUrl,
    };
  }

  return expoConfig;
};
