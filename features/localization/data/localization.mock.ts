import type { LocalizationScreenData } from "../types";

export const localizationScreenMock: LocalizationScreenData = {
  currentLocale: "en",
  locales: [
    {
      currencyExample: "$2,540",
      dateExample: "Mar 22",
      locale: "en",
      nativeLabel: "English",
    },
    {
      currencyExample: "‏٢٬٥٤٠ US$",
      dateExample: "٢٢ مارس",
      locale: "ar",
      nativeLabel: "العربية",
    },
  ],
  subtitle: "Formatting, locale preferences, and RTL-aware options are isolated in the localization module.",
  title: "Localization",
};
