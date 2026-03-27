import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import type { BookingId } from "../../../navigation/routes";
import { useTravelDiscoveryStore } from "../../../store/travel-discovery-store";
import { getBookingSummary } from "../services/booking.service";

export const useFlightBookingDetailsScreen = (bookingId: BookingId | null) => {
  const submittedSearch = useTravelDiscoveryStore((state) => state.submittedSearch);
  const searchKey = JSON.stringify(submittedSearch);
  const bookingQuery = useQuery({
    enabled: Boolean(bookingId),
    queryKey: queryKeys.bookingSummary(bookingId ?? "unknown", searchKey),
    queryFn: () =>
      getBookingSummary({
        bookingId: bookingId ?? "booking-bali-signature",
        search: submittedSearch,
      }),
  });

  return {
    bookingQuery,
    bookingSummary: bookingQuery.data ?? null,
    submittedSearch,
  };
};
