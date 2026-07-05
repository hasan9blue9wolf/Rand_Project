import { router } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { SettingsRow } from "../../../components/ui/settings-row";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, radius, spacing } from "../../../theme";
import { useSettingsScreen } from "../hooks/use-settings-screen";

const permissionTone = {
  denied: colors.coral[600],
  granted: colors.status.success,
  undetermined: colors.text.blue,
  unknown: colors.text.secondary,
} as const;

export const SettingsScreen = () => {
  const {
    busyLocale,
    busyNotifications,
    canAskAgain,
    handleLanguageChange,
    handleNotificationPreferenceChange,
    handleNotificationsToggle,
    handleOpenSystemSettings,
    isRTL,
    language,
    notificationPermissionStatus,
    notificationPreferenceItems,
    notificationsEnabled,
    pushPreparation,
    scheduledPreviewItems,
    scheduledSummary,
    scheduledSummaryCount,
    scheduledSummaryEmpty,
    shortcutIds,
    supportsLocalNotifications,
    t,
  } = useSettingsScreen();
  const launchCopy =
    language === "ar"
      ? {
          helpBody:
            "افتح شاشة دعم مخصصة للمساعدة السريعة وروابط مراجعة حالات التطبيق قبل الإطلاق.",
          helpCta: "المساعدة والدعم",
          helpTitle: "الدعم والإطلاق",
          languageCta: "فتح شاشة اختيار اللغة",
        }
      : language === "fr"
        ? {
            helpBody:
              "Ouvrez un guide pratique pour revoir la recherche, la réservation, Haya, les favoris et les notifications.",
            helpCta: "Aide et guide",
            helpTitle: "Guide de prise en main",
            languageCta: "Ouvrir le choix de langue",
          }
        : {
          helpBody:
            "Open a dedicated support screen for quick help and launch-state review links.",
          helpCta: "Help and support",
          helpTitle: "Support and launch",
          languageCta: "Open language selector",
        };
  const preferenceControlsDisabled =
    busyNotifications ||
    !supportsLocalNotifications ||
    !notificationsEnabled ||
    notificationPermissionStatus !== "granted";
  const shouldShowPermissionButton =
    supportsLocalNotifications && notificationPermissionStatus !== "granted";
  const permissionButtonLabel = canAskAgain
    ? t("settingsScreen.enableNotifications")
    : t("settingsScreen.openSystemSettings");

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.profile)}
        />
      }
      subtitle={t("settingsScreen.subtitle")}
      title={t("common.settings")}
      withBottomTabSpacing={false}
    >
      <AppCard>
        <AppText variant="title">{t("settingsScreen.languageTitle")}</AppText>
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
          <SecondaryButton
            label={launchCopy.languageCta}
            onPress={() => router.push(appRoutes.languageSelector)}
            tone="navy"
          />
        </View>
      </AppCard>

      <AppCard elevated>
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="title">
              {t("settingsScreen.notificationsTitle")}
            </AppText>
            <AppText>{t("settingsScreen.notificationsBody")}</AppText>
          </View>

          <View
            style={{
              alignItems: "center",
              alignSelf: isRTL ? "flex-end" : "flex-start",
              backgroundColor: colors.background.softBlue,
              borderRadius: radius.round,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            }}
          >
            <AppText
              color={permissionTone[notificationPermissionStatus]}
              variant="label"
            >
              {t("settingsScreen.permissionStatusLabel", {
                status: t(
                  `settingsScreen.notificationStatus.${notificationPermissionStatus}`,
                ),
              })}
            </AppText>
          </View>

          <SettingsRow
            description={t("settingsScreen.notificationsHelp")}
            disabled={busyNotifications || !supportsLocalNotifications}
            onValueChange={handleNotificationsToggle}
            title={t("settingsScreen.notificationsSwitchTitle")}
            value={notificationsEnabled}
          />

          <AppText variant="bodySmall">
            {!supportsLocalNotifications
              ? t("settingsScreen.notificationsUnsupported")
              : notificationPermissionStatus === "granted"
                ? scheduledSummary
                : t("settingsScreen.notificationsPermissionBody")}
          </AppText>

          {shouldShowPermissionButton ? (
            canAskAgain ? (
              <PrimaryButton
                label={permissionButtonLabel}
                loading={busyNotifications}
                onPress={() => handleNotificationsToggle(true)}
                tone="navy"
              />
            ) : (
              <SecondaryButton
                label={permissionButtonLabel}
                onPress={handleOpenSystemSettings}
                tone="navy"
              />
            )
          ) : null}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">
            {t("settingsScreen.preferencesTitle")}
          </AppText>
          <AppText>{t("settingsScreen.preferencesBody")}</AppText>
        </View>

        <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
          {notificationPreferenceItems.map((item) => (
            <SettingsRow
              key={item.id}
              description={item.description}
              disabled={preferenceControlsDisabled}
              onValueChange={(value) =>
                handleNotificationPreferenceChange(item.id, value)
              }
              title={item.title}
              value={item.value}
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">{t("settingsScreen.scheduleTitle")}</AppText>
          <AppText>{t("settingsScreen.scheduleBody")}</AppText>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <AppText color={colors.text.blue} variant="label">
            {scheduledSummary}
          </AppText>
        </View>

        {scheduledSummaryEmpty ? (
          <View style={{ marginTop: spacing.md }}>
            <AppText variant="bodySmall">
              {scheduledSummaryCount === 0 &&
              notificationPermissionStatus === "granted"
                ? t("settingsScreen.scheduleEmpty")
                : t("settingsScreen.schedulePending")}
            </AppText>
          </View>
        ) : (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {scheduledPreviewItems.map((item) => (
              <View
                key={item.id}
                style={{
                  borderColor: colors.border.soft,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  gap: spacing.xxs,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <AppText color={colors.text.primary} variant="label">
                  {item.title}
                </AppText>
                <AppText color={colors.text.secondary} variant="bodySmall">
                  {item.kindLabel}
                </AppText>
                <AppText color={colors.text.muted} variant="caption">
                  {item.dateLabel}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </AppCard>

      <AppCard>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">
            {t("settingsScreen.futurePushTitle")}
          </AppText>
          <AppText>{t("settingsScreen.futurePushBody")}</AppText>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          <AppText
            color={
              pushPreparation.hasExpoProjectId
                ? colors.status.success
                : colors.text.secondary
            }
            variant="label"
          >
            {pushPreparation.hasExpoProjectId
              ? t("settingsScreen.futurePushReady")
              : t("settingsScreen.futurePushPending")}
          </AppText>
          <AppText variant="bodySmall">
            {t("settingsScreen.futurePushStrategy")}
          </AppText>
          {pushPreparation.projectId ? (
            <AppText variant="caption">
              {t("settingsScreen.futurePushProjectId", {
                projectId: pushPreparation.projectId,
              })}
            </AppText>
          ) : null}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">{launchCopy.helpTitle}</AppText>
          <AppText>{launchCopy.helpBody}</AppText>
        </View>
        <View style={{ marginTop: spacing.md }}>
          <SecondaryButton
            label={launchCopy.helpCta}
            onPress={() => router.push(appRoutes.helpSupport)}
            tone="coral"
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">
          {t("settingsScreen.travelToolsTitle")}
        </AppText>
        <AppText>{t("settingsScreen.travelToolsBody")}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {shortcutIds.includes("savedDestinations") ? (
            <SecondaryButton
              label={t("common.savedDestinations")}
              onPress={() => router.push(appRoutes.savedDestinations)}
              tone="navy"
            />
          ) : null}
          {shortcutIds.includes("profile") ? (
            <SecondaryButton
              label={t("tabs.profile")}
              onPress={() => router.push(appRoutes.profile)}
              tone="primary"
            />
          ) : null}
        </View>
      </AppCard>
    </ScreenContainer>
  );
};
