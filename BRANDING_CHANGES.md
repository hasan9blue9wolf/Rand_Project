# Branding Changes

## New Brand

- Product display name: Haya Trips
- AI assistant name: Haya
- Expo slug: haya-trips
- Package metadata slug: hayatrips
- Bundle/package identifier: com.hayatrips.app

## Updated Areas

- Expo configuration now uses `Haya Trips` for the app name that feeds generated native labels.
- Expo configuration now uses the new `haya-trips` slug.
- iOS display metadata uses `Haya Trips` through `CFBundleDisplayName`.
- Android package metadata uses `com.hayatrips.app`.
- Public runtime defaults and example environment URLs now use `hayatrips`.
- English and Arabic localization copy now use `Haya Trips` for the product and `Haya` for the assistant.
- Arabic localization uses `هيا تريبس` for the product and `هيا` for the assistant.
- Production logo assets were generated from `assets/brand/haya-logo-source.jpg`.
- Created `assets/brand/haya-logo.png`, `assets/brand/haya-logo-square.png`, `assets/brand/haya-icon.png`, and `assets/brand/haya-splash.png`.
- Updated app-consumed assets at `assets/icon.png`, `assets/adaptive-icon.png`, and `assets/splash.png`.
- Added a reusable `BrandLogo` component for full-logo and compact-icon display modes.
- Home, onboarding, auth, checkout, profile, settings, notifications, package details, and AI chat copy were updated through localization strings.
- Documentation, launch/build notes, store notes, E2E notes, and design reference exports were refreshed to remove previous visible branding.
- Package metadata was updated to the new `hayatrips` slug.

## Notes

- Existing route names, feature folder names, API filenames, and TypeScript symbols that use `heia` were left in place to keep the architecture unchanged.
- User-facing strings and generated app metadata now present the product as `Haya Trips` and the assistant as `Haya`.
