import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Image, View } from "react-native";

import { getRemoteImageSource } from "../../services/media/remote-images";
import { colors, radius, spacing } from "../../theme";
import { AppText } from "./app-text";

type AvatarTone = "primary" | "coral" | "navy" | "neutral";

type AvatarProps = {
  bordered?: boolean;
  label?: string;
  size?: number;
  tone?: AvatarTone;
  uri?: string;
};

const toneGradients: Record<AvatarTone, readonly [string, string]> = {
  coral: colors.gradients.coral,
  navy: colors.gradients.navy,
  neutral: [colors.background.softBlue, colors.border.soft],
  primary: colors.gradients.primary,
};

const getInitials = (label?: string) =>
  label
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "TG";

export const Avatar = memo(function Avatar({
  bordered = false,
  label,
  size = 44,
  tone = "primary",
  uri,
}: AvatarProps) {
  const borderWidth = bordered ? 2 : 0;
  const imageSource = getRemoteImageSource(uri);

  return (
    <View
      style={{
        borderColor: colors.surface.base,
        borderRadius: radius.round,
        borderWidth,
        height: size,
        overflow: "hidden",
        width: size,
      }}
    >
      {imageSource ? (
        <Image source={imageSource} style={{ height: size, width: size }} />
      ) : (
        <LinearGradient
          colors={toneGradients[tone]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            padding: spacing.xs,
          }}
        >
          <AppText
            align="center"
            color={tone === "neutral" ? colors.text.primary : colors.text.inverse}
            variant="label"
          >
            {getInitials(label)}
          </AppText>
        </LinearGradient>
      )}
    </View>
  );
});
