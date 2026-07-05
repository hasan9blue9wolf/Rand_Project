import type { BookingId } from "../../../navigation/routes";
import { getCatalogPackageByBookingId } from "../../catalog/services/catalog.service";
import type { TravelDiscoverySearchRequest } from "../../catalog/types";
import { bookingRecordsById } from "../data/booking.mock";

export const getBookingSummary = async ({
  bookingId,
  search,
}: {
  bookingId: BookingId;
  search?: TravelDiscoverySearchRequest | null;
}) => {
  const booking = bookingRecordsById[bookingId];

  if (!booking) {
    return null;
  }

  const packageDetails = await getCatalogPackageByBookingId({
    bookingId,
    ...(typeof search !== "undefined" ? { search } : {}),
  });

  return {
    booking,
    packageDetails,
    total: booking.baseFare + booking.taxes + booking.serviceFee,
  };
};
