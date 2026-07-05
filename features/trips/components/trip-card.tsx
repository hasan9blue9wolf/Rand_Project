import { TravelCard } from "../../../components/ui/travel-card";
import type { Trip } from "../../../types/travel";

type TripCardProps = {
  enteringIndex?: number;
  onPress?: () => void;
  trip: Trip;
};

export const TripCard = ({ enteringIndex, onPress, trip }: TripCardProps) => {
  if (onPress) {
    return enteringIndex === undefined ? (
      <TravelCard onPress={onPress} trip={trip} />
    ) : (
      <TravelCard enteringIndex={enteringIndex} onPress={onPress} trip={trip} />
    );
  }

  return enteringIndex === undefined ? (
    <TravelCard trip={trip} />
  ) : (
    <TravelCard enteringIndex={enteringIndex} trip={trip} />
  );
};
