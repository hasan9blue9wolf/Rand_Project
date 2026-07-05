import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Avatar } from "../../../components/ui/avatar";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { SettingsRow } from "../../../components/ui/settings-row";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { colors, radius, shadows, spacing } from "../../../theme";
import { useProfileScreen } from "../hooks/use-profile-screen";

export const ProfileScreen = () => {
  const { t } = useLocalization();
  const {
    busyLocale,
    handleLanguageChange,
    handlePickProfilePhoto,
    isRTL,
    isPickingPhoto,
    language,
    memberSince,
    notificationsEnabled,
    profile,
    quickActionIds,
    toggleNotifications,
  } = useProfileScreen();

  return (
    <ScreenContainer
      subtitle={t("profile.subtitle")}
      title={t("profile.title")}
      trailing={
        <Avatar
          label={profile?.fullName ?? t("common.appName")}
          tone="navy"
          {...(profile?.avatarUrl ? { uri: profile.avatarUrl } : {})}
        />
      }
    >
      <LinearGradient
        colors={colors.gradients.navy}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
          shadows.premium,
          {
            borderRadius: radius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.md,
          }}
        >
          <Avatar
            bordered
            label={profile?.fullName ?? t("common.appName")}
            size={64}
            tone="navy"
            {...(profile?.avatarUrl ? { uri: profile.avatarUrl } : {})}
          />
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <AppText color={colors.text.inverse} variant="title">
              {profile?.fullName ?? t("profile.membershipTitle")}
            </AppText>
            <AppText color="rgba(255,255,255,0.82)">
              {profile?.email ?? t("profile.premiumTier")}
            </AppText>
            <AppText color="rgba(255,255,255,0.7)">{memberSince}</AppText>
          </View>
          <Ionicons color={colors.coral[500]} name="sparkles" size={22} />
        </View>
        <View style={{ marginTop: spacing.md }}>
          <SecondaryButton
            icon="image-outline"
            label={t("profile.photoCta")}
            loading={isPickingPhoto}
            onPress={() => void handlePickProfilePhoto()}
            tone="primary"
          />
        </View>
      </LinearGradient>

      <AppCard>
        <AppText variant="title">{t("common.language")}</AppText>
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.md,
            marginTop: spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            {language === "en" ? (
              <PrimaryButton
                label={t("common.english")}
                loading={busyLocale === "en"}
                onPress={() => handleLanguageChange("en")}
              />
            ) : (
              <SecondaryButton
                label={t("common.english")}
                loading={busyLocale === "en"}
                onPress={() => handleLanguageChange("en")}
                tone="primary"
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            {language === "ar" ? (
              <PrimaryButton
                label={t("common.arabic")}
                loading={busyLocale === "ar"}
                onPress={() => handleLanguageChange("ar")}
                tone="coral"
              />
            ) : (
              <SecondaryButton
                label={t("common.arabic")}
                loading={busyLocale === "ar"}
                onPress={() => handleLanguageChange("ar")}
                tone="coral"
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            {language === "fr" ? (
              <PrimaryButton
                label={t("common.french")}
                loading={busyLocale === "fr"}
                onPress={() => handleLanguageChange("fr")}
              />
            ) : (
              <SecondaryButton
                label={t("common.french")}
                loading={busyLocale === "fr"}
                onPress={() => handleLanguageChange("fr")}
                tone="primary"
              />
            )}
          </View>
        </View>
        <View style={{ marginTop: spacing.md }}>
          <AppText>{t("profile.rtlNote")}</AppText>
        </View>
      </AppCard>

      <AppCard>
        <SettingsRow
          description={t("profile.notificationsHelp")}
          onValueChange={() => toggleNotifications()}
          title={t("common.notifications")}
          value={notificationsEnabled}
        />
        <View style={{ marginTop: spacing.sm }}>
          <AppText variant="bodySmall">
            {notificationsEnabled ? t("common.enabled") : t("common.disabled")}
          </AppText>
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{t("profile.manageTravelTitle")}</AppText>
        <AppText>{t("profile.manageTravelBody")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {quickActionIds.includes("settings") ? (
            <SecondaryButton
              label={t("profile.settingsCta")}
              onPress={() => router.push(appRoutes.settings)}
              tone="navy"
            />
          ) : null}
          {quickActionIds.includes("savedDestinations") ? (
            <SecondaryButton
              label={t("profile.savedDestinationsCta")}
              onPress={() => router.push(appRoutes.savedDestinations)}
              tone="primary"
            />
          ) : null}
          {quickActionIds.includes("notifications") ? (
            <SecondaryButton
              label={t("profile.notificationsCta")}
              onPress={() => router.push(appRoutes.notifications)}
              tone="coral"
            />
          ) : null}
          <SecondaryButton
            label={t("helpGuidance.title")}
            onPress={() => router.push(appRoutes.helpSupport)}
            tone="navy"
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
};
