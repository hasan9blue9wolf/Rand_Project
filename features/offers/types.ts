import type { FeaturedOffer } from "../../types/travel";

export type OfferListItem = FeaturedOffer;

export type OfferBookmark = {
  createdAt: string;
  id: string;
  note?: string;
  offerId: string;
};

export type OffersScreenData = {
  offers: OfferListItem[];
  subtitle: string;
  title: string;
};
