import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TextInput, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../../theme";

type ChatInputProps = {
  bottomInset?: number;
  disabled?: boolean;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onMicPress?: () => void;
  onSend: () => void;
  value: string;
};

export const ChatInput = memo(function ChatInput({
  bottomInset = 0,
  disabled = false,
  loading = false,
  onChangeText,
  onFocus,
  onMicPress,
  onSend,
  value,
}: ChatInputProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const isActionDisabled = disabled || loading;
  const isMicDisabled = loading || !onMicPress;

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.92)",
        borderTopColor: "rgba(223, 232, 242, 0.72)",
        borderTopWidth: 1,
        paddingBottom: Math.max(bottomInset, spacing.sm),
        paddingHorizontal: spacing.screen,
        paddingTop: spacing.xs,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.sm,
        }}
      >
        <View
          style={[
            shadows.card,
            {
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.88)",
              borderColor: colors.border.soft,
              borderRadius: radius.round,
              borderWidth: 1,
              flex: 1,
              flexDirection: isRTL ? "row-reverse" : "row",
              gap: spacing.xs,
              minHeight: 50,
              overflow: "hidden",
              paddingHorizontal: spacing.sm,
            },
          ]}
        >
          <TextInput
            multiline
            onChangeText={onChangeText}
            onFocus={onFocus}
            placeholder={t("heiaChat.promptPlaceholder")}
            placeholderTextColor={colors.text.muted}
            style={{
              color: colors.text.primary,
              flex: 1,
              fontSize: 15,
              maxHeight: 110,
              minHeight: 38,
              paddingHorizontal: spacing.xs,
              paddingVertical: spacing.xxs,
              textAlign: isRTL ? "right" : "left",
              textAlignVertical: "center",
              writingDirection: isRTL ? "rtl" : "ltr",
            }}
            value={value}
          />

          <ScalePressable
            accessibilityLabel={t("heiaChat.mic")}
            accessibilityRole="button"
            contentStyle={{
              alignItems: "center",
              backgroundColor: colors.background.softBlue,
              borderRadius: radius.round,
              height: 34,
              justifyContent: "center",
              opacity: isMicDisabled ? 0.5 : 1,
              width: 34,
            }}
            disabled={isMicDisabled}
            onPress={onMicPress}
            scaleTo={0.94}
            style={{ alignSelf: "center", borderRadius: radius.round }}
          >
            <Ionicons color={colors.text.muted} name="mic-outline" size={20} />
          </ScalePressable>
        </View>

        <ScalePressable
          accessibilityLabel={t("heiaChat.send")}
          accessibilityRole="button"
          contentStyle={[
            shadows.card,
            {
              alignItems: "center",
              backgroundColor: colors.navy[800],
              borderRadius: radius.round,
              height: 50,
              justifyContent: "center",
              opacity: isActionDisabled ? 0.55 : 1,
              width: 50,
            },
          ]}
          disabled={isActionDisabled}
          onPress={onSend}
          scaleTo={0.94}
          style={{ borderRadius: radius.md }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Ionicons
              color={colors.text.inverse}
              name="send"
              size={22}
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          )}
        </ScalePressable>
      </View>

      <AppText
        align="center"
        color={colors.text.muted}
        style={{ fontSize: 10, marginTop: spacing.xxs }}
      >
        {t("heiaChat.disclaimer")}
      </AppText>
    </View>
  );
});
