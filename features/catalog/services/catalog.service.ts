import {
  catalogPackages,
  catalogPackagesByBookingId,
  catalogPackagesById,
  defaultTravelSearchRequest,
  featuredOffersById,
  travelPassengerOptionsById,
} from "../data/catalog.mock";
import type {
  TravelDiscoveryFilters,
  TravelDiscoveryPackage,
  TravelDiscoverySearchRequest,
  TravelDiscoverySearchResponse,
  TravelDiscoverySearchResult,
  TravelDiscoverySortOption,
} from "../types";

const getTripLengthDays = (search: TravelDiscoverySearchRequest) => {
  const start = new Date(search.startDate);
  const end = new Date(search.endDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const difference = Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);

  return Math.max(1, difference);
};

const matchesRange = (value: number, range: TravelDiscoveryFilters["priceRange"]) => {
  if (typeof range.min === "number" && value < range.min) {
    return false;
  }

  if (typeof range.max === "number" && value > range.max) {
    return false;
  }

  return true;
};

const getTravelProfileBoost = (
  packageItem: TravelDiscoveryPackage,
  search: TravelDiscoverySearchRequest,
) => {
  const passengerOption = travelPassengerOptionsById[search.passengerOptionId];

  if (!passengerOption) {
    return 0;
  }

  if (passengerOption.profile === "family") {
    return packageItem.themes.includes("family") ? 28 : 0;
  }

  if (passengerOption.profile === "business") {
    return packageItem.themes.includes("business") ? 26 : 0;
  }

  if (passengerOption.profile === "solo") {
    return packageItem.themes.some((theme) => theme === "city" || theme === "adventure")
      ? 16
      : 0;
  }

  return packageItem.themes.some((theme) => theme === "beach" || theme === "luxury")
    ? 18
    : 0;
};

const getModeBoost = (
  packageItem: TravelDiscoveryPackage,
  search: TravelDiscoverySearchRequest,
) => {
  if (search.mode === "flights") {
    return (
      (packageItem.directFlight ? 26 : 0) +
      (packageItem.refundable ? 10 : 0) +
      Math.max(0, 10 - packageItem.durationDays)
    );
  }

  return packageItem.hotelClass * 6 + (packageItem.themes.includes("luxury") ? 14 : 0);
};

const buildSearchScore = (
  packageItem: TravelDiscoveryPackage,
  search: TravelDiscoverySearchRequest,
) => {
  const tripLength = getTripLengthDays(search);
  const durationDelta = Math.abs(packageItem.durationDays - tripLength);

  return (
    (packageItem.destinationId === search.toId ? 120 : 0) +
    (packageItem.departureLocationId === search.fromId ? 30 : 0) +
    Math.max(0, 18 - durationDelta * 4) +
    getTravelProfileBoost(packageItem, search) +
    getModeBoost(packageItem, search) +
    packageItem.hotelClass * 2 +
    (packageItem.visaFriendly ? 4 : 0)
  );
};

const buildSearchResult = (
  packageItem: TravelDiscoveryPackage,
  search: TravelDiscoverySearchRequest,
): TravelDiscoverySearchResult | null => {
  const offer = featuredOffersById[packageItem.id];

  if (!offer) {
    return null;
  }

  return {
    ...offer,
    ...packageItem,
    searchScore: buildSearchScore(packageItem, search),
  };
};

const applyFilters = (
  results: TravelDiscoverySearchResult[],
  filters: TravelDiscoveryFilters,
) =>
  results.filter((result) => {
    if (!matchesRange(result.priceFrom, filters.priceRange)) {
      return false;
    }

    if (!matchesRange(result.durationDays, filters.durationRange)) {
      return false;
    }

    if (filters.themes.length > 0) {
      const matchesTheme = filters.themes.some((theme) => result.themes.includes(theme));

      if (!matchesTheme) {
        return false;
      }
    }

    if (filters.hotelClasses.length > 0 && !filters.hotelClasses.includes(result.hotelClass)) {
      return false;
    }

    if (filters.directFlightsOnly && !result.directFlight) {
      return false;
    }

    if (filters.refundableOnly && !result.refundable) {
      return false;
    }

    if (filters.visaFriendlyOnly && !result.visaFriendly) {
      return false;
    }

    return true;
  });

const sortResults = (
  results: TravelDiscoverySearchResult[],
  sort: TravelDiscoverySortOption,
) =>
  [...results].sort((left, right) => {
    if (sort === "priceAscending") {
      return left.priceFrom - right.priceFrom;
    }

    if (sort === "priceDescending") {
      return right.priceFrom - left.priceFrom;
    }

    if (sort === "durationAscending") {
      return left.durationDays - right.durationDays;
    }

    if (sort === "luxuryDescending") {
      return right.hotelClass - left.hotelClass || right.priceFrom - left.priceFrom;
    }

    return right.searchScore - left.searchScore || left.priceFrom - right.priceFrom;
  });

export const searchCatalogPackages = async ({
  filters,
  search,
  sort,
}: {
  filters: TravelDiscoveryFilters;
  search: TravelDiscoverySearchRequest;
  sort: TravelDiscoverySortOption;
}): Promise<TravelDiscoverySearchResponse> => {
  const results = catalogPackages
    .map((packageItem) => buildSearchResult(packageItem, search))
    .filter((result): result is TravelDiscoverySearchResult => Boolean(result));
  const filteredResults = applyFilters(results, filters);

  return {
    appliedSort: sort,
    results: sortResults(filteredResults, sort),
    totalCount: filteredResults.length,
  };
};

export const getCatalogPackageDetails = async ({
  packageId,
  search,
}: {
  packageId: TravelDiscoveryPackage["id"];
  search?: TravelDiscoverySearchRequest | null;
}) => {
  const packageItem = catalogPackagesById[packageId];

  if (!packageItem) {
    return null;
  }

  return buildSearchResult(packageItem, search ?? defaultTravelSearchRequest);
};

export const getCatalogPackageByBookingId = async ({
  bookingId,
  search,
}: {
  bookingId: TravelDiscoveryPackage["bookingId"];
  search?: TravelDiscoverySearchRequest | null;
}) => {
  const packageItem = catalogPackagesByBookingId[bookingId];

  if (!packageItem) {
    return null;
  }

  return buildSearchResult(packageItem, search ?? defaultTravelSearchRequest);
};
