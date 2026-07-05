import { router } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Platform, View } from "react-native";

import { EmptyState } from "../../../components/ui/empty-state";
import {
  ScreenContainer,
  screenContainerBottomTabSpacing,
} from "../../../components/ui/screen-container";
import { appRoutes } from "../../../navigation/routes";
import { spacing } from "../../../theme";
import type { DemoPackageBooking } from "../../booking/types/demo-package-booking";
import { useTripsScreen } from "../hooks/use-trips-screen";
import { DemoBookingTripCard } from "./demo-booking-trip-card";

export const TripsScreen = () => {
  const { t } = useTranslation();
  const { bookings, hasTrips } = useTripsScreen();
  const renderTrip = useCallback(
    ({ index, item }: { index: number; item: DemoPackageBooking }) => (
      <DemoBookingTripCard
        booking={item}
        enteringIndex={index}
        onPress={() => router.push(appRoutes.tripDetails(item.bookingId))}
      />
    ),
    [],
  );
  const keyExtractor = useCallback(
    (item: DemoPackageBooking) => item.bookingId,
    [],
  );

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      eyebrow={t("common.appName")}
      scrollable={false}
      subtitle={t("trips.subtitle")}
      title={t("trips.title")}
    >
      {hasTrips ? (
        <FlatList
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: screenContainerBottomTabSpacing,
          }}
          data={bookings}
          initialNumToRender={4}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          keyExtractor={keyExtractor}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              actionLabel={t("trips.exploreCta")}
              description={t("trips.emptyBody")}
              icon="briefcase-outline"
              onPress={() => router.push(appRoutes.packages)}
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
      ) : (
        <EmptyState
          actionLabel={t("trips.exploreCta")}
          description={t("trips.emptyBody")}
          icon="briefcase-outline"
          onPress={() => router.push(appRoutes.packages)}
          title={t("trips.emptyTitle")}
          tone="premium"
        />
      )}
    </ScreenContainer>
  );
};
