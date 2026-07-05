import * as Updates from "expo-updates";
import { I18nManager } from "react-native";

import { isLocaleRTL } from "../services/i18n";
import type { AppLocale } from "../types/i18n";

export const syncRTLDirection = async (language: AppLocale) => {
  const rtl = isLocaleRTL(language);
  const shouldReload = I18nManager.isRTL !== rtl;

  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);

  if (shouldReload) {
    await Updates.reloadAsync();
  }
};
