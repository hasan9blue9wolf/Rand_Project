import { Text, type TextProps } from "react-native";

import { useAppLanguage } from "../../hooks/use-app-language";
import { getTypographyStyle, type TypographyVariant } from "../../theme";
import { cn } from "../../utils/cn";

type AppTextProps = TextProps & {
  align?: "auto" | "left" | "right" | "center";
  color?: string;
  variant?: TypographyVariant;
};

export const AppText = ({
  align = "auto",
  className,
  color,
  style,
  variant = "body",
  ...rest
}: AppTextProps) => {
  const { isRTL } = useAppLanguage();

  const alignmentClass =
    align === "auto"
      ? isRTL
        ? "text-right"
        : "text-left"
      : align === "center"
        ? "text-center"
        : align === "right"
          ? "text-right"
          : "text-left";

  return (
    <Text
      {...rest}
      className={cn(alignmentClass, className)}
      style={[
        getTypographyStyle(variant, color),
        { writingDirection: isRTL ? "rtl" : "ltr" },
        style,
      ]}
    />
  );
};
