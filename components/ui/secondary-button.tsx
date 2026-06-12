import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, type PressableProps, View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";
import { ScalePressable } from "./scale-pressable";

type ButtonTone = "primary" | "coral" | "navy";

type SecondaryButtonProps = PressableProps & {
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  loading?: boolean;
  tone?: ButtonTone;
};

const toneStyles = {
  coral: {
    backgroundColor: colors.coral[50],
    borderColor: colors.coral[100],
    color: colors.coral[600],
  },
  navy: {
    backgroundColor: "#EEF2F8",
    borderColor: colors.border.soft,
    color: colors.navy[700],
  },
  primary: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
    color: colors.primary[600],
  },
} as const;

export const SecondaryButton = ({
  disabled,
  fullWidth = true,
  icon,
  label,
  loading = false,
  style,
  tone = "primary",
  ...rest
}: SecondaryButtonProps) => {
  const isDisabled = disabled || loading;
  const toneStyle = toneStyles[tone];
  const { isRTL } = useAppLanguage();
  const resolvedStyle =
    typeof style === "function"
      ? style({ hovered: false, pressed: false })
      : style;

  return (
    <ScalePressable
      accessibilityRole="button"
      disabled={isDisabled}
      scaleTo={0.987}
      style={[
        {
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        resolvedStyle,
      ]}
      {...rest}
    >
      <View
        style={[
          shadows.card,
          {
            alignItems: "center",
            backgroundColor: toneStyle.backgroundColor,
            borderColor: toneStyle.borderColor,
            borderRadius: radius.round,
            borderWidth: 1,
            flexDirection: "row",
            gap: spacing.xs,
            justifyContent: "center",
            minHeight: 58,
            overflow: "hidden",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={toneStyle.color} />
        ) : (
          <View
            style={{
              alignItems: "center",
              flexDirection: isRTL ? "row-reverse" : "row",
              gap: spacing.xs,
              justifyContent: "center",
            }}
          >
            {icon ? (
              <Ionicons color={toneStyle.color} name={icon} size={18} />
            ) : null}
            <AppText align="center" color={toneStyle.color} variant="label">
              {label}
            </AppText>
          </View>
        )}
      </View>
    </ScalePressable>
  );
};
