import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TravelPackage } from "../features/packages/types";
import { appStorage } from "../services/storage";

export type FavoritePackageSnapshot = {
  category: TravelPackage["category"];
  currency: TravelPackage["currency"];
  destinationCity: TravelPackage["destinationCity"];
  destinationCountry: TravelPackage["destinationCountry"];
  durationDays: TravelPackage["durationDays"];
  id: string;
  imageUrl: string;
  packageId: string;
  priceFrom: TravelPackage["priceFrom"];
  rating: TravelPackage["rating"];
  savedAt: string;
  tags: TravelPackage["tags"];
  title: TravelPackage["title"];
};

type PackageFavoritesState = {
  clearFavoritePackages: () => void;
  favorites: FavoritePackageSnapshot[];
  isFavoritePackage: (packageId: string) => boolean;
  removeFavoritePackage: (packageId: string) => void;
  saveFavoritePackage: (packageItem: TravelPackage) => void;
  toggleFavoritePackage: (packageItem: TravelPackage) => boolean;
};

const createFavoriteSnapshot = (
  packageItem: TravelPackage,
): FavoritePackageSnapshot => ({
  category: packageItem.category,
  currency: packageItem.currency,
  destinationCity: packageItem.destinationCity,
  destinationCountry: packageItem.destinationCountry,
  durationDays: packageItem.durationDays,
  id: packageItem.id,
  imageUrl: packageItem.imageUrl,
  packageId: packageItem.id,
  priceFrom: packageItem.priceFrom,
  rating: packageItem.rating,
  savedAt: new Date().toISOString(),
  tags: packageItem.tags,
  title: packageItem.title,
});

export const usePackageFavoritesStore = create<PackageFavoritesState>()(
  persist(
    (set, get) => ({
      clearFavoritePackages: () => set({ favorites: [] }),
      favorites: [],
      isFavoritePackage: (packageId) =>
        get().favorites.some((favorite) => favorite.packageId === packageId),
      removeFavoritePackage: (packageId) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (favorite) => favorite.packageId !== packageId,
          ),
        })),
      saveFavoritePackage: (packageItem) =>
        set((state) => {
          const existingFavorite = state.favorites.some(
            (favorite) => favorite.packageId === packageItem.id,
          );

          if (existingFavorite) {
            return state;
          }

          return {
            favorites: [createFavoriteSnapshot(packageItem), ...state.favorites],
          };
        }),
      toggleFavoritePackage: (packageItem) => {
        const existingFavorite = get().favorites.some(
          (favorite) => favorite.packageId === packageItem.id,
        );

        if (existingFavorite) {
          get().removeFavoritePackage(packageItem.id);
          return false;
        }

        get().saveFavoritePackage(packageItem);
        return true;
      },
    }),
    {
      name: "hayatrips-package-favorites",
      storage: appStorage,
    },
  ),
);
