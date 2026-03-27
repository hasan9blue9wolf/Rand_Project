export type PaymentMethod = {
  id: string;
  label: string;
  type: "card" | "wallet";
};

export type PaymentSummary = {
  amountDue: number;
  bookingId: string;
  method: PaymentMethod;
  route: string;
};

export type PaymentsScreenData = {
  subtitle: string;
  summaries: PaymentSummary[];
  title: string;
};
