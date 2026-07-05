import type { Href } from "expo-router";

import type { BookingMode } from "../features/home/types";

export type PackageId = string;
export type BookingId =
  | "booking-bali-signature"
  | "booking-alps-private"
  | "booking-barcelona-family"
  | "booking-cappadocia-adventure"
  | "booking-maldives-cove"
  | "booking-tokyo-curated";

export type SearchSource = "home" | "offers" | "saved";

export type AppRouteParams = {
  auth: undefined;
  checkout: { bookingId: BookingId };
  demoBooking: { packageId: string };
  demoBookingConfirmed: { bookingId: string };
  packageCategory: { categoryId: string };
  destinationDetails: { destinationId: string };
  emptyStates: undefined;
  errorStates: undefined;
  flightBookingDetails: { bookingId: BookingId };
  flightDetails: { flightId: string };
  heia: { packageContext?: string; packageId?: string } | undefined;
  helpSupport: undefined;
  home: undefined;
  languageSelector: undefined;
  notifications: undefined;
  offlineState: undefined;
  offers: undefined;
  packages: undefined;
  packageDetails: { packageId: PackageId };
  paymentMethod: { bookingId: BookingId };
  profile: undefined;
  savedDestinations: undefined;
  searchResults:
    | { mode?: BookingMode; query?: string; source?: SearchSource }
    | undefined;
  settings: undefined;
  travelerDetails: { bookingId: BookingId };
  tripDetails: { tripId: string };
  trips: undefined;
  tutorial: undefined;
};

export const appRoutes = {
  auth: "/auth" as const satisfies Href,
  checkout: (bookingId: BookingId) =>
    ({ pathname: "/checkout/[bookingId]", params: { bookingId } }) as const satisfies Href,
  demoBooking: (packageId: string) =>
    ({ pathname: "/booking/[packageId]", params: { packageId } } as unknown as Href),
  demoBookingConfirmed: (bookingId: string) =>
    ({
      pathname: "/booking-confirmed/[bookingId]",
      params: { bookingId },
    } as unknown as Href),
  destinationDetails: (destinationId: string) =>
    ({
      pathname: "/destination/[destinationId]",
      params: { destinationId },
    }) as const satisfies Href,
  emptyStates: "/empty-states" as const satisfies Href,
  errorStates: "/error-states" as const satisfies Href,
  flightBookingDetails: (bookingId: BookingId) =>
    ({
      pathname: "/flight-booking/[bookingId]",
      params: { bookingId },
    }) as const satisfies Href,
  flightDetails: (flightId: string) =>
    ({ pathname: "/flight/[flightId]", params: { flightId } } as unknown as Href),
  heia: "/heia" as const satisfies Href,
  heiaWithPackageContext: ({
    packageContext,
    packageId,
  }: {
    packageContext: string;
    packageId: string;
  }) =>
    ({
      pathname: "/heia",
      params: { packageContext, packageId },
    }) as const satisfies Href,
  helpSupport: "/help-support" as const satisfies Href,
  home: "/" as const satisfies Href,
  languageSelector: "/language" as const satisfies Href,
  notifications: "/notifications" as const satisfies Href,
  offlineState: "/offline-state" as const satisfies Href,
  offers: "/offers" as const satisfies Href,
  packages: "/packages" as Href,
  packageCategory: (categoryId: string) =>
    ({ pathname: "/category/[categoryId]", params: { categoryId } } as unknown as Href),
  packageDetails: (packageId: PackageId) =>
    ({ pathname: "/package/[packageId]", params: { packageId } }) as const satisfies Href,
  paymentMethod: (bookingId: BookingId) =>
    ({
      pathname: "/payment-method/[bookingId]",
      params: { bookingId },
    }) as const satisfies Href,
  profile: "/profile" as const satisfies Href,
  savedDestinations: "/saved-destinations" as const satisfies Href,
  searchResults: (params?: AppRouteParams["searchResults"]) =>
    params
      ? ({ pathname: "/search-results", params }) as const satisfies Href
      : ("/search-results" as const satisfies Href),
  settings: "/settings" as const satisfies Href,
  travelerDetails: (bookingId: BookingId) =>
    ({
      pathname: "/traveler-details/[bookingId]",
      params: { bookingId },
    }) as const satisfies Href,
  tripDetails: (tripId: string) =>
    ({
      pathname: "/trip/[tripId]",
      params: { tripId },
    }) as const satisfies Href,
  trips: "/trips" as const satisfies Href,
  tutorial: "/tutorial" as unknown as Href,
} as const;
