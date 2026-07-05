import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { BrandLogo } from "../../../components/ui/brand-logo";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, radius, spacing } from "../../../theme";

type HeiaTopBarProps = {
  avatarUri: string;
  onBackPress: () => void;
  onResetPress: () => void;
};

export const HeiaTopBar = ({ onBackPress, onResetPress }: HeiaTopBarProps) => {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: colors.surface.base,
        borderBottomColor: colors.border.soft,
        borderBottomWidth: 1,
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
        paddingBottom: spacing.md,
        paddingTop: spacing.md,
      }}
    >
      <ScalePressable
        accessibilityLabel={t("common.back")}
        accessibilityRole="button"
        contentStyle={{
          alignItems: "center",
          borderRadius: radius.round,
          height: 40,
          justifyContent: "center",
          width: 40,
        }}
        onPress={onBackPress}
        scaleTo={0.94}
        style={{ borderRadius: radius.round }}
      >
        <Ionicons
          color={colors.text.secondary}
          name="arrow-back"
          size={23}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
      </ScalePressable>

      <View
        style={{
          alignItems: "center",
          flex: 1,
          gap: 6,
          paddingHorizontal: spacing.sm,
        }}
      >
        <BrandLogo mode="icon" size={36} />
        <AppText
          align="center"
          color={colors.navy[700]}
          numberOfLines={1}
          style={{
            fontSize: 18,
            fontWeight: "700",
            letterSpacing: isRTL ? 0 : -0.3,
          }}
        >
          {t("heiaChat.title")}
        </AppText>
      </View>

      <ScalePressable
        accessibilityLabel={t("heiaChat.reset")}
        accessibilityRole="button"
        contentStyle={{
          alignItems: "center",
          borderRadius: radius.round,
          height: 40,
          justifyContent: "center",
          width: 40,
        }}
        onPress={onResetPress}
        scaleTo={0.94}
        style={{ borderRadius: radius.round }}
      >
        <Ionicons color={colors.text.secondary} name="refresh-outline" size={23} />
      </ScalePressable>
    </View>
  );
};
