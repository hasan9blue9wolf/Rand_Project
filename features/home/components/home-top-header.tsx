import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { Avatar } from "../../../components/ui/avatar";
import { BrandLogo } from "../../../components/ui/brand-logo";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../../theme";

type HomeTopHeaderProps = {
  hasUnreadNotifications?: boolean;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  profileAvatarUri: string;
};

export const HomeTopHeader = memo(function HomeTopHeader({
  hasUnreadNotifications = false,
  onNotificationsPress,
  onProfilePress,
  profileAvatarUri,
}: HomeTopHeaderProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.xs,
        }}
      >
        <BrandLogo mode="icon" size={36} />
        <AppText
          color={colors.primary[500]}
          numberOfLines={1}
          style={{
            flexShrink: 1,
            fontSize: 26,
            fontWeight: "800",
            letterSpacing: isRTL ? 0 : -0.8,
          }}
          variant="title"
        >
          {t("common.appName")}
        </AppText>
      </View>

      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.sm,
        }}
      >
        <ScalePressable
          accessibilityLabel={t("common.notifications")}
          accessibilityRole="button"
          contentStyle={{
            borderRadius: radius.round,
          }}
          onPress={onNotificationsPress}
          style={{ borderRadius: radius.round }}
        >
          <View
            style={[
              shadows.card,
              {
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderColor: colors.border.soft,
                borderRadius: radius.round,
                borderWidth: 1,
                height: 42,
                justifyContent: "center",
                width: 42,
              },
            ]}
          >
            <Ionicons
              color={colors.text.secondary}
              name="notifications-outline"
              size={22}
            />
            {hasUnreadNotifications ? (
              <View
                style={{
                  backgroundColor: colors.coral[500],
                  borderColor: colors.surface.base,
                  borderRadius: radius.round,
                  borderWidth: 2,
                  height: 10,
                  position: "absolute",
                  top: -1,
                  width: 10,
                  ...(isRTL ? { left: 0 } : { right: 0 }),
                }}
              />
            ) : null}
          </View>
        </ScalePressable>

        <ScalePressable
          accessibilityLabel={t("tabs.profile")}
          accessibilityRole="button"
          contentStyle={{ borderRadius: radius.round }}
          onPress={onProfilePress}
          scaleTo={0.96}
          style={{ borderRadius: radius.round }}
        >
          <View
            style={{
              backgroundColor: colors.surface.base,
              borderColor: "rgba(255,255,255,0.8)",
              borderRadius: radius.round,
              borderWidth: 2,
            }}
          >
            <Avatar size={38} uri={profileAvatarUri} />
          </View>
        </ScalePressable>
      </View>
    </View>
  );
});
