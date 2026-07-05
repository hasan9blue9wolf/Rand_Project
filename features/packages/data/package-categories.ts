import type { TravelPackageFilters } from "../types";

export type PackageCategoryId =
  | "beach-holidays"
  | "business-travel"
  | "city-breaks"
  | "cultural-journeys"
  | "family-trips"
  | "honeymoon"
  | "luxury-escapes"
  | "mountain-adventures"
  | "student-budget"
  | "weekend-trips";

export type PackageCategoryDefinition = {
  filters: TravelPackageFilters;
  id: PackageCategoryId;
  imageUrl: string;
  titleKey: string;
};

export const packageCategories: PackageCategoryDefinition[] = [
  {
    filters: { category: "luxury" },
    id: "luxury-escapes",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.luxuryEscapes",
  },
  {
    filters: { category: "family" },
    id: "family-trips",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.familyTrips",
  },
  {
    filters: { category: "honeymoon" },
    id: "honeymoon",
    imageUrl:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.honeymoon",
  },
  {
    filters: { category: "student" },
    id: "student-budget",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.studentBudget",
  },
  {
    filters: { category: "beach" },
    id: "beach-holidays",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.beachHolidays",
  },
  {
    filters: { category: "mountain" },
    id: "mountain-adventures",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.mountainAdventures",
  },
  {
    filters: { category: "culture" },
    id: "cultural-journeys",
    imageUrl:
      "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.culturalJourneys",
  },
  {
    filters: { category: "city break" },
    id: "city-breaks",
    imageUrl:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.cityBreaks",
  },
  {
    filters: { category: "business" },
    id: "business-travel",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.businessTravel",
  },
  {
    filters: { maxDurationDays: 4 },
    id: "weekend-trips",
    imageUrl:
      "https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=1200&q=80",
    titleKey: "packageCategories.weekendTrips",
  },
];

export const getPackageCategoryById = (categoryId: string) =>
  packageCategories.find((category) => category.id === categoryId);
