import type { FeaturedOffer } from "../../types/travel";

export type LocalizedPackageText = {
  ar: string;
  en: string;
  fr?: string;
};

export type TravelPackageRegion =
  | "Africa"
  | "Asia"
  | "Caribbean"
  | "Europe"
  | "Middle East"
  | "North America"
  | "Oceania"
  | "South America";

export type TravelPackageCategory =
  | "adventure"
  | "beach"
  | "budget"
  | "business"
  | "city break"
  | "culture"
  | "family"
  | "honeymoon"
  | "luxury"
  | "mountain"
  | "student";

export type TravelPackageTripType =
  | "adventure"
  | "beach"
  | "business"
  | "city"
  | "cultural"
  | "family"
  | "honeymoon"
  | "mountain"
  | "student";

export type TravelPackageLuxuryLevel =
  | "budget"
  | "comfort"
  | "premium"
  | "luxury"
  | "ultraLuxury";

export type TravelPackageItineraryDay = {
  day: number;
  title: LocalizedPackageText;
  description: LocalizedPackageText;
};

export type TravelPackageDateOption = {
  endDate: string;
  id: string;
  seatsLeft: number;
  startDate: string;
};

export type TravelPackage = {
  availableDates: TravelPackageDateOption[];
  bestSeason: LocalizedPackageText;
  category: TravelPackageCategory;
  currency: "USD";
  departureCities: string[];
  destinationCity: LocalizedPackageText;
  destinationCountry: LocalizedPackageText;
  durationDays: number;
  durationNights: number;
  excludes: LocalizedPackageText[];
  flightIncluded: boolean;
  galleryImages: string[];
  hotelClass: 3 | 4 | 5;
  hotelIncluded: boolean;
  id: string;
  imageUrl: string;
  includes: LocalizedPackageText[];
  isAIRecommended: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  itinerary: TravelPackageItineraryDay[];
  longDescription: LocalizedPackageText;
  luxuryLevel: TravelPackageLuxuryLevel;
  maxTravelers: number;
  priceFrom: number;
  rating: number;
  region: TravelPackageRegion;
  reviewCount: number;
  shortDescription: LocalizedPackageText;
  tags: string[];
  title: LocalizedPackageText;
  tripType: TravelPackageTripType;
  visaFriendly: boolean;
  visaNote: LocalizedPackageText;
};

export type TravelPackageSortOption =
  | "bestSeller"
  | "durationAscending"
  | "priceAscending"
  | "priceDescending"
  | "ratingDescending"
  | "recommended";

export type TravelPackageFilters = {
  category?: TravelPackageCategory;
  departureCity?: string;
  flightIncluded?: boolean;
  hotelClass?: TravelPackage["hotelClass"] | TravelPackage["hotelClass"][];
  hotelIncluded?: boolean;
  isAIRecommended?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  luxuryLevel?: TravelPackageLuxuryLevel | TravelPackageLuxuryLevel[];
  maxDurationDays?: number;
  maxPrice?: number;
  minDurationDays?: number;
  minPrice?: number;
  region?: TravelPackageRegion;
  sortBy?: TravelPackageSortOption;
  tag?: string;
  tripType?: TravelPackageTripType | TravelPackageTripType[];
  visaFriendly?: boolean;
};

export type PackagesScreenData = {
  highlightedPackageId: FeaturedOffer["id"];
  items: FeaturedOffer[];
  subtitle: string;
  title: string;
};
