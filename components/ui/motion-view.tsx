import type { ReactNode } from "react";
import { Platform, type StyleProp, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import {
  getCardEntering,
  getChatMessageEntering,
  getRecommendationEntering,
  subtleLayoutTransition,
} from "../../theme/motion";

type MotionVariant = "card" | "chat" | "recommendation";

type MotionViewProps = {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  variant?: MotionVariant;
  withLayout?: boolean;
};

const getEnteringByVariant = (variant: MotionVariant, index: number) => {
  if (variant === "chat") {
    return getChatMessageEntering(index);
  }

  if (variant === "recommendation") {
    return getRecommendationEntering(index);
  }

  return getCardEntering(index);
};

export const MotionView = ({
  children,
  index = 0,
  style,
  variant = "card",
  withLayout = true,
}: MotionViewProps) => {
  if (Platform.OS === "android") {
    return <View style={style}>{children}</View>;
  }

  const layoutProps = withLayout ? { layout: subtleLayoutTransition } : {};

  return (
    <Animated.View
      entering={getEnteringByVariant(variant, index)}
      style={style}
      {...layoutProps}
    >
      {children}
    </Animated.View>
  );
};
