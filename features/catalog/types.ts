import type {
  BookingId,
  PackageId,
  SearchSource,
} from "../../navigation/routes";
import type { FeaturedOffer } from "../../types/travel";
import type { BookingMode } from "../home/types";

export type TravelDiscoveryTheme =
  | "adventure"
  | "beach"
  | "business"
  | "city"
  | "family"
  | "luxury"
  | "mountain";

export type TravelHotelClass = 3 | 4 | 5;

export type TravelDiscoverySortOption =
  | "durationAscending"
  | "luxuryDescending"
  | "priceAscending"
  | "priceDescending"
  | "recommended";

export type TravelSearchPriceRangeId =
  | "all"
  | "premium"
  | "signature"
  | "value";

export type TravelSearchDurationRangeId =
  | "all"
  | "long"
  | "short"
  | "week";

export type TravelDepartureLocationId =
  | "dubai"
  | "london"
  | "losAngeles"
  | "newYork";

export type TravelDestinationId =
  | "bali"
  | "barcelona"
  | "cappadocia"
  | "maldives"
  | "tokyo"
  | "zermatt";

export type TravelDateOptionId =
  | "holidayBreak"
  | "springReset"
  | "tropicalOctober";

export type TravelPassengerOptionId =
  | "businessDuo"
  | "familyFour"
  | "soloExplorer"
  | "twoAdults";

export type TravelPassengerProfile =
  | "business"
  | "couple"
  | "family"
  | "solo";

export type TravelSearchFieldId = "dates" | "from" | "passengers" | "to";

export type TravelSearchRange = {
  max?: number;
  min?: number;
};

export type TravelDiscoverySearchRequest = {
  endDate: string;
  fromId: TravelDepartureLocationId;
  mode: BookingMode;
  passengerOptionId: TravelPassengerOptionId;
  source: SearchSource;
  startDate: string;
  toId: TravelDestinationId;
};

export type TravelDiscoveryFilters = {
  directFlightsOnly: boolean;
  durationRange: TravelSearchRange;
  durationRangeId: TravelSearchDurationRangeId;
  hotelClasses: TravelHotelClass[];
  priceRange: TravelSearchRange;
  priceRangeId: TravelSearchPriceRangeId;
  refundableOnly: boolean;
  themes: TravelDiscoveryTheme[];
  visaFriendlyOnly: boolean;
};

export type TravelDepartureOption = {
  airportCode: string;
  cityId: TravelDepartureLocationId;
};

export type TravelDestinationOption = {
  id: TravelDestinationId;
};

export type TravelDateOption = {
  endDate: string;
  id: TravelDateOptionId;
  startDate: string;
};

export type TravelPassengerOption = {
  id: TravelPassengerOptionId;
  passengerCount: number;
  profile: TravelPassengerProfile;
};

export type TravelDiscoveryRangeOption<Id extends string> = {
  id: Id;
  range: TravelSearchRange;
};

export type TravelDiscoveryPackage = {
  bestMonths: string;
  bookingId: BookingId;
  cabinLabel: string;
  country: string;
  departureLocationId: TravelDepartureLocationId;
  description: string;
  destinationId: TravelDestinationId;
  directFlight: boolean;
  durationDays: number;
  flightDurationLabel: string;
  heroImageUri: string;
  hotelClass: TravelHotelClass;
  hotelName: string;
  id: PackageId;
  idealFor: string;
  inclusions: string[];
  itineraryHighlights: string[];
  refundable: boolean;
  routeCode: string;
  seatsLeft: number;
  summary: string;
  themes: TravelDiscoveryTheme[];
  visaFriendly: boolean;
};

export type TravelDiscoverySearchResult = TravelDiscoveryPackage &
  Pick<
    FeaturedOffer,
    "accent" | "badge" | "destination" | "duration" | "highlights" | "priceFrom" | "title"
  > & {
    searchScore: number;
  };

export type TravelDiscoverySearchResponse = {
  appliedSort: TravelDiscoverySortOption;
  results: TravelDiscoverySearchResult[];
  totalCount: number;
};
