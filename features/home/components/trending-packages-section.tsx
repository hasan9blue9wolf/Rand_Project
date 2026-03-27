import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  type ListRenderItemInfo,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { colors, spacing } from "../../../theme";
import type { HomeTrendingPackage } from "../types";
import { TrendingPackageCard } from "./trending-package-card";

type TrendingPackagesSectionProps = {
  onPackagePress?: (packageItem: HomeTrendingPackage) => void;
  onSeeAllPress?: () => void;
  packages: HomeTrendingPackage[];
};

export const TrendingPackagesSection = memo(function TrendingPackagesSection({
  onPackagePress,
  onSeeAllPress,
  packages,
}: TrendingPackagesSectionProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const { width } = useWindowDimensions();
  const cardWidth =
    width >= 768 ? 320 : Math.min(284, Math.max(244, width * 0.74));
  const itemSize = cardWidth + spacing.md;
  const renderPackage = useCallback(
    ({ item }: ListRenderItemInfo<HomeTrendingPackage>) => (
      <TrendingPackageCard
        cardWidth={cardWidth}
        onPress={() => onPackagePress?.(item)}
        packageItem={item}
      />
    ),
    [cardWidth, onPackagePress],
  );
  const keyExtractor = useCallback(
    (item: HomeTrendingPackage) => item.id,
    [],
  );
  const contentContainerStyle = useMemo(
    () => ({
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      gap: spacing.md,
      paddingHorizontal: 1,
    }),
    [isRTL],
  );
  const getItemLayout = useCallback(
    (_: ArrayLike<HomeTrendingPackage> | null | undefined, index: number) => ({
      index,
      length: itemSize,
      offset: itemSize * index,
    }),
    [itemSize],
  );

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
        }}
      >
        <AppText
          style={{
            fontSize: 25,
            fontWeight: "800",
            letterSpacing: isRTL ? 0 : -0.6,
          }}
          variant="title"
        >
          {t("home.trendingPackages.title")}
        </AppText>
        <ScalePressable
          accessibilityRole="button"
          contentStyle={{ alignSelf: "flex-start" }}
          onPress={onSeeAllPress}
          scaleTo={0.96}
        >
          <AppText
            color={colors.primary[500]}
            style={{
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: isRTL ? 0 : 0.7,
            }}
            variant="caption"
          >
            {isRTL ? t("home.trendingPackages.seeAll") : t("home.trendingPackages.seeAll").toUpperCase()}
          </AppText>
        </ScalePressable>
      </View>

      <FlatList
        contentContainerStyle={contentContainerStyle}
        data={packages}
        getItemLayout={getItemLayout}
        horizontal
        initialNumToRender={3}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={3}
        removeClippedSubviews={Platform.OS === "android"}
        renderItem={renderPackage}
        showsHorizontalScrollIndicator={false}
        updateCellsBatchingPeriod={16}
        windowSize={5}
      />
    </View>
  );
});
