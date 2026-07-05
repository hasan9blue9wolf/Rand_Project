import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { MotionView } from "../../../components/ui/motion-view";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, radius, spacing } from "../../../theme";

type HeiaBannerProps = {
  onPress?: () => void;
};

export const HeiaBanner = memo(function HeiaBanner({
  onPress,
}: HeiaBannerProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();

  return (
    <MotionView index={1}>
      <View
        style={{
          backgroundColor: colors.navy[900],
          borderRadius: radius.lg,
          overflow: "hidden",
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(52, 116, 255, 0.14)",
            borderRadius: radius.round,
            height: 136,
            position: "absolute",
            top: -78,
            width: 136,
            ...(isRTL ? { left: -52 } : { right: -52 }),
          }}
        />

        <Ionicons
          color="rgba(255,255,255,0.12)"
          name="sparkles"
          size={34}
          style={{
            bottom: spacing.md,
            position: "absolute",
            ...(isRTL ? { left: spacing.lg } : { right: spacing.lg }),
          }}
        />

        <View style={{ gap: spacing.lg }}>
          <View
            style={{
              alignItems: "center",
              alignSelf: isRTL ? "flex-end" : "flex-start",
              flexDirection: isRTL ? "row-reverse" : "row",
              gap: spacing.xs,
            }}
          >
            <LinearGradient
              colors={[colors.coral[500], colors.primary[500]]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={{
                alignItems: "center",
                borderRadius: radius.xs,
                height: 30,
                justifyContent: "center",
                width: 30,
              }}
            >
              <Ionicons color={colors.text.inverse} name="flash" size={15} />
            </LinearGradient>
            <AppText
              color={colors.text.inverse}
              style={{ fontWeight: "700" }}
              variant="caption"
            >
              {t("home.heiaBanner.kicker")}
            </AppText>
          </View>

          <View style={{ gap: spacing.xs }}>
            <AppText
              color={colors.text.inverse}
              style={{ fontSize: 18, fontWeight: "800", lineHeight: 24 }}
              variant="title"
            >
              {t("home.heiaBanner.title")}
            </AppText>
            <AppText
              color="rgba(255,255,255,0.84)"
              style={{ fontSize: 18, fontWeight: "800", lineHeight: 24 }}
              variant="title"
            >
              {t("home.heiaBanner.subtitle")}
            </AppText>
          </View>

          <ScalePressable
            accessibilityRole="button"
            contentStyle={{
              alignItems: "center",
              alignSelf: isRTL ? "flex-end" : "flex-start",
              backgroundColor: colors.coral[500],
              borderRadius: radius.round,
              justifyContent: "center",
              minHeight: 44,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
            }}
            onPress={onPress}
            scaleTo={0.96}
            style={{ borderRadius: radius.round }}
          >
            <AppText
              color={colors.text.inverse}
              style={{ fontWeight: "700" }}
              variant="label"
            >
              {t("home.heiaBanner.cta")}
            </AppText>
          </ScalePressable>
        </View>
      </View>
    </MotionView>
  );
});
