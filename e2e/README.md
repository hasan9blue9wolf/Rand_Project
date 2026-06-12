# Haya Trip E2E Plan

Haya Trip is being demoed as an Android APK, so the recommended E2E tool for the first production-grade pass is `Maestro`.

Why Maestro for this project:

- it is fast to run against real Android builds and APKs
- it works well for investor-demo smoke coverage
- it keeps the initial E2E layer lightweight while the product is still mock-first

## Critical Demo Flows

### 1. Launch app

- Open the APK and verify the app boots past the splash state.
- Confirm the default tab shell is visible.
- Expected result: Home renders without errors and the bottom tab bar is interactive.

### 2. Switch language

- Open Profile.
- Open Settings.
- Switch from English to Arabic.
- Expected result: copy changes, RTL layout flips correctly, and the tab/header alignment still looks natural.

### 3. Search trip

- Start on Home.
- Tap the booking fields to cycle mock search values.
- Tap `Search Flights`.
- Expected result: Search Results opens with a filled criteria summary and visible results.

### 4. Open package

- From Search Results or Offers, open a package card.
- Expected result: Package Details shows hero media, pricing, chips, trip context, and booking CTA states without placeholders or crashes.

### 5. Chat with Heia

- Open Heia from the tab bar or Home banner.
- Tap one suggestion chip or enter a custom message.
- Send the message.
- Expected result: the conversation appends smoothly, loading state appears briefly, and a structured recommendation or follow-up response renders.

### 6. Save destination

- Open a package from Search Results or Offers.
- Tap `Save destination`.
- Navigate to Profile, then open Saved Destinations.
- Expected result: the saved package appears in the saved destinations list and the package CTA reflects the saved state.

### 7. Sign in

- Open the Auth screen.
- Sign in with demo credentials.
- Expected result: the session hydrates cleanly, the app routes forward without backend dependency, and returning to Profile reflects the signed-in state.

## Suggested Maestro Rollout

Phase 1:
- `launch-app.yaml`
- `language-switch.yaml`
- `search-and-open-package.yaml`
- `heia-chat.yaml`
- `sign-in-demo.yaml`

Phase 2:
- add stable `testID` coverage for the main CTA surfaces
- add notification and checkout smoke flows

## Android Execution Notes

- Build the APK with demo mode enabled: `EXPO_PUBLIC_APP_MODE=demo`
- Keep `EXPO_PUBLIC_HEIA_PROVIDER=mock` for deterministic demo behavior
- Run flows on at least:
  - one Pixel-class Android emulator
  - one physical Android device intended for presentations

## Exit Criteria For Demo Readiness

- No red screens or dead-end navigation
- Home, Search Results, Package Details, Heia, and Auth all complete successfully
- Arabic switch keeps the app visually premium and correctly mirrored
- All flows complete without requiring Supabase, real AI, or payments
