import type { AppLocale } from "../types/i18n";

export type LocalizedValue<T> = {
  ar: T;
  en: T;
};

export const resolveLocalizedValue = <T>(
  language: AppLocale,
  value: LocalizedValue<T>,
): T => (language === "ar" ? value.ar : value.en);
