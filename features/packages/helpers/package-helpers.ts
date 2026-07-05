import type { AppLocale } from "../../../types/i18n";
import { formatCurrency } from "../../../utils/format";
import type {
  LocalizedPackageText,
  TravelPackage,
  TravelPackageFilters,
} from "../types";

export const FALLBACK_PACKAGE_IMAGE_URL =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80";

export const resolvePackageText = (
  value: LocalizedPackageText,
  locale: AppLocale = "en",
) => value[locale] || value.en;

export const resolvePackageImageUrl = (imageUrl?: string | null) =>
  imageUrl?.startsWith("https://") ? imageUrl : FALLBACK_PACKAGE_IMAGE_URL;

export const getPackageGalleryImages = (packageItem: TravelPackage) => {
  const gallery = [packageItem.imageUrl, ...packageItem.galleryImages]
    .map(resolvePackageImageUrl)
    .filter((url, index, values) => values.indexOf(url) === index);

  return gallery.length > 0 ? gallery : [resolvePackageImageUrl(packageItem.imageUrl)];
};

export const formatPackagePrice = (
  packageItem: Pick<TravelPackage, "priceFrom">,
  locale: AppLocale = "en",
) => formatCurrency(packageItem.priceFrom, locale);

export const normalizePackageSearchTerm = (value: string) =>
  value.trim().toLowerCase();

export const matchesPackageFilters = (
  packageItem: TravelPackage,
  filters: TravelPackageFilters,
) => {
  if (filters.category && packageItem.category !== filters.category) {
    return false;
  }

  if (filters.region && packageItem.region !== filters.region) {
    return false;
  }

  if (filters.minPrice && packageItem.priceFrom < filters.minPrice) {
    return false;
  }

  if (filters.maxPrice && packageItem.priceFrom > filters.maxPrice) {
    return false;
  }

  if (filters.minDurationDays && packageItem.durationDays < filters.minDurationDays) {
    return false;
  }

  if (filters.maxDurationDays && packageItem.durationDays > filters.maxDurationDays) {
    return false;
  }

  if (filters.flightIncluded !== undefined && packageItem.flightIncluded !== filters.flightIncluded) {
    return false;
  }

  if (filters.visaFriendly !== undefined && packageItem.visaFriendly !== filters.visaFriendly) {
    return false;
  }

  if (filters.hotelIncluded !== undefined && packageItem.hotelIncluded !== filters.hotelIncluded) {
    return false;
  }

  if (filters.isFeatured !== undefined && packageItem.isFeatured !== filters.isFeatured) {
    return false;
  }

  if (filters.isBestSeller !== undefined && packageItem.isBestSeller !== filters.isBestSeller) {
    return false;
  }

  if (
    filters.isAIRecommended !== undefined &&
    packageItem.isAIRecommended !== filters.isAIRecommended
  ) {
    return false;
  }

  if (filters.departureCity && !packageItem.departureCities.includes(filters.departureCity)) {
    return false;
  }

  if (filters.tag && !packageItem.tags.includes(filters.tag)) {
    return false;
  }

  if (filters.hotelClass) {
    const hotelClasses = Array.isArray(filters.hotelClass)
      ? filters.hotelClass
      : [filters.hotelClass];

    if (!hotelClasses.includes(packageItem.hotelClass)) {
      return false;
    }
  }

  if (filters.luxuryLevel) {
    const luxuryLevels = Array.isArray(filters.luxuryLevel)
      ? filters.luxuryLevel
      : [filters.luxuryLevel];

    if (!luxuryLevels.includes(packageItem.luxuryLevel)) {
      return false;
    }
  }

  if (filters.tripType) {
    const tripTypes = Array.isArray(filters.tripType) ? filters.tripType : [filters.tripType];

    if (!tripTypes.includes(packageItem.tripType)) {
      return false;
    }
  }

  return true;
};
