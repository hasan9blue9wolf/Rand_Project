import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, spacing } from "../../theme";
import { AppText } from "./app-text";

type DetailRowProps = {
  label: string;
  value: string;
};

export const DetailRow = ({ label, value }: DetailRowProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
        gap: spacing.md,
      }}
    >
      <AppText color={colors.text.secondary} variant="bodySmall">
        {label}
      </AppText>
      <AppText
        align={isRTL ? "left" : "right"}
        color={colors.text.primary}
        style={{ flexShrink: 1, fontWeight: "600" }}
        variant="bodySmall"
      >
        {value}
      </AppText>
    </View>
  );
};
