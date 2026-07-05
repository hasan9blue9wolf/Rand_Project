import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, type PressableProps, View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";
import { ScalePressable } from "./scale-pressable";

type ButtonTone = "primary" | "coral" | "navy";

type PrimaryButtonProps = PressableProps & {
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  loading?: boolean;
  tone?: ButtonTone;
};

const gradientByTone: Record<ButtonTone, readonly [string, string]> = {
  coral: colors.gradients.coral,
  navy: colors.gradients.navy,
  primary: colors.gradients.primary,
};

export const PrimaryButton = ({
  disabled,
  fullWidth = true,
  icon,
  label,
  loading = false,
  style,
  tone = "primary",
  ...rest
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;
  const { isRTL } = useAppLanguage();
  const resolvedStyle =
    typeof style === "function"
      ? style({ hovered: false, pressed: false })
      : style;

  return (
    <ScalePressable
      accessibilityRole="button"
      disabled={isDisabled}
      scaleTo={0.985}
      style={[
        {
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        resolvedStyle,
      ]}
      {...rest}
    >
      <LinearGradient
        colors={gradientByTone[tone]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
          shadows.premium,
          {
            alignItems: "center",
            borderColor: "rgba(255,255,255,0.18)",
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
          <ActivityIndicator color={colors.text.inverse} />
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
              <Ionicons color={colors.text.inverse} name={icon} size={18} />
            ) : null}
            <AppText align="center" color={colors.text.inverse} variant="label">
              {label}
            </AppText>
          </View>
        )}
      </LinearGradient>
    </ScalePressable>
  );
};
