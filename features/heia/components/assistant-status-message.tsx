import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { MotionView } from "../../../components/ui/motion-view";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, spacing } from "../../../theme";
import type { AiAdvisorStatusChatMessage } from "../../aiAdvisor/types";

type AssistantStatusMessageProps = {
  messageIndex?: number;
  message: AiAdvisorStatusChatMessage;
  onRetry: (() => void) | undefined;
};

export const AssistantStatusMessage = memo(function AssistantStatusMessage({
  messageIndex = 0,
  message,
  onRetry,
}: AssistantStatusMessageProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (message.status !== "loading") {
      pulse.value = 0;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [message.status, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + pulse.value * 0.18,
    transform: [{ scale: 0.92 + pulse.value * 0.16 }],
  }));

  return (
    <MotionView
      index={messageIndex}
      style={{
        alignSelf: isRTL ? "flex-end" : "flex-start",
        width: "84%",
      }}
      variant="chat"
    >
      <AppCard>
        <View
          style={{
            alignItems: "flex-start",
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.md,
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: 32,
              minWidth: 32,
            }}
          >
            {message.status === "loading" ? (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Animated.View
                  style={[
                    {
                      backgroundColor: colors.primary[100],
                      borderRadius: 999,
                      height: 28,
                      position: "absolute",
                      width: 28,
                    },
                    pulseStyle,
                  ]}
                />
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : (
              <Ionicons
                color={colors.coral[500]}
                name="alert-circle-outline"
                size={22}
              />
            )}
          </View>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="title">{message.title}</AppText>
            <AppText>{message.description}</AppText>
            {message.status === "error" && message.retryable && onRetry ? (
              <SecondaryButton
                fullWidth={false}
                label={t("common.retry")}
                onPress={onRetry}
                tone="coral"
              />
            ) : null}
          </View>
        </View>
      </AppCard>
    </MotionView>
  );
});
