import { View } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { colors, radius, shadows, spacing } from "../../theme";
import { AppText } from "./app-text";
import { ScalePressable } from "./scale-pressable";

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  value: T;
};

export const SegmentedControl = <T extends string>({
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) => {
  const { isRTL } = useAppLanguage();

  return (
    <View
      style={{
        backgroundColor: colors.background.softBlue,
        borderRadius: radius.md,
        flexDirection: isRTL ? "row-reverse" : "row",
        padding: spacing.xxs,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <ScalePressable
            key={option.value}
            contentStyle={[
              {
                alignItems: "center",
                borderRadius: radius.sm,
                flex: 1,
                justifyContent: "center",
                minHeight: 46,
                paddingHorizontal: spacing.sm,
              },
              active
                ? [
                    shadows.card,
                    {
                      backgroundColor: colors.surface.base,
                    },
                  ]
                : null,
            ]}
            onPress={() => onChange(option.value)}
            scaleTo={0.985}
            style={{ flex: 1 }}
          >
            <AppText
              align="center"
              color={active ? colors.primary[600] : colors.text.secondary}
              variant="label"
            >
              {option.label}
            </AppText>
          </ScalePressable>
        );
      })}
    </View>
  );
};
