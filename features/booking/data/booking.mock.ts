import type { BookingId } from "../../../navigation/routes";

type BookingServiceId = "changes" | "concierge" | "lounge" | "transfer";

export type FlightBookingRecord = {
  arrivalLabel: string;
  baseFare: number;
  cabinLabel: string;
  departureLabel: string;
  durationLabel: string;
  hotelName: string;
  id: BookingId;
  paymentLabel: string;
  routeCode: string;
  serviceFee: number;
  services: BookingServiceId[];
  taxes: number;
  travelerCount: number;
};

export const bookingRecords: FlightBookingRecord[] = [
  {
    arrivalLabel: "22:15 DPS",
    baseFare: 3890,
    cabinLabel: "Business",
    departureLabel: "18:30 JFK",
    durationLabel: "19h 45m",
    hotelName: "Kayana Private Villas",
    id: "booking-bali-signature",
    paymentLabel: "Visa Infinite •••• 2048",
    routeCode: "JFK -> DPS",
    serviceFee: 180,
    services: ["lounge", "transfer", "concierge", "changes"],
    taxes: 690,
    travelerCount: 2,
  },
  {
    arrivalLabel: "13:40 ZRH",
    baseFare: 5120,
    cabinLabel: "Business",
    departureLabel: "21:50 JFK",
    durationLabel: "11h 50m",
    hotelName: "The Omnia Zermatt",
    id: "booking-alps-private",
    paymentLabel: "Visa Infinite •••• 2048",
    routeCode: "JFK -> ZRH",
    serviceFee: 210,
    services: ["lounge", "concierge", "changes"],
    taxes: 820,
    travelerCount: 2,
  },
  {
    arrivalLabel: "16:05 HND",
    baseFare: 4270,
    cabinLabel: "Premium Economy",
    departureLabel: "09:10 LAX",
    durationLabel: "13h 55m",
    hotelName: "Aoyama Grand Hotel",
    id: "booking-tokyo-curated",
    paymentLabel: "Visa Infinite •••• 2048",
    routeCode: "LAX -> HND",
    serviceFee: 160,
    services: ["transfer", "concierge", "changes"],
    taxes: 540,
    travelerCount: 2,
  },
  {
    arrivalLabel: "14:20 MLE",
    baseFare: 5840,
    cabinLabel: "Business",
    departureLabel: "20:55 DXB",
    durationLabel: "4h 25m",
    hotelName: "Siyam World Maldives",
    id: "booking-maldives-cove",
    paymentLabel: "Visa Infinite •••• 2048",
    routeCode: "DXB -> MLE",
    serviceFee: 240,
    services: ["lounge", "transfer", "concierge", "changes"],
    taxes: 910,
    travelerCount: 2,
  },
  {
    arrivalLabel: "11:35 BCN",
    baseFare: 3180,
    cabinLabel: "Premium Economy",
    departureLabel: "19:45 JFK",
    durationLabel: "7h 50m",
    hotelName: "Majestic Hotel & Spa Barcelona",
    id: "booking-barcelona-family",
    paymentLabel: "Visa Infinite •••• 2048",
    routeCode: "JFK -> BCN",
    serviceFee: 170,
    services: ["transfer", "concierge", "changes"],
    taxes: 460,
    travelerCount: 4,
  },
  {
    arrivalLabel: "15:10 NAV",
    baseFare: 2510,
    cabinLabel: "Premium Economy",
    departureLabel: "08:00 LHR",
    durationLabel: "8h 10m",
    hotelName: "Argos in Cappadocia",
    id: "booking-cappadocia-adventure",
    paymentLabel: "Visa Infinite •••• 2048",
    routeCode: "LHR -> NAV",
    serviceFee: 140,
    services: ["transfer", "concierge"],
    taxes: 390,
    travelerCount: 2,
  },
];

export const bookingRecordsById = Object.fromEntries(
  bookingRecords.map((record) => [record.id, record]),
) as Record<FlightBookingRecord["id"], FlightBookingRecord>;

export const tripToBookingMap = {
  "trip-1": "booking-bali-signature",
  "trip-2": "booking-alps-private",
  "trip-3": "booking-tokyo-curated",
} as const satisfies Record<string, BookingId>;
