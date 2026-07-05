import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Image, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { MotionView } from "../../../components/ui/motion-view";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useLocalization } from "../../../hooks/use-localization";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, shadows, spacing } from "../../../theme";
import {
  formatPackagePrice,
  resolvePackageImageUrl,
  resolvePackageText,
} from "../helpers/package-helpers";
import { usePackageFavoriteToggle } from "../hooks/use-package-favorite-toggle";
import type { TravelPackage } from "../types";

type DemoPackageCardProps = {
  enteringIndex?: number;
  onPress?: () => void;
  packageItem: TravelPackage;
  showFavoriteAction?: boolean;
};

const DemoPackageCardComponent = ({
  enteringIndex = 0,
  onPress,
  packageItem,
  showFavoriteAction = true,
}: DemoPackageCardProps) => {
  const { isRTL, language, t } = useLocalization();
  const favoriteAction = usePackageFavoriteToggle(packageItem);
  const imageSource = useMemo(
    () => getRemoteImageSource(resolvePackageImageUrl(packageItem.imageUrl)),
    [packageItem.imageUrl],
  );
  const title = resolvePackageText(packageItem.title, language);
  const destinationCity = resolvePackageText(packageItem.destinationCity, language);
  const destinationCountry = resolvePackageText(
    packageItem.destinationCountry,
    language,
  );
  const summary = resolvePackageText(packageItem.shortDescription, language);

  return (
    <MotionView index={enteringIndex}>
      <ScalePressable
        accessibilityRole={onPress ? "button" : undefined}
        disabled={!onPress}
        feedback={onPress ? "selection" : "none"}
        onPress={onPress}
        scaleTo={0.985}
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
        <View>
          <Image
            source={imageSource}
            style={{
              backgroundColor: colors.surface.muted,
              height: 168,
              width: "100%",
            }}
          />
          {showFavoriteAction ? (
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
              onPress={() => void favoriteAction.toggleFavorite()}
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
        </View>

        <View style={{ gap: spacing.md, padding: spacing.lg }}>
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.xs,
            }}
          >
            {packageItem.isFeatured ? (
              <Chip label={t("packagesDiscovery.badges.featured")} tone="navy" />
            ) : null}
            {packageItem.isBestSeller ? (
              <Chip
                label={t("packagesDiscovery.badges.bestSeller")}
                tone="coral"
              />
            ) : null}
            {packageItem.isAIRecommended ? (
              <Chip label={t("packagesDiscovery.badges.ai")} tone="primary" />
            ) : null}
          </View>

          <View style={{ gap: spacing.xs }}>
            <AppText
              color={colors.navy[800]}
              numberOfLines={2}
              style={{ fontSize: 20, fontWeight: "800" }}
              variant="title"
            >
              {title}
            </AppText>
            <AppText color={colors.text.secondary} variant="bodySmall">
              {`${destinationCity}, ${destinationCountry}`}
            </AppText>
          </View>

          <AppText numberOfLines={3} variant="bodySmall">
            {summary}
          </AppText>

          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.sm,
            }}
          >
            <Chip
              icon="time-outline"
              label={t("packagesDiscovery.meta.duration", {
                count: packageItem.durationDays,
              })}
              tone="neutral"
            />
            <Chip
              icon="star"
              label={`${packageItem.rating.toFixed(1)} (${packageItem.reviewCount})`}
              tone="warning"
            />
            <Chip
              icon="business-outline"
              label={t("packagesDiscovery.meta.hotelClass", {
                count: packageItem.hotelClass,
              })}
              tone="primary"
            />
            {packageItem.visaFriendly ? (
              <Chip
                icon="checkmark-circle-outline"
                label={t("packagesDiscovery.filters.visaFriendly")}
                tone="success"
              />
            ) : null}
          </View>

          <View
            style={{
              alignItems: "center",
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <AppText color={colors.text.muted} variant="caption">
                {t("packagesDiscovery.meta.from")}
              </AppText>
              <AppText color={colors.primary[600]} variant="title">
                {formatPackagePrice(packageItem, language)}
              </AppText>
            </View>
            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.navy[700],
                borderRadius: radius.round,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Ionicons
                color={colors.text.inverse}
                name={isRTL ? "arrow-back" : "arrow-forward"}
                size={20}
              />
            </View>
          </View>
        </View>
      </ScalePressable>
    </MotionView>
  );
};

export const DemoPackageCard = memo(DemoPackageCardComponent);
