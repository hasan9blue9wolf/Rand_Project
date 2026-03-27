import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { AppCard } from "./app-card";
import { AppText } from "./app-text";
import { SecondaryButton } from "./secondary-button";

type EmptyStateTone = "default" | "error" | "premium";

type EmptyStateProps = {
  actionLabel?: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  title: string;
  tone?: EmptyStateTone;
};

const toneStyles: Record<
  EmptyStateTone,
  {
    buttonTone: "coral" | "navy" | "primary";
    iconColor: string;
    orbColors: readonly [string, string];
  }
> = {
  default: {
    buttonTone: "primary",
    iconColor: colors.primary[500],
    orbColors: ["#EFF4FF", "#F8FBFF"],
  },
  error: {
    buttonTone: "coral",
    iconColor: colors.coral[600],
    orbColors: ["#FFF1EB", "#FFF9F7"],
  },
  premium: {
    buttonTone: "navy",
    iconColor: colors.navy[700],
    orbColors: ["#EEF2F8", "#F8FBFF"],
  },
};

export const EmptyState = ({
  actionLabel,
  description,
  icon = "compass-outline",
  onPress,
  title,
  tone = "default",
}: EmptyStateProps) => {
  const toneStyle = toneStyles[tone];

  return (
    <AppCard
      elevated
      style={{
        alignItems: "center",
        gap: spacing.lg,
        paddingVertical: spacing.xxxl,
      }}
    >
      <LinearGradient
        colors={["rgba(15, 73, 189, 0.08)", "rgba(255, 127, 80, 0.02)"]}
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

      <LinearGradient
        colors={toneStyle.orbColors}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={{
          alignItems: "center",
          borderRadius: radius.round,
          height: 76,
          justifyContent: "center",
          width: 76,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: radius.round,
            height: 56,
            justifyContent: "center",
            width: 56,
          }}
        >
          <Ionicons color={toneStyle.iconColor} name={icon} size={24} />
        </View>
      </LinearGradient>

      <View style={{ alignItems: "center", gap: spacing.xs, maxWidth: 420 }}>
        <AppText align="center" variant="title">
          {title}
        </AppText>
        <AppText align="center" variant="bodySmall">
          {description}
        </AppText>
      </View>

      {actionLabel && onPress ? (
        <SecondaryButton
          fullWidth={false}
          label={actionLabel}
          onPress={onPress}
          tone={toneStyle.buttonTone}
        />
      ) : null}
    </AppCard>
  );
};
