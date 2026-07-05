import { Image, View } from "react-native";

import { colors, radius } from "../../theme";

type BrandLogoMode = "full" | "icon";

type BrandLogoProps = {
  mode?: BrandLogoMode;
  size?: number;
};

const fullLogoSource = require("../../assets/brand/haya-logo.png");
const iconLogoSource = require("../../assets/brand/haya-icon.png");

export const BrandLogo = ({ mode = "full", size = 96 }: BrandLogoProps) => {
  if (mode === "icon") {
    return (
      <View
        style={{
          backgroundColor: colors.surface.base,
          borderRadius: Math.min(radius.lg, size * 0.2),
          height: size,
          overflow: "hidden",
          width: size,
        }}
      >
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={iconLogoSource}
          style={{ height: "100%", width: "100%" }}
        />
      </View>
    );
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={fullLogoSource}
      style={{ height: size, width: size * 1.7 }}
    />
  );
};
