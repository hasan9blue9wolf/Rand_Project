import type { FeaturedOffer } from "../../types/travel";

export type PackagesScreenData = {
  highlightedPackageId: FeaturedOffer["id"];
  items: FeaturedOffer[];
  subtitle: string;
  title: string;
};
