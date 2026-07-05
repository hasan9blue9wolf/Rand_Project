import type { TextStyle } from "react-native";
import { Platform } from "react-native";

import { colors } from "./colors";

const fontFamily = Platform.select({
  android: "sans-serif",
  default: "System",
  ios: "System",
});

export const typography = {
  family: {
    sans: fontFamily,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  variants: {
    eyebrow: {
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.2,
      fontWeight: "700",
      textTransform: "uppercase",
      color: colors.text.muted,
    },
    caption: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
      color: colors.text.muted,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "400",
      color: colors.text.secondary,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400",
      color: colors.text.secondary,
    },
    bodyStrong: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      color: colors.text.primary,
    },
    label: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600",
      color: colors.text.primary,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "700",
      letterSpacing: -0.35,
      color: colors.text.primary,
    },
    headline: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
      letterSpacing: -0.7,
      color: colors.text.primary,
    },
    display: {
      fontSize: 34,
      lineHeight: 40,
      fontWeight: "700",
      letterSpacing: -0.9,
      color: colors.text.primary,
    },
  },
} as const;

export type TypographyVariant = keyof typeof typography.variants;

export const getTypographyStyle = (
  variant: TypographyVariant,
  color?: string,
): TextStyle => ({
  ...(typography.variants[variant] as TextStyle),
  color: color ?? typography.variants[variant].color,
  fontFamily,
});
