# Haya Trips

Haya Trips is a production-oriented Expo React Native app built with TypeScript for premium travel planning. It ships with five initial screens, English and Arabic localization, RTL support, strict TypeScript, linting, formatting, environment configuration, and a scalable feature-based structure.

## Launch Docs

- [LAUNCH_CHECKLIST.md](/home/bluewolf/Desktop/Rand_Project/LAUNCH_CHECKLIST.md)
- [RELEASE_CHECKLIST.md](/home/bluewolf/Desktop/Rand_Project/RELEASE_CHECKLIST.md)
- [REQUIRED_ASSETS_CHECKLIST.md](/home/bluewolf/Desktop/Rand_Project/REQUIRED_ASSETS_CHECKLIST.md)
- [STORE_SUBMISSION_NOTES.md](/home/bluewolf/Desktop/Rand_Project/STORE_SUBMISSION_NOTES.md)
- [store-placeholders/README.md](/home/bluewolf/Desktop/Rand_Project/assets/store-placeholders/README.md)

## Investor Demo Mode

The app now defaults to an investor-demo setup intended for polished Android APK presentations:

- `EXPO_PUBLIC_APP_MODE=demo` keeps the app fully interactive without requiring Supabase, a live AI backend, or real payments.
- Haya uses premium scripted mock intelligence through the existing AI abstraction layer.
- Auth, profile data, saved destinations, notifications metadata, checkout confirmation, and related backend-dependent flows fall back to realistic on-device demo services.
- The live architecture is still preserved, so real providers can be re-enabled later without rewriting the screens.

## Android Investor APK

Haya Trips is a true Expo React Native mobile app and is ready to produce an installable Android APK for investor demos through EAS.

The dedicated profile is `investor-apk` and is configured to:

- build an `apk` instead of an `aab`
- use `EXPO_PUBLIC_APP_MODE=demo`
- keep Haya on polished mock intelligence
- avoid depending on live Supabase or payment backends
- preserve the production app name and package identity for a premium install experience

### Exact Commands

Install dependencies:

```bash
npm install
```

Sign in to EAS:

```bash
npx eas-cli login
```

Configure EAS if this project has not been linked before:

```bash
npx eas-cli build:configure
```

Build the Android investor APK:

```bash
npx eas-cli build --platform android --profile investor-apk
```

Optional shortcut:

```bash
npm run build:investor-apk
```

List recent Android builds so you can grab the artifact URL:

```bash
npx eas-cli build:list --platform android --limit 5
```

Download the APK after the build finishes:

```bash
curl -L "<PASTE_APK_URL_FROM_EAS_OUTPUT>" -o hayatrips-investor.apk
```

Install the APK on a connected Android phone with ADB:

```bash
adb install -r hayatrips-investor.apk
```

If you prefer manual installation, download the APK from the EAS build page, transfer it to the phone, and open it there.

## Why Expo Router

Expo Router was chosen over wiring React Navigation manually for this project because it is the cleaner production option in an Expo-managed app:

- It is first-party in the Expo ecosystem and stays aligned with Expo SDK upgrades.
- It keeps navigation structure explicit through file-based routes instead of spreading screen registration across multiple navigation files.
- It still uses React Navigation under the hood, so the app keeps proven navigation primitives without carrying extra setup complexity.
- It scales well for nested stacks, tabs, deep linking, typed routes, and static export.

## Stack

- Expo + React Native + TypeScript
- Expo Router
- NativeWind
- Zustand
- TanStack Query
- React Hook Form + Zod
- i18next + react-i18next
- Supabase Auth + Postgres
- Expo Localization + RTL handling
- ESLint + Prettier

## Included Screens

- Home
- Haya AI Chat
- My Trips
- Offers
- Profile

## Project Structure

```text
app/
  (tabs)/
components/
  ui/
features/
  heia/
  home/
  offers/
  profile/
  trips/
hooks/
services/
  api/
  i18n/
  storage/
store/
theme/
constants/
types/
locales/
utils/
assets/
```

## Setup

### Requirements

- Node.js 20+
- npm 10+
- Xcode for iOS Simulator work
- Android Studio for Android Emulator work

### Install

```bash
npm install
cp .env.example .env
```

### Start Development

```bash
npm run start
```

Open on a device or simulator with:

```bash
npm run ios
npm run android
```

## Environment Variables

The app uses Expo environment variables. Put them in `.env`.

```env
APP_VARIANT=development
APP_ENV=development
APP_VERSION=1.0.0
IOS_BUILD_NUMBER=1
ANDROID_VERSION_CODE=1
EXPO_PUBLIC_APP_MODE=demo
EXPO_PUBLIC_API_BASE_URL=https://api.hayatrips.app
EXPO_PUBLIC_EAS_UPDATE_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_HEIA_PROVIDER=mock
```

Notes:

- `EXPO_PUBLIC_*` values are available in the app runtime.
- `APP_VARIANT` controls the native app identity for side-by-side installs: `development`, `staging`, or `production`.
- `APP_ENV` is exposed through `app.config.ts` for configuration metadata.
- `APP_VERSION`, `IOS_BUILD_NUMBER`, and `ANDROID_VERSION_CODE` drive release versioning in native builds.
- `EXPO_PUBLIC_APP_MODE=demo` is the recommended setting for investor demos and Android APK testing.
- Set `EXPO_PUBLIC_APP_MODE=live` only when the real backend services are configured and ready.
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the client-safe key for the mobile app. Do not put a service-role key in the app.
- Configure `OPENAI_API_KEY` only in `server/.env` or the backend host's secret manager; see [server/README.md](server/README.md).
- Set `EXPO_PUBLIC_HEIA_PROVIDER=real` only after the `/api/haya/chat` backend route is deployed.
- Use [.env.staging.example](/home/bluewolf/Desktop/Rand_Project/.env.staging.example) and [.env.production.example](/home/bluewolf/Desktop/Rand_Project/.env.production.example) as launch templates for separated release environments.
- The `investor-apk` EAS profile overrides runtime mode to demo and intentionally clears live Supabase client values for a safer presentation build.

## Supabase Setup

Haya Trips now includes a typed Supabase integration for:

- authentication
- user profiles
- travel preferences
- saved trips
- saved destinations
- Haya chat history
- notification metadata
- offers bookmarks

Key files:

- Supabase client: [client.ts](/home/bluewolf/Desktop/Rand_Project/services/supabase/client.ts)
- Typed database contract: [database.types.ts](/home/bluewolf/Desktop/Rand_Project/services/supabase/database.types.ts)
- Auth bootstrap: [auth.ts](/home/bluewolf/Desktop/Rand_Project/services/supabase/auth.ts)
- Schema proposal: [SCHEMA_PROPOSAL.md](/home/bluewolf/Desktop/Rand_Project/supabase/SCHEMA_PROPOSAL.md)
- Full schema: [schema.sql](/home/bluewolf/Desktop/Rand_Project/supabase/schema.sql)
- Migration: [20260327090000_initial_hayatrips.sql](/home/bluewolf/Desktop/Rand_Project/supabase/migrations/20260327090000_initial_hayatrips.sql)

Suggested setup flow:

1. Create a Supabase project.
2. Copy the project URL into `EXPO_PUBLIC_SUPABASE_URL`.
3. Copy the publishable key into `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Apply the schema with either the SQL editor using [schema.sql](/home/bluewolf/Desktop/Rand_Project/supabase/schema.sql) or the CLI migration in [20260327090000_initial_hayatrips.sql](/home/bluewolf/Desktop/Rand_Project/supabase/migrations/20260327090000_initial_hayatrips.sql).
5. Enable Email auth in the Supabase dashboard.
6. Start the app with `npm run start`.

If you use the Supabase CLI, a typical remote flow is:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

After schema changes, regenerate the database contract if needed and compare it with [database.types.ts](/home/bluewolf/Desktop/Rand_Project/services/supabase/database.types.ts).

## Haya AI Backend

The Haya assistant uses a server-side integration for OpenAI. The mobile app never sends requests directly to OpenAI and never holds a secret API key.

- Mobile app request layer: [services/api/request.ts](/home/bluewolf/Desktop/Rand_Project/services/api/request.ts)
- Haya backend client: [heia-backend.client.ts](/home/bluewolf/Desktop/Rand_Project/features/aiAdvisor/services/heia-backend.client.ts)
- Serverless route: [api/heia.ts](/home/bluewolf/Desktop/Rand_Project/api/heia.ts)
- Rate limiting: [heia-rate-limit.ts](/home/bluewolf/Desktop/Rand_Project/api/_lib/heia-rate-limit.ts)

The backend route expects to be deployed under the base API URL at `/api/heia`.

For investor demos, keep `EXPO_PUBLIC_HEIA_PROVIDER=mock` so the assistant remains responsive even without a deployed backend.

## Notifications

Haya Trips now includes a local notification layer built with Expo Notifications and structured so push support can be added later without changing the screen architecture.

Key files:

- Expo notification service: [expo-notifications.service.ts](/home/bluewolf/Desktop/Rand_Project/features/notifications/services/expo-notifications.service.ts)
- Notification observer: [use-notification-observer.ts](/home/bluewolf/Desktop/Rand_Project/hooks/use-notification-observer.ts)
- Notification preferences store: [settings-store.ts](/home/bluewolf/Desktop/Rand_Project/store/settings-store.ts)
- Settings screen controls: [settings-screen.tsx](/home/bluewolf/Desktop/Rand_Project/features/settings/components/settings-screen.tsx)
- App config plugin wiring: [app.config.ts](/home/bluewolf/Desktop/Rand_Project/app.config.ts)

What is included now:

- local trip reminders
- Haya reminder prompts
- saved offer alerts
- booking milestone reminders
- travel checklist reminders
- granular on-device notification preferences
- future push-readiness status based on Expo/EAS configuration

Setup notes:

1. Install dependencies with `npm install`.
2. Rebuild the native app after changing native dependencies or config plugins:
   `npm run ios` or `npm run android`
3. Local reminders are scheduled through `expo-notifications` from mock trip and offer data.
4. Future push support will require an EAS project ID plus Apple and Firebase credentials.
5. The app already exposes that readiness in Settings, but push token registration is intentionally not enabled yet.

## Scripts

```bash
npm run start
npm run ios
npm run android
npm run web
npm run test
npm run test:watch
npm run test:ci
npm run lint
npm run lint:fix
npm run format
npm run typecheck
npm run check
npm run prebuild
```

## Testing

Haya Trips now includes a Jest + React Native Testing Library setup aimed at fast demo-confidence coverage.

Included layers:

- unit tests for localization utilities
- hook tests for language switching and Home search flow orchestration
- shared UI component tests for primary CTA and chip interactions
- screen tests for Home and Haya AI Chat
- integration tests for demo auth service behavior and structured Haya response rendering

Key test files:

- Jest config: [jest.config.js](/home/bluewolf/Desktop/Rand_Project/jest.config.js)
- Jest setup: [setup.js](/home/bluewolf/Desktop/Rand_Project/test/setup.js)
- Render helpers: [render-with-providers.tsx](/home/bluewolf/Desktop/Rand_Project/test/utils/render-with-providers.tsx)
- E2E plan: [README.md](/home/bluewolf/Desktop/Rand_Project/e2e/README.md)

Run locally with:

```bash
npm run test
npm run test:watch
npm run test:ci
```

## Architecture Notes

### Navigation

- `app/` contains the route tree.
- `app/(tabs)/_layout.tsx` defines the bottom-tab shell.
- `app/_layout.tsx` wires app-level providers and route stack behavior.

### State

- Zustand is used for local app state:
  - settings and language preference
  - Haya chat session
  - last travel search
- TanStack Query is used for async/server-style state:
  - offers
  - trips
  - Haya prompt suggestions

### Forms

- React Hook Form handles input state.
- Zod provides schema validation.
- Initial native forms are implemented in:
  - `features/home/components/home-search-form.tsx`
  - `features/heia/components/chat-composer.tsx`

### Theming

- Design tokens are split across:
  - [theme/colors.ts](/home/bluewolf/Desktop/Rand_Project/theme/colors.ts)
  - [theme/spacing.ts](/home/bluewolf/Desktop/Rand_Project/theme/spacing.ts)
  - [theme/typography.ts](/home/bluewolf/Desktop/Rand_Project/theme/typography.ts)
  - [theme/shadows.ts](/home/bluewolf/Desktop/Rand_Project/theme/shadows.ts)
  - [theme/radius.ts](/home/bluewolf/Desktop/Rand_Project/theme/radius.ts)
  - [theme/index.ts](/home/bluewolf/Desktop/Rand_Project/theme/index.ts)
- Tailwind/NativeWind theme extensions live in [tailwind.config.js](/home/bluewolf/Desktop/Rand_Project/tailwind.config.js).
- Brand direction:
  - deep navy foundation
  - vivid royal blue emphasis
  - coral CTA accents
  - soft elevated shadows

### Localization and RTL

- Translation dictionaries live in:
  - [locales/en.ts](/home/bluewolf/Desktop/Rand_Project/locales/en.ts)
  - [locales/ar.ts](/home/bluewolf/Desktop/Rand_Project/locales/ar.ts)
- i18n bootstrapping lives in [services/i18n/index.ts](/home/bluewolf/Desktop/Rand_Project/services/i18n/index.ts).
- Language switching persists via Zustand and updates layout direction for Arabic.

## Release Readiness

The project is prepared for App Store / Play Store workflows with:

- app metadata and bundle/package identifiers in [app.config.ts](/home/bluewolf/Desktop/Rand_Project/app.config.ts)
- EAS build profiles in [eas.json](/home/bluewolf/Desktop/Rand_Project/eas.json)
- splash/icon asset wiring in `assets/`
- strict type checking and linting

Before submitting to stores, replace the current placeholder app artwork in `assets/` with final brand exports and set your production environment values.

### Example Release Commands

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Verification

The project has been validated with:

```bash
npm run lint
npm run typecheck
npx expo export --platform all --output-dir dist
```

## Performance Report

- Virtualized the highest-churn surfaces with `FlatList`, including Offers, Trips, Notifications, Search Results, the home trending carousel, and the Haya chat feed.
- Reduced avoidable rerenders with `React.memo`, narrower Zustand selectors via `useShallow`, memoized derived values/handlers, and `startTransition` for chat/bootstrap updates.
- Optimized remote images with cached sources plus safe prefetching for the home header and trending destinations.
- Improved startup and navigation responsiveness by freezing inactive screens, deferring non-critical notification sync until after first interactions, and using placeholder query data instead of blocking initial renders.
- Added weaker-network handling with offline-first TanStack Query defaults, cached placeholder reuse during refetches, and API retry/backoff logic for transient timeout and network failures.
- Verified the changes with `npm run lint`, `npm run typecheck`, `npm run test`, and targeted component assertions for the Haya keyboard/virtualization behavior.

## Notes

- The `stitch/` folders are retained as design reference exports and are not used by the runtime app.
- The app uses proper native components, not HTML or webview-style screens.
