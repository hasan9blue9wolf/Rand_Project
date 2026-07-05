import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLanguage } from "../../hooks/use-app-language";
import { useToastStore } from "../../store/toast-store";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";

const TOAST_DURATION_MS = 2200;

export const AppToast = () => {
  const { isRTL } = useAppLanguage();
  const insets = useSafeAreaInsets();
  const hideToast = useToastStore((state) => state.hideToast);
  const message = useToastStore((state) => state.message);
  const tone = useToastStore((state) => state.tone);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = setTimeout(hideToast, TOAST_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [hideToast, message]);

  if (!message) {
    return null;
  }

  const icon = tone === "success" ? "checkmark-circle" : "heart";
  const iconColor =
    tone === "success" ? colors.status.success : colors.primary[600];

  return (
    <View
      pointerEvents="none"
      style={{
        bottom: Math.max(insets.bottom, spacing.md) + spacing.lg,
        left: spacing.lg,
        position: "absolute",
        right: spacing.lg,
        zIndex: 50,
      }}
    >
      <Animated.View
        entering={FadeInDown.duration(180)}
        exiting={FadeOutDown.duration(140)}
      >
        <View
          style={[
            shadows.premium,
            {
              alignItems: "center",
              alignSelf: "center",
              backgroundColor: "rgba(255,255,255,0.96)",
              borderColor: colors.border.soft,
              borderRadius: radius.round,
              borderWidth: 1,
              flexDirection: isRTL ? "row-reverse" : "row",
              gap: spacing.sm,
              maxWidth: 420,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <Ionicons color={iconColor} name={icon} size={18} />
          <AppText color={colors.navy[800]} variant="label">
            {message}
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
};
