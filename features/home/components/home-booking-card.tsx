import { memo, useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "../../../components/ui/app-text";
import { MotionView } from "../../../components/ui/motion-view";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { SegmentedControl } from "../../../components/ui/segmented-control";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { colors, radius, shadows, spacing } from "../../../theme";
import type {
  BookingMode,
  HomeBookingField,
  HomeBookingFieldId,
} from "../types";
import { BookingField } from "./booking-field";

type HomeBookingCardProps = {
  ctaLabel: string;
  fields: HomeBookingField[];
  fieldValues: Record<HomeBookingFieldId, string>;
  mode: BookingMode;
  onFieldPress?: (field: HomeBookingField) => void;
  onModeChange: (mode: BookingMode) => void;
  onSearchPress?: () => void;
  submitting?: boolean;
};

const getFieldKey = (field: HomeBookingField) =>
  `home.booking.fields.${field.id}`;

export const HomeBookingCard = memo(function HomeBookingCard({
  ctaLabel,
  fields,
  fieldValues,
  mode,
  onFieldPress,
  onModeChange,
  onSearchPress,
  submitting = false,
}: HomeBookingCardProps) {
  const { t } = useLocalization();
  const { isRTL } = useAppLanguage();
  const rows = useMemo(() => [fields.slice(0, 2), fields.slice(2, 4)], [fields]);
  const segmentedOptions = useMemo(
    () => [
      {
        label: t("home.booking.modes.flights"),
        value: "flights" as const,
      },
      {
        label: t("home.booking.modes.packages"),
        value: "packages" as const,
      },
    ],
    [t],
  );
  const shimmer = useSharedValue(-140);

  useEffect(() => {
    if (!submitting) {
      shimmer.value = -140;
      return;
    }

    shimmer.value = withRepeat(
      withTiming(260, {
        duration: 760,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [shimmer, submitting]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }],
  }));

  return (
    <MotionView index={0}>
      <View
        style={[
          shadows.premium,
          {
            backgroundColor: colors.surface.base,
            borderColor: "rgba(223, 232, 242, 0.85)",
            borderRadius: radius.lg,
            borderWidth: 1,
            gap: spacing.lg,
            overflow: "hidden",
            padding: spacing.lg,
          },
        ]}
      >
        <SegmentedControl
          onChange={onModeChange}
          options={segmentedOptions}
          value={mode}
        />

        <View style={{ gap: spacing.md }}>
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.md,
              }}
            >
              {row.map((field) => {
                const fieldKey = getFieldKey(field);
                const value =
                  fieldValues[field.id] || t(`${fieldKey}.placeholder`);

                return (
                  <BookingField
                    icon={field.icon}
                    isPlaceholder={!fieldValues[field.id]}
                    key={field.id}
                    label={t(`${fieldKey}.label`)}
                    onPress={() => onFieldPress?.(field)}
                    value={value}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <ScalePressable
          accessibilityRole="button"
          contentStyle={[
            shadows.card,
            {
              alignItems: "center",
              backgroundColor: colors.primary[500],
              borderRadius: radius.xs,
              justifyContent: "center",
              minHeight: 56,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            },
          ]}
          disabled={submitting}
          feedback="light"
          onPress={onSearchPress}
          scaleTo={0.985}
          style={{ width: "100%" }}
        >
          {submitting ? (
            <>
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    backgroundColor: "rgba(255,255,255,0.18)",
                    borderRadius: radius.round,
                    bottom: 6,
                    left: 0,
                    position: "absolute",
                    top: 6,
                    width: 112,
                  },
                  shimmerStyle,
                ]}
              />
              <View
                style={{
                  alignItems: "center",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: spacing.xs,
                }}
              >
                <ActivityIndicator color={colors.text.inverse} />
                <AppText
                  align="center"
                  color={colors.text.inverse}
                  style={{ fontSize: 18, fontWeight: "700" }}
                  variant="label"
                >
                  {t("common.search")}
                </AppText>
              </View>
            </>
          ) : (
            <AppText
              align="center"
              color={colors.text.inverse}
              style={{ fontSize: 18, fontWeight: "700" }}
              variant="label"
            >
              {ctaLabel}
            </AppText>
          )}
        </ScalePressable>
      </View>
    </MotionView>
  );
});
