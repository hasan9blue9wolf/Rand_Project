import { router, useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, spacing } from "../../../theme";
import { demoFlights } from "../data/flights.mock";

export const FlightDetailsScreen = () => {
  const { flightId } = useLocalSearchParams<{ flightId?: string }>();
  const { formatCurrency, t } = useLocalization();
  const flight = demoFlights.find((item) => item.flightId === flightId);

  if (!flight) {
    return (
      <ScreenContainer title="Flight details" withBottomTabSpacing={false}>
        <EmptyState
          actionLabel="Search flights"
          description="This demo flight could not be found."
          onPress={() => router.replace(appRoutes.searchResults({ mode: "flights" }))}
          title="Flight unavailable"
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.searchResults({ mode: "flights" }))}
        />
      }
      title="Flight details"
      subtitle={`${flight.fromAirport} -> ${flight.toAirport}`}
      withBottomTabSpacing={false}
    >
      <AppCard elevated>
        <View style={{ alignItems: "center", gap: spacing.md }}>
          <Image
            source={getRemoteImageSource(flight.airlineLogo)}
            style={{
              backgroundColor: colors.surface.muted,
              borderRadius: radius.lg,
              height: 120,
              width: "100%",
            }}
          />
          <AppText variant="headline">{flight.airline}</AppText>
          <AppText>{`${flight.fromCity} to ${flight.toCity}`}</AppText>
          <AppText color={colors.primary[600]} variant="headline">
            {formatCurrency(flight.priceFrom, { currency: flight.currency })}
          </AppText>
        </View>
      </AppCard>
      <AppCard>
        <View style={{ gap: spacing.md }}>
          <DetailRow label="Flight" value={flight.flightId} />
          <DetailRow label="Date" value={flight.departureDate} />
          <DetailRow label="Time" value={`${flight.departureTime} - ${flight.arrivalTime}`} />
          <DetailRow label="Duration" value={flight.duration} />
          <DetailRow label="Cabin" value={flight.cabin} />
          <DetailRow label="Baggage" value={flight.baggage} />
          <DetailRow label="Refundable" value={flight.refundable ? "Yes" : "No"} />
          <Chip label={flight.stops === 0 ? "Nonstop" : `${flight.stops} stops`} tone="navy" />
        </View>
      </AppCard>
      <PrimaryButton
        icon="briefcase-outline"
        label="Book demo flight"
        onPress={() => router.push(appRoutes.demoBooking(flight.flightId))}
      />
    </ScreenContainer>
  );
};
