import type { ViewStyle } from "react-native";
import { Platform } from "react-native";

const iosShadow = (
  shadowOpacity: number,
  shadowRadius: number,
  height: number,
): ViewStyle => ({
  shadowColor: "#12203A",
  shadowOffset: { width: 0, height },
  shadowOpacity,
  shadowRadius,
});

export const shadows = {
  card: {
    ...Platform.select<ViewStyle>({
      android: {
        elevation: 6,
      },
      default: iosShadow(0.08, 22, 12),
      ios: iosShadow(0.08, 22, 12),
    }),
  },
  premium: {
    ...Platform.select<ViewStyle>({
      android: {
        elevation: 10,
      },
      default: iosShadow(0.14, 32, 18),
      ios: iosShadow(0.14, 32, 18),
    }),
  },
  floating: {
    ...Platform.select<ViewStyle>({
      android: {
        elevation: 14,
      },
      default: iosShadow(0.18, 36, 22),
      ios: iosShadow(0.18, 36, 22),
    }),
  },
  tabBar: {
    ...Platform.select<ViewStyle>({
      android: {
        elevation: 18,
      },
      default: iosShadow(0.12, 30, 12),
      ios: iosShadow(0.12, 30, 12),
    }),
  },
} as const;
