import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows } from "../../theme";
import { ScalePressable } from "./scale-pressable";

type HeaderIconButtonProps = {
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  mirrorInRTL?: boolean;
  onPress: () => void;
};

export const HeaderIconButton = ({
  accessibilityLabel,
  icon,
  mirrorInRTL = false,
  onPress,
}: HeaderIconButtonProps) => {
  const { isRTL } = useAppLanguage();

  return (
    <ScalePressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      contentStyle={{
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={onPress}
      scaleTo={0.94}
      style={{ borderRadius: radius.round }}
    >
      <View
        style={[
          shadows.card,
          {
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.88)",
            borderColor: colors.border.soft,
            borderRadius: radius.round,
            borderWidth: 1,
            height: 42,
            justifyContent: "center",
            width: 42,
          },
        ]}
      >
        <Ionicons
          color={colors.text.secondary}
          name={icon}
          size={22}
          style={{ transform: [{ scaleX: mirrorInRTL && isRTL ? -1 : 1 }] }}
        />
      </View>
    </ScalePressable>
  );
};
