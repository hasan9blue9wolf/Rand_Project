import { ImageBackground, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useLocalization } from "../../../hooks/use-localization";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, shadows, spacing } from "../../../theme";
import type { PackageCategoryDefinition } from "../data/package-categories";

type PackageCategoryCardProps = {
  category: PackageCategoryDefinition;
  onPress: () => void;
  width?: number;
};

export const PackageCategoryCard = ({
  category,
  onPress,
  width = 220,
}: PackageCategoryCardProps) => {
  const { t } = useLocalization();

  return (
    <ScalePressable
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.97}
      style={[shadows.card, { borderRadius: radius.lg, width }]}
    >
      <ImageBackground
        imageStyle={{ borderRadius: radius.lg }}
        source={getRemoteImageSource(category.imageUrl)}
        style={{
          height: 132,
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(11,18,32,0.48)",
            padding: spacing.md,
          }}
        >
          <AppText color={colors.text.inverse} variant="title">
            {t(category.titleKey)}
          </AppText>
        </View>
      </ImageBackground>
    </ScalePressable>
  );
};
