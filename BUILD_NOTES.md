# Build Notes

This repo was hardened for Android investor-demo APK generation.

## What Changed

- Fixed the Expo config so `npx expo config` and EAS can actually evaluate [app.config.ts](/home/bluewolf/Desktop/Rand_Project/app.config.ts) without failing on TypeScript-only runtime imports.
- Added an `investor-apk` profile to [eas.json](/home/bluewolf/Desktop/Rand_Project/eas.json) that builds an Android `apk` with internal distribution and demo-safe environment values.
- Pinned Expo SDK dependencies and native peers to the SDK 55-compatible set so `npx expo-doctor` passes before APK generation.
- Kept the investor build on `demo` mode with mock Heia behavior and no real payment processing.
- Explicitly set Android presentation config in [app.config.ts](/home/bluewolf/Desktop/Rand_Project/app.config.ts): package name, version, versionCode, adaptive icon, splash screen, reviewed permissions, light UI mode, and keyboard resize behavior.
- Added safer app boot behavior in [use-app-bootstrap.ts](/home/bluewolf/Desktop/Rand_Project/hooks/use-app-bootstrap.ts) so optional startup failures do not leave the splash screen hanging.
- Demo mode now skips live Supabase bootstrap work at startup, which keeps investor builds self-contained even if backend credentials exist elsewhere.
- Imported gesture-handler at app entry in [app/_layout.tsx](/home/bluewolf/Desktop/Rand_Project/app/_layout.tsx) for safer Android navigation behavior.
- Improved Android keyboard handling in [auth-shell.tsx](/home/bluewolf/Desktop/Rand_Project/features/auth/components/auth-shell.tsx) and [heia-screen.tsx](/home/bluewolf/Desktop/Rand_Project/features/heia/components/heia-screen.tsx).
- Removed a dead-end Heia mic interaction by turning it into a premium demo shortcut and disabling it when unavailable in [chat-input.tsx](/home/bluewolf/Desktop/Rand_Project/features/heia/components/chat-input.tsx).
- Made social auth feel intentional in demo mode by labeling it as demo access in [auth-social-placeholders.tsx](/home/bluewolf/Desktop/Rand_Project/features/auth/components/auth-social-placeholders.tsx).
- Forced Trips to stay on stable mock/demo data during demo mode in [trips.service.ts](/home/bluewolf/Desktop/Rand_Project/features/trips/services/trips.service.ts).
- Added exact investor APK build and install commands to [README.md](/home/bluewolf/Desktop/Rand_Project/README.md).
- Verified the project against Expo Doctor, TypeScript, ESLint, and Jest after the APK-prep changes.

## Intended Result

The `investor-apk` build should feel stable, premium, and self-contained for presentations:

- onboarding works without backend setup
- Home, Search, Package Details, Heia, Trips, Offers, and Profile remain usable
- visual identity stays polished on Android
- there are no intentional real-payment dependencies in the investor build

## Recommended Build Command

```bash
npx eas-cli build --platform android --profile investor-apk
```
