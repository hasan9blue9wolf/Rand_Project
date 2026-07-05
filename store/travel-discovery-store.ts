import { create } from "zustand";

import {
  defaultTravelDiscoveryFilters,
  defaultTravelSearchRequest,
} from "../features/catalog/data/catalog.mock";
import type {
  TravelDiscoveryFilters,
  TravelDiscoverySearchRequest,
  TravelDiscoverySortOption,
  TravelDiscoveryTheme,
  TravelHotelClass,
} from "../features/catalog/types";

type TravelDiscoveryState = {
  draftSearch: TravelDiscoverySearchRequest;
  filters: TravelDiscoveryFilters;
  resetFilters: () => void;
  setDraftSearch: (payload: Partial<TravelDiscoverySearchRequest>) => void;
  setSort: (sort: TravelDiscoverySortOption) => void;
  setSubmittedSearch: (payload: Partial<TravelDiscoverySearchRequest>) => void;
  sort: TravelDiscoverySortOption;
  submittedSearch: TravelDiscoverySearchRequest;
  toggleHotelClass: (hotelClass: TravelHotelClass) => void;
  toggleTheme: (theme: TravelDiscoveryTheme) => void;
  updateFilters: (payload: Partial<TravelDiscoveryFilters>) => void;
};

const cloneDefaultFilters = (): TravelDiscoveryFilters => ({
  ...defaultTravelDiscoveryFilters,
  durationRange: { ...defaultTravelDiscoveryFilters.durationRange },
  hotelClasses: [...defaultTravelDiscoveryFilters.hotelClasses],
  priceRange: { ...defaultTravelDiscoveryFilters.priceRange },
  themes: [...defaultTravelDiscoveryFilters.themes],
});

export const useTravelDiscoveryStore = create<TravelDiscoveryState>()((set) => ({
  draftSearch: defaultTravelSearchRequest,
  filters: cloneDefaultFilters(),
  resetFilters: () =>
    set({
      filters: cloneDefaultFilters(),
      sort: "recommended",
    }),
  setDraftSearch: (payload) =>
    set((state) => ({
      draftSearch: {
        ...state.draftSearch,
        ...payload,
      },
    })),
  setSort: (sort) => set({ sort }),
  setSubmittedSearch: (payload) =>
    set((state) => {
      const nextSearch = {
        ...state.draftSearch,
        ...payload,
      };

      return {
        draftSearch: nextSearch,
        filters: cloneDefaultFilters(),
        sort: "recommended",
        submittedSearch: nextSearch,
      };
    }),
  sort: "recommended",
  submittedSearch: defaultTravelSearchRequest,
  toggleHotelClass: (hotelClass) =>
    set((state) => ({
      filters: {
        ...state.filters,
        hotelClasses: state.filters.hotelClasses.includes(hotelClass)
          ? state.filters.hotelClasses.filter((item) => item !== hotelClass)
          : [...state.filters.hotelClasses, hotelClass].sort(),
      },
    })),
  toggleTheme: (theme) =>
    set((state) => ({
      filters: {
        ...state.filters,
        themes: state.filters.themes.includes(theme)
          ? state.filters.themes.filter((item) => item !== theme)
          : [...state.filters.themes, theme],
      },
    })),
  updateFilters: (payload) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...payload,
      },
    })),
}));
