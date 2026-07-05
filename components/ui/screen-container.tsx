import type { ReactNode } from "react";
import {
  Platform,
  ScrollView,
  type ScrollViewProps,
  useWindowDimensions,
  View,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  getContentMaxWidth,
  getScreenPadding,
  spacing,
} from "../../theme";
import { cn } from "../../utils/cn";
import { AmbientBackground } from "./ambient-background";
import { AppHeader } from "./app-header";

type ScreenContainerProps = ViewProps & {
  backgroundColor?: string;
  contentContainerClassName?: string | undefined;
  contentStyle?: ScrollViewProps["contentContainerStyle"] | undefined;
  eyebrow?: string | undefined;
  leading?: ReactNode | undefined;
  keyboardDismissMode?: ScrollViewProps["keyboardDismissMode"] | undefined;
  scrollable?: boolean;
  subtitle?: string | undefined;
  title?: string | undefined;
  trailing?: ReactNode | undefined;
  withBottomTabSpacing?: boolean;
};

export const screenContainerBottomTabSpacing = 136;

export const ScreenContainer = ({
  backgroundColor = colors.background.app,
  children,
  className,
  contentContainerClassName,
  contentStyle,
  eyebrow,
  keyboardDismissMode,
  leading,
  scrollable = true,
  subtitle,
  title,
  trailing,
  withBottomTabSpacing = true,
}: ScreenContainerProps) => {
  const { width } = useWindowDimensions();
  const screenPadding = getScreenPadding(width);
  const contentMaxWidth = getContentMaxWidth(width);
  const bottomPadding = withBottomTabSpacing
    ? screenContainerBottomTabSpacing
    : Platform.OS === "android"
      ? spacing.hero
      : spacing.section;

  const content = (
    <View
      className={cn("w-full self-center", contentContainerClassName)}
      style={[
        {
          gap: spacing.xl,
          maxWidth: contentMaxWidth,
          paddingBottom: bottomPadding,
          paddingHorizontal: screenPadding,
          paddingTop: spacing.lg,
          width: "100%",
        },
        contentStyle,
      ]}
    >
      {title ? (
        <AppHeader
          eyebrow={eyebrow}
          leading={leading}
          subtitle={subtitle}
          title={title}
          trailing={trailing}
        />
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      className={cn("flex-1", className)}
      edges={["top", "left", "right"]}
      style={{ backgroundColor }}
    >
      <AmbientBackground baseColor={backgroundColor}>
        {scrollable ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardDismissMode={
              keyboardDismissMode ??
              (Platform.OS === "ios" ? "interactive" : "none")
            }
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>{content}</View>
        )}
      </AmbientBackground>
    </SafeAreaView>
  );
};
