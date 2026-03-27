import "react-native-gesture-handler";
import "../global.css";
import "../services/i18n";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze } from "react-native-screens";

import { useAppBootstrap } from "../hooks/use-app-bootstrap";
import { useNotificationObserver } from "../hooks/use-notification-observer";
import { createAppQueryClient } from "../services/query/client";

if (Platform.OS !== "web") {
  enableFreeze(true);
}

const queryClient = createAppQueryClient();

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
      <Stack.Screen
        name="notifications"
        options={{
          animation: "fade_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="flight-booking/[bookingId]" />
      <Stack.Screen
        name="checkout/[bookingId]"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help-support" />
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
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
