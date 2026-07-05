import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { useLocalization } from "../../hooks/use-localization";
import { colors, radius, shadows, spacing } from "../../theme";
import type { Trip, TripStatus } from "../../types/travel";
import { AppText } from "./app-text";
import { Chip } from "./chip";
import { MotionView } from "./motion-view";
import { ScalePressable } from "./scale-pressable";

type TravelCardProps = {
  enteringIndex?: number;
  onPress?: () => void;
  trip: Trip;
};

const statusTone: Record<TripStatus, "success" | "warning" | "primary"> = {
  confirmed: "success",
  planning: "warning",
  wishlist: "primary",
};

export const TravelCard = memo(function TravelCard({
  enteringIndex = 0,
  onPress,
  trip,
}: TravelCardProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const { formatDateRange } = useLocalization();
  const travelersLabel = useMemo(
    () =>
      trip.travelers === 1
        ? t("trips.traveler_one", { count: trip.travelers })
        : t("trips.travelers", { count: trip.travelers }),
    [t, trip.travelers],
  );
  const localizedDateRange = useMemo(
    () => formatDateRange(trip.startDate, trip.endDate),
    [formatDateRange, trip.endDate, trip.startDate],
  );

  const content = (
    <View
      style={[
        {
          backgroundColor: colors.surface.base,
          borderColor: colors.border.soft,
          borderRadius: radius.lg,
          borderWidth: 1,
          gap: spacing.md,
          padding: spacing.lg,
        },
      ]}
    >
      <View
        style={{
          alignItems: "flex-start",
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <AppText variant="title">
            {t(`content.trips.${trip.id}.title`, { defaultValue: trip.title })}
          </AppText>
          <AppText>
            {t(`content.trips.${trip.id}.destination`, {
              defaultValue: trip.destination,
            })}
          </AppText>
        </View>
        <Chip
          label={t(`trips.${trip.status}`)}
          tone={statusTone[trip.status]}
        />
      </View>

      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: spacing.md,
        }}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.xs,
          }}
        >
          <Ionicons
            color={colors.primary[500]}
            name="calendar-outline"
            size={18}
          />
          <AppText color={colors.text.primary} variant="bodySmall">
            {localizedDateRange}
          </AppText>
        </View>
        <View
          style={{
            alignItems: "center",
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: spacing.xs,
          }}
        >
          <Ionicons
            color={colors.primary[500]}
            name="people-outline"
            size={18}
          />
          <AppText color={colors.text.primary} variant="bodySmall">
            {travelersLabel}
          </AppText>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.surface.muted,
          borderColor: colors.border.soft,
          borderRadius: radius.md,
          borderWidth: 1,
          padding: spacing.md,
        }}
      >
        <AppText color={colors.text.primary}>
          {t(`content.trips.${trip.id}.progressLabel`, {
            defaultValue: trip.progressLabel,
          })}
        </AppText>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <MotionView index={enteringIndex}>
        <ScalePressable
          accessibilityRole="button"
          contentStyle={[shadows.card, { borderRadius: radius.lg }]}
          onPress={onPress}
          scaleTo={0.985}
        >
          {content}
        </ScalePressable>
      </MotionView>
    );
  }

  return (
    <MotionView index={enteringIndex}>
      <View style={shadows.card}>{content}</View>
    </MotionView>
  );
});
