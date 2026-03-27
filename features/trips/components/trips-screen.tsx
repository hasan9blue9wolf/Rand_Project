import { router } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Platform, View } from "react-native";

import { EmptyState } from "../../../components/ui/empty-state";
import { LoadingState } from "../../../components/ui/loading-state";
import {
  ScreenContainer,
  screenContainerBottomTabSpacing,
} from "../../../components/ui/screen-container";
import { appRoutes } from "../../../navigation/routes";
import { spacing } from "../../../theme";
import type { Trip } from "../../../types/travel";
import { useTripsScreen } from "../hooks/use-trips-screen";
import { TripCard } from "./trip-card";

export const TripsScreen = () => {
  const { t } = useTranslation();
  const { hasTrips, trips, tripsQuery } = useTripsScreen();
  const isInitialLoading = tripsQuery.isLoading && !tripsQuery.data;
  const renderTrip = useCallback(
    ({ index, item }: { index: number; item: Trip }) => (
      <TripCard
        enteringIndex={index}
        onPress={() => router.push(appRoutes.tripDetails(item.id))}
        trip={item}
      />
    ),
    [],
  );
  const keyExtractor = useCallback((item: Trip) => item.id, []);

  if (isInitialLoading) {
    return (
      <ScreenContainer
        eyebrow={t("common.appName")}
        scrollable={false}
        subtitle={t("trips.subtitle")}
        title={t("trips.title")}
      >
        <LoadingState label={t("common.search")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      eyebrow={t("common.appName")}
      scrollable={false}
      subtitle={t("trips.subtitle")}
      title={t("trips.title")}
    >
      {tripsQuery.isError && !hasTrips ? (
        <EmptyState
          actionLabel={t("common.retry")}
          description={t("trips.emptyBody")}
          onPress={() => {
            void tripsQuery.refetch();
          }}
          title={t("common.retry")}
          tone="error"
        />
      ) : (
        <FlatList
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: screenContainerBottomTabSpacing,
          }}
          data={trips}
          initialNumToRender={4}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          keyExtractor={keyExtractor}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              description={t("trips.emptyBody")}
              icon="briefcase-outline"
              title={t("trips.emptyTitle")}
              tone="premium"
            />
          }
          maxToRenderPerBatch={4}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={renderTrip}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          updateCellsBatchingPeriod={16}
          windowSize={7}
        />
      )}
    </ScreenContainer>
  );
};
