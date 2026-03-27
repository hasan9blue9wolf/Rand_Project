import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode,useEffect } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLanguage } from "../../hooks/use-app-language";
import {
  colors,
  getContentMaxWidth,
  getScreenPadding,
  radius,
  shadows,
  spacing,
  subtleLayoutTransition,
} from "../../theme";
import { AppText } from "./app-text";
import { ScalePressable } from "./scale-pressable";

const getTabLabel = (
  options: BottomTabBarProps["descriptors"][string]["options"],
  routeName: string,
) => {
  if (typeof options.tabBarLabel === "string") {
    return options.tabBarLabel;
  }

  if (typeof options.title === "string") {
    return options.title;
  }

  return routeName;
};

type TabBarItemProps = {
  color: string;
  focused: boolean;
  icon: ReactNode;
  isHeia: boolean;
  label: string;
  onPress: () => void;
};

const TabBarItem = ({
  color,
  focused,
  icon,
  isHeia,
  label,
  onPress,
}: TabBarItemProps) => {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const itemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.84, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -2]) },
      { scale: interpolate(progress.value, [0, 1], [0.985, 1.02]) },
    ],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.52, 1]) }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.16, 0.28]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1.05]) }],
  }));

  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      feedback={isHeia ? "light" : "selection"}
      onPress={onPress}
      scaleTo={isHeia ? 0.95 : 0.975}
      style={{
        borderRadius: radius.lg,
        flex: 1,
      }}
    >
      {isHeia ? (
        <Animated.View
          layout={subtleLayoutTransition}
          style={[
            itemStyle,
            {
              alignItems: "center",
              gap: spacing.xs,
              justifyContent: "flex-end",
              marginTop: -Platform.select({
                android: 18,
                default: 22,
                ios: 22,
              }),
              minHeight: 74,
              paddingBottom: spacing.xxs,
            },
          ]}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              style={[
                haloStyle,
                {
                  backgroundColor: "rgba(52,116,255,0.16)",
                  borderRadius: radius.round,
                  height: 72,
                  position: "absolute",
                  width: 72,
                },
              ]}
            />
            <LinearGradient
              colors={colors.gradients.primary}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={[
                shadows.floating,
                {
                  alignItems: "center",
                  borderColor: colors.surface.base,
                  borderRadius: radius.round,
                  borderWidth: 4,
                  height: 58,
                  justifyContent: "center",
                  width: 58,
                },
              ]}
            >
              {icon}
            </LinearGradient>
          </View>
          <AppText
            align="center"
            color={focused ? colors.primary[500] : colors.text.muted}
            variant="caption"
          >
            {label}
          </AppText>
        </Animated.View>
      ) : (
        <Animated.View
          layout={subtleLayoutTransition}
          style={[
            itemStyle,
            {
              alignItems: "center",
              gap: spacing.xxs,
              justifyContent: "flex-end",
              minHeight: 68,
              paddingBottom: spacing.sm,
            },
          ]}
        >
          <Animated.View
            style={[
              indicatorStyle,
              {
                backgroundColor: "rgba(15, 73, 189, 0.18)",
                borderRadius: radius.round,
                height: 4,
                marginBottom: spacing.xs,
                width: 24,
              },
            ]}
          />
          {icon}
          <AppText align="center" color={color} variant="caption">
            {label}
          </AppText>
        </Animated.View>
      )}
    </ScalePressable>
  );
};

export const BottomTabBar = ({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { isRTL } = useAppLanguage();
  const { width } = useWindowDimensions();
  const screenPadding = getScreenPadding(width);
  const maxWidth = getContentMaxWidth(width);

  return (
    <View
      pointerEvents="box-none"
      style={{
        backgroundColor: "transparent",
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        paddingHorizontal: screenPadding,
        paddingTop: spacing.xs,
      }}
    >
      <View
        style={[
          shadows.tabBar,
          {
            alignSelf: "center",
            backgroundColor: colors.surface.base,
            borderColor: colors.border.soft,
            borderRadius: radius.xl,
            borderWidth: 1,
            maxWidth,
            overflow: "hidden",
            paddingHorizontal: spacing.sm,
            paddingTop: spacing.xs,
            width: "100%",
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.96)", "rgba(246,249,252,0.98)"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.82)",
            borderRadius: radius.round,
            height: 1,
            left: spacing.lg,
            opacity: 0.85,
            position: "absolute",
            right: spacing.lg,
            top: 0,
          }}
        />
        <View
          style={{
            alignItems: "flex-end",
            flexDirection: isRTL ? "row-reverse" : "row",
            justifyContent: "space-between",
          }}
        >
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            if (!descriptor) {
              return null;
            }
            const focused = state.index === index;
            const label = getTabLabel(descriptor.options, route.name);
            const isHeia = route.name === "heia";
            const color = focused ? colors.primary[500] : colors.text.muted;
            const onPress = () => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const icon = descriptor.options.tabBarIcon?.({
              color: isHeia ? colors.text.inverse : color,
              focused,
              size: isHeia ? 22 : 21,
            });

            return (
              <TabBarItem
                color={color}
                focused={focused}
                icon={icon}
                key={route.key}
                isHeia={isHeia}
                label={label}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};
