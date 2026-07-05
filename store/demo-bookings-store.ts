import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  DemoPackageBooking,
  DemoPackageBookingTravelerDetails,
} from "../features/booking/types/demo-package-booking";
import type { FlightItinerary } from "../features/flights/types";
import { resolvePackageText } from "../features/packages/helpers/package-helpers";
import type { TravelPackage } from "../features/packages/types";
import { appStorage } from "../services/storage";
import { useNotificationsStore } from "./notifications-store";

type CreateDemoBookingInput = {
  packageItem: TravelPackage;
  travelerDetails: DemoPackageBookingTravelerDetails;
};

type CreateDemoFlightBookingInput = {
  flight: FlightItinerary;
  travelerDetails: DemoPackageBookingTravelerDetails;
};

type DemoBookingsState = {
  bookings: DemoPackageBooking[];
  cancelBooking: (bookingId: string) => void;
  clearBookings: () => void;
  createBooking: (input: CreateDemoBookingInput) => DemoPackageBooking;
  createFlightBooking: (input: CreateDemoFlightBookingInput) => DemoPackageBooking;
  getBookingById: (bookingId: string) => DemoPackageBooking | undefined;
  updateBookingStatus: (
    bookingId: string,
    status: DemoPackageBooking["status"],
  ) => void;
};

const createBookingId = () =>
  `HT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const notifyBookingCreated = (booking: DemoPackageBooking) => {
  useNotificationsStore.getState().createNotification({
    actionLabel: "View booking",
    actionRoute: `/trip/${booking.bookingId}`,
    message:
      booking.bookingType === "flight"
        ? `${booking.packageTitle} is pending confirmation.`
        : `${booking.packageTitle} in ${booking.destination} is pending confirmation.`,
    relatedBookingId: booking.bookingId,
    ...(booking.bookingType === "flight"
      ? { relatedFlightId: booking.itemId }
      : { relatedPackageId: booking.itemId }),
    title:
      booking.bookingType === "flight"
        ? "Flight booking request received"
        : "Booking request received",
    type: "booking_created",
  });
};

const notifyBookingCancelled = (booking: DemoPackageBooking) => {
  useNotificationsStore.getState().createNotification({
    actionLabel: "View booking",
    actionRoute: `/trip/${booking.bookingId}`,
    message: `${booking.packageTitle} has been cancelled.`,
    relatedBookingId: booking.bookingId,
    ...(booking.bookingType === "flight"
      ? { relatedFlightId: booking.itemId }
      : { relatedPackageId: booking.itemId }),
    title: "Booking cancelled",
    type: "booking_status",
  });
};

export const useDemoBookingsStore = create<DemoBookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],
      cancelBooking: (bookingId) =>
        get().updateBookingStatus(bookingId, "Cancelled"),
      clearBookings: () => set({ bookings: [] }),
      createBooking: ({ packageItem, travelerDetails }) => {
        const destinationCity = resolvePackageText(packageItem.destinationCity);
        const destinationCountry = resolvePackageText(packageItem.destinationCountry);
        const image = packageItem.imageUrl;
        const travelersCount = travelerDetails.travelersCount;
        const booking: DemoPackageBooking = {
          bookingId: createBookingId(),
          bookingType: "package",
          createdAt: new Date().toISOString(),
          departureCity: travelerDetails.departureCity,
          destination: `${destinationCity}, ${destinationCountry}`,
          destinationCity,
          destinationCountry,
          email: travelerDetails.email,
          fullName: travelerDetails.fullName,
          durationDays: packageItem.durationDays,
          image,
          includedServices: packageItem.includes.map((item) =>
            resolvePackageText(item),
          ),
          itemId: packageItem.id,
          imageUrl: image,
          packageId: packageItem.id,
          packageTitle: resolvePackageText(packageItem.title),
          phone: travelerDetails.phoneNumber,
          selectedDate: travelerDetails.preferredTravelDate,
          specialRequests: travelerDetails.specialRequests,
          status: "Pending Confirmation",
          totalEstimatedPrice: packageItem.priceFrom * travelersCount,
          travelersCount,
          travelerDetails,
          title: resolvePackageText(packageItem.title),
          currency: packageItem.currency,
        };

        set((state) => ({ bookings: [booking, ...state.bookings] }));
        notifyBookingCreated(booking);

        return booking;
      },
      createFlightBooking: ({ flight, travelerDetails }) => {
        const travelersCount = travelerDetails.travelersCount;
        const title = `${flight.airline} ${flight.fromAirport} -> ${flight.toAirport}`;
        const booking: DemoPackageBooking = {
          bookingId: createBookingId(),
          bookingType: "flight",
          createdAt: new Date().toISOString(),
          departureCity: travelerDetails.departureCity,
          destination: `${flight.toCity}, ${flight.toAirport}`,
          destinationCity: flight.toCity,
          destinationCountry: flight.toAirport,
          email: travelerDetails.email,
          fullName: travelerDetails.fullName,
          durationDays: 1,
          image: flight.airlineLogo,
          includedServices: [
            flight.baggage,
            flight.refundable ? "Refundable fare" : "Standard demo fare",
            flight.stops === 0 ? "Nonstop" : `${flight.stops} stops`,
          ],
          itemId: flight.flightId,
          imageUrl: flight.airlineLogo,
          packageId: flight.flightId,
          packageTitle: title,
          phone: travelerDetails.phoneNumber,
          selectedDate: travelerDetails.preferredTravelDate,
          specialRequests: travelerDetails.specialRequests,
          status: "Pending Confirmation",
          totalEstimatedPrice: flight.priceFrom * travelersCount,
          travelersCount,
          travelerDetails,
          title,
          currency: flight.currency,
        };

        set((state) => ({ bookings: [booking, ...state.bookings] }));
        notifyBookingCreated(booking);

        return booking;
      },
      getBookingById: (bookingId) =>
        get().bookings.find((booking) => booking.bookingId === bookingId),
      updateBookingStatus: (bookingId, status) =>
        set((state) => {
          const existingBooking = state.bookings.find(
            (booking) => booking.bookingId === bookingId,
          );
          const bookings = state.bookings.map((booking) =>
            booking.bookingId === bookingId ? { ...booking, status } : booking,
          );

          if (existingBooking && status === "Cancelled") {
            notifyBookingCancelled({ ...existingBooking, status });
          }

          return { bookings };
        }),
    }),
    {
      name: "hayatrips-demo-package-bookings",
      storage: appStorage,
    },
  ),
);
