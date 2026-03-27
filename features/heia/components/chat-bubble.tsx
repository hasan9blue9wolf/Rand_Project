import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { Avatar } from "../../../components/ui/avatar";
import { MotionView } from "../../../components/ui/motion-view";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, radius, spacing } from "../../../theme";
import type { HeiaSuggestionId, HeiaTextMessage } from "../types";

type ChatBubbleProps = {
  assistantAvatarUri: string;
  messageIndex?: number;
  message: HeiaTextMessage;
  onSuggestionPress?: (suggestionId: HeiaSuggestionId) => void;
};

const AVATAR_SIZE = 32;
const ASSISTANT_INDENT = AVATAR_SIZE + spacing.sm;

export const ChatBubble = memo(function ChatBubble({
  assistantAvatarUri,
  messageIndex = 0,
  message,
  onSuggestionPress,
}: ChatBubbleProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const isAssistant = message.role === "assistant";
  const showAvatar =
    message.kind === "assistant_text" ? Boolean(message.showAvatar) : false;
  const suggestionIds =
    message.kind === "assistant_text" ? message.suggestionIds : undefined;
  const assistantTone =
    message.kind === "assistant_text" ? message.tone : undefined;
  const alignToStart = isAssistant ? !isRTL : isRTL;
  const bubbleText = message.text;
  const hasSuggestions = isAssistant && Boolean(suggestionIds?.length);
  const leadingInset = isAssistant && showAvatar ? ASSISTANT_INDENT : 0;
  const assistantBubbleColor =
    isAssistant && assistantTone === "safety"
      ? colors.coral[500]
      : isAssistant && assistantTone === "fallback"
        ? colors.primary[600]
        : colors.navy[700];

  return (
    <MotionView
      index={messageIndex}
      style={{
        alignItems: alignToStart ? "flex-start" : "flex-end",
        gap: spacing.sm,
      }}
      variant="chat"
    >
      <View
        style={{
          alignItems: "flex-start",
          flexDirection:
            isAssistant && showAvatar
              ? isRTL
                ? "row-reverse"
                : "row"
              : "column",
          gap: spacing.sm,
          maxWidth: "100%",
        }}
      >
        {isAssistant && showAvatar ? (
          <Avatar size={AVATAR_SIZE} uri={assistantAvatarUri} />
        ) : null}

        <View style={{ maxWidth: "86%" }}>
          {isAssistant && showAvatar ? (
            <AppText
              color={colors.text.muted}
              style={{
                fontSize: 12,
                fontWeight: "600",
                marginBottom: spacing.xs,
              }}
              variant="caption"
            >
              {t("common.heia")}
            </AppText>
          ) : null}

          <View
            style={{
              backgroundColor: isAssistant
                ? assistantBubbleColor
                : colors.surface.base,
              borderColor: isAssistant ? "transparent" : colors.border.soft,
              borderRadius: radius.md,
              borderTopLeftRadius: alignToStart ? radius.xs : radius.md,
              borderTopRightRadius: alignToStart ? radius.md : radius.xs,
              borderWidth: isAssistant ? 0 : 1,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
            }}
          >
            <AppText
              color={isAssistant ? colors.text.inverse : colors.text.primary}
            >
              {bubbleText}
            </AppText>
          </View>
        </View>
      </View>

      {hasSuggestions ? (
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.sm,
          }}
          showsHorizontalScrollIndicator={false}
          style={{
            alignSelf: alignToStart ? "flex-start" : "flex-end",
            marginLeft: !isRTL ? leadingInset : 0,
            marginRight: isRTL ? leadingInset : 0,
            maxWidth: "100%",
          }}
        >
          {suggestionIds?.map((suggestionId) => (
            <ScalePressable
              key={suggestionId}
              accessibilityRole="button"
              contentStyle={{
                alignItems: "center",
                backgroundColor: colors.surface.base,
                borderColor: colors.border.soft,
                borderRadius: radius.round,
                borderWidth: 1,
                justifyContent: "center",
                minHeight: 36,
                paddingHorizontal: spacing.md,
              }}
              onPress={() => onSuggestionPress?.(suggestionId)}
              scaleTo={0.97}
              style={{ borderRadius: radius.round }}
            >
              <AppText
                color={colors.text.secondary}
                style={{ fontSize: 12, fontWeight: "600" }}
              >
                {t(`heiaChat.suggestions.${suggestionId}`)}
              </AppText>
            </ScalePressable>
          ))}
        </ScrollView>
      ) : null}
    </MotionView>
  );
});
