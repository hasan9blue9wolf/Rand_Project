import { useDemoBookingsStore } from "../../../store/demo-bookings-store";

export const useTripsScreen = () => {
  const demoBookings = useDemoBookingsStore((state) => state.bookings);

  return {
    bookings: demoBookings,
    hasTrips: demoBookings.length > 0,
  };
};
