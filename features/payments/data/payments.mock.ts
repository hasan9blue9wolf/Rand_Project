import { bookingRecords } from "../../booking/data/booking.mock";
import type { PaymentsScreenData } from "../types";

export const paymentsScreenMock: PaymentsScreenData = {
  subtitle: "Checkout summaries, payment methods, and booking totals are grouped in the payments module.",
  summaries: bookingRecords.map((record) => ({
    amountDue: record.baseFare + record.taxes + record.serviceFee,
    bookingId: record.id,
    method: {
      id: `payment-${record.id}`,
      label: record.paymentLabel,
      type: "card",
    },
    route: record.routeCode,
  })),
  title: "Payments",
};
