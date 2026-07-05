import i18n from "../../services/i18n";
import { useSettingsStore } from "../../store/settings-store";
import type { AppLocale } from "../../types/i18n";

export const setTestLocale = async (language: AppLocale = "en") => {
  useSettingsStore.setState({ language });
  await i18n.changeLanguage(language);
};
