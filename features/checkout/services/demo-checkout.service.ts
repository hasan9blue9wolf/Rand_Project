import type { BookingId } from "../../../navigation/routes";

export type DemoCheckoutConfirmation = {
  bookingId: BookingId;
  bookingReference: string;
};

const waitForDemoLatency = (durationMs = 900) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const buildBookingReference = (bookingId: BookingId) =>
  `TG-${bookingId
    .replace(/^booking-/, "")
    .slice(0, 8)
    .toUpperCase()}`;

export const confirmDemoCheckout = async (
  bookingId: BookingId,
): Promise<DemoCheckoutConfirmation> => {
  await waitForDemoLatency();

  return {
    bookingId,
    bookingReference: buildBookingReference(bookingId),
  };
};
