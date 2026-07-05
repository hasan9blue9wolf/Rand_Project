import { PackageCard } from "../../../components/ui/package-card";
import type { FeaturedOffer } from "../../../types/travel";

type OfferCardProps = {
  offer: FeaturedOffer;
};

export const OfferCard = ({ offer }: OfferCardProps) => <PackageCard offer={offer} />;
