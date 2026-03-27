import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";

type SearchFieldProps = TextInputProps & {
  error?: string | undefined;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  rightAdornment?: ReactNode;
};

export const SearchField = ({
  error,
  icon = "search",
  label,
  onBlur,
  onFocus,
  rightAdornment,
  style,
  ...rest
}: SearchFieldProps) => {
  const { isRTL } = useAppLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error
    ? colors.status.danger
    : isFocused
      ? colors.primary[100]
      : colors.border.soft;

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <AppText color={colors.text.secondary} variant="caption">
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          isFocused ? shadows.card : null,
          {
            alignItems: "center",
            backgroundColor: isFocused
              ? colors.surface.base
              : colors.surface.muted,
            borderColor,
            borderRadius: radius.md,
            borderWidth: 1,
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.sm,
            minHeight: 60,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: isFocused
              ? colors.primary[50]
              : colors.background.softBlue,
            borderRadius: radius.round,
            height: 34,
            justifyContent: "center",
            width: 34,
          }}
        >
          <Ionicons color={colors.primary[500]} name={icon} size={18} />
        </View>
        <TextInput
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.text.muted}
          style={[
            {
              color: colors.text.primary,
              flex: 1,
              fontSize: 16,
              lineHeight: 22,
              minHeight: rest.multiline ? 90 : 48,
              textAlign: isRTL ? "right" : "left",
              textAlignVertical: rest.multiline ? "top" : "center",
              writingDirection: isRTL ? "rtl" : "ltr",
            },
            style,
          ]}
          {...rest}
        />
        {rightAdornment}
      </View>
      {error ? (
        <AppText color={colors.status.danger} variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
};
