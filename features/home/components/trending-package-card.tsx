import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Image, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, shadows, spacing } from "../../../theme";
import type { HomeTrendingPackage } from "../types";

type TrendingPackageCardProps = {
  cardWidth: number;
  onPress?: () => void;
  packageItem: HomeTrendingPackage;
};

export const TrendingPackageCard = memo(function TrendingPackageCard({
  cardWidth,
  onPress,
  packageItem,
}: TrendingPackageCardProps) {
  const { formatCurrency, t } = useLocalization();
  const { isRTL } = useAppLanguage();
  const itemKey = `home.trendingPackages.items.${packageItem.id}`;
  const imageSource = useMemo(
    () => getRemoteImageSource(packageItem.imageUri),
    [packageItem.imageUri],
  );

  return (
    <ScalePressable
      accessibilityRole="button"
      contentStyle={[
        shadows.card,
        {
          backgroundColor: colors.surface.base,
          borderRadius: radius.md,
          overflow: "hidden",
          width: cardWidth,
        },
      ]}
      onPress={onPress}
      scaleTo={0.985}
      style={{ width: cardWidth }}
    >
      <View>
        <View style={{ height: 168, position: "relative" }}>
          <Image
            resizeMode="cover"
            source={imageSource}
            style={{ height: "100%", width: "100%" }}
          />
          {packageItem.showBadge ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: radius.xs,
                paddingHorizontal: spacing.xs,
                paddingVertical: 6,
                position: "absolute",
                top: spacing.sm,
                ...(isRTL ? { left: spacing.sm } : { right: spacing.sm }),
              }}
            >
              <AppText
                color={colors.primary[500]}
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: isRTL ? 0 : 0.4,
                }}
                variant="caption"
              >
                {t(`${itemKey}.badge`)}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={{ gap: spacing.sm, padding: spacing.md }}>
          <AppText
            color={colors.text.primary}
            numberOfLines={2}
            style={{ fontSize: 17, fontWeight: "700", lineHeight: 22 }}
            variant="bodyStrong"
          >
            {t(`${itemKey}.title`)}
          </AppText>

          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              flexWrap: "wrap",
              gap: spacing.sm,
            }}
          >
            {packageItem.meta.map((meta) => (
              <View
                key={`${packageItem.id}-${meta.key}`}
                style={{
                  alignItems: "center",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: 4,
                }}
              >
                <Ionicons color={colors.text.muted} name={meta.icon} size={13} />
                <AppText color={colors.text.secondary} variant="caption">
                  {t(`${itemKey}.${meta.key}`)}
                </AppText>
              </View>
            ))}
          </View>

          <View
            style={{
              alignItems: isRTL ? "flex-end" : "flex-start",
              borderTopColor: colors.background.subtle,
              borderTopWidth: 1,
              gap: spacing.xxs,
              paddingTop: spacing.sm,
            }}
          >
            <AppText color={colors.text.muted} variant="caption">
              {t("home.trendingPackages.startingFrom")}
            </AppText>
            <AppText
              color={colors.primary[500]}
              style={{
                fontSize: 30,
                fontWeight: "800",
                letterSpacing: isRTL ? 0 : -0.7,
              }}
              variant="title"
            >
              {formatCurrency(packageItem.priceFrom)}
            </AppText>
          </View>
        </View>
      </View>
    </ScalePressable>
  );
});
