import { Ionicons } from "@expo/vector-icons";
import { type PressableProps, View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, spacing } from "../../theme";
import { AppText } from "./app-text";
import { ScalePressable } from "./scale-pressable";

type ChipTone =
  | "primary"
  | "coral"
  | "navy"
  | "neutral"
  | "success"
  | "warning";
type ChipVariant = "soft" | "solid" | "outline";

type ChipProps = PressableProps & {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  selected?: boolean;
  tone?: ChipTone;
  variant?: ChipVariant;
};

const toneStyles: Record<
  ChipTone,
  {
    solidBackground: string;
    softBackground: string;
    softBorder: string;
    text: string;
  }
> = {
  coral: {
    solidBackground: colors.coral[500],
    softBackground: colors.coral[50],
    softBorder: colors.coral[100],
    text: colors.coral[600],
  },
  navy: {
    solidBackground: colors.navy[700],
    softBackground: "#EEF1F6",
    softBorder: colors.border.soft,
    text: colors.navy[700],
  },
  neutral: {
    solidBackground: colors.background.softBlue,
    softBackground: colors.background.subtle,
    softBorder: colors.border.soft,
    text: colors.text.primary,
  },
  primary: {
    solidBackground: colors.primary[500],
    softBackground: colors.primary[50],
    softBorder: colors.primary[100],
    text: colors.primary[600],
  },
  success: {
    solidBackground: colors.status.success,
    softBackground: "#EAF8F1",
    softBorder: "#C8EFD9",
    text: colors.status.success,
  },
  warning: {
    solidBackground: colors.status.warning,
    softBackground: "#FEF5E2",
    softBorder: "#F8DFAD",
    text: colors.status.warning,
  },
};

export const Chip = ({
  icon,
  label,
  onPress,
  selected = false,
  style,
  tone = "neutral",
  variant = "soft",
  ...rest
}: ChipProps) => {
  const { isRTL } = useAppLanguage();
  const toneStyle = toneStyles[tone];
  const isInteractive = Boolean(onPress);
  const resolvedStyle =
    typeof style === "function"
      ? style({ hovered: false, pressed: false })
      : style;

  const backgroundColor =
    variant === "solid" || selected
      ? toneStyle.solidBackground
      : variant === "outline"
        ? "transparent"
        : toneStyle.softBackground;
  const borderColor =
    variant === "solid" || selected
      ? "transparent"
      : variant === "outline"
        ? toneStyle.text
        : toneStyle.softBorder;
  const textColor =
    variant === "solid" || selected ? colors.text.inverse : toneStyle.text;

  return (
    <ScalePressable
      disabled={!isInteractive}
      feedback={isInteractive ? "selection" : "none"}
      onPress={onPress}
      scaleTo={0.985}
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor,
          borderColor,
          borderRadius: radius.round,
          borderWidth: 1,
          opacity: rest.disabled ? 0.55 : 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
        },
        resolvedStyle,
      ]}
      {...rest}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.xs,
        }}
      >
        {icon ? <Ionicons color={textColor} name={icon} size={16} /> : null}
        <AppText color={textColor} variant="caption">
          {label}
        </AppText>
      </View>
    </ScalePressable>
  );
};
