import { Switch, View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, spacing } from "../../theme";
import { AppText } from "./app-text";

type SettingsRowProps = {
  description?: string;
  disabled?: boolean;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export const SettingsRow = ({
  description,
  disabled = false,
  onValueChange,
  title,
  value,
}: SettingsRowProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: spacing.md,
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <AppText color={colors.text.primary} variant="label">
          {title}
        </AppText>
        {description ? (
          <AppText variant="bodySmall">{description}</AppText>
        ) : null}
      </View>
      <Switch
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor={value ? colors.text.inverse : "#ffffff"}
        trackColor={{ false: colors.border.soft, true: colors.primary[500] }}
        value={value}
      />
    </View>
  );
};
