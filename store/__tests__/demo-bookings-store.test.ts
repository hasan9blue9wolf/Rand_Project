import AsyncStorage from "@react-native-async-storage/async-storage";

import { demoTravelPackages } from "../../features/packages/data/demo-travel-packages.seed";
import { useDemoBookingsStore } from "../demo-bookings-store";

const packageItem = demoTravelPackages[0]!;

const travelerDetails = {
  departureCity: "Baghdad",
  email: "haya@example.com",
  fullName: "Haya Traveler",
  phoneNumber: "+9647800000000",
  preferredTravelDate: "2026-10-12",
  specialRequests: "Window seat if flights are included.",
  travelersCount: 2,
};

describe("useDemoBookingsStore", () => {
  it("creates a complete pending booking record", () => {
    const booking = useDemoBookingsStore
      .getState()
      .createBooking({ packageItem, travelerDetails });

    expect(booking).toMatchObject({
      departureCity: travelerDetails.departureCity,
      destinationCity: packageItem.destinationCity.en,
      destinationCountry: packageItem.destinationCountry.en,
      email: travelerDetails.email,
      fullName: travelerDetails.fullName,
      image: packageItem.imageUrl,
      packageId: packageItem.id,
      packageTitle: packageItem.title.en,
      phone: travelerDetails.phoneNumber,
      selectedDate: travelerDetails.preferredTravelDate,
      specialRequests: travelerDetails.specialRequests,
      status: "Pending Confirmation",
      totalEstimatedPrice: packageItem.priceFrom * travelerDetails.travelersCount,
      travelersCount: travelerDetails.travelersCount,
    });
    expect(booking.bookingId).toEqual(expect.stringMatching(/^HT-/));
    expect(useDemoBookingsStore.getState().getBookingById(booking.bookingId)).toBe(
      booking,
    );
  });

  it("persists and rehydrates bookings from AsyncStorage", async () => {
    const booking = useDemoBookingsStore
      .getState()
      .createBooking({ packageItem, travelerDetails });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "hayatrips-demo-package-bookings",
      expect.stringContaining(booking.bookingId),
    );

    const persistedBookingState = await AsyncStorage.getItem(
      "hayatrips-demo-package-bookings",
    );
    useDemoBookingsStore.setState({ bookings: [] });
    await AsyncStorage.setItem(
      "hayatrips-demo-package-bookings",
      persistedBookingState ?? "",
    );
    await useDemoBookingsStore.persist.rehydrate();

    expect(useDemoBookingsStore.getState().bookings).toHaveLength(1);
    expect(useDemoBookingsStore.getState().bookings[0]?.bookingId).toBe(
      booking.bookingId,
    );
  });

  it("exposes created bookings for My Trips", () => {
    const booking = useDemoBookingsStore
      .getState()
      .createBooking({ packageItem, travelerDetails });
    const myTripsBookings = useDemoBookingsStore.getState().bookings;

    expect(myTripsBookings).toHaveLength(1);
    expect(myTripsBookings[0]).toMatchObject({
      bookingId: booking.bookingId,
      packageId: packageItem.id,
      status: "Pending Confirmation",
    });
  });

  it("cancels a booking by updating local status", () => {
    const booking = useDemoBookingsStore
      .getState()
      .createBooking({ packageItem, travelerDetails });

    useDemoBookingsStore.getState().cancelBooking(booking.bookingId);

    expect(
      useDemoBookingsStore.getState().getBookingById(booking.bookingId)?.status,
    ).toBe("Cancelled");
  });
});
