import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { queryKeys } from "../../../constants/query-keys";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { useSettingsStore } from "../../../store/settings-store";
import { profileScreenMock } from "../data/profile.mock";
import {
  getProfileScreenData,
  upsertCurrentUserProfile,
} from "../services/profile.service";

export const useProfileScreen = () => {
  const userId = useAuthStore(selectActiveUserId);
  const profileQuery = useQuery({
    placeholderData: profileScreenMock,
    queryKey: [
      queryKeys.profile[0],
      queryKeys.profile[1],
      userId ?? "anonymous",
    ],
    queryFn: getProfileScreenData,
  });
  const screenData = profileQuery.data ?? profileScreenMock;
  const { formatDate, t } = useLocalization();
  const { changeLanguage, isRTL, language } = useAppLanguage();
  const { notificationsEnabled, toggleNotifications } = useSettingsStore(
    useShallow((state) => ({
      notificationsEnabled: state.notificationsEnabled,
      toggleNotifications: state.toggleNotifications,
    })),
  );
  const [busyLocale, setBusyLocale] = useState<"en" | "ar" | null>(null);
  const memberSince = t("profile.memberSince", {
    year: formatDate(screenData.memberSince, { year: "numeric" }),
  });

  const handleLanguageChange = useCallback(
    async (nextLanguage: "en" | "ar") => {
      setBusyLocale(nextLanguage);
      try {
        await changeLanguage(nextLanguage);
        if (userId) {
          await upsertCurrentUserProfile({
            preferredLocale: nextLanguage,
          });
          await profileQuery.refetch();
        }
      } finally {
        setBusyLocale(null);
      }
    },
    [changeLanguage, profileQuery, userId],
  );

  return {
    busyLocale,
    handleLanguageChange,
    isRTL,
    language,
    memberSince,
    notificationsEnabled,
    profile: screenData.profile,
    profileQuery,
    quickActionIds: screenData.quickActionIds,
    travelPreferences: screenData.travelPreferences,
    toggleNotifications,
  };
};
