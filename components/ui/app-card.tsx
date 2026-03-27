import { View, type ViewProps } from "react-native";

import { colors, radius, shadows, spacing } from "../../theme";
import { cn } from "../../utils/cn";

type AppCardProps = ViewProps & {
  elevated?: boolean;
};

export const AppCard = ({
  children,
  className,
  elevated = false,
  style,
  ...rest
}: AppCardProps) => (
  <View
    {...rest}
    className={cn("bg-surface-elevated", className)}
    style={[
      elevated ? shadows.premium : shadows.card,
      {
        backgroundColor: colors.surface.base,
        borderColor: colors.border.soft,
        borderRadius: elevated ? radius.xl : radius.lg,
        borderWidth: 1,
        overflow: "hidden",
        padding: elevated ? spacing.xl : spacing.lg,
        position: "relative",
      },
      style,
    ]}
  >
    {children}
  </View>
);
