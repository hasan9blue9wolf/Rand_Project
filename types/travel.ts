export type FeaturedOffer = {
  id: string;
  title: string;
  destination: string;
  duration: string;
  priceFrom: number;
  badge: string;
  accent: [string, string];
  highlights: string[];
};

export type TripStatus = "confirmed" | "planning" | "wishlist";

export type Trip = {
  id: string;
  title: string;
  destination: string;
  endDate: string;
  status: TripStatus;
  startDate: string;
  progressLabel: string;
  travelers: number;
};
