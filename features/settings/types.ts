import type { AppLocale } from "../../types/i18n";

export type SettingsShortcutId = "profile" | "savedDestinations";

export type SettingsScreenData = {
  availableLanguages: AppLocale[];
  shortcutIds: SettingsShortcutId[];
};
