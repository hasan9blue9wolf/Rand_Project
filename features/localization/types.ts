import type { AppLocale } from "../../types/i18n";

export type LocalePreview = {
  currencyExample: string;
  dateExample: string;
  locale: AppLocale;
  nativeLabel: string;
};

export type LocalizationScreenData = {
  currentLocale: AppLocale;
  locales: LocalePreview[];
  subtitle: string;
  title: string;
};
