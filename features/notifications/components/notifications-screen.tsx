import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Platform, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, radius, spacing } from "../../../theme";
import { useNotificationsScreen } from "../hooks/use-notifications-screen";
import type { InAppNotification } from "../types";

const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
};

export const NotificationsScreen = () => {
  const { isRTL, t } = useLocalization();
  const {
    clearAll,
    deleteNotification,
    getNotificationIcon,
    items,
    markAllRead,
    markRead,
    unreadCount,
  } = useNotificationsScreen();
  const handleBackPress = useCallback(
    () => navigateBackOr(appRoutes.home),
    [],
  );
  const handleSettingsPress = useCallback(
    () => router.push(appRoutes.settings),
    [],
  );
  const openNotification = useCallback(
    (item: InAppNotification) => {
      markRead(item.notificationId);

      if (item.relatedBookingId) {
        router.push(appRoutes.tripDetails(item.relatedBookingId));
        return;
      }

      if (item.relatedPackageId) {
        router.push(appRoutes.packageDetails(item.relatedPackageId));
        return;
      }

      if (item.relatedFlightId) {
        router.push(appRoutes.flightDetails(item.relatedFlightId));
      }
    },
    [markRead],
  );
  const renderNotification = useCallback(
    ({ item }: { item: InAppNotification }) => (
      <AppCard elevated={!item.isRead}>
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
              backgroundColor: item.isRead
                ? colors.surface.muted
                : colors.background.softBlue,
              borderRadius: radius.round,
              height: 46,
              justifyContent: "center",
              width: 46,
            }}
          >
            <Ionicons
              color={item.isRead ? colors.text.secondary : colors.primary[500]}
              name={getNotificationIcon(item.type)}
              size={22}
            />
          </View>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <View
              style={{
                alignItems: "center",
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.xs,
              }}
            >
              <AppText color={colors.text.primary} style={{ flex: 1 }} variant="label">
                {item.title}
              </AppText>
              {!item.isRead ? <Chip label="New" tone="primary" /> : null}
            </View>
            <AppText>{item.message}</AppText>
            <AppText color={colors.text.muted} variant="caption">
              {formatRelativeTime(item.createdAt)}
            </AppText>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                flexWrap: "wrap",
                gap: spacing.sm,
                marginTop: spacing.sm,
              }}
            >
              {(item.relatedBookingId ||
                item.relatedPackageId ||
                item.relatedFlightId) ? (
                <PrimaryButton
                  fullWidth={false}
                  label={item.actionLabel ?? t("common.viewDetails")}
                  onPress={() => openNotification(item)}
                />
              ) : null}
              {!item.isRead ? (
                <SecondaryButton
                  fullWidth={false}
                  label="Mark read"
                  onPress={() => markRead(item.notificationId)}
                  tone="navy"
                />
              ) : null}
              <SecondaryButton
                fullWidth={false}
                icon="trash-outline"
                label="Delete"
                onPress={() => deleteNotification(item.notificationId)}
                tone="coral"
              />
            </View>
          </View>
        </View>
      </AppCard>
    ),
    [
      deleteNotification,
      getNotificationIcon,
      isRTL,
      markRead,
      openNotification,
      t,
    ],
  );
  const keyExtractor = useCallback(
    (item: InAppNotification) => item.notificationId,
    [],
  );
  const listHeader = useMemo(
    () => (
      <AppCard>
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: spacing.xs }}>
            <Chip label={`${unreadCount} unread`} tone="primary" />
            <Chip label={`${items.length} total`} tone="navy" />
          </View>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: spacing.sm }}>
            <SecondaryButton
              fullWidth={false}
              label={t("notificationsScreen.markAllRead")}
              onPress={markAllRead}
              tone="navy"
            />
            <SecondaryButton
              fullWidth={false}
              icon="trash-outline"
              label="Clear all"
              onPress={clearAll}
              tone="coral"
            />
          </View>
        </View>
      </AppCard>
    ),
    [clearAll, isRTL, items.length, markAllRead, t, unreadCount],
  );

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
      <FlatList
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: spacing.section,
        }}
        data={items}
        initialNumToRender={8}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        keyExtractor={keyExtractor}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            description={t("notificationsScreen.emptyBody")}
            icon="notifications-outline"
            title={t("notificationsScreen.emptyTitle")}
            tone="premium"
          />
        }
        ListHeaderComponent={items.length > 0 ? listHeader : undefined}
        ListHeaderComponentStyle={{ marginBottom: spacing.lg }}
        maxToRenderPerBatch={8}
        removeClippedSubviews={Platform.OS === "android"}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        updateCellsBatchingPeriod={16}
        windowSize={7}
      />
    </ScreenContainer>
  );
};
