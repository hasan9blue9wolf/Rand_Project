import { useTranslation } from "react-i18next";

import {
  formatCurrencyByLocale,
  formatCurrencyRangeByLocale,
  formatDateByLocale,
  formatDateRangeByLocale,
  getLocaleCurrency,
  getLocaleTag,
} from "../services/i18n/localization";
import { useAppLanguage } from "./use-app-language";

export const useLocalization = () => {
  const translation = useTranslation();
  const languageState = useAppLanguage();
  const { language } = languageState;

  return {
    ...translation,
    ...languageState,
    currency: getLocaleCurrency(language),
    formatCurrency: (value: number, options?: Parameters<typeof formatCurrencyByLocale>[2]) =>
      formatCurrencyByLocale(value, language, options),
    formatCurrencyRange: (
      minValue: number,
      maxValue: number,
      options?: Parameters<typeof formatCurrencyRangeByLocale>[3],
    ) => formatCurrencyRangeByLocale(minValue, maxValue, language, options),
    formatDate: (value: Parameters<typeof formatDateByLocale>[0], options?: Intl.DateTimeFormatOptions) =>
      formatDateByLocale(value, language, options),
    formatDateRange: (
      startValue: Parameters<typeof formatDateRangeByLocale>[0],
      endValue: Parameters<typeof formatDateRangeByLocale>[1],
      options?: Intl.DateTimeFormatOptions,
    ) => formatDateRangeByLocale(startValue, endValue, language, options),
    localeTag: getLocaleTag(language),
  };
};
