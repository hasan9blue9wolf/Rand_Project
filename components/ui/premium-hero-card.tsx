import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";

type PremiumHeroMetric = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

type PremiumHeroCardProps = {
  accent?: readonly [string, string];
  badge?: string;
  children?: ReactNode;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  metrics?: PremiumHeroMetric[];
  title: string;
};

export const PremiumHeroCard = ({
  accent = colors.gradients.navy,
  badge,
  children,
  description,
  icon = "sparkles",
  metrics,
  title,
}: PremiumHeroCardProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <LinearGradient
      colors={accent}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[
        shadows.premium,
        {
          borderRadius: radius.xl,
          gap: spacing.lg,
          overflow: "hidden",
          padding: spacing.xl,
        },
      ]}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: radius.xl,
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <View
        style={{
          alignItems: "flex-start",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.md,
          justifyContent: "space-between",
        }}
      >
        {badge ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderColor: "rgba(255,255,255,0.2)",
              borderRadius: radius.round,
              borderWidth: 1,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            }}
          >
            <AppText color={colors.text.inverse} variant="caption">
              {badge}
            </AppText>
          </View>
        ) : (
          <View />
        )}

        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.14)",
            borderRadius: radius.round,
            height: 48,
            justifyContent: "center",
            width: 48,
          }}
        >
          <Ionicons color={colors.text.inverse} name={icon} size={22} />
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText color={colors.text.inverse} variant="headline">
          {title}
        </AppText>
        <AppText color="rgba(255,255,255,0.84)">{description}</AppText>
      </View>

      {metrics?.length ? (
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: spacing.sm,
          }}
        >
          {metrics.map((metric) => (
            <View
              key={`${metric.icon}-${metric.label}`}
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.16)",
                borderRadius: radius.round,
                borderWidth: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Ionicons color={colors.text.inverse} name={metric.icon} size={16} />
              <AppText color={colors.text.inverse} variant="caption">
                {metric.label}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {children}
    </LinearGradient>
  );
};
