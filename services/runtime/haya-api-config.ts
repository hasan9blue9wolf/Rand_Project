import Constants from "expo-constants";

const { EXPO_PUBLIC_HAYA_API_URL } = process.env as Record<string, string | undefined>;

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const normalizeHayaApiUrl = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || /(?:sk-|api[_-]?key|openai)/i.test(trimmed)) return "";
  try {
    const url = new URL(trimmed);
    const privateDevHost = ["localhost", "127.0.0.1", "10.0.2.2"].includes(url.hostname) || /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && privateDevHost)) return "";
    return trimTrailingSlashes(url.href);
  } catch { return ""; }
};

export const getHayaApiUrl = () => {
  const extra = (Constants.expoConfig?.extra ?? {}) as { hayaApiUrl?: string };
  return normalizeHayaApiUrl(EXPO_PUBLIC_HAYA_API_URL ?? extra.hayaApiUrl);
};

export const isHayaApiConfigured = () => Boolean(getHayaApiUrl());
