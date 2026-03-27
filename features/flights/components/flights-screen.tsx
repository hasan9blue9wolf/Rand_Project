import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { LoadingState } from "../../../components/ui/loading-state";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { spacing } from "../../../theme";
import { useFlightsScreen } from "../hooks/use-flights-screen";

export const FlightsScreen = () => {
  const { formatCurrency } = useLocalization();
  const { flightsQuery, screenData } = useFlightsScreen();

  return (
    <ScreenContainer subtitle={screenData.subtitle} title={screenData.title}>
      {flightsQuery.isLoading ? <LoadingState label={screenData.title} /> : null}

      <AppCard elevated>
        <AppText variant="title">{screenData.headline}</AppText>
        <AppText>{`${screenData.search.from} -> ${screenData.search.to}`}</AppText>
        <AppText variant="bodySmall">{`${screenData.search.passengers} travelers · ${screenData.search.cabin}`}</AppText>
      </AppCard>

      {screenData.itineraries.map((itinerary) => (
        <AppCard key={itinerary.id}>
          <AppText variant="title">{itinerary.route}</AppText>
          <AppText>{`${itinerary.departureTime} -> ${itinerary.arrivalTime}`}</AppText>
          <AppText color="#235DFF" variant="label">
            {formatCurrency(itinerary.price)}
          </AppText>
          <AppCard
            style={{
              borderWidth: 0,
              padding: 0,
              shadowOpacity: 0,
              elevation: 0,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.sm,
            }}
          >
            {itinerary.tags.map((tag) => (
              <Chip key={tag} label={tag} tone="navy" />
            ))}
          </AppCard>
        </AppCard>
      ))}
    </ScreenContainer>
  );
};
