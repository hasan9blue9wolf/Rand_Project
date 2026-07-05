import { useEffect } from "react";
import {
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors, radius } from "../../theme";

type SkeletonBlockProps = {
  borderRadius?: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
};

export const SkeletonBlock = ({
  borderRadius = radius.sm,
  height,
  style,
  width = "100%",
}: SkeletonBlockProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.82, 0.2]),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-120, 240]),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius,
          height,
          width,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            borderRadius,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#E7EFF8",
    overflow: "hidden",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.base,
    width: 108,
  },
});
