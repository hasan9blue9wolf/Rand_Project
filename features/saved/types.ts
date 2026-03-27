export type SavedDestination = {
  countryName?: string;
  destinationName: string;
  destinationSlug: string;
  id: string;
  imageUrl?: string;
  packageId?: string;
  priceFrom?: number;
  savedAt: string;
  source?: string;
  summary?: string;
};

export type SaveDestinationInput = {
  countryName?: string;
  destinationName: string;
  destinationSlug: string;
  imageUrl?: string;
  packageId?: string;
  priceFrom?: number;
  source?: string;
  summary?: string;
};
