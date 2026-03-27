import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Platform, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, radius, spacing } from "../../../theme";
import { useNotificationsScreen } from "../hooks/use-notifications-screen";
import type { NotificationItem } from "../types";

export const NotificationsScreen = () => {
  const { isRTL, t } = useLocalization();
  const {
    allRead,
    items,
    markAllRead,
    notificationsQuery,
  } = useNotificationsScreen();
  const isInitialLoading =
    notificationsQuery.isLoading && !notificationsQuery.data;
  const handleBackPress = useCallback(
    () => navigateBackOr(appRoutes.home),
    [],
  );
  const handleSettingsPress = useCallback(
    () => router.push(appRoutes.settings),
    [],
  );
  const renderNotification = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <AppCard key={item.id}>
        <View
          style={{
            alignItems: "flex-start",
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.md,
          }}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.background.softBlue,
              borderRadius: radius.round,
              height: 46,
              justifyContent: "center",
              width: 46,
            }}
          >
            <Ionicons
              color={colors.primary[500]}
              name={item.icon}
              size={22}
            />
          </View>
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <AppText color={colors.text.primary} variant="label">
              {t(item.titleKey)}
            </AppText>
            <AppText>{t(item.bodyKey)}</AppText>
            <AppText color={colors.text.muted} variant="caption">
              {allRead ? t("common.enabled") : t(item.timeKey)}
            </AppText>
          </View>
        </View>
      </AppCard>
    ),
    [allRead, isRTL, t],
  );
  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);
  const listHeader = useMemo(
    () => (
      <SecondaryButton
        fullWidth={false}
        label={t("notificationsScreen.markAllRead")}
        onPress={markAllRead}
        tone="navy"
      />
    ),
    [markAllRead, t],
  );

  if (isInitialLoading) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={handleBackPress}
          />
        }
        scrollable={false}
        subtitle={t("notificationsScreen.subtitle")}
        title={t("common.notifications")}
        trailing={
          <HeaderIconButton
            accessibilityLabel={t("common.settings")}
            icon="settings-outline"
            onPress={handleSettingsPress}
          />
        }
        withBottomTabSpacing={false}
      >
        <LoadingState label={t("common.notifications")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={handleBackPress}
        />
      }
      scrollable={false}
      subtitle={t("notificationsScreen.subtitle")}
      title={t("common.notifications")}
      trailing={
        <HeaderIconButton
          accessibilityLabel={t("common.settings")}
          icon="settings-outline"
          onPress={handleSettingsPress}
        />
      }
      withBottomTabSpacing={false}
    >
      {notificationsQuery.isError && items.length === 0 ? (
        <EmptyState
          actionLabel={t("common.retry")}
          description={t("notificationsScreen.emptyBody")}
          onPress={() => {
            void notificationsQuery.refetch();
          }}
          title={t("common.retry")}
          tone="error"
        />
      ) : (
        <FlatList
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: spacing.section,
          }}
          data={items}
          initialNumToRender={6}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          keyExtractor={keyExtractor}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              description={t("notificationsScreen.emptyBody")}
              title={t("notificationsScreen.emptyTitle")}
              tone="premium"
            />
          }
          ListHeaderComponent={items.length > 0 ? listHeader : undefined}
          ListHeaderComponentStyle={{ marginBottom: spacing.lg }}
          maxToRenderPerBatch={6}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          updateCellsBatchingPeriod={16}
          windowSize={7}
        />
      )}
    </ScreenContainer>
  );
};
