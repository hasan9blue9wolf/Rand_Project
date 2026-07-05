import "react-native-gesture-handler";
import "../global.css";
import "../services/i18n";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ErrorBoundaryProps, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze } from "react-native-screens";

import { AppToast } from "../components/ui/app-toast";
import { BrandLogo } from "../components/ui/brand-logo";
import { useAppBootstrap } from "../hooks/use-app-bootstrap";
import { useNotificationObserver } from "../hooks/use-notification-observer";
import { createAppQueryClient } from "../services/query/client";
import { useDemoBookingsStore } from "../store/demo-bookings-store";
import { useDemoModeStore } from "../store/demo-mode-store";
import { useNotificationsStore } from "../store/notifications-store";
import { useTravelPreferencesStore } from "../store/travel-preferences-store";
import { useTutorialStore } from "../store/tutorial-store";
import { colors, radius, spacing } from "../theme";

if (Platform.OS !== "web") {
  enableFreeze(true);
}

const queryClient = createAppQueryClient();

const resetStartupDemoData = async () => {
  await Promise.allSettled([
    useDemoBookingsStore.persist.clearStorage(),
    useDemoModeStore.persist.clearStorage(),
    useNotificationsStore.persist.clearStorage(),
    useTravelPreferencesStore.persist.clearStorage(),
    useTutorialStore.persist.clearStorage(),
  ]);

  useDemoBookingsStore.setState({ bookings: [] });
  useDemoModeStore.getState().resetDemoData();
  useNotificationsStore.setState({ notifications: [], unreadCount: 0 });
  useTravelPreferencesStore.setState({
    guestModeEnabled: false,
    onboardingCompleted: false,
    preferences: null,
  });
  useTutorialStore.setState({ completed: false });
};

export const ErrorBoundary = ({ retry }: ErrorBoundaryProps) => {
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const handleResetDemoData = () => {
    void resetStartupDemoData().finally(() => {
      retry();
    });
  };

  return (
    <SafeAreaProvider>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.background.app,
          flex: 1,
          gap: spacing.lg,
          justifyContent: "center",
          padding: spacing.xl,
        }}
      >
        <BrandLogo mode="full" size={96} />
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Haya Trips
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: 16,
            lineHeight: 24,
            textAlign: "center",
          }}
        >
          Something went wrong while starting the app.
        </Text>
        <View style={{ gap: spacing.sm, marginTop: spacing.md, width: "100%" }}>
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={{
              alignItems: "center",
              backgroundColor: colors.primary[500],
              borderRadius: radius.round,
              minHeight: 52,
              justifyContent: "center",
              paddingHorizontal: spacing.lg,
            }}
          >
            <Text style={{ color: colors.text.inverse, fontWeight: "800" }}>
              Try Again
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleResetDemoData}
            style={{
              alignItems: "center",
              backgroundColor: colors.surface.base,
              borderColor: colors.border.soft,
              borderRadius: radius.round,
              borderWidth: 1,
              minHeight: 52,
              justifyContent: "center",
              paddingHorizontal: spacing.lg,
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: "800" }}>
              Reset demo data
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const RootNavigator = () => {
  useNotificationObserver();

  return (
    <Stack
      screenOptions={{
        animation:
          Platform.OS === "ios" ? "fade_from_bottom" : "slide_from_right",
        contentStyle: {
          backgroundColor: "#F4F7FB",
        },
        freezeOnBlur: true,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      <Stack.Screen
        name="auth"
        options={{
          animation: "fade_from_bottom",
          presentation: "card",
        }}
      />
      <Stack.Screen name="destination/[destinationId]" />
      <Stack.Screen name="empty-states" />
      <Stack.Screen name="error-states" />
      <Stack.Screen name="search-results" />
      <Stack.Screen name="package/[packageId]" />
      <Stack.Screen name="category/[categoryId]" />
      <Stack.Screen name="booking/[packageId]" />
      <Stack.Screen name="booking-confirmed/[bookingId]" />
      <Stack.Screen
        name="notifications"
        options={{
          animation: "fade_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="flight-booking/[bookingId]" />
      <Stack.Screen name="flight/[flightId]" />
      <Stack.Screen
        name="checkout/[bookingId]"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="tutorial" options={{ animation: "fade_from_bottom" }} />
      <Stack.Screen name="language" />
      <Stack.Screen name="offline-state" />
      <Stack.Screen
        name="payment-method/[bookingId]"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="saved-destinations" />
      <Stack.Screen
        name="traveler-details/[bookingId]"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="trip/[tripId]" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default function RootLayout() {
  const { ready } = useAppBootstrap();

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootNavigator />
        <AppToast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
