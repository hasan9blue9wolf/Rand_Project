import {
  formatCurrencyByLocale,
  formatCurrencyRangeByLocale,
  formatDateByLocale,
  formatDateRangeByLocale,
} from "../services/i18n/localization";
import type { AppLocale } from "../types/i18n";

export const formatCurrency = (
  value: number,
  locale: AppLocale = "en",
  options?: Parameters<typeof formatCurrencyByLocale>[2],
) => formatCurrencyByLocale(value, locale, options);

export const formatCurrencyRange = (
  minValue: number,
  maxValue: number,
  locale: AppLocale = "en",
  options?: Parameters<typeof formatCurrencyRangeByLocale>[3],
) => formatCurrencyRangeByLocale(minValue, maxValue, locale, options);

export const formatDate = (
  value: Parameters<typeof formatDateByLocale>[0],
  locale: AppLocale = "en",
  options?: Intl.DateTimeFormatOptions,
) => formatDateByLocale(value, locale, options);

export const formatDateRange = (
  startValue: Parameters<typeof formatDateRangeByLocale>[0],
  endValue: Parameters<typeof formatDateRangeByLocale>[1],
  locale: AppLocale = "en",
  options?: Intl.DateTimeFormatOptions,
) => formatDateRangeByLocale(startValue, endValue, locale, options);
