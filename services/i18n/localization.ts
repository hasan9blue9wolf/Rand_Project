import { FALLBACK_LOCALE } from "../../constants/app";
import type { AppLocale } from "../../types/i18n";

type DateInput = Date | number | string;

type CurrencyFormatOptions = {
  currency?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

type LocaleConfig = {
  currency: string;
  tag: string;
};

const localeConfig: Record<AppLocale, LocaleConfig> = {
  ar: {
    currency: "USD",
    tag: "ar",
  },
  en: {
    currency: "USD",
    tag: "en-US",
  },
  fr: {
    currency: "USD",
    tag: "fr-FR",
  },
};

const resolveDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

export const getLocaleConfig = (locale: AppLocale = FALLBACK_LOCALE) =>
  localeConfig[locale] ?? localeConfig[FALLBACK_LOCALE];

export const getLocaleTag = (locale: AppLocale = FALLBACK_LOCALE) =>
  getLocaleConfig(locale).tag;

export const getLocaleCurrency = (locale: AppLocale = FALLBACK_LOCALE) =>
  getLocaleConfig(locale).currency;

export const formatCurrencyByLocale = (
  value: number,
  locale: AppLocale = FALLBACK_LOCALE,
  options: CurrencyFormatOptions = {},
) =>
  new Intl.NumberFormat(getLocaleTag(locale), {
    currency: options.currency ?? getLocaleCurrency(locale),
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    style: "currency",
  }).format(value);

export const formatCurrencyRangeByLocale = (
  minValue: number,
  maxValue: number,
  locale: AppLocale = FALLBACK_LOCALE,
  options: CurrencyFormatOptions = {},
) =>
  [
    formatCurrencyByLocale(minValue, locale, options),
    formatCurrencyByLocale(maxValue, locale, options),
  ].join(" - ");

export const formatDateByLocale = (
  value: DateInput,
  locale: AppLocale = FALLBACK_LOCALE,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  },
) => new Intl.DateTimeFormat(getLocaleTag(locale), options).format(resolveDate(value));

export const formatDateRangeByLocale = (
  startValue: DateInput,
  endValue: DateInput,
  locale: AppLocale = FALLBACK_LOCALE,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  },
) => {
  const startDate = resolveDate(startValue);
  const endDate = resolveDate(endValue);
  const formatter = new Intl.DateTimeFormat(getLocaleTag(locale), options);

  if (typeof formatter.formatRange === "function") {
    return formatter.formatRange(startDate, endDate);
  }

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
};
