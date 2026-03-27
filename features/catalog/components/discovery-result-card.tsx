import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { MotionView } from "../../../components/ui/motion-view";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { colors, radius, shadows, spacing } from "../../../theme";
import type { TravelDiscoverySearchResult } from "../types";

type DiscoveryResultCardProps = {
  actionLabel: string;
  enteringIndex?: number;
  onActionPress: () => void;
  result: TravelDiscoverySearchResult;
};

export const DiscoveryResultCard = memo(function DiscoveryResultCard({
  actionLabel,
  enteringIndex = 0,
  onActionPress,
  result,
}: DiscoveryResultCardProps) {
  const { formatCurrency, isRTL, t } = useLocalization();
  const localizedHighlights = useMemo(
    () =>
      t(`content.offers.${result.id}.highlights`, {
        defaultValue: result.highlights,
        returnObjects: true,
      }) as string[],
    [result.highlights, result.id, t],
  );
  const localizedSummary = useMemo(
    () =>
      t(`content.offers.${result.id}.summary`, {
        defaultValue: result.summary,
      }),
    [result.id, result.summary, t],
  );

  return (
    <MotionView index={enteringIndex}>
      <View
        style={[
          shadows.card,
          {
            backgroundColor: colors.surface.base,
            borderColor: colors.border.soft,
            borderRadius: radius.lg,
            borderWidth: 1,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={result.accent}
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
                label={t(`content.offers.${result.id}.badge`, {
                  defaultValue: result.badge,
                })}
                tone="neutral"
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
                  name="compass-outline"
                  size={18}
                />
              </View>
            </View>

            <View style={{ gap: spacing.xs }}>
              <AppText color={colors.text.inverse} variant="title">
                {t(`content.offers.${result.id}.title`, {
                  defaultValue: result.title,
                })}
              </AppText>
              <AppText color="rgba(255,255,255,0.82)" variant="bodySmall">
                {t(`content.offers.${result.id}.destination`, {
                  defaultValue: result.destination,
                })}
              </AppText>
              <AppText color="rgba(255,255,255,0.78)" variant="bodySmall">
                {localizedSummary}
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
              label={t(`content.offers.${result.id}.duration`, {
                defaultValue: result.duration,
              })}
              tone="primary"
            />
            <Chip
              icon="star-outline"
              label={t("searchResults.hotelClassValue", {
                count: result.hotelClass,
              })}
              tone="navy"
            />
            {result.directFlight ? (
              <Chip
                icon="airplane-outline"
                label={t("searchResults.directFlight")}
                tone="success"
              />
            ) : null}
            {result.refundable ? (
              <Chip
                icon="refresh-outline"
                label={t("searchResults.refundable")}
                tone="warning"
              />
            ) : null}
            {result.visaFriendly ? (
              <Chip
                icon="document-text-outline"
                label={t("searchResults.visaFriendly")}
                tone="primary"
              />
            ) : null}
          </View>

          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.xs,
            }}
          >
            {localizedHighlights.map((highlight) => (
              <Chip
                icon="sparkles"
                key={highlight}
                label={highlight}
                tone="coral"
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
              <AppText variant="eyebrow">
                {t("searchResults.startingFrom")}
              </AppText>
              <AppText color={colors.primary[600]} variant="title">
                {formatCurrency(result.priceFrom)}
              </AppText>
            </View>
            <SecondaryButton
              fullWidth={false}
              label={actionLabel}
              onPress={onActionPress}
              tone="coral"
            />
          </View>
        </View>
      </View>
    </MotionView>
  );
});
