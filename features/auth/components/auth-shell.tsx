import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../../components/ui/app-text";
import { useLocalization } from "../../../hooks/use-localization";
import { colors, getContentMaxWidth, getScreenPadding, radius, spacing } from "../../../theme";

type AuthShellProps = {
  badgeLabels: string[];
  children: ReactNode;
  subtitle: string;
  title: string;
};

export const AuthShell = ({
  badgeLabels,
  children,
  subtitle,
  title,
}: AuthShellProps) => {
  const { isRTL, t } = useLocalization();
  const { width } = useWindowDimensions();
  const screenPadding = getScreenPadding(width);
  const contentMaxWidth = Math.min(getContentMaxWidth(width), 560);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.navy[900], flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              alignSelf: "center",
              maxWidth: contentMaxWidth,
              paddingBottom: spacing.xxxl,
              paddingHorizontal: screenPadding,
              width: "100%",
            }}
          >
            <LinearGradient
              colors={colors.gradients.navy}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={{
                borderBottomLeftRadius: radius.xl,
                borderBottomRightRadius: radius.xl,
                overflow: "hidden",
                paddingBottom: spacing.hero + spacing.lg,
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.md,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 120,
                  height: 180,
                  position: "absolute",
                  right: isRTL ? undefined : -48,
                  top: -44,
                  width: 180,
                  ...(isRTL ? { left: -48 } : null),
                }}
              />
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 88,
                  bottom: 24,
                  height: 132,
                  left: isRTL ? undefined : -28,
                  position: "absolute",
                  width: 132,
                  ...(isRTL ? { right: -28 } : null),
                }}
              />

              <View
                style={{
                  alignItems: "center",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: spacing.sm,
                  marginBottom: spacing.xl,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderColor: "rgba(255,255,255,0.12)",
                    borderRadius: radius.round,
                    borderWidth: 1,
                    height: 44,
                    justifyContent: "center",
                    width: 44,
                  }}
                >
                  <Ionicons color={colors.coral[500]} name="sparkles" size={20} />
                </View>
                <View style={{ flex: 1, gap: spacing.xxs }}>
                  <AppText color={colors.text.inverse} variant="title">
                    {t("common.appName")}
                  </AppText>
                  <AppText color="rgba(255,255,255,0.72)" variant="bodySmall">
                    {t("authFlow.hero.brandSubtitle")}
                  </AppText>
                </View>
              </View>

              <View style={{ gap: spacing.md }}>
                <AppText color="rgba(255,255,255,0.8)" variant="caption">
                  {t("authFlow.hero.kicker")}
                </AppText>
                <AppText color={colors.text.inverse} variant="display">
                  {title}
                </AppText>
                <AppText
                  color="rgba(255,255,255,0.74)"
                  style={{ maxWidth: 440 }}
                  variant="body"
                >
                  {subtitle}
                </AppText>
              </View>

              <View
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  flexWrap: "wrap",
                  gap: spacing.sm,
                  marginTop: spacing.xl,
                }}
              >
                {badgeLabels.map((label) => (
                  <View
                    key={label}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: radius.round,
                      borderWidth: 1,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                    }}
                  >
                    <AppText color={colors.text.inverse} variant="caption">
                      {label}
                    </AppText>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <View style={{ marginTop: -spacing.xxl }}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
