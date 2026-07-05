import type { ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { triggerFeedback } from "../../services/feedback";

type PressFeedback = "light" | "none" | "selection";

type ScalePressableProps = Omit<PressableProps, "style"> & {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  feedback?: PressFeedback;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  translateYTo?: number;
};

export const ScalePressable = ({
  children,
  contentStyle,
  feedback = "selection",
  onPressIn,
  onPressOut,
  scaleTo = 0.98,
  style,
  translateYTo = 1,
  ...rest
}: ScalePressableProps) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(event) => {
        scale.value = withTiming(scaleTo, {
          duration: 120,
          easing: Easing.out(Easing.quad),
        });
        translateY.value = withTiming(translateYTo, {
          duration: 120,
          easing: Easing.out(Easing.quad),
        });
        if (feedback !== "none") {
          void triggerFeedback(feedback);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, {
          duration: 170,
          easing: Easing.out(Easing.quad),
        });
        translateY.value = withTiming(0, {
          duration: 170,
          easing: Easing.out(Easing.quad),
        });
        onPressOut?.(event);
      }}
      style={style}
      {...rest}
    >
      <Animated.View style={[contentStyle, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
