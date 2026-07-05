import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";
import { Chip } from "./chip";
import { PrimaryButton } from "./primary-button";

type RecommendationCardProps = {
  actionLabel: string;
  description: string;
  onPress: () => void;
  title: string;
};

export const RecommendationCard = ({
  actionLabel,
  description,
  onPress,
  title,
}: RecommendationCardProps) => {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();

  return (
    <LinearGradient
      colors={colors.gradients.navy}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[
        shadows.premium,
        {
          borderRadius: radius.lg,
          overflow: "hidden",
          padding: spacing.xl,
        },
      ]}
    >
      <View style={{ gap: spacing.lg }}>
        <View
          style={{
            alignItems: "flex-start",
            flexDirection: isRTL ? "row-reverse" : "row",
            justifyContent: "space-between",
          }}
        >
          <Chip label={t("tabs.heia")} tone="coral" variant="soft" />
          <View
            style={{
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: radius.round,
              height: 44,
              justifyContent: "center",
              width: 44,
            }}
          >
            <Ionicons color={colors.coral[500]} name="sparkles" size={20} />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText color={colors.text.inverse} variant="title">
            {title}
          </AppText>
          <AppText color="rgba(255,255,255,0.8)">{description}</AppText>
        </View>

        <PrimaryButton label={actionLabel} onPress={onPress} tone="coral" />
      </View>
    </LinearGradient>
  );
};
