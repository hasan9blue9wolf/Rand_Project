# Launch Checklist

## Product Readiness

- [ ] Confirm `production` build opens the real backend and `staging` build points only to staging services.
- [ ] Smoke-test sign-in, onboarding, Heia, saved destinations, trips, offers, notifications, RTL, and offline/weak-network behavior on real iPhone and Android hardware.
- [ ] Verify every external link resolves to production domains, especially privacy policy and support flows.
- [ ] Replace the temporary launch artwork with final branded icons, screenshots, and feature graphics before store submission.

## Store Metadata

- [ ] Finalize App Store and Play Store titles, subtitles, short descriptions, and full descriptions.
- [ ] Prepare localized metadata for at least English and Arabic.
- [ ] Add production privacy policy URL and support contact URL/email.
- [ ] Write reviewer notes explaining demo-only paths, live backend expectations, and how to exercise notifications.

## Compliance

- [ ] Complete App Store Connect App Privacy answers for all shipped SDKs and flows.
- [ ] Complete Google Play Data safety, App content, target audience, ads, and content rating forms.
- [ ] Confirm the app’s age rating matches the actual in-app experience and AI/chat behavior.
- [ ] Review export compliance/encryption answers before the first App Store submission.

## Build And Release

- [ ] Create EAS environment variables for `development`, `preview`, and `production`.
- [ ] Run `eas build --profile staging` on both platforms and validate the install side-by-side with production.
- [ ] Run `eas build --profile production` on both platforms and archive release artifacts.
- [ ] Submit staged builds to TestFlight and Play internal testing before store release.
