import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, spacing } from "../../theme";
import { AppText } from "./app-text";
import { ScalePressable } from "./scale-pressable";

type SectionHeaderProps = {
  actionLabel?: string;
  onPress?: () => void;
  title: string;
};

export const SectionHeader = ({
  actionLabel,
  onPress,
  title,
}: SectionHeaderProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: spacing.sm,
        justifyContent: "space-between",
      }}
    >
      <AppText variant="title">{title}</AppText>
      {actionLabel && onPress ? (
        <ScalePressable onPress={onPress} scaleTo={0.97}>
          <AppText color={colors.primary[600]} variant="label">
            {actionLabel}
          </AppText>
        </ScalePressable>
      ) : null}
    </View>
  );
};
