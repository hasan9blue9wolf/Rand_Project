import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, radius, spacing } from "../../../theme";

type BookingFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  isPlaceholder?: boolean;
  label: string;
  onPress?: () => void;
  value: string;
};

export const BookingField = ({
  icon,
  isPlaceholder = false,
  label,
  onPress,
  value,
}: BookingFieldProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <ScalePressable
      accessibilityRole="button"
      contentStyle={{
        backgroundColor: colors.surface.muted,
        borderColor: "rgba(223, 232, 242, 0.88)",
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.xs,
        minHeight: 92,
        padding: spacing.md,
      }}
      onPress={onPress}
      scaleTo={0.985}
      style={{ flex: 1 }}
    >
      <AppText
        color={colors.text.secondary}
        style={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: isRTL ? 0 : 0.4,
        }}
        variant="caption"
      >
        {label}
      </AppText>

      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.xs,
          minWidth: 0,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.background.softBlue,
            borderRadius: radius.round,
            height: 32,
            justifyContent: "center",
            width: 32,
          }}
        >
          <Ionicons color={colors.primary[500]} name={icon} size={16} />
        </View>
        <AppText
          color={isPlaceholder ? colors.text.muted : colors.text.primary}
          numberOfLines={1}
          style={{ flex: 1, fontSize: 17, fontWeight: "700" }}
          variant="bodyStrong"
        >
          {value}
        </AppText>
      </View>
    </ScalePressable>
  );
};
