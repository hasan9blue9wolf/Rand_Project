import { demoTravelPackages } from "../../features/packages/data/demo-travel-packages.seed";
import { useDemoBookingsStore } from "../demo-bookings-store";
import { useNotificationsStore } from "../notifications-store";

const travelerDetails = {
  departureCity: "Baghdad",
  email: "haya@example.com",
  fullName: "Haya Traveler",
  phoneNumber: "+9647800000000",
  preferredTravelDate: "2026-10-12",
  specialRequests: "",
  travelersCount: 2,
};

describe("useNotificationsStore", () => {
  it("creates notifications and tracks unread count", () => {
    const notification = useNotificationsStore.getState().createNotification({
      message: "Your booking is pending confirmation.",
      title: "Booking request received",
      type: "booking_created",
    });

    expect(notification.notificationId).toEqual(expect.stringMatching(/^NT-/));
    expect(useNotificationsStore.getState().notifications).toHaveLength(1);
    expect(useNotificationsStore.getState().unreadCount).toBe(1);
  });

  it("marks a notification as read", () => {
    const notification = useNotificationsStore.getState().createNotification({
      message: "Read me",
      title: "System",
      type: "system",
    });

    useNotificationsStore.getState().markRead(notification.notificationId);

    expect(useNotificationsStore.getState().notifications[0]?.isRead).toBe(true);
    expect(useNotificationsStore.getState().unreadCount).toBe(0);
  });

  it("deletes a notification", () => {
    const notification = useNotificationsStore.getState().createNotification({
      message: "Delete me",
      title: "System",
      type: "system",
    });

    useNotificationsStore.getState().deleteNotification(notification.notificationId);

    expect(useNotificationsStore.getState().notifications).toHaveLength(0);
    expect(useNotificationsStore.getState().unreadCount).toBe(0);
  });

  it("clears all notifications", () => {
    useNotificationsStore.getState().createNotification({
      message: "One",
      title: "System",
      type: "system",
    });
    useNotificationsStore.getState().createNotification({
      message: "Two",
      title: "Haya tip",
      type: "haya_tip",
    });

    useNotificationsStore.getState().clearAll();

    expect(useNotificationsStore.getState().notifications).toHaveLength(0);
    expect(useNotificationsStore.getState().unreadCount).toBe(0);
  });

  it("creates a notification after package booking", () => {
    const packageItem = demoTravelPackages[0]!;

    const booking = useDemoBookingsStore
      .getState()
      .createBooking({ packageItem, travelerDetails });
    const notification = useNotificationsStore.getState().notifications[0];

    expect(notification).toMatchObject({
      relatedBookingId: booking.bookingId,
      relatedPackageId: packageItem.id,
      title: "Booking request received",
      type: "booking_created",
    });
    expect(useNotificationsStore.getState().unreadCount).toBe(1);
  });

  it("creates a cancellation notification after canceling a booking", () => {
    const packageItem = demoTravelPackages[0]!;
    const booking = useDemoBookingsStore
      .getState()
      .createBooking({ packageItem, travelerDetails });

    useDemoBookingsStore.getState().cancelBooking(booking.bookingId);

    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({
      relatedBookingId: booking.bookingId,
      title: "Booking cancelled",
      type: "booking_status",
    });
  });
});
