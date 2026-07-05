import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Image, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { MotionView } from "../../../components/ui/motion-view";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useLocalization } from "../../../hooks/use-localization";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, shadows, spacing } from "../../../theme";
import { formatCurrency, formatDate } from "../../../utils/format";
import type { DemoPackageBooking } from "../../booking/types/demo-package-booking";
import { resolvePackageImageUrl } from "../../packages/helpers/package-helpers";

type DemoBookingTripCardProps = {
  booking: DemoPackageBooking;
  enteringIndex?: number;
  onPress: () => void;
};

const statusTone: Record<
  DemoPackageBooking["status"],
  "coral" | "navy" | "neutral" | "primary" | "success" | "warning"
> = {
  Cancelled: "warning",
  Completed: "neutral",
  "Confirmed Demo": "success",
  "Pending Confirmation": "primary",
};

const DemoBookingTripCardComponent = ({
  booking,
  enteringIndex = 0,
  onPress,
}: DemoBookingTripCardProps) => {
  const { isRTL, language, t } = useLocalization();
  const imageSource = useMemo(
    () => getRemoteImageSource(resolvePackageImageUrl(booking.imageUrl)),
    [booking.imageUrl],
  );

  return (
    <MotionView index={enteringIndex}>
      <ScalePressable
        accessibilityRole="button"
        contentStyle={[shadows.card, { borderRadius: radius.lg }]}
        onPress={onPress}
        scaleTo={0.985}
      >
        <View
          style={{
            backgroundColor: colors.surface.base,
            borderColor: colors.border.soft,
            borderRadius: radius.lg,
            borderWidth: 1,
            overflow: "hidden",
          }}
        >
          <Image
            resizeMode="cover"
            source={imageSource}
            style={{
              backgroundColor: colors.surface.muted,
              height: 150,
              width: "100%",
            }}
          />
          <View style={{ gap: spacing.md, padding: spacing.lg }}>
            <View
              style={{
                alignItems: "flex-start",
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.md,
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, gap: spacing.xxs }}>
                <AppText color={colors.navy[800]} variant="title">
                  {booking.packageTitle}
                </AppText>
                <AppText color={colors.text.secondary} variant="bodySmall">
                  {booking.destination}
                </AppText>
              </View>
              <Chip
                label={t(`trips.bookingStatuses.${booking.status}`)}
                tone={statusTone[booking.status]}
              />
            </View>

            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                flexWrap: "wrap",
                gap: spacing.sm,
              }}
            >
              <Chip
                icon="calendar-outline"
                label={formatDate(
                  booking.travelerDetails.preferredTravelDate,
                  language,
                )}
                tone="primary"
              />
              <Chip
                icon="people-outline"
                label={t("trips.travelers", {
                  count: booking.travelerDetails.travelersCount,
                })}
                tone="navy"
              />
              <Chip
                icon="cash-outline"
                label={formatCurrency(booking.totalEstimatedPrice, language)}
                tone="coral"
              />
            </View>

            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.surface.muted,
                borderColor: colors.border.soft,
                borderRadius: radius.md,
                borderWidth: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.xs,
                padding: spacing.md,
              }}
            >
              <Ionicons color={colors.primary[600]} name="receipt-outline" size={18} />
              <AppText color={colors.text.secondary} variant="bodySmall">
                {`${t("trips.bookingId")}: ${booking.bookingId}`}
              </AppText>
            </View>
          </View>
        </View>
      </ScalePressable>
    </MotionView>
  );
};

export const DemoBookingTripCard = memo(DemoBookingTripCardComponent);
