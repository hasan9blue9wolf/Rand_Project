import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, Platform, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { SearchField } from "../../../components/ui/search-field";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, spacing } from "../../../theme";
import { demoFlights } from "../data/flights.mock";
import type { FlightCabin, FlightItinerary } from "../types";

type FlightsScreenProps = {
  initialFrom?: string;
  initialTo?: string;
};

const cabins: FlightCabin[] = ["economy", "premiumEconomy", "business"];

const FlightCard = ({ flight }: { flight: FlightItinerary }) => {
  const { formatCurrency, isRTL, t } = useLocalization();

  return (
    <AppCard>
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: spacing.md }}>
        <Image
          resizeMode="cover"
          source={getRemoteImageSource(flight.airlineLogo)}
          style={{
            backgroundColor: colors.surface.muted,
            borderRadius: radius.md,
            height: 64,
            width: 64,
          }}
        />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="title">{flight.airline}</AppText>
          <AppText>{`${flight.fromCity} (${flight.fromAirport}) -> ${flight.toCity} (${flight.toAirport})`}</AppText>
          <AppText variant="bodySmall">
            {`${flight.departureDate} · ${flight.departureTime} - ${flight.arrivalTime} · ${flight.duration}`}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.md }}>
        <Chip label={flight.cabin} tone="primary" />
        <Chip label={flight.stops === 0 ? "Nonstop" : `${flight.stops} stops`} tone="navy" />
        <Chip label={flight.baggage} tone="coral" />
        {flight.refundable ? <Chip label="Refundable" tone="success" /> : null}
      </View>
      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        <AppText color={colors.primary[600]} variant="headline">
          {formatCurrency(flight.priceFrom, { currency: flight.currency })}
        </AppText>
        <PrimaryButton
          label={t("common.viewDetails")}
          onPress={() => router.push(appRoutes.flightDetails(flight.flightId))}
        />
      </View>
    </AppCard>
  );
};

export const FlightsScreen = ({
  initialFrom = "",
  initialTo = "",
}: FlightsScreenProps) => {
  const { t } = useLocalization();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [cabin, setCabin] = useState<FlightCabin | undefined>();
  const flights = useMemo(() => {
    const fromQuery = from.trim().toLowerCase();
    const toQuery = to.trim().toLowerCase();

    return demoFlights.filter((flight) => {
      const matchesFrom =
        !fromQuery ||
        flight.fromCity.toLowerCase().includes(fromQuery) ||
        flight.fromAirport.toLowerCase().includes(fromQuery);
      const matchesTo =
        !toQuery ||
        flight.toCity.toLowerCase().includes(toQuery) ||
        flight.toAirport.toLowerCase().includes(toQuery);
      const matchesCabin = !cabin || flight.cabin === cabin;

      return matchesFrom && matchesTo && matchesCabin;
    });
  }, [cabin, from, to]);

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.section }}
      data={flights}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.flightId}
      ListEmptyComponent={
        <EmptyState
          description="Try Dubai, Istanbul, Doha, Paris, Tokyo, London, Bali, or Beirut."
          icon="airplane-outline"
          title="No matching demo flights"
          tone="premium"
        />
      }
      ListHeaderComponent={
        <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
          <AppCard elevated>
            <View style={{ gap: spacing.md }}>
              <AppText variant="title">Flight search</AppText>
              <SearchField label="From" onChangeText={setFrom} value={from} />
              <SearchField label="To" onChangeText={setTo} value={to} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                {cabins.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    onPress={() => setCabin(cabin === item ? undefined : item)}
                    selected={cabin === item}
                    tone="primary"
                  />
                ))}
              </View>
              <Chip label={`${flights.length} demo flights`} tone="navy" />
            </View>
          </AppCard>
        </View>
      }
      removeClippedSubviews={false}
      renderItem={({ item }) => <FlightCard flight={item} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
      showsVerticalScrollIndicator={false}
    />
  );
};
