import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { queryKeys } from "../../../constants/query-keys";
import { useTravelDiscoveryStore } from "../../../store/travel-discovery-store";
import {
  travelDurationRangeOptions,
  travelPriceRangeOptions,
} from "../data/catalog.mock";
import { searchCatalogPackages } from "../services/catalog.service";
import type { TravelDiscoveryFilters } from "../types";

const serialize = (value: unknown) => JSON.stringify(value);

export const useSearchResultsScreen = () => {
  const {
    filters,
    resetFilters,
    setSort,
    sort,
    submittedSearch,
    toggleHotelClass,
    toggleTheme,
    updateFilters,
  } = useTravelDiscoveryStore(
    useShallow((state) => ({
      filters: state.filters,
      resetFilters: state.resetFilters,
      setSort: state.setSort,
      sort: state.sort,
      submittedSearch: state.submittedSearch,
      toggleHotelClass: state.toggleHotelClass,
      toggleTheme: state.toggleTheme,
      updateFilters: state.updateFilters,
    })),
  );
  const searchKey = useMemo(() => serialize(submittedSearch), [submittedSearch]);
  const filtersKey = useMemo(() => serialize(filters), [filters]);
  const searchQuery = useQuery({
    queryKey: queryKeys.catalogSearchResults(searchKey, filtersKey, sort),
    queryFn: () =>
      searchCatalogPackages({
        filters,
        search: submittedSearch,
        sort,
      }),
  });

  const setPriceRange = useCallback(
    (priceRangeId: TravelDiscoveryFilters["priceRangeId"]) => {
      const option = travelPriceRangeOptions.find(
        (item) => item.id === priceRangeId,
      );

      updateFilters({
        priceRange: option?.range ?? {},
        priceRangeId,
      });
    },
    [updateFilters],
  );

  const setDurationRange = useCallback(
    (durationRangeId: TravelDiscoveryFilters["durationRangeId"]) => {
      const option = travelDurationRangeOptions.find(
        (item) => item.id === durationRangeId,
      );

      updateFilters({
        durationRange: option?.range ?? {},
        durationRangeId,
      });
    },
    [updateFilters],
  );

  const activeFilterCount = useMemo(
    () =>
      (filters.priceRangeId !== "all" ? 1 : 0) +
      (filters.durationRangeId !== "all" ? 1 : 0) +
      filters.themes.length +
      filters.hotelClasses.length +
      (filters.directFlightsOnly ? 1 : 0) +
      (filters.refundableOnly ? 1 : 0) +
      (filters.visaFriendlyOnly ? 1 : 0),
    [filters],
  );
  const results = searchQuery.data?.results ?? [];

  return {
    activeFilterCount,
    filters,
    resetFilters,
    results,
    searchQuery,
    setDurationRange,
    setPriceRange,
    setSort,
    sort,
    submittedSearch,
    toggleHotelClass,
    toggleTheme,
    updateFilters,
  };
};
