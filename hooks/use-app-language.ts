import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import i18n, { isLocaleRTL } from "../services/i18n";
import { useSettingsStore } from "../store/settings-store";
import type { AppLocale } from "../types/i18n";
import { syncRTLDirection } from "../utils/rtl";

export const useAppLanguage = () => {
  const { language, setLanguage } = useSettingsStore(
    useShallow((state) => ({
      language: state.language,
      setLanguage: state.setLanguage,
    })),
  );

  const changeLanguage = useCallback(
    async (nextLanguage: AppLocale) => {
      if (nextLanguage === language) {
        return;
      }

      await i18n.changeLanguage(nextLanguage);
      setLanguage(nextLanguage);
      await syncRTLDirection(nextLanguage);
    },
    [language, setLanguage],
  );

  return {
    changeLanguage,
    isRTL: isLocaleRTL(language),
    language,
  };
};
