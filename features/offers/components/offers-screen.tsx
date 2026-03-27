import { router } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Platform, View } from "react-native";

import { EmptyState } from "../../../components/ui/empty-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { PackageCard } from "../../../components/ui/package-card";
import {
  ScreenContainer,
  screenContainerBottomTabSpacing,
} from "../../../components/ui/screen-container";
import { appRoutes } from "../../../navigation/routes";
import { spacing } from "../../../theme";
import type { FeaturedOffer } from "../../../types/travel";
import { useOffersScreen } from "../hooks/use-offers-screen";

export const OffersScreen = () => {
  const { t } = useTranslation();
  const { hasOffers, offers, offersQuery } = useOffersScreen();
  const isInitialLoading = offersQuery.isLoading && !offersQuery.data;
  const renderOffer = useCallback(
    ({ index, item }: { index: number; item: FeaturedOffer }) => (
      <PackageCard
        actionLabel={t("common.viewDetails")}
        enteringIndex={index}
        offer={item}
        onActionPress={() => router.push(appRoutes.packageDetails(item.id))}
      />
    ),
    [t],
  );
  const keyExtractor = useCallback((item: FeaturedOffer) => item.id, []);

  if (isInitialLoading) {
    return (
      <ScreenContainer
        eyebrow={t("common.explore")}
        scrollable={false}
        subtitle={t("offers.subtitle")}
        title={t("offers.title")}
      >
        <LoadingState label={t("common.search")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      eyebrow={t("common.explore")}
      scrollable={false}
      subtitle={t("offers.subtitle")}
      title={t("offers.title")}
    >
      {offersQuery.isError && !hasOffers ? (
        <EmptyState
          actionLabel={t("common.retry")}
          description={t("offers.emptyBody")}
          onPress={() => {
            void offersQuery.refetch();
          }}
          title={t("offers.emptyTitle")}
          tone="error"
        />
      ) : (
        <FlatList
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: screenContainerBottomTabSpacing,
          }}
          data={offers}
          initialNumToRender={4}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          keyExtractor={keyExtractor}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              description={t("offers.emptyBody")}
              title={t("offers.emptyTitle")}
              tone="premium"
            />
          }
          maxToRenderPerBatch={4}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={renderOffer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          updateCellsBatchingPeriod={16}
          windowSize={7}
        />
      )}
    </ScreenContainer>
  );
};
