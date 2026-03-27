import { SUPPORTED_LOCALES } from "../../../constants/app";
import { getDeviceLocale } from "../../../services/i18n";
import {
  formatCurrencyByLocale,
  formatDateByLocale,
} from "../../../services/i18n/localization";
import type { AppLocale } from "../../../types/i18n";
import type { LocalePreview,LocalizationScreenData } from "../types";

const localeLabels: Record<AppLocale, string> = {
  ar: "العربية",
  en: "English",
};

const buildLocalePreview = (locale: AppLocale): LocalePreview => ({
  currencyExample: formatCurrencyByLocale(2540, locale),
  dateExample: formatDateByLocale("2026-03-22", locale),
  locale,
  nativeLabel: localeLabels[locale],
});

export const getLocalizationScreenData = async (): Promise<LocalizationScreenData> => ({
  currentLocale: getDeviceLocale(),
  locales: SUPPORTED_LOCALES.map(buildLocalePreview),
  subtitle: "Formatting, locale preferences, and RTL-aware options are isolated in the localization module.",
  title: "Localization",
});
