import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useLocalization } from "../../hooks/use-localization";
import { colors, radius, shadows, spacing } from "../../theme";
import type { FeaturedOffer } from "../../types/travel";
import { AppText } from "./app-text";
import { Chip } from "./chip";
import { MotionView } from "./motion-view";
import { SecondaryButton } from "./secondary-button";

type PackageCardProps = {
  actionLabel?: string;
  enteringIndex?: number;
  offer: FeaturedOffer;
  onActionPress?: () => void;
};

export const PackageCard = memo(function PackageCard({
  actionLabel,
  enteringIndex = 0,
  offer,
  onActionPress,
}: PackageCardProps) {
  const { formatCurrency, isRTL } = useLocalization();
  const { t } = useTranslation();

  const localizedHighlights = useMemo(
    () =>
      t(`content.offers.${offer.id}.highlights`, {
        defaultValue: offer.highlights,
        returnObjects: true,
      }) as string[],
    [offer.highlights, offer.id, t],
  );

  return (
    <MotionView index={enteringIndex}>
      <View
        style={[
          shadows.premium,
          {
            backgroundColor: colors.surface.base,
            borderColor: colors.border.soft,
            borderRadius: radius.xl,
            borderWidth: 1,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={offer.accent}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{ padding: spacing.lg }}
        >
          <View style={{ gap: spacing.md }}>
            <View
              style={{
                alignItems: "flex-start",
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "space-between",
              }}
            >
              <Chip
                label={t(`content.offers.${offer.id}.badge`, {
                  defaultValue: offer.badge,
                })}
                tone="neutral"
                variant="soft"
              />
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.16)",
                  borderRadius: radius.round,
                  height: 40,
                  justifyContent: "center",
                  width: 40,
                }}
              >
                <Ionicons
                  color={colors.text.inverse}
                  name="airplane"
                  size={18}
                />
              </View>
            </View>

            <View style={{ gap: spacing.xs }}>
              <AppText color={colors.text.inverse} variant="title">
                {t(`content.offers.${offer.id}.title`, {
                  defaultValue: offer.title,
                })}
              </AppText>
              <AppText color="rgba(255,255,255,0.82)" variant="bodySmall">
                {t(`content.offers.${offer.id}.destination`, {
                  defaultValue: offer.destination,
                })}
              </AppText>
            </View>
          </View>
        </LinearGradient>

        <View style={{ gap: spacing.md, padding: spacing.lg }}>
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.xs,
            }}
          >
            <Chip
              icon="moon"
              label={t(`content.offers.${offer.id}.duration`, {
                defaultValue: offer.duration,
              })}
              tone="primary"
            />
            {localizedHighlights.map((highlight) => (
              <Chip
                icon="sparkles"
                key={highlight}
                label={highlight}
                tone="navy"
              />
            ))}
          </View>

          <View
            style={{
              alignItems: "flex-end",
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ gap: spacing.xxs }}>
              <AppText color={colors.text.secondary} variant="caption">
                {t("offers.startingFrom")}
              </AppText>
              <AppText color={colors.primary[600]} variant="title">
                {formatCurrency(offer.priceFrom)}
              </AppText>
            </View>
            {actionLabel ? (
              <SecondaryButton
                fullWidth={false}
                label={actionLabel}
                onPress={onActionPress}
                tone="coral"
              />
            ) : null}
          </View>
        </View>
      </View>
    </MotionView>
  );
});
