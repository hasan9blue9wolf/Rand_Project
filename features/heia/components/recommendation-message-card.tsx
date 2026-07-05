import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Image, View } from "react-native";
import Animated from "react-native-reanimated";

import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { MotionView } from "../../../components/ui/motion-view";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import {
  colors,
  getRecommendationEntering,
  radius,
  shadows,
  spacing,
} from "../../../theme";
import type { HeiaRecommendationCardData } from "../types";

type RecommendationMessageCardProps = {
  card: HeiaRecommendationCardData;
  enteringIndex?: number;
  favoriteAction?:
    | {
        accessibilityLabel: string;
        iconName: "heart" | "heart-outline";
        isFavorite: boolean;
        onPress: () => void;
      }
    | undefined;
  onPress: (() => void) | undefined;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

export const RecommendationMessageCard = memo(function RecommendationMessageCard({
  card,
  enteringIndex = 0,
  favoriteAction,
  onPress,
}: RecommendationMessageCardProps) {
  const { formatCurrencyRange, t } = useLocalization();
  const { isRTL } = useAppLanguage();
  const imageSource = useMemo(
    () => getRemoteImageSource(card.imageUri),
    [card.imageUri],
  );

  return (
    <MotionView index={enteringIndex} variant="recommendation">
      <View
        style={[
          shadows.card,
          {
            backgroundColor: colors.surface.base,
            borderColor: colors.border.soft,
            borderRadius: radius.md,
            borderWidth: 1,
            overflow: "hidden",
          },
        ]}
      >
        <Animated.View
          entering={getRecommendationEntering(enteringIndex)}
          style={{ aspectRatio: 1.08, position: "relative" }}
        >
          <AnimatedImage
            entering={getRecommendationEntering(enteringIndex + 1)}
            resizeMode="cover"
            source={imageSource}
            style={{ height: "100%", width: "100%" }}
          />
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.94)",
              borderRadius: radius.xs,
              paddingHorizontal: spacing.xs,
              paddingVertical: 6,
              position: "absolute",
              top: spacing.sm,
              ...(isRTL ? { right: spacing.sm } : { left: spacing.sm }),
            }}
          >
            <AppText
              color={colors.navy[700]}
              style={{
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: isRTL ? 0 : 0.4,
              }}
            >
              {t("heiaChat.bestForLabel")}
            </AppText>
          </View>
          {favoriteAction ? (
            <ScalePressable
              accessibilityLabel={favoriteAction.accessibilityLabel}
              accessibilityRole="button"
              contentStyle={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.94)",
                borderColor: colors.border.soft,
                borderRadius: radius.round,
                borderWidth: 1,
                height: 42,
                justifyContent: "center",
                width: 42,
              }}
              onPress={() => void favoriteAction.onPress()}
              scaleTo={0.92}
              style={{
                position: "absolute",
                top: spacing.sm,
                ...(isRTL ? { left: spacing.sm } : { right: spacing.sm }),
              }}
            >
              <Ionicons
                color={
                  favoriteAction.isFavorite
                    ? colors.coral[600]
                    : colors.navy[700]
                }
                name={favoriteAction.iconName}
                size={21}
              />
            </ScalePressable>
          ) : null}
        </Animated.View>

        <View style={{ gap: spacing.md, padding: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <AppText
              color={colors.navy[700]}
              style={{ fontSize: 18, fontWeight: "800", lineHeight: 24 }}
              variant="bodyStrong"
            >
              {`${card.destination}, ${card.country}`}
            </AppText>
            <AppText color={colors.text.secondary} style={{ lineHeight: 24 }}>
              {card.summary}
            </AppText>
          </View>

          <View style={{ gap: spacing.sm }}>
            <DetailRow
              label={t("heiaChat.estimatedBudget")}
              value={formatCurrencyRange(
                card.budgetRange.min,
                card.budgetRange.max,
              )}
            />
            <DetailRow
              label={t("heiaChat.bestForLabel")}
              value={card.bestForLabel}
            />
            <DetailRow
              label={t("heiaChat.weatherLabel")}
              value={card.weatherLabel}
            />
            <DetailRow label={t("heiaChat.visaLabel")} value={card.visaLabel} />
            <DetailRow
              label={t("heiaChat.luxuryLabel")}
              value={card.luxuryLabel}
            />
          </View>

          <View style={{ gap: spacing.xs }}>
            <AppText color={colors.text.muted} variant="eyebrow">
              {t("heiaChat.whyItFits")}
            </AppText>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                flexWrap: "wrap",
                gap: spacing.xs,
              }}
            >
              {card.reasons.map((reason) => (
                <View
                  key={reason}
                  style={{
                    alignItems: "center",
                    backgroundColor: colors.background.softBlue,
                    borderRadius: radius.round,
                    justifyContent: "center",
                    minHeight: 32,
                    paddingHorizontal: spacing.md,
                  }}
                >
                  <AppText color={colors.navy[700]} variant="bodySmall">
                    {reason}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {onPress ? (
            <PrimaryButton
              label={card.ctaLabel}
              onPress={onPress}
              tone="coral"
            />
          ) : null}
        </View>
      </View>
    </MotionView>
  );
});
