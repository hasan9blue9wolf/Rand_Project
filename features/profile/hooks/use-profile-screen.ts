import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { queryKeys } from "../../../constants/query-keys";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { useSettingsStore } from "../../../store/settings-store";
import type { AppLocale } from "../../../types/i18n";
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
  const [busyLocale, setBusyLocale] = useState<AppLocale | null>(null);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const memberSince = t("profile.memberSince", {
    year: formatDate(screenData.memberSince, { year: "numeric" }),
  });

  const handleLanguageChange = useCallback(
    async (nextLanguage: AppLocale) => {
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

  const handlePickProfilePhoto = useCallback(async () => {
    setIsPickingPhoto(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.82,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      await upsertCurrentUserProfile({
        avatarUrl: result.assets[0].uri,
      });
      await profileQuery.refetch();
    } finally {
      setIsPickingPhoto(false);
    }
  }, [profileQuery]);

  return {
    busyLocale,
    handleLanguageChange,
    handlePickProfilePhoto,
    isRTL,
    isPickingPhoto,
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
