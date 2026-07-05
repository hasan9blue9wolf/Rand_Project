import type { ReactNode } from "react";
import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, spacing } from "../../theme";
import { AppText } from "./app-text";

type AppHeaderProps = {
  eyebrow?: string | undefined;
  leading?: ReactNode | undefined;
  subtitle?: string | undefined;
  title: string;
  trailing?: ReactNode | undefined;
};

export const AppHeader = ({
  eyebrow,
  leading,
  subtitle,
  title,
  trailing,
}: AppHeaderProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        alignItems: "flex-start",
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: spacing.md,
        justifyContent: "space-between",
      }}
    >
      {leading}
      <View
        style={{
          alignItems: isRTL ? "flex-end" : "flex-start",
          flex: 1,
          gap: spacing.xs,
        }}
      >
        {eyebrow ? (
          <View
            style={{
              alignSelf: isRTL ? "flex-end" : "flex-start",
              backgroundColor: colors.background.softBlue,
              borderRadius: radius.round,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xxs + 1,
            }}
          >
            <AppText color={colors.primary[600]} variant="caption">
              {eyebrow}
            </AppText>
          </View>
        ) : null}
        <View
          style={{
            alignItems: isRTL ? "flex-end" : "flex-start",
            gap: spacing.xs,
          }}
        >
          <AppText variant="headline">{title}</AppText>
          {subtitle ? <AppText variant="bodySmall">{subtitle}</AppText> : null}
        </View>
      </View>
      {trailing}
    </View>
  );
};
