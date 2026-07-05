import type { TravelPackage } from "../../packages/types";

export type DemoPackageBookingStatus =
  | "Cancelled"
  | "Completed"
  | "Confirmed Demo"
  | "Pending Confirmation";

export type DemoPackageBookingTravelerDetails = {
  departureCity: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  preferredTravelDate: string;
  specialRequests: string;
  travelersCount: number;
};

export type DemoPackageBooking = {
  bookingId: string;
  bookingType: "flight" | "package";
  createdAt: string;
  departureCity: string;
  destination: string;
  destinationCity: string;
  destinationCountry: string;
  email: string;
  fullName: string;
  durationDays: number;
  image: string;
  includedServices: string[];
  itemId: string;
  imageUrl: string;
  packageId: TravelPackage["id"];
  packageTitle: string;
  phone: string;
  selectedDate: string;
  specialRequests: string;
  status: DemoPackageBookingStatus;
  totalEstimatedPrice: number;
  travelersCount: number;
  travelerDetails: DemoPackageBookingTravelerDetails;
  title: string;
  currency: "USD";
};
