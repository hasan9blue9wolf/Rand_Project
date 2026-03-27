import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

type AmbientBackgroundVariant = "chat" | "default";

type AmbientBackgroundProps = Omit<ViewProps, "children"> & {
  baseColor: string;
  children: ReactNode;
  variant?: AmbientBackgroundVariant;
};

const orbPaletteByVariant: Record<
  AmbientBackgroundVariant,
  {
    left: readonly [string, string];
    right: readonly [string, string];
  }
> = {
  chat: {
    left: ["rgba(52, 116, 255, 0.16)", "rgba(52, 116, 255, 0)"],
    right: ["rgba(255, 127, 80, 0.12)", "rgba(255, 127, 80, 0)"],
  },
  default: {
    left: ["rgba(15, 73, 189, 0.14)", "rgba(15, 73, 189, 0)"],
    right: ["rgba(255, 127, 80, 0.1)", "rgba(255, 127, 80, 0)"],
  },
};

export const AmbientBackground = ({
  baseColor,
  children,
  style,
  variant = "default",
  ...rest
}: AmbientBackgroundProps) => {
  const palette = orbPaletteByVariant[variant];

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: baseColor,
          flex: 1,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.32)", "rgba(255,255,255,0)"]}
        pointerEvents="none"
        style={[styles.fill, { top: -120 }]}
      />
      <LinearGradient
        colors={palette.left}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.orb, styles.leftOrb]}
      />
      <LinearGradient
        colors={palette.right}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.orb, styles.rightOrb]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  leftOrb: {
    height: 260,
    left: -84,
    top: 24,
    width: 260,
  },
  orb: {
    borderRadius: 999,
    position: "absolute",
  },
  rightOrb: {
    height: 220,
    right: -72,
    top: 168,
    width: 220,
  },
});
