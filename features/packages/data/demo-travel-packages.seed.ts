import packageCatalog from "../../../shared/catalog/packages.json";
import type { TravelPackage } from "../types";

/** The shared JSON catalog is the canonical package inventory for mobile and server. */
export const demoTravelPackages = packageCatalog as TravelPackage[];
