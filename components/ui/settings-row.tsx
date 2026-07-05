import { Pressable, View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, spacing } from "../../theme";
import { AppText } from "./app-text";

const SWITCH_WIDTH = 42;
const SWITCH_HEIGHT = 24;
const SWITCH_PADDING = 3;
const SWITCH_THUMB_SIZE = SWITCH_HEIGHT - SWITCH_PADDING * 2;

type SettingsRowProps = {
  description?: string;
  disabled?: boolean;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const SettingsSwitch = ({
  disabled,
  isRTL,
  onValueChange,
  testID = "settings-row-switch",
  value,
}: {
  disabled: boolean;
  isRTL: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  value: boolean;
}) => {
  const thumbLeft = isRTL
    ? value
      ? SWITCH_PADDING
      : SWITCH_WIDTH - SWITCH_THUMB_SIZE - SWITCH_PADDING
    : value
      ? SWITCH_WIDTH - SWITCH_THUMB_SIZE - SWITCH_PADDING
      : SWITCH_PADDING;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={{
        alignItems: "center",
        backgroundColor: value ? colors.primary[500] : colors.border.soft,
        borderRadius: SWITCH_HEIGHT / 2,
        height: SWITCH_HEIGHT,
        justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
        position: "relative",
        width: SWITCH_WIDTH,
      }}
      testID={testID}
    >
      <View
        style={{
          backgroundColor: value ? colors.status.success : colors.surface.base,
          borderRadius: SWITCH_THUMB_SIZE / 2,
          height: SWITCH_THUMB_SIZE,
          left: thumbLeft,
          position: "absolute",
          top: SWITCH_PADDING,
          width: SWITCH_THUMB_SIZE,
        }}
        testID="settings-row-switch-thumb"
      />
    </Pressable>
  );
};

export const SettingsRow = ({
  description,
  disabled = false,
  onValueChange,
  title,
  value,
}: SettingsRowProps) => {
  const { isRTL } = useAppLanguage();
  const copy = (
    <View style={{ flex: 1, gap: spacing.xxs }} testID="settings-row-copy">
      <AppText color={colors.text.primary} variant="label">
        {title}
      </AppText>
      {description ? (
        <AppText variant="bodySmall">{description}</AppText>
      ) : null}
    </View>
  );
  const switchControl = (
    <SettingsSwitch
      disabled={disabled}
      isRTL={isRTL}
      onValueChange={onValueChange}
      testID="settings-row-switch"
      value={value}
    />
  );

  return (
    <View
      testID="settings-row-container"
      style={{
        alignItems: "center",
        alignSelf: "stretch",
        direction: "ltr",
        opacity: disabled ? 0.5 : 1,
        flexDirection: "row",
        gap: spacing.md,
        justifyContent: "space-between",
      }}
    >
      {isRTL ? switchControl : copy}
      {isRTL ? copy : switchControl}
    </View>
  );
};
