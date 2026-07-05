import * as Localization from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { FALLBACK_LOCALE, RTL_LANGUAGES, SUPPORTED_LOCALES } from "../../constants/app";
import { ar } from "../../locales/ar";
import { en } from "../../locales/en";
import { fr } from "../../locales/fr";
import type { AppLocale } from "../../types/i18n";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
} as const;

const i18n = createInstance();

export const normalizeLocale = (value?: string | null): AppLocale => {
  if (!value) {
    return FALLBACK_LOCALE;
  }

  if (value.startsWith("ar")) {
    return "ar";
  }

  if (value.startsWith("fr")) {
    return "fr";
  }

  return "en";
};

export const getDeviceLocale = (): AppLocale => {
  const locale = Localization.getLocales()[0];
  return normalizeLocale(locale?.languageTag ?? locale?.languageCode);
};

export const isLocaleRTL = (locale: AppLocale) => RTL_LANGUAGES.includes(locale);

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  fallbackLng: FALLBACK_LOCALE,
  interpolation: {
    escapeValue: false,
  },
  resources,
  lng: getDeviceLocale(),
  load: "languageOnly",
  nonExplicitSupportedLngs: true,
  react: {
    useSuspense: false,
  },
  returnNull: false,
  supportedLngs: SUPPORTED_LOCALES,
});

export default i18n;
