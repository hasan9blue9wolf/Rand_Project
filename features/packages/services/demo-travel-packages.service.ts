import { simulateRequest } from "../../../services/api/client";
import { demoTravelPackages } from "../data/demo-travel-packages.seed";
import {
  matchesPackageFilters,
  normalizePackageSearchTerm,
  resolvePackageText,
} from "../helpers/package-helpers";
import type { TravelPackage, TravelPackageFilters } from "../types";

const sortPackages = (
  packages: TravelPackage[],
  sortBy: TravelPackageFilters["sortBy"],
) => {
  const nextPackages = [...packages];

  switch (sortBy) {
    case "bestSeller":
      return nextPackages.sort(
        (left, right) =>
          Number(right.isBestSeller) - Number(left.isBestSeller) ||
          right.reviewCount - left.reviewCount,
      );
    case "durationAscending":
      return nextPackages.sort((left, right) => left.durationDays - right.durationDays);
    case "priceAscending":
      return nextPackages.sort((left, right) => left.priceFrom - right.priceFrom);
    case "priceDescending":
      return nextPackages.sort((left, right) => right.priceFrom - left.priceFrom);
    case "ratingDescending":
      return nextPackages.sort((left, right) => right.rating - left.rating);
    case "recommended":
      return nextPackages.sort(
        (left, right) =>
          Number(right.isAIRecommended) - Number(left.isAIRecommended) ||
          Number(right.isFeatured) - Number(left.isFeatured) ||
          right.rating - left.rating,
      );
    default:
      return nextPackages;
  }
};

export const getAllPackages = async () => simulateRequest(demoTravelPackages, 180);

export const getFeaturedPackages = async () =>
  simulateRequest(
    demoTravelPackages.filter((packageItem) => packageItem.isFeatured),
    160,
  );

export const getBestSellerPackages = async () =>
  simulateRequest(
    demoTravelPackages.filter((packageItem) => packageItem.isBestSeller),
    160,
  );

export const getAIRecommendedPackages = async () =>
  simulateRequest(
    demoTravelPackages.filter((packageItem) => packageItem.isAIRecommended),
    160,
  );

export const getPackageById = async (id: TravelPackage["id"]) =>
  simulateRequest(
    demoTravelPackages.find((packageItem) => packageItem.id === id) ?? null,
    120,
  );

export const getPackagesByTag = async (tag: string) =>
  simulateRequest(
    demoTravelPackages.filter((packageItem) => packageItem.tags.includes(tag)),
    140,
  );

export const searchPackages = async (query: string) => {
  const normalizedQuery = normalizePackageSearchTerm(query);

  if (!normalizedQuery) {
    return getAllPackages();
  }

  return simulateRequest(
    demoTravelPackages.filter((packageItem) => {
      const searchBlob = [
        resolvePackageText(packageItem.title),
        resolvePackageText(packageItem.destinationCity),
        resolvePackageText(packageItem.destinationCountry),
        resolvePackageText(packageItem.shortDescription),
        packageItem.region,
        packageItem.category,
        packageItem.departureCities.join(" "),
        packageItem.durationDays,
        packageItem.tripType,
        packageItem.luxuryLevel,
        packageItem.priceFrom,
        packageItem.visaFriendly ? "visa friendly visa-free easy visa" : "",
        packageItem.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return searchBlob.includes(normalizedQuery);
    }),
    180,
  );
};

export const filterPackages = async (filters: TravelPackageFilters) =>
  simulateRequest(
    sortPackages(
      demoTravelPackages.filter((packageItem) =>
        matchesPackageFilters(packageItem, filters),
      ),
      filters.sortBy,
    ),
    180,
  );
