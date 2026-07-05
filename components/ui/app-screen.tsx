import type { ReactNode } from "react";
import type { ViewProps } from "react-native";

import { ScreenContainer } from "./screen-container";

type AppScreenProps = ViewProps & {
  contentContainerClassName?: string;
  rightSlot?: ReactNode;
  scrollable?: boolean;
  subtitle?: string;
  title?: string;
};

export const AppScreen = ({
  children,
  contentContainerClassName,
  rightSlot,
  scrollable = true,
  subtitle,
  title,
}: AppScreenProps) => (
  <ScreenContainer
    contentContainerClassName={contentContainerClassName}
    scrollable={scrollable}
    subtitle={subtitle}
    title={title}
    trailing={rightSlot}
  >
    {children}
  </ScreenContainer>
);
