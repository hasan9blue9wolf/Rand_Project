import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useEffect, useMemo, useRef } from "react";
import { type Control, Controller, useForm, useWatch } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SearchField } from "../../../components/ui/search-field";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { queryKeys } from "../../../constants/query-keys";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { triggerFeedback } from "../../../services/feedback";
import { useDemoBookingsStore } from "../../../store/demo-bookings-store";
import { colors, spacing } from "../../../theme";
import { getFlightById } from "../../flights/services/flights.service";
import type { FlightItinerary } from "../../flights/types";
import { scheduleBookingLocalNotificationAsync } from "../../notifications/services/expo-notifications.service";
import {
  formatPackagePrice,
  resolvePackageText,
} from "../../packages/helpers/package-helpers";
import { getPackageById } from "../../packages/services/demo-travel-packages.service";

const schema = z.object({
  departureCity: z.string().trim().min(2),
  email: z.string().trim().email(),
  fullName: z.string().trim().min(2),
  phoneNumber: z.string().trim().min(7),
  preferredTravelDate: z.string().trim().min(4),
  specialRequests: z.string().trim(),
  travelersCount: z.string().trim().regex(/^\d+$/).refine((value) => {
    const count = Number(value);

    return Number.isInteger(count) && count >= 1 && count <= 20;
  }),
});

type FormValues = z.infer<typeof schema>;

type BookingSummaryCardProps = {
  control: Control<FormValues>;
  language: ReturnType<typeof useLocalization>["language"];
  item:
    | { kind: "package"; value: NonNullable<Awaited<ReturnType<typeof getPackageById>>> }
    | { kind: "flight"; value: FlightItinerary };
  t: ReturnType<typeof useLocalization>["t"];
};

const BookingSummaryCard = memo(function BookingSummaryCard({
  control,
  item,
  language,
  t,
}: BookingSummaryCardProps) {
  const [travelersCountValue, preferredTravelDate] = useWatch({
    control,
    name: ["travelersCount", "preferredTravelDate"],
  });
  const summary = useMemo(() => {
    const title =
      item.kind === "package"
        ? resolvePackageText(item.value.title, language)
        : `${item.value.airline} ${item.value.fromAirport} -> ${item.value.toAirport}`;
    const destination =
      item.kind === "package"
        ? `${resolvePackageText(item.value.destinationCity, language)}, ${resolvePackageText(
            item.value.destinationCountry,
            language,
          )}`
        : `${item.value.toCity} (${item.value.toAirport})`;
    const travelersCount = Number(travelersCountValue || 1);
    const estimatedTotal =
      (item.kind === "package" ? item.value.priceFrom : item.value.priceFrom) *
      travelersCount;

    return {
      destination,
      estimatedTotal,
      preferredTravelDate,
      title,
      travelersCount,
    };
  }, [item, language, preferredTravelDate, travelersCountValue]);

  return (
    <AppCard elevated>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Ionicons color={colors.primary[600]} name="receipt-outline" size={20} />
          <AppText variant="title">{t("demoBooking.summaryTitle")}</AppText>
        </View>
        <DetailRow label={t("demoBooking.summary.package")} value={summary.title} />
        <DetailRow
          label={t("demoBooking.summary.destination")}
          value={summary.destination}
        />
        <DetailRow
          label={t("demoBooking.summary.duration")}
          value={
            item.kind === "package"
              ? t("packagesDiscovery.meta.duration", {
                  count: item.value.durationDays,
                })
              : item.value.duration
          }
        />
        <DetailRow
          label={t("demoBooking.summary.travelers")}
          value={`${summary.travelersCount}`}
        />
        <DetailRow
          label={t("demoBooking.summary.date")}
          value={summary.preferredTravelDate}
        />
        <DetailRow
          label={t("demoBooking.summary.total")}
          value={formatPackagePrice(
            { priceFrom: summary.estimatedTotal },
            language,
          )}
        />
        <View style={{ gap: spacing.xs }}>
          <AppText color={colors.text.muted} variant="caption">
            {t("demoBooking.summary.includes")}
          </AppText>
          {(item.kind === "package"
            ? item.value.includes.map((includedItem) =>
                resolvePackageText(includedItem, language),
              )
            : [
                item.value.baggage,
                item.value.cabin,
                item.value.refundable ? "Refundable" : "Standard fare",
              ]
          )
            .slice(0, 5)
            .map((includedItem) => (
              <AppText key={includedItem} variant="bodySmall">
                {`• ${includedItem}`}
              </AppText>
            ))}
        </View>
      </View>
    </AppCard>
  );
});

export const DemoPackageBookingScreen = () => {
  const { packageId } = useLocalSearchParams<{ packageId?: string }>();
  const { language, t } = useLocalization();
  const createBooking = useDemoBookingsStore((state) => state.createBooking);
  const createFlightBooking = useDemoBookingsStore((state) => state.createFlightBooking);
  const packageQuery = useQuery({
    enabled: Boolean(packageId),
    queryFn: () => getPackageById(packageId ?? ""),
    queryKey: queryKeys.catalogPackageDetails(packageId ?? "unknown", "demoBooking"),
  });
  const packageItem = packageQuery.data ?? null;
  const flightQuery = useQuery({
    enabled: Boolean(packageId) && packageQuery.isSuccess && !packageItem,
    queryFn: () => getFlightById(packageId ?? ""),
    queryKey: ["demoFlightDetails", packageId ?? "unknown", "demoBooking"],
  });
  const flightItem = flightQuery.data ?? null;
  const bookingItem = useMemo(
    () =>
      packageItem
        ? ({ kind: "package", value: packageItem } as const)
        : flightItem
          ? ({ kind: "flight", value: flightItem } as const)
          : null,
    [flightItem, packageItem],
  );
  const initialFormValues = useMemo<FormValues>(
    () => ({
      departureCity:
        packageItem?.departureCities[0] ?? flightItem?.fromCity ?? "Baghdad",
      email: "",
      fullName: "",
      phoneNumber: "",
      preferredTravelDate:
        packageItem?.availableDates[0]?.startDate ??
        flightItem?.departureDate ??
        "2026-10-12",
      specialRequests: "",
      travelersCount: "2",
    }),
    [flightItem, packageItem],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: initialFormValues,
    resolver: zodResolver(schema),
  });
  const initializedBookingId = useRef<string | null>(null);

  useEffect(() => {
    if (bookingItem && initializedBookingId.current !== packageId) {
      initializedBookingId.current = packageId ?? null;
      reset(initialFormValues);
    }
  }, [bookingItem, initialFormValues, packageId, reset]);

  if (packageQuery.isLoading || flightQuery.isLoading) {
    return (
      <ScreenContainer title={t("demoBooking.title")} withBottomTabSpacing={false}>
        <LoadingState label={t("demoBooking.loading")} />
      </ScreenContainer>
    );
  }

  if (!bookingItem) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.packages)}
          />
        }
        title={t("demoBooking.title")}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("packagesDiscovery.title")}
          description={t("packageDetails.notFoundBody")}
          onPress={() => router.replace(appRoutes.packages)}
          title={t("packageDetails.notFoundTitle")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  const submit = handleSubmit(async (values) => {
    const travelerDetails = {
        departureCity: values.departureCity,
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        preferredTravelDate: values.preferredTravelDate,
        specialRequests: values.specialRequests.trim(),
        travelersCount: Number(values.travelersCount),
      };
    const booking =
      bookingItem.kind === "package"
        ? createBooking({
            packageItem: bookingItem.value,
            travelerDetails,
          })
        : createFlightBooking({
            flight: bookingItem.value,
            travelerDetails,
          });

    await triggerFeedback("success");
    void scheduleBookingLocalNotificationAsync({
      body: `${booking.packageTitle} is pending confirmation.`,
      bookingId: booking.bookingId,
      selectedDate: booking.selectedDate,
      title:
        booking.bookingType === "flight"
          ? "Flight booking request received"
          : "Booking request received",
    });
    router.replace(appRoutes.demoBookingConfirmed(booking.bookingId));
  });

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() =>
            navigateBackOr(
              bookingItem.kind === "package"
                ? appRoutes.packageDetails(bookingItem.value.id)
                : appRoutes.flightDetails(bookingItem.value.flightId),
            )
          }
        />
      }
      subtitle={t("demoBooking.subtitle")}
      keyboardDismissMode="none"
      title={t("demoBooking.title")}
      withBottomTabSpacing={false}
    >
      <AppCard elevated>
        <View style={{ gap: spacing.sm }}>
          <AppText color={colors.primary[600]} variant="eyebrow">
            {t("demoBooking.demoNoticeTitle")}
          </AppText>
          <AppText>{t("demoBooking.demoNotice")}</AppText>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: spacing.md }}>
          <AppText variant="title">{t("demoBooking.travelerTitle")}</AppText>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                autoCapitalize="words"
                error={errors.fullName?.message}
                icon="person-outline"
                label={t("demoBooking.fields.fullName")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                error={errors.phoneNumber?.message}
                icon="call-outline"
                keyboardType="phone-pad"
                label={t("demoBooking.fields.phoneNumber")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                autoCapitalize="none"
                error={errors.email?.message}
                icon="mail-outline"
                keyboardType="email-address"
                label={t("demoBooking.fields.email")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="travelersCount"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                error={errors.travelersCount?.message}
                icon="people-outline"
                keyboardType="number-pad"
                label={t("demoBooking.fields.travelersCount")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={String(value)}
              />
            )}
          />
          <Controller
            control={control}
            name="preferredTravelDate"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                error={errors.preferredTravelDate?.message}
                icon="calendar-outline"
                label={t("demoBooking.fields.preferredTravelDate")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="departureCity"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                error={errors.departureCity?.message}
                icon="airplane-outline"
                label={t("demoBooking.fields.departureCity")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="specialRequests"
            render={({ field: { onBlur, onChange, value } }) => (
              <SearchField
                error={errors.specialRequests?.message}
                icon="chatbubble-ellipses-outline"
                label={t("demoBooking.fields.specialRequests")}
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </AppCard>

      <BookingSummaryCard
        control={control}
        item={bookingItem}
        language={language}
        t={t}
      />

      <View style={{ gap: spacing.md }}>
        <PrimaryButton label={t("demoBooking.confirmCta")} onPress={submit} />
        <SecondaryButton
          label={t("common.back")}
          onPress={() => router.back()}
          tone="navy"
        />
      </View>
    </ScreenContainer>
  );
};
